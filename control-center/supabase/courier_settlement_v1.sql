-- Courier Settlement v1
-- Supabase remains canonical; Google Sheets stays a per-order mirror.
-- This RPC groups confirmed COD payouts into one batch. Settlement is also the delivery confirmation when courier tracking is unavailable.

create or replace function public.settle_control_center_courier_batch(p_order_ids uuid[])
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_now timestamptz := now();
  v_batch_id text := upper('CS-' || to_char(v_now, 'YYYYMMDD') || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  v_requested integer;
  v_eligible integer;
  v_total numeric(12,2);
  v_orders jsonb;
begin
  if v_user is null or not exists (
    select 1 from public.admin_users where user_id = v_user
  ) then
    raise exception 'PlayNice admin access required.';
  end if;

  if p_order_ids is null or cardinality(p_order_ids) = 0 then
    raise exception 'Select at least one pending COD order.';
  end if;

  select count(distinct id)
    into v_requested
  from unnest(p_order_ids) as id;

  select count(*), round(coalesce(sum((source_payload->>'total')::numeric), 0), 2)
    into v_eligible, v_total
  from public.checkout_orders
  where id = any(p_order_ids)
    and status in ('SHIPPED','OUT_FOR_DELIVERY','DELIVERED')
    and courier_payment_status = 'PENDING'
    and origin <> 'regression_test';

  if v_eligible <> v_requested then
    raise exception 'Settlement selection contains an order that is not SHIPPED / OUT_FOR_DELIVERY / DELIVERED + PENDING.';
  end if;

  perform set_config('app.orders_lifecycle_write','control_center',true);

  with updated as (
    update public.checkout_orders
    set status = 'DELIVERED',
        delivered_at = coalesce(delivered_at, v_now),
        courier_payment_status = 'PAID',
        courier_paid_at = v_now,
        courier_batch_id = v_batch_id,
        sheet_state_version = sheet_state_version + 1,
        sheet_state_sync_status = 'pending',
        sheet_state_sync_error = null,
        updated_at = v_now
    where id = any(p_order_ids)
      and status in ('SHIPPED','OUT_FOR_DELIVERY','DELIVERED')
      and courier_payment_status = 'PENDING'
      and origin <> 'regression_test'
    returning *
  )
  select coalesce(jsonb_agg(to_jsonb(updated) order by created_at), '[]'::jsonb)
    into v_orders
  from updated;

  if jsonb_array_length(v_orders) <> v_requested then
    raise exception 'Courier settlement changed concurrently. Refresh and try again.';
  end if;

  return jsonb_build_object(
    'batch_id', v_batch_id,
    'settled_at', v_now,
    'order_count', v_requested,
    'total', v_total,
    'orders', v_orders
  );
end;
$$;

revoke all on function public.settle_control_center_courier_batch(uuid[]) from public;
revoke all on function public.settle_control_center_courier_batch(uuid[]) from anon;
grant execute on function public.settle_control_center_courier_batch(uuid[]) to authenticated;
