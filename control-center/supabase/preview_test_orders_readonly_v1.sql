-- Read-only preview checkout audit; ordinary Control Center Orders stays production-only.
-- Requires existing admin_users membership. Does not alter orders or fulfillment.
create or replace function public.get_control_center_preview_test_orders()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_result jsonb;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED' using errcode='42501';
  end if;
  if not exists (select 1 from public.admin_users a where a.user_id = v_uid) then
    raise exception 'ADMIN_REQUIRED' using errcode='42501';
  end if;

  select coalesce(jsonb_agg(to_jsonb(o) order by o.created_at desc), '[]'::jsonb)
    into v_result
  from (
    select id, order_id, tracking_number, status, source_payload, created_at, environment,
           sheet_sync_status
      from public.checkout_orders
     where environment = 'preview' and order_id like 'PNTEST-%'
     order by created_at desc
     limit 30
  ) o;
  return v_result;
end;
$$;
revoke all on function public.get_control_center_preview_test_orders() from public, anon;
grant execute on function public.get_control_center_preview_test_orders() to authenticated;
comment on function public.get_control_center_preview_test_orders() is
  'Admin-authenticated read-only PNTEST preview order audit; not used by production Orders.';
