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
  metadata jsonb not null default '{}'::jsonb,
  channels text[] not null default array['instagram_feed','instagram_story','facebook']::text[],
  status text not null default 'draft' check (status in ('draft','ready','scheduled','published','failed','cancelled')),
  publish_mode text not null default 'shadow' check (publish_mode in ('shadow','approval','auto')),
  draft_content jsonb,
  approved_content jsonb,
  scheduled_for timestamptz,
  next_retry_at timestamptz,
  last_attempt_at timestamptz,
  execution_token uuid,
  execution_lease_until timestamptz,
  shadow_executed_at timestamptz,
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

-- Keep this script safe to re-run after the initial table has already been activated.
alter table public.social_events add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.social_events add column if not exists next_retry_at timestamptz;
alter table public.social_events add column if not exists last_attempt_at timestamptz;
alter table public.social_events add column if not exists execution_token uuid;
alter table public.social_events add column if not exists execution_lease_until timestamptz;
alter table public.social_events add column if not exists shadow_executed_at timestamptz;

create index if not exists social_events_status_created_idx on public.social_events(status, created_at desc);
create index if not exists social_events_source_idx on public.social_events(source_type, source_id);
create index if not exists social_events_schedule_idx on public.social_events(scheduled_for) where status = 'scheduled';
create index if not exists social_events_retry_idx on public.social_events(next_retry_at) where status = 'scheduled';
create index if not exists social_events_lease_idx on public.social_events(execution_lease_until) where status = 'scheduled';
create index if not exists social_events_created_by_idx on public.social_events(created_by);
create index if not exists social_events_approved_by_idx on public.social_events(approved_by);

create table if not exists public.social_audit_log (
  id bigint generated always as identity primary key,
  social_event_id uuid references public.social_events(id) on delete cascade,
  actor_id uuid references auth.users(id),
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists social_audit_log_event_idx on public.social_audit_log(social_event_id);
create index if not exists social_audit_log_actor_idx on public.social_audit_log(actor_id);

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

-- Reuse Control Center admin authorization. The scalar auth.uid() subquery is
-- deliberately init-plan friendly so it is not re-evaluated for each candidate row.
drop policy if exists social_events_admin_all on public.social_events;
create policy social_events_admin_all on public.social_events
for all to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

drop policy if exists social_audit_admin_all on public.social_audit_log;
create policy social_audit_admin_all on public.social_audit_log
for all to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

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

-- Atomically lease one due event. Keeping status='scheduled' while leased means the
-- existing UI/status model remains stable; execution_token + lease_until provide the claim.
-- Shadow events are claimed only once after a successful shadow execution. If publish_mode
-- is later changed to approval/auto, shadow_executed_at does not block the future live path.
create or replace function public.claim_due_social_event(
  p_now timestamptz default now(),
  p_lease_seconds integer default 120
)
returns setof public.social_events
language plpgsql
security invoker
set search_path = public
as $$
declare
  claimed_id uuid;
begin
  select e.id
    into claimed_id
    from public.social_events e
   where e.status = 'scheduled'
     and e.approved_content is not null
     and e.scheduled_for is not null
     and e.scheduled_for <= p_now
     and (e.next_retry_at is null or e.next_retry_at <= p_now)
     and (e.execution_lease_until is null or e.execution_lease_until <= p_now)
     and (e.publish_mode <> 'shadow' or e.shadow_executed_at is null)
   order by coalesce(e.next_retry_at, e.scheduled_for), e.created_at
   for update skip locked
   limit 1;

  if claimed_id is null then
    return;
  end if;

  return query
  update public.social_events
     set execution_token = gen_random_uuid(),
         execution_lease_until = p_now + make_interval(secs => greatest(30, least(p_lease_seconds, 900))),
         last_attempt_at = p_now
   where id = claimed_id
   returning *;
end;
$$;

revoke all on function public.claim_due_social_event(timestamptz, integer) from public, anon;
grant execute on function public.claim_due_social_event(timestamptz, integer) to authenticated;
