-- Social Publisher: allow clean campaign drafts that are not tied to Product, Hero or Journal.

alter table public.social_events
  drop constraint if exists social_events_event_type_check;

alter table public.social_events
  add constraint social_events_event_type_check
  check (event_type in ('product_published','hero_published','journal_published','manual_post'));

alter table public.social_events
  drop constraint if exists social_events_source_type_check;

alter table public.social_events
  add constraint social_events_source_type_check
  check (source_type in ('product','hero','journal','custom'));
