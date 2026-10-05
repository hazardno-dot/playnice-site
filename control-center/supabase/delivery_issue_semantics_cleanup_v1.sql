-- Delivery issue semantics cleanup v1
-- RETURNED is a terminal fulfillment status, not a delivery issue reason.
-- Existing terminal records are preserved; new delivery-issue writes allow only UNREACHABLE / REFUSED / RESOLVED.

do $$
declare
  v_ddl text;
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

  v_ddl := replace(
    v_ddl,
    'v_order.delivery_issue in (''UNREACHABLE'',''REFUSED'',''RETURNED'')',
    'v_order.delivery_issue in (''UNREACHABLE'',''REFUSED'')'
  );

  v_ddl := replace(
    v_ddl,
    'if v_value not in (''UNREACHABLE'',''REFUSED'',''RETURNED'',''RESOLVED'') then',
    'if v_value not in (''UNREACHABLE'',''REFUSED'',''RESOLVED'') then'
  );

  v_ddl := replace(
    v_ddl,
    '        delivery_issue=case
          when v_next_status=''OUT_FOR_DELIVERY'' and v_order.status=''DELIVERY_FAILED'' then ''RESOLVED''
          when v_next_status=''RETURNED'' then ''RETURNED''
          else delivery_issue
        end,
        source_payload=case
          when v_next_status=''OUT_FOR_DELIVERY'' and v_order.status=''DELIVERY_FAILED''
            then jsonb_set(source_payload,''{deliveryIssue}'',to_jsonb(''RESOLVED''::text),true)
          when v_next_status=''RETURNED''
            then jsonb_set(source_payload,''{deliveryIssue}'',to_jsonb(''RETURNED''::text),true)
          else source_payload
        end,',
    '        delivery_issue=case
          when v_next_status=''OUT_FOR_DELIVERY'' and v_order.status=''DELIVERY_FAILED'' then ''RESOLVED''
          else delivery_issue
        end,
        source_payload=case
          when v_next_status=''OUT_FOR_DELIVERY'' and v_order.status=''DELIVERY_FAILED''
            then jsonb_set(source_payload,''{deliveryIssue}'',to_jsonb(''RESOLVED''::text),true)
          else source_payload
        end,'
  );

  execute v_ddl;
end;
$$;
