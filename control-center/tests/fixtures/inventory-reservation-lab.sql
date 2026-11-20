-- PlayNice Inventory Protection: ISOLATED SQL LAB — NOT A PRODUCTION MIGRATION.
-- Only execute in a disposable PostgreSQL/Supabase development database.
-- Never run in the PlayNice production database. No checkout_orders writes.
--
-- Setup precondition: CREATE ROLE test runner privileges for dedicated database.
-- The lab is under a separate schema, with independent synthetic fixtures.
create schema if not exists inventory_protection_lab;
revoke all on schema inventory_protection_lab from public, anon, authenticated;

create table inventory_protection_lab.balances (
  product_key text primary key,
  physical_centi_ml bigint not null check (physical_centi_ml >= 0),
  reserved_centi_ml bigint not null default 0
    check (reserved_centi_ml >= 0 and reserved_centi_ml <= physical_centi_ml),
  verified boolean not null default false
);
create table inventory_protection_lab.orders (
  order_id text primary key,
  fingerprint text not null unique,
  state text not null default 'RESERVED'
    check (state in ('RESERVED','CONSUMED','RELEASED')),
  created_at timestamptz not null default now()
);
create table inventory_protection_lab.lines (
  order_id text not null references inventory_protection_lab.orders(order_id),
  product_key text not null references inventory_protection_lab.balances(product_key),
  centi_ml bigint not null check (centi_ml > 0),
  primary key(order_id,product_key)
);
revoke all on all tables in schema inventory_protection_lab from public, anon, authenticated;

-- This lab runs the create+reserve operation in ONE Postgres transaction.
-- The transaction's row locks serialize concurrent buyers for the same products.
create or replace function inventory_protection_lab.reserve(
  p_order_id text, p_fingerprint text, p_items jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $fn$
declare
  v_existing text;
  v_item record;
  v_balance record;
  v_requested bigint;
  v_key text;
begin
  if length(coalesce(p_order_id,'')) not between 1 and 80 or
     length(coalesce(p_fingerprint,'')) not between 1 and 128 or
     jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or
     jsonb_array_length(p_items) > 60 then
    raise exception 'INVALID_RESERVATION_REQUEST';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('inventory-lab-idempotency:' || p_fingerprint, 0));
  select order_id into v_existing from inventory_protection_lab.orders
    where fingerprint=p_fingerprint;
  if found then
    return jsonb_build_object('result','DUPLICATE','order_id',v_existing);
  end if;
  if exists (select 1 from inventory_protection_lab.orders where order_id=p_order_id) then
    raise exception 'IDEMPOTENCY_CONFLICT';
  end if;

  create temporary table if not exists pg_temp.lab_requested(
    product_key text primary key, centi_ml bigint not null
  ) on commit drop;
  truncate pg_temp.lab_requested;
  for v_item in
    select * from jsonb_to_recordset(p_items) as x(product_key text, centi_ml bigint)
  loop
    if v_item.product_key is null or v_item.product_key !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or
       length(v_item.product_key)>100 or v_item.centi_ml is null or
       v_item.centi_ml<=0 or v_item.centi_ml>500000 then
      raise exception 'INVALID_ITEM';
    end if;
    insert into pg_temp.lab_requested (product_key,centi_ml)
      values (v_item.product_key,v_item.centi_ml)
    on conflict(product_key) do update set
      centi_ml = pg_temp.lab_requested.centi_ml + excluded.centi_ml;
  end loop;

  -- Iterate in stable SKU order to avoid lock-order inversion/deadlocks.
  for v_item in
    select product_key,centi_ml from pg_temp.lab_requested order by product_key
  loop
    select product_key,physical_centi_ml,reserved_centi_ml,verified
      into v_balance from inventory_protection_lab.balances
      where product_key=v_item.product_key for update;
    if not found or v_balance.verified is distinct from true then
      raise exception 'UNKNOWN_STOCK';
    end if;
    if v_balance.physical_centi_ml-v_balance.reserved_centi_ml < v_item.centi_ml then
      raise exception 'INSUFFICIENT_AVAILABLE';
    end if;
  end loop;

  insert into inventory_protection_lab.orders (order_id,fingerprint)
    values (p_order_id,p_fingerprint);
  insert into inventory_protection_lab.lines (order_id,product_key,centi_ml)
    select p_order_id,product_key,centi_ml from pg_temp.lab_requested;
  update inventory_protection_lab.balances b
    set reserved_centi_ml=b.reserved_centi_ml+r.centi_ml
    from pg_temp.lab_requested r where b.product_key=r.product_key;
  return jsonb_build_object('result','RESERVED','order_id',p_order_id);
end;
$fn$;

create or replace function inventory_protection_lab.transition(
  p_order_id text, p_action text
)
returns text
language plpgsql
security invoker
set search_path = ''
as $fn$
declare
  v_status text;
  v_line record;
  v_balance record;
begin
  -- Lock the order before any stock rows; competing transitions serialize.
  select state into v_status from inventory_protection_lab.orders
    where order_id=p_order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if p_action='PACK' and v_status='CONSUMED' then return 'DUPLICATE'; end if;
  if p_action='CANCEL' and v_status='RELEASED' then return 'DUPLICATE'; end if;
  if v_status<>'RESERVED' or p_action not in ('PACK','CANCEL') then
    raise exception 'RECONCILIATION_REQUIRED';
  end if;

  for v_line in
    select product_key,centi_ml from inventory_protection_lab.lines
      where order_id=p_order_id order by product_key
  loop
    select * into v_balance from inventory_protection_lab.balances
      where product_key=v_line.product_key for update;
    if not found or v_balance.reserved_centi_ml<v_line.centi_ml or
       (p_action='PACK' and v_balance.physical_centi_ml<v_line.centi_ml) then
      raise exception 'INCONSISTENT_LEDGER';
    end if;
  end loop;
  update inventory_protection_lab.balances b
     set reserved_centi_ml=b.reserved_centi_ml-l.centi_ml,
         physical_centi_ml=b.physical_centi_ml-
           (case when p_action='PACK' then l.centi_ml else 0 end)
    from inventory_protection_lab.lines l
    where l.order_id=p_order_id and l.product_key=b.product_key;
  update inventory_protection_lab.orders
    set state=(case when p_action='PACK' then 'CONSUMED' else 'RELEASED' end)
    where order_id=p_order_id;
  return p_action;
end;
$fn$;

-- No grants to anon/authenticated; use an isolated test DB administrative role.
revoke all on all functions in schema inventory_protection_lab from public, anon, authenticated;

-- Initial synthetic state only. Do not copy production physical stock.
insert into inventory_protection_lab.balances
  (product_key, physical_centi_ml, verified)
values ('naxos-test',8000,true), ('ginger-test',3000,true),
       ('unknown-test',2500,false);
