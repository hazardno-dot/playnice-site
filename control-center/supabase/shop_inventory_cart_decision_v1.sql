-- PlayNice public-shop inventory decision -- DRAFT, NOT APPLIED.
-- This is a read-only, fail-open, service-role-only RPC for Shop's SERVER.
-- It returns only ALLOW, LIMIT_REACHED or UNKNOWN. No balances or customer
-- information are exposed. Never grant EXECUTE to anon/authenticated.
--
-- Scope: baseline inventories with directly recorded delivered decant items.
-- Non-direct bundles or ambiguous gift/catalog mappings require follow-up;
-- undercounting consumption means we fail to restrict, never falsely claim no stock.
-- Transactional reservation is deliberately out of scope; checkout unchanged.
create or replace function public.get_shop_inventory_cart_decision(
  p_product_name text, p_requested_total_ml numeric
) returns jsonb
language plpgsql security definer set search_path = ''
as $function$
declare
  v_name text := trim(coalesce(p_product_name,''));
  v_baseline numeric;
  v_restock numeric;
  v_manual_out numeric;
  v_consumed numeric;
  v_remaining numeric;
  v_base_count integer;
begin
  if auth.role() <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501';
  end if;
  if v_name='' or length(v_name)>180 or
     p_requested_total_ml is null or
     p_requested_total_ml<=0 or p_requested_total_ml>5000 then
    return jsonb_build_object('decision','UNKNOWN');
  end if;

  -- No baseline or ambiguous mapping => unknown, not out of stock.
  select count(*)::int into v_base_count
  from public.fragrance_inventory_events e
  where lower(trim(e.product_name))=lower(v_name)
    and e.event_type in ('BASELINE_SET','OPENING');
  if v_base_count<>1 then
    return jsonb_build_object('decision','UNKNOWN');
  end if;

  select coalesce(sum(e.quantity_ml) filter (where event_type in ('BASELINE_SET','OPENING')),0),
         coalesce(sum(e.quantity_ml) filter (where event_type='RESTOCK'),0),
         coalesce(sum(e.quantity_ml) filter (where event_type='MANUAL_OUT'),0)
  into v_baseline,v_restock,v_manual_out
  from public.fragrance_inventory_events e
  where lower(trim(e.product_name))=lower(v_name);

  -- Old imported order data, bundles, gifts and aliases are not guaranteed
  -- complete here: any ambiguous direct order entry forces UNKNOWN rather
  -- than an arbitrary stock denial.
  if exists (
    select 1 from public.order_items i
    join public.checkout_orders o on o.id=i.order_record_id
    where o.environment='production' and o.status='DELIVERED'
      and lower(trim(i.product_name))=lower(v_name)
      and (
        i.size_ml is null or i.size_ml<=0 or i.quantity is null or i.quantity<=0
        or (jsonb_typeof(i.source_data->'bundleItems')='array'
            and jsonb_array_length(i.source_data->'bundleItems')>0)
      )
  ) then return jsonb_build_object('decision','UNKNOWN'); end if;

  select coalesce(sum(i.size_ml*i.quantity),0)
    into v_consumed
  from public.order_items i
  join public.checkout_orders o on o.id=i.order_record_id
  where o.environment='production' and o.status='DELIVERED'
    and lower(trim(i.product_name))=lower(v_name)
    and i.size_ml>0 and i.size_ml<50;

  v_remaining := round(v_baseline+v_restock-v_manual_out-v_consumed,2);

  -- Negative, implausible or unreconciled balances are not trusted limits.
  if v_remaining < 0 or v_remaining > 5000 then
    return jsonb_build_object('decision','UNKNOWN');
  end if;

  if round(p_requested_total_ml,2) > v_remaining then
    return jsonb_build_object('decision','LIMIT_REACHED');
  end if;
  return jsonb_build_object('decision','ALLOW');
end;
$function$;

revoke all on function public.get_shop_inventory_cart_decision(text,numeric)
  from public,anon,authenticated;
grant execute on function public.get_shop_inventory_cart_decision(text,numeric)
  to service_role;
