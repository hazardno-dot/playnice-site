-- Settlement-confirmed Delivery v1 analytics alignment
-- Outstanding COD includes shipped orders because courier payout is the delivery confirmation
-- when live courier delivery status is unavailable.

do $$
declare
  v_ddl text;
  v_old text := 'and courier_payment_status=''PENDING''
          and status=''DELIVERED''';
  v_new text := 'and courier_payment_status=''PENDING''
          and status in (''SHIPPED'',''OUT_FOR_DELIVERY'',''DELIVERED'')';
begin
  select pg_get_functiondef(p.oid)
    into v_ddl
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname='get_control_center_order_analytics'
    and p.prokind='f'
  limit 1;

  if v_ddl is null then
    raise exception 'get_control_center_order_analytics not found';
  end if;
  if position(v_old in v_ddl)=0 then
    raise exception 'COD pending analytics anchor not found';
  end if;

  execute replace(v_ddl,v_old,v_new);
end;
$$;
