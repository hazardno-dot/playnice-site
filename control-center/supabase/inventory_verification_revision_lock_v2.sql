-- PlayNice inventory verification revision-lock protocol — DESIGN / NOT APPLIED.
-- NEVER execute on Production without migration review + load tests.
-- This is a low-level global invalidation primitive, NOT a complete Verified flow.
-- No stock, checkout, orders or balances are changed by this SQL draft.
-- Real activation requires: canonical mapping, full historical inventory ledger,
-- atomic server-side Remaining computation, admin confirm RPC, and real DB tests.
--
-- A single global revision row conservatively serializes changes. This is
-- simpler than per-product mapping at first, but potentially costly under load;
-- use only after verifying transaction contention, backup and rollback.
create table if not exists public.inventory_verification_global_revision (
  singleton boolean primary key default true check (singleton),
  revision bigint not null default 0 check (revision >= 0),
  changed_at timestamptz not null default now()
);
revoke all on public.inventory_verification_global_revision from public,anon,authenticated;
alter table public.inventory_verification_global_revision enable row level security;
insert into public.inventory_verification_global_revision(singleton,revision)
values(true,0) on conflict(singleton) do nothing;

create or replace function public.inventory_verification_revision_bump()
returns trigger language plpgsql security definer set search_path=''
as $function$
begin
  -- Invoked only by triggers. Row lock is held until outer transaction commits.
  update public.inventory_verification_global_revision
    set revision=revision+1,changed_at=clock_timestamp() where singleton=true;
  if not found then raise exception 'INVENTORY_REVISION_ROW_MISSING'; end if;
  return null;
end;
$function$;
revoke all on function public.inventory_verification_revision_bump() from public,anon,authenticated;

-- Statement-level triggers: any relevant row modification invalidates all
-- confirmations, including unchanged or offsetting balances. Deliberately
-- conservative; even a non-inventory edit would invalidate confirmation.
-- Preview order writes also invalidate in this v2 prototype.
drop trigger if exists inventory_verify_bump_inventory_events on public.fragrance_inventory_events;
create trigger inventory_verify_bump_inventory_events
after insert or update or delete on public.fragrance_inventory_events
for each statement execute function public.inventory_verification_revision_bump();

drop trigger if exists inventory_verify_bump_checkout_orders on public.checkout_orders;
create trigger inventory_verify_bump_checkout_orders
after insert or update or delete on public.checkout_orders
for each statement execute function public.inventory_verification_revision_bump();

drop trigger if exists inventory_verify_bump_order_status on public.order_status_events;
create trigger inventory_verify_bump_order_status
after insert or update or delete on public.order_status_events
for each statement execute function public.inventory_verification_revision_bump();

-- Future admin confirmation MUST lock the same singleton row via:
-- SELECT revision FROM public.inventory_verification_global_revision
-- WHERE singleton=true FOR UPDATE;
-- BEFORE reading a complete server-recomputed ledger and writing verification,
-- within the SAME database transaction. Lock order must be studied to avoid
-- trigger-driven deadlocks with order updates and any future product locks.
--
-- This alone does NOT make a user-supplied or JS-derived Remaining trustworthy:
-- the SQL transaction needs to compute its own canonical remaining + obligations.
-- No write/grant/confirm RPC is defined in this migration.
-- A successful Preview compilation must not be misrepresented as proving
-- isolation or safe Production rollout.
