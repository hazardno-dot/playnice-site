-- PlayNice Social Inbox webhook heartbeat
-- Stores technical delivery diagnostics only; never stores customer message content.

create table if not exists public.social_inbox_webhook_state (
  platform text primary key check (platform = 'facebook'),
  last_received_at timestamptz,
  last_event_object text,
  last_entry_count integer not null default 0 check (last_entry_count >= 0),
  last_sender_count integer not null default 0 check (last_sender_count >= 0),
  last_processed integer not null default 0 check (last_processed >= 0),
  last_reason text,
  last_error text,
  updated_at timestamptz not null default now()
);

alter table public.social_inbox_webhook_state enable row level security;

revoke all on table public.social_inbox_webhook_state from anon, authenticated, service_role;
grant select, insert, update on table public.social_inbox_webhook_state to service_role;

comment on table public.social_inbox_webhook_state is
  'Technical heartbeat for Social Inbox webhook delivery. No customer message content is stored.';
