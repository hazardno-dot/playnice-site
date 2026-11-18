-- DRAFT / NEVER APPLY DIRECTLY TO PRODUCTION.
-- Isolated schema proposal; intentionally does not alter existing order RPC,
-- Product CC accounting, inventory events, or shop checkout.
-- The atomic order-admission RPC must be reviewed separately.
begin;

create table if not exists public.checkout_inventory_reservations_v1 (
  id uuid primary key default gen_random_uuid(),
  environment text not null check(environment in ('preview','production')),
  order_record_id uuid not null references public.checkout_orders(id) on delete restrict,
  product_key text not null check(product_key = lower(btrim(product_key)) and length(product_key) between 2 and 200),
  reserved_ml numeric(10,2) not null check(reserved_ml > 0 and reserved_ml <= 5000),
  disposition text not null default 'HELD' check(disposition in ('HELD','COMMITTED','HELD_RETURN','RELEASED')),
  verified_remaining_at_admission boolean not null,
  released_at timestamptz,
  restock_event_id uuid references public.fragrance_inventory_events(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(order_record_id,product_key),
  check (
    (disposition='RELEASED' and released_at is not null)
    or (disposition<>'RELEASED' and released_at is null)
  ),
  check (
    (restock_event_id is null) or disposition='RELEASED'
  )
);

create index if not exists checkout_inventory_reservations_active_v1
on public.checkout_inventory_reservations_v1(environment,product_key)
where disposition<>'RELEASED';

alter table public.checkout_inventory_reservations_v1 enable row level security;
revoke all on public.checkout_inventory_reservations_v1 from public,anon,authenticated;
grant select,insert,update on public.checkout_inventory_reservations_v1 to service_role;

-- No SECURITY DEFINER mutation function is installed by this draft.
-- The eventual create-or-get RPC must:
--   1. lock fingerprint and check idempotency first;
--   2. lock sorted canonical fragrance keys by transaction advisory locks;
--   3. re-read a trusted, fresh CC Remaining inclusive of held reservations
--      and account for shipped/returned/delivered parcels exactly once;
--   4. verify server-sourced per-order cap (default 30 ml);
--   5. insert order + reservations within THE SAME database transaction;
--   6. transition reservations only through authorized CC lifecycle writers;
--   7. prevent direct service-role writers from bypassing locking;
--   8. use a separate inventory namespace for PNTEST preview vs production.
-- No direct return REST API or browser writes to this table.

commit;
