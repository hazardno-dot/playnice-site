-- REVIEWED READ-ONLY SOURCE. Install separately; never expose to browser.
-- Supabase source feed for Shop's server-side replica of the existing CC
-- buildInventoryAnalytics calculation. Does not calculate or expose stock
-- publicly; does not mutate orders/inventory or checkout.
begin;
create or replace function public.get_shop_inventory_source_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path=''
as $function$
declare
  v_events_count integer;
  v_orders_count integer;
  v_items_count integer;
  v_events jsonb;
  v_orders jsonb;
  v_items jsonb;
begin
  if (current_setting('request.jwt.claims', true)::jsonb->>'role') is distinct from 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501';
  end if;

  select count(*) into v_events_count from public.fragrance_inventory_events;
  select count(*) into v_orders_count
    from public.checkout_orders o where o.environment='production';
  select count(*) into v_items_count
    from public.order_items i join public.checkout_orders o
      on o.id=i.order_record_id where o.environment='production';

  -- Never supply a partial order snapshot that could falsely lock buyers.
  if v_events_count>2000 or v_orders_count>250 or v_items_count>5000
    then return jsonb_build_object('complete',false,'reason','SOURCE_TOO_LARGE');
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',e.id,'product_name',e.product_name,'event_type',e.event_type,
    'quantity_ml',e.quantity_ml,'note',e.note,'created_at',e.created_at
  ) order by e.created_at,e.id),'[]'::jsonb)
  into v_events from public.fragrance_inventory_events e;

  -- Strip all customer identity, contact, location and payment information.
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',o.id,'order_id',o.order_id,'environment',o.environment,
    'origin',o.origin,'status',o.status,'created_at',o.created_at,
    'updated_at',o.updated_at,'packed_at',o.packed_at,
    'shipped_at',o.shipped_at,
    'source_payload',jsonb_build_object(
      'items',o.source_payload->'items',
      'giftSamples',o.source_payload->'giftSamples',
      'freeGift',o.source_payload->>'freeGift'
    )
  ) order by o.created_at,o.id),'[]'::jsonb)
  into v_orders from public.checkout_orders o
  where o.environment='production';

  select coalesce(jsonb_agg(jsonb_build_object(
    'order_record_id',i.order_record_id,'product_name',i.product_name,
    'size_label',i.size_label,'size_ml',i.size_ml,'quantity',i.quantity,
    'source_data',jsonb_build_object(
      'bundleItems',i.source_data->'bundleItems'
    )
  ) order by i.order_record_id,i.id),'[]'::jsonb)
  into v_items from public.order_items i
  join public.checkout_orders o on o.id=i.order_record_id
  where o.environment='production';

  -- The counts are checked inside the same STABLE statement snapshot.
  if jsonb_array_length(v_events)<>v_events_count or
     jsonb_array_length(v_orders)<>v_orders_count or
     jsonb_array_length(v_items)<>v_items_count
    then return jsonb_build_object('complete',false,'reason','INCOMPLETE_SNAPSHOT');
  end if;

  return jsonb_build_object(
    'complete',true,'snapshot_at',statement_timestamp(),
    'events',v_events,'orders',v_orders,'items',v_items
  );
end;
$function$;
revoke all on function public.get_shop_inventory_source_v1()
  from public,anon,authenticated;
grant execute on function public.get_shop_inventory_source_v1()
  to service_role;
commit;
