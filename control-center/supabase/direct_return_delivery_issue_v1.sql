-- Direct return from active delivery issue v1
-- A shipped/out-for-delivery order with a confirmed delivery issue can close directly as RETURNED.
-- This keeps UNREACHABLE / REFUSED workflows from requiring the artificial DELIVERY_FAILED intermediate state.

do $$
declare
  v_ddl text;
  v_old_shipped text := '(v_order.status=''SHIPPED'' and v_next_status in (''OUT_FOR_DELIVERY'',''DELIVERY_FAILED''))';
  v_new_shipped text := '(v_order.status=''SHIPPED'' and (
        v_next_status in (''OUT_FOR_DELIVERY'',''DELIVERY_FAILED'')
        or (v_next_status=''RETURNED'' and v_order.delivery_issue in (''UNREACHABLE'',''REFUSED''))
      ))';
  v_old_delivery text := '(v_order.status=''OUT_FOR_DELIVERY'' and v_next_status in (''SHIPPED'',''DELIVERED'',''DELIVERY_FAILED''))';
  v_new_delivery text := '(v_order.status=''OUT_FOR_DELIVERY'' and (
        v_next_status in (''SHIPPED'',''DELIVERED'',''DELIVERY_FAILED'')
        or (v_next_status=''RETURNED'' and v_order.delivery_issue in (''UNREACHABLE'',''REFUSED''))
      ))';
begin
  select pg_get_functiondef(p.oid)
    into v_ddl
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname='update_control_center_order'
    and p.prokind='f'
  limit 1;

  if v_ddl is null then
    raise exception 'update_control_center_order not found';
  end if;

  if position(v_new_shipped in v_ddl)=0 then
    if position(v_old_shipped in v_ddl)=0 then
      raise exception 'SHIPPED lifecycle anchor not found';
    end if;
    v_ddl := replace(v_ddl,v_old_shipped,v_new_shipped);
  end if;

  if position(v_new_delivery in v_ddl)=0 then
    if position(v_old_delivery in v_ddl)=0 then
      raise exception 'OUT_FOR_DELIVERY lifecycle anchor not found';
    end if;
    v_ddl := replace(v_ddl,v_old_delivery,v_new_delivery);
  end if;

  execute v_ddl;
end;
$$;
