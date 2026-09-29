-- Community intake production write-through v2.
-- Supabase is canonical; Google Apps Script is a best-effort mirror after canonical acceptance.

alter table public.scent_requests
  add column if not exists request_token text;

create unique index if not exists scent_requests_request_token_uidx
  on public.scent_requests (request_token)
  where request_token is not null;

create or replace function public.submit_scent_request_v2(
  p_fragrance text,
  p_language text default '',
  p_page text default '',
  p_device_id text default '',
  p_request_token text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_fragrance text := trim(coalesce(p_fragrance,''));
  v_device_id text := trim(coalesce(p_device_id,''));
  v_language text := left(trim(coalesce(p_language,'')),12);
  v_page text := left(trim(coalesce(p_page,'')),500);
  v_request_token text := trim(coalesce(p_request_token,''));
  v_normalized text;
  v_now timestamptz := now();
  v_latest_same timestamptz;
  v_recent_count integer := 0;
  v_oldest_recent timestamptz;
  v_remaining interval;
  v_remaining_days integer;
  v_remaining_hours integer;
  v_id bigint;
  v_existing public.scent_requests%rowtype;
begin
  if v_fragrance = '' or char_length(v_fragrance) > 240 then
    return jsonb_build_object('status','error','message','Invalid fragrance');
  end if;
  if v_device_id = '' or char_length(v_device_id) > 200 then
    return jsonb_build_object('status','error','message','Invalid deviceId');
  end if;
  if v_request_token = '' or char_length(v_request_token) > 200 then
    return jsonb_build_object('status','error','message','Invalid request token');
  end if;

  v_normalized := public.normalize_scent_request_name(v_fragrance);
  if v_normalized = '' then
    return jsonb_build_object('status','error','message','Invalid fragrance');
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_device_id, 0));

  select * into v_existing
  from public.scent_requests
  where request_token = v_request_token
  limit 1;

  if found then
    if v_existing.device_id is distinct from v_device_id
       or v_existing.fragrance_normalized is distinct from v_normalized then
      return jsonb_build_object('status','error','message','Request token conflict');
    end if;
    return jsonb_build_object(
      'status','ok',
      'type','scent_request',
      'id',v_existing.id,
      'duplicate',true,
      'mirrorStatus',v_existing.mirror_status
    );
  end if;

  select max(created_at)
  into v_latest_same
  from public.scent_requests
  where device_id = v_device_id
    and source = 'scent_request'
    and fragrance_normalized = v_normalized;

  if v_latest_same is not null and v_latest_same > v_now - interval '3 days' then
    v_remaining := (v_latest_same + interval '3 days') - v_now;
    v_remaining_days := greatest(1, ceil(extract(epoch from v_remaining) / 86400.0)::integer);
    return jsonb_build_object(
      'status','blocked',
      'type','scent_request',
      'blockReason','same_fragrance',
      'message','Same fragrance cooldown active',
      'remainingDays',v_remaining_days
    );
  end if;

  select count(*), min(created_at)
  into v_recent_count, v_oldest_recent
  from public.scent_requests
  where device_id = v_device_id
    and source = 'scent_request'
    and created_at > v_now - interval '24 hours';

  if v_recent_count >= 3 then
    v_remaining := (v_oldest_recent + interval '24 hours') - v_now;
    v_remaining_hours := greatest(1, ceil(extract(epoch from v_remaining) / 3600.0)::integer);
    return jsonb_build_object(
      'status','blocked',
      'type','scent_request',
      'blockReason','daily_limit',
      'message','Daily scent request limit reached',
      'remainingHours',v_remaining_hours
    );
  end if;

  insert into public.scent_requests (
    created_at, fragrance, fragrance_normalized, language, page, source,
    device_id, request_token, mirror_status
  ) values (
    v_now, v_fragrance, v_normalized, v_language, v_page, 'scent_request',
    v_device_id, v_request_token, 'pending'
  )
  returning id into v_id;

  return jsonb_build_object(
    'status','ok',
    'type','scent_request',
    'id',v_id,
    'duplicate',false,
    'mirrorStatus','pending'
  );
end;
$function$;

create or replace function public.mark_scent_request_mirror(
  p_id bigint,
  p_device_id text,
  p_request_token text,
  p_status text,
  p_error text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_status text := lower(trim(coalesce(p_status,'')));
begin
  if v_status not in ('synced','failed') then
    return jsonb_build_object('status','error','message','Invalid mirror status');
  end if;

  update public.scent_requests
  set mirror_status = v_status,
      mirror_synced_at = case when v_status='synced' then now() else null end,
      mirror_error = case when v_status='failed' then left(coalesce(p_error,''),400) else null end
  where id = p_id
    and device_id = trim(coalesce(p_device_id,''))
    and request_token = trim(coalesce(p_request_token,''));

  if not found then
    return jsonb_build_object('status','error','message','Scent request mirror row not found');
  end if;

  return jsonb_build_object('status','ok','mirrorStatus',v_status);
end;
$function$;

create or replace function public.mark_journal_feedback_mirror(
  p_feedback_id text,
  p_device_id text,
  p_status text,
  p_error text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_status text := lower(trim(coalesce(p_status,'')));
begin
  if v_status not in ('synced','failed') then
    return jsonb_build_object('status','error','message','Invalid mirror status');
  end if;

  update public.journal_feedback
  set mirror_status = v_status,
      mirror_synced_at = case when v_status='synced' then now() else null end,
      mirror_error = case when v_status='failed' then left(coalesce(p_error,''),400) else null end
  where feedback_id = trim(coalesce(p_feedback_id,''))
    and device_id = trim(coalesce(p_device_id,''));

  if not found then
    return jsonb_build_object('status','error','message','Journal feedback mirror row not found');
  end if;

  return jsonb_build_object('status','ok','mirrorStatus',v_status);
end;
$function$;

revoke execute on function public.submit_scent_request_v2(text,text,text,text,text) from public;
revoke execute on function public.mark_scent_request_mirror(bigint,text,text,text,text) from public;
revoke execute on function public.mark_journal_feedback_mirror(text,text,text,text) from public;

grant execute on function public.submit_scent_request_v2(text,text,text,text,text) to anon, authenticated;
grant execute on function public.mark_scent_request_mirror(bigint,text,text,text,text) to anon, authenticated;
grant execute on function public.mark_journal_feedback_mirror(text,text,text,text) to anon, authenticated;
