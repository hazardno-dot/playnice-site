-- PlayNice Social Inbox Assistant v2
-- Deterministic draft storage. Drafts are never sent automatically.

create table if not exists public.social_inbox_drafts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.social_inbox_threads(id) on delete cascade,
  source_message_id uuid not null references public.social_inbox_messages(id) on delete cascade,
  platform text not null default 'facebook' check (platform = 'facebook'),
  status text not null default 'ready'
    check (status in ('ready','needs_review','superseded','sent','dismissed')),
  intent text not null,
  confidence numeric(4,3) not null default 0
    check (confidence >= 0 and confidence <= 1),
  body text,
  reason text,
  rules_version text not null,
  notified_at timestamptz,
  notification_error text,
  sent_at timestamptz,
  sent_message_id text,
  final_text text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (thread_id, source_message_id)
);

create index if not exists social_inbox_drafts_thread_idx
  on public.social_inbox_drafts(thread_id, created_at desc);

create index if not exists social_inbox_drafts_status_idx
  on public.social_inbox_drafts(status, created_at desc);

alter table public.social_inbox_drafts enable row level security;

revoke all on table public.social_inbox_drafts from anon, authenticated;
grant select, insert, update on table public.social_inbox_drafts to authenticated;

drop policy if exists social_inbox_drafts_admin_select on public.social_inbox_drafts;
create policy social_inbox_drafts_admin_select on public.social_inbox_drafts
for select to authenticated
using (exists (
  select 1 from public.admin_users a
  where a.user_id = (select auth.uid())
));

drop policy if exists social_inbox_drafts_admin_insert on public.social_inbox_drafts;
create policy social_inbox_drafts_admin_insert on public.social_inbox_drafts
for insert to authenticated
with check (exists (
  select 1 from public.admin_users a
  where a.user_id = (select auth.uid())
));

drop policy if exists social_inbox_drafts_admin_update on public.social_inbox_drafts;
create policy social_inbox_drafts_admin_update on public.social_inbox_drafts
for update to authenticated
using (exists (
  select 1 from public.admin_users a
  where a.user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.admin_users a
  where a.user_id = (select auth.uid())
));

create or replace function public.set_social_inbox_draft_updated_at()
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

revoke all on function public.set_social_inbox_draft_updated_at() from public, anon, authenticated;

drop trigger if exists social_inbox_drafts_updated_at on public.social_inbox_drafts;
create trigger social_inbox_drafts_updated_at
before update on public.social_inbox_drafts
for each row execute function public.set_social_inbox_draft_updated_at();

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'social_inbox_drafts'
    ) then
      alter publication supabase_realtime add table public.social_inbox_drafts;
    end if;
  end if;
end;
$$;
