-- PlayNice inventory global revision — DRAFT / NOT APPLIED.
-- Read-only ADMIN RPC. Conservatively invalidates ALL reviews whenever ANY
-- production order, status event or inventory event changes.
-- No raw customer data is returned. No stock, order or verification writes.
-- This is a change detector, NOT an authorization token or atomic approval.
--
-- Uses sorted JSON text for deterministic ordering, including source_payload
-- internally to detect changes to gifts/bundles/items. Do not return payload.
-- Catalog mapping / external sheet changes are NOT covered; do not claim
-- completeness until those sources and durable revision locking are addressed.
create or replace function public.get_control_center_inventory_global_revision()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_inventory text;
  v_orders text;
  v_history text;
  v_inventory_count bigint;
  v_orders_count bigint;
  v_history_count bigint;
begin
  if v_uid is null or not exists (
    select 1 from public.admin_users a where a.user_id=v_uid
  ) then
    raise exception 'ADMIN_REQUIRED' using errcode='42501';
  end if;

  select count(*), md5(coalesce(string_agg(
    to_jsonb(e)::text, E'\n' order by e.id::text
  ),'')) into v_inventory_count,v_inventory
  from public.fragrance_inventory_events e;

  select count(*), md5(coalesce(string_agg(
    to_jsonb(o)::text, E'\n' order by o.id::text
  ),'')) into v_orders_count,v_orders
  from public.checkout_orders o
  where o.environment='production';

  select count(*), md5(coalesce(string_agg(
    to_jsonb(h)::text, E'\n' order by h.id::text
  ),'')) into v_history_count,v_history
  from public.order_status_events h
  where exists (
    select 1 from public.checkout_orders o
    where o.id=h.order_id and o.environment='production'
  );

  return jsonb_build_object(
    'status','PARTIAL_REVISION_ONLY',
    'schema_version',1,
    'revision',md5(v_inventory||':'||v_orders||':'||v_history),
    'inventory_events',v_inventory_count,
    'production_orders',v_orders_count,
    'status_events',v_history_count,
    'mapping_verified',false,
    'atomic_with_checkout',false,
    'can_authorize_verification',false,
    'can_enforce_stock',false
  );
end;
$function$;

revoke all on function public.get_control_center_inventory_global_revision()
  from public,anon;
grant execute on function public.get_control_center_inventory_global_revision()
  to authenticated;
