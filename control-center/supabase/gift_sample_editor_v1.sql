-- Gift / Sample Editor v1
-- Structured sample metadata remains compatible with the existing freeGift text field.

create or replace function public.update_control_center_order_gift(
  p_record_id uuid,
  p_sample_name text default '',
  p_sample_size text default '',
  p_extra_gift text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_order public.checkout_orders%rowtype;
  v_name text := trim(coalesce(p_sample_name,''));
  v_size text := trim(coalesce(p_sample_size,''));
  v_extra text := trim(coalesce(p_extra_gift,''));
  v_size_ml numeric;
  v_free_gift text := '';
  v_samples jsonb := '[]'::jsonb;
  v_extras jsonb := '[]'::jsonb;
  v_payload jsonb;
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

  if length(v_name) > 180 then raise exception 'SAMPLE_NAME_TOO_LONG'; end if;
  if length(v_size) > 40 then raise exception 'SAMPLE_SIZE_TOO_LONG'; end if;
  if length(v_extra) > 120 then raise exception 'EXTRA_GIFT_TOO_LONG'; end if;

  if (v_name='' and v_size<>'') or (v_name<>'' and v_size='') then
    raise exception 'SAMPLE_NAME_AND_SIZE_REQUIRED_TOGETHER';
  end if;

  if v_name<>'' then
    if v_size !~* '^\s*[0-9]+(?:\.[0-9]+)?\s*ml\s*$' then
      raise exception 'INVALID_SAMPLE_SIZE';
    end if;
    v_size_ml := substring(v_size from '([0-9]+(?:\.[0-9]+)?)')::numeric;
    if v_size_ml <= 0 or v_size_ml > 50 then raise exception 'INVALID_SAMPLE_SIZE'; end if;
    v_samples := jsonb_build_array(jsonb_build_object(
      'name',v_name,'size',v_size,'sizeMl',v_size_ml
    ));
    v_free_gift := v_name || ' - ' || v_size;
  end if;

  if v_extra<>'' then
    v_extras := jsonb_build_array(v_extra);
    v_free_gift := case when v_free_gift<>'' then v_free_gift || ' + ' || v_extra else v_extra end;
  end if;

  v_payload := jsonb_set(v_order.source_payload,'{giftSamples}',v_samples,true);
  v_payload := jsonb_set(v_payload,'{giftExtras}',v_extras,true);
  v_payload := jsonb_set(v_payload,'{freeGift}',to_jsonb(v_free_gift),true);

  update public.checkout_orders
  set source_payload=v_payload,
      updated_at=now(),
      sheet_state_sync_status='pending',
      sheet_state_sync_error=null,
      sheet_state_version=sheet_state_version+1
  where id=p_record_id
  returning * into v_order;

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
      'freeGift',coalesce(v_order.source_payload->>'freeGift',''),
      'stateVersion',v_order.sheet_state_version
    )
  );
end;
$function$;

revoke all on function public.update_control_center_order_gift(uuid,text,text,text) from public;
revoke all on function public.update_control_center_order_gift(uuid,text,text,text) from anon;
grant execute on function public.update_control_center_order_gift(uuid,text,text,text) to authenticated;
