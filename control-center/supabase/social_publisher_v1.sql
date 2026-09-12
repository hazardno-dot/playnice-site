-- PlayNice Social Publisher v1
-- Shadow-mode infrastructure only. No Meta publishing is enabled by this migration.

create table if not exists public.social_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('product_published','hero_published','journal_published')),
  source_type text not null check (source_type in ('product','hero','journal')),
  source_id text not null,
  source_url text,
  payload jsonb not null default '{}'::jsonb,
  media jsonb not null default '[]'::jsonb,
  channels text[] not null default array['instagram_feed','instagram_story','facebook']::text[],
  status text not null default 'draft' check (status in ('draft','ready','scheduled','published','failed','cancelled')),
  publish_mode text not null default 'shadow' check (publish_mode in ('shadow','approval','auto')),
  draft_content jsonb,
  approved_content jsonb,
  scheduled_for timestamptz,
  published_at timestamptz,
  approved_at timestamptz,
  instagram_status text,
  instagram_media_id text,
  facebook_status text,
  facebook_post_id text,
  last_error text,
  retry_count integer not null default 0 check (retry_count >= 0),
  created_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_type, source_type, source_id)
);

create index if not exists social_events_status_created_idx on public.social_events(status, created_at desc);
create index if not exists social_events_source_idx on public.social_events(source_type, source_id);
create index if not exists social_events_schedule_idx on public.social_events(scheduled_for) where status = 'scheduled';

create table if not exists public.social_audit_log (
  id bigint generated always as identity primary key,
  social_event_id uuid references public.social_events(id) on delete cascade,
  actor_id uuid references auth.users(id),
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.social_events enable row level security;
alter table public.social_audit_log enable row level security;

-- Explicit Data API exposure. Supabase no longer guarantees automatic grants for
-- newly-created public tables, so keep browser/API access deterministic and least-privilege.
revoke all on table public.social_events from anon, authenticated;
revoke all on table public.social_audit_log from anon, authenticated;
grant select, insert, update, delete on table public.social_events to authenticated;
grant select, insert on table public.social_audit_log to authenticated;
revoke all on sequence public.social_audit_log_id_seq from anon, authenticated;
grant usage, select on sequence public.social_audit_log_id_seq to authenticated;

-- Reuse Control Center admin authorization. These policies intentionally permit
-- authenticated admins to inspect and edit shadow drafts while public users have no access.
drop policy if exists social_events_admin_all on public.social_events;
create policy social_events_admin_all on public.social_events
for all to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists social_audit_admin_all on public.social_audit_log;
create policy social_audit_admin_all on public.social_audit_log
for all to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create or replace function public.set_social_events_updated_at()
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

revoke all on function public.set_social_events_updated_at() from public, anon, authenticated;

drop trigger if exists social_events_updated_at on public.social_events;
create trigger social_events_updated_at
before update on public.social_events
for each row execute function public.set_social_events_updated_at();
