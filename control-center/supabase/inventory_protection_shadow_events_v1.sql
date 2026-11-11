-- PlayNice Inventory Protection: passive observability schema (NOT applied by this PR).
-- Deploy separately, after review. Does not modify checkout, stock or order records.
-- Do NOT expose insert privileges to anon/authenticated. Store no customer identity,
-- IP, UA, raw cart contents or exact stock balances.

create table if not exists public.inventory_protection_shadow_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product_key text not null check (length(product_key) between 1 and 160),
  source text not null check (source in ('ADD_TO_CART','CART_QUANTITY','CHECKOUT')),
  decision text not null check (decision in ('ALLOW','WOULD_BLOCK','UNKNOWN')),
  reason text not null check (length(reason) between 1 and 96),
  environment text not null check (environment in ('production','preview')),
  evaluated_by text not null default 'server' check (evaluated_by='server'),
  evaluation_version text not null check (length(evaluation_version) between 1 and 32)
);

create index if not exists inventory_protection_shadow_recent_idx
  on public.inventory_protection_shadow_events (created_at desc);
create index if not exists inventory_protection_shadow_decision_idx
  on public.inventory_protection_shadow_events (decision, created_at desc);

alter table public.inventory_protection_shadow_events enable row level security;
revoke all on public.inventory_protection_shadow_events from public, anon, authenticated;
-- Service role (server only) owns event inserts; an authenticated user must never
-- write decisions or impersonate authoritative checks.

create or replace function public.get_control_center_inventory_protection_shadow(
  p_since timestamptz default now() - interval '24 hours'
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $function$
declare
  v_uid uuid := auth.uid();
  v_from timestamptz := greatest(coalesce(p_since, now()-interval '24 hours'),now()-interval '7 days');
  v_counts jsonb;
  v_recent jsonb;
begin
  if v_uid is null or not exists (
    select 1 from public.admin_users a where a.user_id=v_uid
  ) then raise exception 'ADMIN_REQUIRED' using errcode='42501'; end if;

  select jsonb_build_object(
    'total',count(*),
    'allow',count(*) filter (where decision='ALLOW'),
    'would_block',count(*) filter (where decision='WOULD_BLOCK'),
    'unknown',count(*) filter (where decision='UNKNOWN')
  ) into v_counts
  from public.inventory_protection_shadow_events
  where created_at>=v_from and environment='production';

  select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc),'[]'::jsonb)
  into v_recent from (
    select created_at,product_key,source,decision,reason,evaluation_version
    from public.inventory_protection_shadow_events
    where created_at>=v_from and environment='production'
    order by created_at desc limit 50
  ) x;

  return jsonb_build_object('mode','SHADOW_ONLY','since',v_from,
      'counts',coalesce(v_counts,'{}'::jsonb),'recent',v_recent);
end;
$function$;

revoke all on function public.get_control_center_inventory_protection_shadow(timestamptz)
  from public,anon;
grant execute on function public.get_control_center_inventory_protection_shadow(timestamptz)
  to authenticated;

-- Retention plan: add a separately reviewed purge job, initially 30 days.
-- Do NOT activate event inserts until the identity mapping, server-side evaluator,
-- rate limits, payload validation and monitoring tests have been reviewed.
