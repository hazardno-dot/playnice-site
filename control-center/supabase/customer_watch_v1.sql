-- Customer Watch / Order Alert v1
-- Internal operational flags matched to future orders by normalized email or phone.
-- Supabase remains canonical; this data is intentionally not mirrored to Google Sheets.

create table if not exists public.customer_watches (
  id uuid primary key default gen_random_uuid(),
  email_key text,
  phone_key text,
  display_name text,
  level text not null default 'VERIFY_BEFORE_SHIPPING',
  reason text not null,
  source_order_id uuid references public.checkout_orders(id) on delete set null,
  active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_watches_level_check check (
    level in ('WATCH','VERIFY_BEFORE_SHIPPING','MANUAL_APPROVAL')
  ),
  constraint customer_watches_identity_check check (
    nullif(trim(coalesce(email_key,'')),'') is not null
    or nullif(trim(coalesce(phone_key,'')),'') is not null
  )
);

create index if not exists customer_watches_email_key_idx
  on public.customer_watches (email_key)
  where active and email_key is not null;

create index if not exists customer_watches_phone_key_idx
  on public.customer_watches (phone_key)
  where active and phone_key is not null;

alter table public.customer_watches enable row level security;

create or replace function public.get_control_center_customer_watches()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_rows jsonb;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if not exists (select 1 from public.admin_users a where a.user_id=v_uid) then
    raise exception 'ADMIN_REQUIRED' using errcode='42501';
  end if;

  select coalesce(jsonb_agg(to_jsonb(w) order by w.updated_at desc),'[]'::jsonb)
  into v_rows
  from (
    select id,email_key,phone_key,display_name,level,reason,source_order_id,
           active,created_at,updated_at
    from public.customer_watches
    where active=true
    order by updated_at desc
  ) w;

  return v_rows;
end;
$function$;

create or replace function public.upsert_control_center_customer_watch(
  p_record_id uuid,
  p_level text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_order public.checkout_orders%rowtype;
  v_email text;
  v_phone text;
  v_name text;
  v_level text := upper(trim(coalesce(p_level,'')));
  v_reason text := trim(coalesce(p_reason,''));
  v_existing public.customer_watches%rowtype;
  v_watch public.customer_watches%rowtype;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if not exists (select 1 from public.admin_users a where a.user_id=v_uid) then
    raise exception 'ADMIN_REQUIRED' using errcode='42501';
  end if;

  if v_level not in ('WATCH','VERIFY_BEFORE_SHIPPING','MANUAL_APPROVAL') then
    raise exception 'INVALID_CUSTOMER_WATCH_LEVEL';
  end if;
  if length(v_reason) < 4 then raise exception 'CUSTOMER_WATCH_REASON_REQUIRED'; end if;
  if length(v_reason) > 500 then raise exception 'CUSTOMER_WATCH_REASON_TOO_LONG'; end if;

  select * into v_order
  from public.checkout_orders
  where id=p_record_id and environment='production'
  limit 1;

  if not found then raise exception 'ORDER_NOT_FOUND'; end if;

  v_email := lower(trim(coalesce(v_order.source_payload->>'email','')));
  if v_email='' then v_email := null; end if;

  v_phone := regexp_replace(coalesce(v_order.source_payload->>'phone',''),'[^0-9]','','g');
  if length(v_phone)>=8 then v_phone := right(v_phone,8); else v_phone := null; end if;

  v_name := left(trim(coalesce(v_order.source_payload->>'fullName','')),160);

  if v_email is null and v_phone is null then
    raise exception 'CUSTOMER_WATCH_REQUIRES_EMAIL_OR_PHONE';
  end if;

  select * into v_existing
  from public.customer_watches
  where active=true
    and ((v_email is not null and email_key=v_email)
      or (v_phone is not null and phone_key=v_phone))
  order by updated_at desc
  limit 1
  for update;

  if found then
    update public.customer_watches
    set email_key=coalesce(v_email,email_key),
        phone_key=coalesce(v_phone,phone_key),
        display_name=coalesce(nullif(v_name,''),display_name),
        level=v_level,
        reason=v_reason,
        source_order_id=v_order.id,
        updated_at=now()
    where id=v_existing.id
    returning * into v_watch;
  else
    insert into public.customer_watches(
      email_key,phone_key,display_name,level,reason,source_order_id,active,created_by
    ) values (
      v_email,v_phone,nullif(v_name,''),v_level,v_reason,v_order.id,true,v_uid
    )
    returning * into v_watch;
  end if;

  return to_jsonb(v_watch);
end;
$function$;

create or replace function public.deactivate_control_center_customer_watch(
  p_watch_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_watch public.customer_watches%rowtype;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
  if not exists (select 1 from public.admin_users a where a.user_id=v_uid) then
    raise exception 'ADMIN_REQUIRED' using errcode='42501';
  end if;

  update public.customer_watches
  set active=false, updated_at=now()
  where id=p_watch_id and active=true
  returning * into v_watch;

  if not found then raise exception 'CUSTOMER_WATCH_NOT_FOUND'; end if;
  return to_jsonb(v_watch);
end;
$function$;

revoke all on public.customer_watches from anon, authenticated;

revoke all on function public.get_control_center_customer_watches() from public, anon;
revoke all on function public.upsert_control_center_customer_watch(uuid,text,text) from public, anon;
revoke all on function public.deactivate_control_center_customer_watch(uuid) from public, anon;

grant execute on function public.get_control_center_customer_watches() to authenticated;
grant execute on function public.upsert_control_center_customer_watch(uuid,text,text) to authenticated;
grant execute on function public.deactivate_control_center_customer_watch(uuid) to authenticated;
