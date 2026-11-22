-- Email acceptance audit for PlayNice Orders. Apply before enabling the new CC tracking UI.
-- "accepted" means Resend accepted the API request, NOT inbox delivery.
create table if not exists public.order_email_events (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.checkout_orders(order_id) on delete cascade,
  stage text not null check (stage in ('ORDER_RECEIVED','PACKED','SHIPPED')),
  recipient_role text not null check (recipient_role in ('admin','customer')),
  state text not null check (state in ('accepted','failed','delivered','delayed','bounced','complained')),
  provider_event_id text,
  source text not null default 'send_api' check (source in ('send_api','resend_webhook')),
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now()
);
create index if not exists order_email_events_order_time_idx
  on public.order_email_events(order_id,created_at desc);
-- A provider message generates MULTIPLE lifecycle events. Do not make message ID unique.
create index if not exists order_email_events_provider_message_idx
  on public.order_email_events(provider_message_id) where provider_message_id is not null;
create unique index if not exists order_email_events_provider_event_uidx
  on public.order_email_events(provider_event_id) where provider_event_id is not null;

alter table public.order_email_events enable row level security;
revoke all on public.order_email_events from anon;
grant select,insert on public.order_email_events to authenticated;
-- Admin access only. Other authenticated users cannot read or write order communications.
create policy "PlayNice admins can inspect email events"
  on public.order_email_events for select to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "PlayNice admins can record email events"
  on public.order_email_events for insert to authenticated
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

comment on table public.order_email_events is
  'Append-only Resend lifecycle history. accepted != delivered; provider_event_id deduplicates verified webhook events.';


-- At most one operator-initiated PACKED retry per order, claimed atomically.
-- This is deliberately fail-closed: uncertain outcomes require manual
-- inspection in Resend, NOT a second attempt.
create table if not exists public.order_email_retry_claims (
  order_id text not null references public.checkout_orders(order_id) on delete cascade,
  stage text not null check (stage = 'PACKED'),
  recipient_role text not null check (recipient_role = 'customer'),
  claimed_by uuid not null,
  claimed_at timestamptz not null default now(),
  primary key (order_id,stage,recipient_role)
);
alter table public.order_email_retry_claims enable row level security;
revoke all on public.order_email_retry_claims from anon, authenticated;

create or replace function public.claim_packed_email_retry(p_order_id text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null or not exists (
    select 1 from public.admin_users where user_id = v_user
  ) then
    raise exception 'ADMIN_REQUIRED' using errcode='42501';
  end if;
  if not exists (
    select 1 from public.checkout_orders
    where order_id=p_order_id and status='PACKED' and environment='production'
  ) then
    return false;
  end if;
  -- A provider-accepted message must never be manually resent just because
  -- it later bounced, delayed, or the inbox is full.
  if exists (
    select 1 from public.order_email_events
    where order_id=p_order_id and stage='PACKED'
      and recipient_role='customer' and state='accepted'
  ) then
    return false;
  end if;
  if not exists (
    select 1 from public.order_email_events
    where order_id=p_order_id and stage='PACKED'
      and recipient_role='customer' and state='failed'
  ) then
    return false;
  end if;
  insert into public.order_email_retry_claims(order_id,stage,recipient_role,claimed_by)
  values(p_order_id,'PACKED','customer',v_user)
  on conflict do nothing;
  return found;
end;
$$;
revoke all on function public.claim_packed_email_retry(text) from public, anon;
grant execute on function public.claim_packed_email_retry(text) to authenticated;

-- Read-only admin projection for disabling already-consumed retry controls.
create or replace function public.get_control_center_email_retry_claims()
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_user uuid := auth.uid(); v_result jsonb;
begin
  if v_user is null or not exists (
    select 1 from public.admin_users where user_id = v_user
  ) then
    raise exception 'ADMIN_REQUIRED' using errcode='42501';
  end if;
  select coalesce(jsonb_agg(order_id),'[]'::jsonb) into v_result
  from public.order_email_retry_claims;
  return v_result;
end;
$$;
revoke all on function public.get_control_center_email_retry_claims() from public, anon;
grant execute on function public.get_control_center_email_retry_claims() to authenticated;
