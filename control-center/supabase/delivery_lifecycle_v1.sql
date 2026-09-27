-- Full Delivery Lifecycle v1
-- Canonical status lives in Supabase. Google Sheets keeps legacy status compatibility:
-- PACKED -> NEW, OUT_FOR_DELIVERY / DELIVERED -> SHIPPED.
-- The real lifecycle remains available in the existing fulfillmentStatus mirror field.

alter table public.checkout_orders
  add column if not exists returned_at timestamptz;

create or replace function public.get_control_center_orders()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_orders jsonb;
  v_events jsonb;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if not exists (select 1 from public.admin_users a where a.user_id=v_uid) then
    raise exception 'ADMIN_REQUIRED' using errcode='42501';
  end if;

  select coalesce(jsonb_agg(to_jsonb(o) order by o.created_at desc),'[]'::jsonb)
  into v_orders
  from (
    select id,order_id,tracking_number,checkout_fingerprint,status,source_payload,
      created_at,updated_at,packed_at,shipped_at,out_for_delivery_at,delivered_at,returned_at,cancelled_at,
      courier_payment_status,courier_paid_at,courier_batch_id,origin,legacy_sheet_row,legacy_imported_at,
      delivery_issue,delivery_alert_email_status,
      sheet_state_sync_status,sheet_state_sync_attempts,sheet_state_synced_at,sheet_state_sync_error,
      sheet_state_sync_last_attempt_at,sheet_state_version
    from public.checkout_orders
    where environment='production'
    order by created_at desc
    limit 250
  ) o;

  select coalesce(jsonb_agg(to_jsonb(e) order by e.created_at asc),'[]'::jsonb)
  into v_events
  from (
    select e.id,e.order_id,e.status,e.note,e.source,e.created_at
    from public.order_status_events e
    join public.checkout_orders o on o.id=e.order_id
    where o.environment='production'
    order by e.created_at asc
    limit 1000
  ) e;

  return jsonb_build_object(
    'orders',v_orders,'events',v_events,'mode','write_through_v1',
    'canonical_source','supabase','backup_source','google_sheets'
  );
end;
$function$;

create or replace function public.update_control_center_order(
  p_record_id uuid,
  p_action text,
  p_value text default null::text,
  p_note text default null::text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_order public.checkout_orders%rowtype;
  v_now timestamptz := now();
  v_action text := lower(trim(coalesce(p_action,'')));
  v_value text := trim(coalesce(p_value,''));
  v_next_status text;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if not exists (select 1 from public.admin_users a where a.user_id=v_uid) then
    raise exception 'ADMIN_REQUIRED' using errcode='42501';
  end if;

  select * into v_order
  from public.checkout_orders
  where id=p_record_id and environment='production'
  for update;

  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_order.status='DUPLICATE' then raise exception 'DUPLICATE_IS_AUDIT_ONLY'; end if;

  if v_action='set_status' then
    v_next_status := upper(v_value);
    if v_next_status not in (
      'NEW','PACKED','SHIPPED','OUT_FOR_DELIVERY','DELIVERED',
      'DELIVERY_FAILED','RETURNED','CANCELLED'
    ) then
      raise exception 'STATUS_NOT_ENABLED_FOR_WRITE_THROUGH_V1';
    end if;

    if not (
      (v_order.status='NEW' and v_next_status in ('PACKED','CANCELLED')) or
      (v_order.status='PACKED' and v_next_status in ('NEW','SHIPPED','CANCELLED')) or
      (v_order.status='SHIPPED' and v_next_status in ('OUT_FOR_DELIVERY','DELIVERY_FAILED')) or
      (v_order.status='OUT_FOR_DELIVERY' and v_next_status in ('SHIPPED','DELIVERED','DELIVERY_FAILED')) or
      (v_order.status='DELIVERY_FAILED' and v_next_status in ('OUT_FOR_DELIVERY','RETURNED'))
    ) then
      raise exception 'INVALID_STATUS_TRANSITION_%_TO_%',v_order.status,v_next_status;
    end if;

    update public.checkout_orders
    set status=v_next_status,
        packed_at=case
          when v_next_status='PACKED' then coalesce(packed_at,v_now)
          when v_next_status='NEW' then null
          else packed_at
        end,
        shipped_at=case
          when v_next_status='SHIPPED' then coalesce(shipped_at,v_now)
          else shipped_at
        end,
        out_for_delivery_at=case
          when v_next_status='OUT_FOR_DELIVERY' then v_now
          when v_order.status='OUT_FOR_DELIVERY' and v_next_status='SHIPPED' then null
          else out_for_delivery_at
        end,
        delivered_at=case when v_next_status='DELIVERED' then v_now else delivered_at end,
        returned_at=case when v_next_status='RETURNED' then v_now else returned_at end,
        cancelled_at=case when v_next_status='CANCELLED' then v_now else cancelled_at end,
        delivery_issue=case
          when v_next_status='OUT_FOR_DELIVERY' and v_order.status='DELIVERY_FAILED' then 'RESOLVED'
          when v_next_status='RETURNED' then 'RETURNED'
          else delivery_issue
        end,
        source_payload=case
          when v_next_status='OUT_FOR_DELIVERY' and v_order.status='DELIVERY_FAILED'
            then jsonb_set(source_payload,'{deliveryIssue}',to_jsonb('RESOLVED'::text),true)
          when v_next_status='RETURNED'
            then jsonb_set(source_payload,'{deliveryIssue}',to_jsonb('RETURNED'::text),true)
          else source_payload
        end,
        updated_at=v_now,
        sheet_state_sync_status='pending',
        sheet_state_sync_error=null,
        sheet_state_version=sheet_state_version+1
    where id=p_record_id
    returning * into v_order;

    insert into public.order_status_events(order_id,status,note,source,created_by,created_at)
    values(v_order.id,v_next_status,nullif(left(coalesce(p_note,''),500),''),'control_center',v_uid,v_now);

  elsif v_action='save_tracking' then
    if length(v_value)>120 then raise exception 'TRACKING_TOO_LONG'; end if;
    update public.checkout_orders
    set tracking_number=v_value,updated_at=v_now,
        sheet_state_sync_status='pending',sheet_state_sync_error=null,
        sheet_state_version=sheet_state_version+1
    where id=p_record_id returning * into v_order;

  elsif v_action='set_courier_payment' then
    v_value := upper(v_value);
    if v_value not in ('PENDING','PAID','N/A') then raise exception 'INVALID_COURIER_PAYMENT_STATUS'; end if;
    update public.checkout_orders
    set courier_payment_status=v_value,
        courier_paid_at=case when v_value='PAID' then coalesce(courier_paid_at,v_now) else null end,
        updated_at=v_now,
        sheet_state_sync_status='pending',sheet_state_sync_error=null,
        sheet_state_version=sheet_state_version+1
    where id=p_record_id returning * into v_order;

  elsif v_action='set_delivery_issue' then
    v_value := upper(v_value);
    if v_value not in ('UNREACHABLE','REFUSED','RETURNED','RESOLVED') then
      raise exception 'INVALID_DELIVERY_ISSUE';
    end if;
    if v_order.status not in ('SHIPPED','OUT_FOR_DELIVERY','DELIVERY_FAILED') then
      raise exception 'DELIVERY_ISSUE_REQUIRES_ACTIVE_DELIVERY_ORDER';
    end if;

    update public.checkout_orders
    set delivery_issue=v_value,
        source_payload=jsonb_set(source_payload,'{deliveryIssue}',to_jsonb(v_value),true),
        updated_at=v_now,
        sheet_state_sync_status='pending',sheet_state_sync_error=null,
        sheet_state_version=sheet_state_version+1
    where id=p_record_id returning * into v_order;

  else
    raise exception 'UNSUPPORTED_ORDER_ACTION';
  end if;

  return jsonb_build_object(
    'order',to_jsonb(v_order),
    'mirror',jsonb_build_object(
      'source','order_state_sync',
      'orderId',v_order.order_id,
      'checkoutFingerprint',v_order.checkout_fingerprint,
      'fulfillmentStatus',v_order.status,
      'legacyStatus',case
        when v_order.status='PACKED' then 'NEW'
        when v_order.status in ('OUT_FOR_DELIVERY','DELIVERED') then 'SHIPPED'
        else v_order.status
      end,
      'trackingNumber',v_order.tracking_number,
      'courierPaid',v_order.courier_payment_status,
      'courierPaidAt',v_order.courier_paid_at,
      'deliveryIssue',coalesce(v_order.delivery_issue,''),
      'stateVersion',v_order.sheet_state_version
    )
  );
end;
$function$;
