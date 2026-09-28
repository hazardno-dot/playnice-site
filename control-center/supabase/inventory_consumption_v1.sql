-- Inventory / Fragrance Consumption v1
-- First event per fragrance is the measured current opening balance.
-- Later events are restocks. Consumption is calculated in Orders API from
-- fulfillment events after tracking starts, so historical sales are not subtracted twice.

create table if not exists public.fragrance_inventory_events (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  event_type text not null check (event_type in ('OPENING','RESTOCK')),
  quantity_ml numeric(10,2) not null check (quantity_ml > 0 and quantity_ml <= 5000),
  note text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create unique index if not exists fragrance_inventory_one_opening_per_product
  on public.fragrance_inventory_events (lower(product_name))
  where event_type='OPENING';

create index if not exists fragrance_inventory_product_created_idx
  on public.fragrance_inventory_events (lower(product_name), created_at);

alter table public.fragrance_inventory_events enable row level security;
revoke all on table public.fragrance_inventory_events from public;
revoke all on table public.fragrance_inventory_events from anon;
revoke all on table public.fragrance_inventory_events from authenticated;

create or replace function public.get_control_center_inventory_stock()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_result jsonb;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if not exists (select 1 from public.admin_users a where a.user_id=v_uid) then
    raise exception 'ADMIN_REQUIRED' using errcode='42501';
  end if;

  select coalesce(jsonb_agg(to_jsonb(x) order by lower(x.product_name)), '[]'::jsonb)
  into v_result
  from (
    select
      min(product_name) filter (where event_type='OPENING') as product_name,
      min(created_at) filter (where event_type='OPENING') as tracking_started_at,
      coalesce(sum(quantity_ml) filter (where event_type='OPENING'),0) as opening_balance_ml,
      coalesce(sum(quantity_ml) filter (where event_type='RESTOCK'),0) as restock_ml,
      coalesce(sum(quantity_ml),0) as stock_in_ml,
      max(created_at) as last_stock_at,
      count(*)::int as event_count
    from public.fragrance_inventory_events
    group by lower(product_name)
  ) x;

  return v_result;
end;
$function$;

revoke all on function public.get_control_center_inventory_stock() from public;
revoke all on function public.get_control_center_inventory_stock() from anon;
grant execute on function public.get_control_center_inventory_stock() to authenticated;

create or replace function public.record_control_center_inventory_stock(
  p_product_name text,
  p_quantity_ml numeric,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_name text := trim(coalesce(p_product_name,''));
  v_qty numeric := round(coalesce(p_quantity_ml,0),2);
  v_note text := nullif(trim(coalesce(p_note,'')),'');
  v_type text;
  v_row public.fragrance_inventory_events%rowtype;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if not exists (select 1 from public.admin_users a where a.user_id=v_uid) then
    raise exception 'ADMIN_REQUIRED' using errcode='42501';
  end if;

  if v_name='' or length(v_name)>180 then raise exception 'INVALID_PRODUCT_NAME'; end if;
  if v_qty<=0 or v_qty>5000 then raise exception 'INVALID_QUANTITY_ML'; end if;
  if v_note is not null and length(v_note)>300 then raise exception 'NOTE_TOO_LONG'; end if;

  if exists (
    select 1 from public.fragrance_inventory_events
    where lower(product_name)=lower(v_name)
  ) then
    v_type := 'RESTOCK';
  else
    v_type := 'OPENING';
  end if;

  insert into public.fragrance_inventory_events(product_name,event_type,quantity_ml,note,created_by)
  values(v_name,v_type,v_qty,v_note,v_uid)
  returning * into v_row;

  return jsonb_build_object(
    'id',v_row.id,
    'product_name',v_row.product_name,
    'event_type',v_row.event_type,
    'quantity_ml',v_row.quantity_ml,
    'note',v_row.note,
    'created_at',v_row.created_at
  );
end;
$function$;

revoke all on function public.record_control_center_inventory_stock(text,numeric,text) from public;
revoke all on function public.record_control_center_inventory_stock(text,numeric,text) from anon;
grant execute on function public.record_control_center_inventory_stock(text,numeric,text) to authenticated;
