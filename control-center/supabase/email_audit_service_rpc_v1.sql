-- PlayNice email audit: purpose-built service-only operations.
-- These RPCs can only be executed with the server service_role JWT.
-- No direct client access; SECURITY DEFINER is necessary because the
-- checkout_orders and order_email_events tables intentionally lack
-- direct service_role grants. Validate all identifiers before writes.

create or replace function public.record_checkout_email_acceptances(
  p_order_id text, p_sync_token uuid, p_events jsonb
) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_event jsonb;
  v_role text;
  v_state text;
  v_message_id text;
  v_error text;
  v_existing text;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.checkout_orders
    where order_id = p_order_id and sync_token = p_sync_token
  ) then return false; end if;
  if jsonb_typeof(p_events) <> 'array' or jsonb_array_length(p_events) > 2 then
    raise exception 'Invalid events payload';
  end if;
  for v_event in select value from jsonb_array_elements(p_events)
  loop
    v_role := v_event->>'recipient_role';
    v_state := v_event->>'state';
    v_message_id := nullif(trim(coalesce(v_event->>'provider_message_id','')), '');
    v_error := nullif(left(coalesce(v_event->>'error_message',''),300),'');
    if v_role not in ('admin','customer')
       or v_state not in ('accepted','failed')
       or (v_state = 'accepted' and (v_message_id is null or length(v_message_id) > 120))
       or (v_state = 'failed' and v_message_id is not null)
    then raise exception 'Invalid email event'; end if;
    if v_state = 'accepted' then
      select provider_message_id into v_existing
      from public.order_email_events
      where order_id=p_order_id and stage='ORDER_RECEIVED'
        and recipient_role=v_role and state='accepted';
      if found then
        if v_existing is distinct from v_message_id then
          raise exception 'Conflicting accepted email identity';
        end if;
        continue;
      end if;
    end if;
    insert into public.order_email_events (
      order_id,stage,recipient_role,state,provider_message_id,error_message,source
    ) values (
      p_order_id,'ORDER_RECEIVED',v_role,v_state,v_message_id,v_error,'send_api'
    );
  end loop;
  return true;
end;
$$;
revoke all on function public.record_checkout_email_acceptances(text,uuid,jsonb) from public, anon, authenticated;
grant execute on function public.record_checkout_email_acceptances(text,uuid,jsonb) to service_role;

create or replace function public.record_resend_lifecycle_event(
  p_message_id text,p_event_id text,p_state text,p_error text default null
) returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_order_id text;
  v_stage text;
  v_role text;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;
  if p_message_id is null or length(p_message_id) not between 4 and 128
     or p_event_id is null or length(p_event_id) not between 4 and 128
     or p_state not in ('delivered','delayed','bounced','failed','complained')
  then raise exception 'Invalid lifecycle event'; end if;
  if exists (select 1 from public.order_email_events where provider_event_id=p_event_id) then
    return 'already_recorded';
  end if;
  select order_id, stage, recipient_role into v_order_id, v_stage, v_role
    from public.order_email_events
   where provider_message_id=p_message_id and state='accepted'
   order by created_at desc limit 1;
  if not found then return 'untracked_message'; end if;
  insert into public.order_email_events (
    order_id,stage,recipient_role,state,source,provider_event_id,provider_message_id,error_message
  ) values (
    v_order_id,v_stage,v_role,p_state,'resend_webhook',
    p_event_id,p_message_id,nullif(left(coalesce(p_error,''),300),'')
  ) on conflict (provider_event_id) where provider_event_id is not null do nothing;
  return 'recorded';
end;
$$;
revoke all on function public.record_resend_lifecycle_event(text,text,text,text) from public, anon, authenticated;
grant execute on function public.record_resend_lifecycle_event(text,text,text,text) to service_role;

create or replace function public.record_shipped_email_acceptance(
  p_order_id text,p_message_id text
) returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_status text;
  v_prior_order text;
  v_prior_id text;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;
  if p_order_id is null or p_order_id !~ '^PN[0-9]{4}-[0-9]{4,}$'
     or p_message_id is null or p_message_id !~ '^[A-Za-z0-9_-]{4,128}$'
  then raise exception 'Invalid shipped email identifiers'; end if;
  select status into v_status from public.checkout_orders
    where order_id=p_order_id and environment='production';
  if not found then return 'order_not_found'; end if;
  if v_status not in ('SHIPPED','OUT_FOR_DELIVERY','DELIVERED','DELIVERY_FAILED','RETURNED') then
    return 'order_not_shipped';
  end if;
  select order_id into v_prior_order from public.order_email_events
    where provider_message_id=p_message_id and state='accepted' limit 1;
  if found then
    return case when v_prior_order=p_order_id then 'already_recorded'
                else 'message_id_conflict' end;
  end if;
  select provider_message_id into v_prior_id from public.order_email_events
    where order_id=p_order_id and stage='SHIPPED'
      and recipient_role='customer' and state='accepted' limit 1;
  if found then return 'different_message_accepted'; end if;
  insert into public.order_email_events(
    order_id,stage,recipient_role,state,source,provider_message_id
  ) values(p_order_id,'SHIPPED','customer','accepted','send_api',p_message_id);
  return 'recorded';
end;
$$;
revoke all on function public.record_shipped_email_acceptance(text,text) from public, anon, authenticated;
grant execute on function public.record_shipped_email_acceptance(text,text) to service_role;
