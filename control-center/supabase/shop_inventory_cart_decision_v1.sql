-- Shop read-only inventory gate, revision 1 (conservative).
-- Applies only to unambiguous inventory rows without historical order consumption.
-- If any order mentions a product, or a stock event is ambiguous: UNKNOWN.
-- No data writes. Checkout does NOT call this function.
create or replace function public.get_shop_inventory_cart_decision(
  p_product_name text, p_requested_total_ml numeric
) returns jsonb
language plpgsql
security definer
set search_path=''
as $function$
declare
  v_name text := trim(coalesce(p_product_name,''));
  v_initial numeric;
  v_restock numeric;
  v_out numeric;
  v_remaining numeric;
  v_init_count integer;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501';
  end if;

  if length(v_name)<3 or length(v_name)>180 or
     p_requested_total_ml is null or
     p_requested_total_ml<=0 or p_requested_total_ml>5000 or
     round(p_requested_total_ml,2)<>p_requested_total_ml then
    return jsonb_build_object('decision','UNKNOWN');
  end if;

  select
    count(*) filter (where e.event_type in ('BASELINE_SET','OPENING')),
    max(e.quantity_ml) filter (where e.event_type in ('BASELINE_SET','OPENING')),
    coalesce(sum(e.quantity_ml) filter (where e.event_type='RESTOCK'),0),
    coalesce(sum(e.quantity_ml) filter (where e.event_type='MANUAL_OUT'),0)
  into v_init_count,v_initial,v_restock,v_out
  from public.fragrance_inventory_events e
  where lower(trim(e.product_name))=lower(v_name);

  if v_init_count <> 1 or v_initial is null or v_initial <= 0 or
     v_initial>5000 or v_restock<0 or v_out<0 then
    return jsonb_build_object('decision','UNKNOWN');
  end if;

  -- Reject all unrecognized ledger event categories to avoid estimating.
  if exists (
    select 1 from public.fragrance_inventory_events e
    where lower(trim(e.product_name))=lower(v_name)
      and e.event_type not in ('BASELINE_SET','OPENING','RESTOCK','MANUAL_OUT')
  ) then return jsonb_build_object('decision','UNKNOWN'); end if;

  -- The Control Center consumption calculation includes gifts, bundles and
  -- historical aliases. This initial gate MUST NOT assume direct order lines
  -- are exhaustive. Any historical mention => UNKNOWN and permit checkout.
  if exists (
    select 1 from public.order_items i
    where lower(trim(i.product_name))=lower(v_name)
  ) or exists (
    select 1 from public.checkout_orders o
    where o.environment='production' and
          strpos(lower(o.source_payload::text),lower(v_name))>0
  ) then return jsonb_build_object('decision','UNKNOWN'); end if;

  v_remaining := round(v_initial+v_restock-v_out,2);
  if v_remaining<0 or v_remaining>5000 then
    return jsonb_build_object('decision','UNKNOWN');
  end if;
  return jsonb_build_object(
    'decision',
    case when p_requested_total_ml>v_remaining
      then 'LIMIT_REACHED' else 'ALLOW' end
  );
end;
$function$;
revoke all on function public.get_shop_inventory_cart_decision(text,numeric)
  from public,anon,authenticated;
grant execute on function public.get_shop_inventory_cart_decision(text,numeric)
  to service_role;
