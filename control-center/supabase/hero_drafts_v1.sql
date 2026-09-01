-- PlayNice Control Center / Hero draft editor v1
-- Applied to the playnice-control-center Supabase project.
-- Drafts are isolated from public.hero_slides and from the live Shop.

create table if not exists public.hero_drafts (
  id uuid primary key default gen_random_uuid(),
  hero_key text not null unique references public.hero_slides(hero_key) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  review_status text not null default 'draft' check (review_status in ('draft','ready','approved')),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  approved_payload jsonb,
  baseline_snapshot jsonb
);

alter table public.hero_drafts enable row level security;

revoke all on table public.hero_drafts from anon;
revoke all on table public.hero_drafts from authenticated;
grant select, insert, update, delete on table public.hero_drafts to authenticated;

create policy hero_drafts_select_own on public.hero_drafts for select to authenticated
using (created_by = auth.uid() and exists (select 1 from public.admin_users au where au.user_id = auth.uid()));
create policy hero_drafts_insert_own on public.hero_drafts for insert to authenticated
with check (created_by = auth.uid() and exists (select 1 from public.admin_users au where au.user_id = auth.uid()));
create policy hero_drafts_update_own on public.hero_drafts for update to authenticated
using (created_by = auth.uid() and exists (select 1 from public.admin_users au where au.user_id = auth.uid()))
with check (created_by = auth.uid() and exists (select 1 from public.admin_users au where au.user_id = auth.uid()));
create policy hero_drafts_delete_own on public.hero_drafts for delete to authenticated
using (created_by = auth.uid() and exists (select 1 from public.admin_users au where au.user_id = auth.uid()));
