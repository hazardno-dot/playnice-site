-- PlayNice Inventory Protection v1: ADMIN VERIFICATION PROPOSAL ONLY.
-- NOT APPLIED. Must be security-reviewed before deploying.
-- This table stores a decision about an existing ledger balance; it NEVER
-- changes fragrance_inventory_events, checkout_orders, Total, Out or Remaining.
-- A verified flag alone is NOT permission to enforce checkout restrictions.
create table if not exists public.inventory_balance_verifications (
  product_key text primary key check (length(product_key) between 1 and 180),
  product_name text not null,
  remaining_ml numeric(12,2) not null check (remaining_ml >= 0),
  ledger_snapshot text not null check (length(ledger_snapshot) between 1 and 5000),
  verified_by uuid not null references auth.users(id),
  verified_at timestamptz not null default now(),
  status text not null default 'REVIEWED' check (status in ('REVIEWED','REVOKED')),
  note text
);
create index if not exists inventory_balance_verifications_status_idx
  on public.inventory_balance_verifications(status, verified_at desc);
alter table public.inventory_balance_verifications enable row level security;
revoke all on public.inventory_balance_verifications from public,anon,authenticated;

-- This is deliberately a read-only admin function; no write RPC here.
-- Before implementing an admin verify/revoke transaction:
-- (1) reconstruct canonical ledger server-side and validate user-reviewed
--     snapshot with a transaction-level lock / revision,
-- (2) verify product mapping, no pending NEW order or unresolved returns,
-- (3) require explicit admin action and record original reviewer,
-- (4) invalidate review automatically on ANY relevant stock/order/gift event,
-- (5) separately review whether a stock balance can be used for checkout.
create or replace function public.get_control_center_inventory_balance_verifications()
returns jsonb language plpgsql security definer set search_path=''
as $function$
declare v_uid uuid:=auth.uid(); v_rows jsonb;
begin
  if v_uid is null or not exists
     (select 1 from public.admin_users a where a.user_id=v_uid) then
    raise exception 'ADMIN_REQUIRED' using errcode='42501';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
      'product_key',product_key,'product_name',product_name,
      'remaining_ml',remaining_ml,'ledger_snapshot',ledger_snapshot,
      'verified_at',verified_at,'status',status
    ) order by product_key),'[]'::jsonb)
    into v_rows from public.inventory_balance_verifications;
  return v_rows;
end;
$function$;
revoke all on function public.get_control_center_inventory_balance_verifications()
  from public,anon;
grant execute on function public.get_control_center_inventory_balance_verifications()
  to authenticated;
