-- Email acceptance audit for PlayNice Orders. Apply before enabling the new CC tracking UI.
-- "accepted" means Resend accepted the API request, NOT inbox delivery.
create table if not exists public.order_email_events (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.checkout_orders(order_id) on delete cascade,
  stage text not null check (stage in ('ORDER_RECEIVED','PACKED','SHIPPED')),
  recipient_role text not null check (recipient_role in ('admin','customer')),
  state text not null check (state in ('accepted','failed','delivered','delayed','bounced')),
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now()
);
create index if not exists order_email_events_order_time_idx
  on public.order_email_events(order_id,created_at desc);
create unique index if not exists order_email_events_provider_message_uidx
  on public.order_email_events(provider_message_id) where provider_message_id is not null;

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
  'Append-only provider outcome history. Accepted != delivered. Webhook delivery status requires separate verified integration.';
