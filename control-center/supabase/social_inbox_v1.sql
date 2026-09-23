-- PlayNice Social Inbox v1
-- Read-only Meta inbox sync foundation. Sending remains disabled.

create table if not exists public.social_inbox_threads (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('instagram','facebook')),
  meta_conversation_id text not null,
  participant_id text,
  participant_name text,
  status text not null default 'open' check (status in ('open','needs_review','replied','ignored')),
  unread_count integer not null default 0 check (unread_count >= 0),
  last_message_text text,
  last_message_direction text check (last_message_direction in ('inbound','outbound')),
  last_message_at timestamptz,
  meta_updated_at timestamptz,
  synced_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, meta_conversation_id)
);

create index if not exists social_inbox_threads_platform_idx
  on public.social_inbox_threads(platform, last_message_at desc);
create index if not exists social_inbox_threads_status_idx
  on public.social_inbox_threads(status, updated_at desc);

create table if not exists public.social_inbox_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.social_inbox_threads(id) on delete cascade,
  platform text not null check (platform in ('instagram','facebook')),
  meta_message_id text not null,
  direction text not null check (direction in ('inbound','outbound')),
  sender_id text,
  sender_name text,
  recipient_id text,
  body text,
  sent_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (platform, meta_message_id)
);

create index if not exists social_inbox_messages_thread_idx
  on public.social_inbox_messages(thread_id, sent_at asc);

alter table public.social_inbox_threads enable row level security;
alter table public.social_inbox_messages enable row level security;

revoke all on table public.social_inbox_threads from anon, authenticated;
revoke all on table public.social_inbox_messages from anon, authenticated;
grant select, insert, update on table public.social_inbox_threads to authenticated;
grant select, insert, update on table public.social_inbox_messages to authenticated;

drop policy if exists social_inbox_threads_admin_select on public.social_inbox_threads;
create policy social_inbox_threads_admin_select on public.social_inbox_threads
for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists social_inbox_threads_admin_insert on public.social_inbox_threads;
create policy social_inbox_threads_admin_insert on public.social_inbox_threads
for insert to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists social_inbox_threads_admin_update on public.social_inbox_threads;
create policy social_inbox_threads_admin_update on public.social_inbox_threads
for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists social_inbox_messages_admin_select on public.social_inbox_messages;
create policy social_inbox_messages_admin_select on public.social_inbox_messages
for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists social_inbox_messages_admin_insert on public.social_inbox_messages;
create policy social_inbox_messages_admin_insert on public.social_inbox_messages
for insert to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists social_inbox_messages_admin_update on public.social_inbox_messages;
create policy social_inbox_messages_admin_update on public.social_inbox_messages
for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

create or replace function public.set_social_inbox_thread_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_social_inbox_thread_updated_at() from public, anon, authenticated;

drop trigger if exists social_inbox_threads_updated_at on public.social_inbox_threads;
create trigger social_inbox_threads_updated_at
before update on public.social_inbox_threads
for each row execute function public.set_social_inbox_thread_updated_at();

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='social_inbox_threads') then
      alter publication supabase_realtime add table public.social_inbox_threads;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='social_inbox_messages') then
      alter publication supabase_realtime add table public.social_inbox_messages;
    end if;
  end if;
end;
$$;
