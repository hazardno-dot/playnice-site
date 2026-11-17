-- DRAFT ONLY. Do not apply to Production until explicitly approved.
-- Administrative purchase policy (per fragrance, per order), independent of inventory.
-- The default 30 ml applies when no override exists. This table stores overrides only.
create table if not exists public.inventory_purchase_cap_overrides_v1 (
  product_name text primary key,
  limit_ml numeric(8,2) not null check (limit_ml >= 2 and limit_ml <= 200),
  updated_at timestamptz not null default now(),
  updated_by uuid not null
);
alter table public.inventory_purchase_cap_overrides_v1 enable row level security;
revoke all on public.inventory_purchase_cap_overrides_v1 from public, anon, authenticated;
-- SECURITY DEFINER functions below are the only client-visible access path.

create or replace function public.get_control_center_purchase_caps_v1()
returns jsonb language plpgsql stable security definer set search_path=''
as $function$
declare v_user uuid := auth.uid(); v_overrides jsonb;
begin
  if v_user is null or not exists(
    select 1 from public.admin_users a where a.user_id=v_user
  ) then raise exception 'ADMIN_REQUIRED' using errcode='42501'; end if;
  select coalesce(jsonb_object_agg(product_name,limit_ml order by product_name),'{}'::jsonb)
    into v_overrides from public.inventory_purchase_cap_overrides_v1;
  return jsonb_build_object('default_limit_ml',30,'overrides',v_overrides);
end;
$function$;

create or replace function public.set_control_center_purchase_cap_v1(
  p_product_name text, p_limit_ml numeric default null
)
returns jsonb language plpgsql volatile security definer set search_path=''
as $function$
declare v_user uuid := auth.uid(); v_product_name text;
begin
  if v_user is null or not exists(
    select 1 from public.admin_users a where a.user_id=v_user
  ) then raise exception 'ADMIN_REQUIRED' using errcode='42501'; end if;
  select e.product_name into v_product_name
    from public.fragrance_inventory_events e
    where lower(trim(e.product_name))=lower(trim(p_product_name))
    order by e.created_at desc,e.id desc limit 1;
  if v_product_name is null then
    raise exception 'UNKNOWN_INVENTORY_PRODUCT' using errcode='22023';
  end if;
  if p_limit_ml is null or p_limit_ml=30 then
    delete from public.inventory_purchase_cap_overrides_v1
      where lower(product_name)=lower(v_product_name);
  elsif p_limit_ml < 2 or p_limit_ml > 200 or p_limit_ml*100 <> trunc(p_limit_ml*100) then
    raise exception 'INVALID_PURCHASE_CAP' using errcode='22023';
  else
    insert into public.inventory_purchase_cap_overrides_v1(product_name,limit_ml,updated_at,updated_by)
    values(v_product_name,p_limit_ml,now(),v_user)
    on conflict(product_name) do update
      set limit_ml=excluded.limit_ml,updated_at=excluded.updated_at,updated_by=excluded.updated_by;
  end if;
  return public.get_control_center_purchase_caps_v1();
end;
$function$;

create or replace function public.get_shop_purchase_caps_v1()
returns jsonb language plpgsql stable security definer set search_path=''
as $function$
declare v_overrides jsonb;
begin
  if current_user <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501';
  end if;
  select coalesce(jsonb_object_agg(product_name,limit_ml order by product_name),'{}'::jsonb)
    into v_overrides from public.inventory_purchase_cap_overrides_v1;
  return jsonb_build_object('default_limit_ml',30,'overrides',v_overrides);
end;
$function$;

revoke all on function public.get_control_center_purchase_caps_v1() from public,anon,authenticated;
revoke all on function public.set_control_center_purchase_cap_v1(text,numeric) from public,anon,authenticated;
revoke all on function public.get_shop_purchase_caps_v1() from public,anon,authenticated;
grant execute on function public.get_control_center_purchase_caps_v1() to authenticated;
grant execute on function public.set_control_center_purchase_cap_v1(text,numeric) to authenticated;
grant execute on function public.get_shop_purchase_caps_v1() to service_role;
