-- PlayNice Control Center / Hero pin swap v2
-- Keeps the single-pinned Hero contract while allowing a new Hero to take the pin atomically.

create or replace function public.finalize_hero_apply(p_hero_key text, p_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $function$
begin
  if auth.uid() is null or not exists (
    select 1 from public.admin_users where user_id = auth.uid()
  ) then
    raise exception 'PlayNice admin access required';
  end if;

  if p_hero_key is null or btrim(p_hero_key) = '' or p_payload is null then
    raise exception 'hero_key and payload are required';
  end if;

  -- A pinned Hero may not be directly unpinned, because that would leave zero
  -- pinned slides. The supported operation is to pin another Hero instead.
  if coalesce((p_payload->>'pinnedFirst')::boolean, false) = false
     and exists (
       select 1 from public.hero_slides
       where hero_key = p_hero_key and pinned_first = true
     ) then
    raise exception 'Pinned Hero cannot be unpinned directly. Pin another Hero to move the pin.';
  end if;

  -- If this Hero is becoming pinned, release the existing pin first. Both
  -- updates run inside this function transaction, so persisted state remains
  -- consistent and the unique partial index is never violated.
  if coalesce((p_payload->>'pinnedFirst')::boolean, false) = true then
    update public.hero_slides
    set pinned_first = false, updated_at = now()
    where hero_key <> p_hero_key and pinned_first = true;
  end if;

  update public.hero_slides
  set
    kind = coalesce(nullif(p_payload->>'kind',''), kind),
    enabled = coalesce((p_payload->>'enabled')::boolean, enabled),
    pinned_first = coalesce((p_payload->>'pinnedFirst')::boolean, pinned_first),
    image = coalesce(nullif(p_payload->>'image',''), nullif(p_payload->>'desktopImage',''), image),
    desktop_image = coalesce(nullif(p_payload->>'desktopImage',''), nullif(p_payload->>'image',''), desktop_image),
    mobile_image = coalesce(nullif(p_payload->>'mobileImage',''), mobile_image),
    alt = coalesce(p_payload->>'alt', alt),
    action_type = coalesce(nullif(p_payload->>'actionPrimary',''), action_type),
    product_slug = nullif(p_payload->>'actionProductSlug',''),
    preferred_size = nullif(p_payload->>'preferredSize',''),
    collection_title = nullif(p_payload->>'collectionTitle',''),
    collection_slugs = coalesce(
      (select array_agg(value::text order by ordinality)
       from jsonb_array_elements_text(coalesce(p_payload->'actionCollection','[]'::jsonb))
       with ordinality as t(value, ordinality)),
      '{}'::text[]
    ),
    manifesto_type = nullif(p_payload->>'manifestoType',''),
    updated_at = now()
  where hero_key = p_hero_key;

  if not found then
    raise exception 'Hero baseline not found';
  end if;

  delete from public.hero_drafts where hero_key = p_hero_key;
end;
$function$;
