-- PlayNice Control Center / Hero v1 read-only schema
-- Applied to the playnice-control-center Supabase project.
-- This table is intentionally SELECT-only for authenticated PlayNice admins.

create table if not exists public.hero_slides (
  id bigint primary key,
  hero_key text not null unique,
  kind text not null default 'imageOnly' check (kind in ('imageOnly')),
  enabled boolean not null default true,
  pinned_first boolean not null default false,
  position integer not null default 0,
  image text not null,
  desktop_image text not null,
  mobile_image text not null,
  alt text not null,
  action_type text not null check (action_type in ('none','shop','product','collection','manifesto')),
  product_slug text,
  preferred_size text,
  collection_title text,
  collection_slugs text[] not null default '{}',
  manifesto_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hero_product_action_contract check (action_type <> 'product' or product_slug is not null),
  constraint hero_collection_action_contract check (action_type <> 'collection' or cardinality(collection_slugs) > 0),
  constraint hero_manifesto_action_contract check (action_type <> 'manifesto' or manifesto_type is not null)
);

create unique index if not exists hero_slides_single_pinned_first
  on public.hero_slides (pinned_first)
  where pinned_first = true;

alter table public.hero_slides enable row level security;
revoke all on table public.hero_slides from anon;
revoke insert, update, delete, truncate, references, trigger on table public.hero_slides from authenticated;
grant select on table public.hero_slides to authenticated;

drop policy if exists hero_slides_admin_read on public.hero_slides;
create policy hero_slides_admin_read
  on public.hero_slides
  for select
  to authenticated
  using (exists (
    select 1 from public.admin_users au
    where au.user_id = (select auth.uid())
  ));

insert into public.hero_slides (
  id, hero_key, kind, enabled, pinned_first, position,
  image, desktop_image, mobile_image, alt,
  action_type, product_slug, preferred_size,
  collection_title, collection_slugs, manifesto_type
) values
  (12,'hero-12','imageOnly',true,true,1,'/hero/slide-12.jpg','/hero/slide-12.jpg','/hero/mobile/slide-12-mobile.jpg','Thomas Kosmala No. 7 Le Sel de la Terre','collection',null,null,'Thomas Kosmala, three times.',array['thomas-kosmala-no-1-tonic-blanc','thomas-kosmala-no-4-apres-lamour','thomas-kosmala-no7-le-sel-de-la-terre'],null),
  (9,'hero-9','imageOnly',true,false,2,'/hero/slide-9.jpg','/hero/slide-9.jpg','/hero/mobile/slide-9-mobile.jpg','Optional: special action, drop ili limited stock','collection',null,null,'SOFT. BOLD. LUXURY.',array['swiss-arabian-musk-01','gisada-luxury-collection-royal'],null),
  (6,'hero-6','imageOnly',true,false,3,'/hero/slide-6.jpg','/hero/slide-6.jpg','/hero/mobile/slide-6-mobile.jpg','JASMINE IN THE SUN Now at PlayNice','product','my-geisha-jasmine-in-the-sun','10ml',null,'{}',null),
  (2,'hero-2','imageOnly',true,false,4,'/hero/slide-2.jpg','/hero/slide-2.jpg','/hero/mobile/slide-2-mobile.jpg','PlayNice – luxury fragrance experience and trust','manifesto',null,null,null,'{}','confidence'),
  (3,'hero-3','imageOnly',true,false,5,'/hero/slide-light-blue-2025.jpg','/hero/slide-light-blue-2025.jpg','/hero/mobile/slide-light-blue-2025-mobile.jpg','Dolce & Gabbana Light Blue Pour Homme 2025','product','dolce-gabbana-light-blue-pour-homme-2025','10ml',null,'{}',null),
  (4,'hero-4','imageOnly',true,false,6,'/hero/slide-4.jpg','/hero/slide-4.jpg','/hero/mobile/slide-4-mobile.jpg','PlayNice Private Selection – trusted premium decants','manifesto',null,null,null,'{}','playnice-mission'),
  (5,'hero-5','imageOnly',true,false,7,'/hero/slide-5.jpg','/hero/slide-5.jpg','/hero/mobile/slide-5-mobile.jpg','Summer Bangers','collection',null,null,'Summer Bangers',array['dolce-gabbana-light-blue-pour-homme-2025','giorgio-armani-acqua-di-gio-profondo-parfum','versace-man-eau-fraiche','ysl-y-iced-cologne','acqua-di-parma-fico-di-amalfi'],null),
  (1,'hero-1','imageOnly',true,false,8,'/hero/slide-1-fix.jpg','/hero/slide-1-fix.jpg','/hero/mobile/slide-1-mobile.jpg','Yves Saint Laurent Y Iced Cologne','product','ysl-y-iced-cologne','10ml',null,'{}',null),
  (7,'hero-7','imageOnly',true,false,9,'/hero/slide-7.jpg','/hero/slide-7.jpg','/hero/mobile/slide-7-mobile.jpg','Optional: special action, drop ili limited stock','product','armaf-club-de-nuit-intense-overdose','10ml',null,'{}',null),
  (8,'hero-8','imageOnly',true,false,10,'/hero/slide-8.jpg','/hero/slide-8.jpg','/hero/mobile/slide-8-mobile.jpg','Optional: special action, drop ili limited stock','manifesto',null,null,null,'{}','details'),
  (10,'hero-10','imageOnly',true,false,11,'/hero/slide-10.jpg','/hero/slide-10.jpg','/hero/mobile/slide-10-mobile.jpg','Optional: special action, drop ili limited stock','collection',null,null,'Three parfumers. Three icons. One house.',array['essential-parfums-nice-bergamote','essential-parfums-orange-x-santal','bois-imperial-essential-parfums'],null),
  (11,'hero-11','imageOnly',true,false,12,'/hero/slide-11.jpg','/hero/slide-11.jpg','/hero/mobile/slide-11-mobile.jpg','Od sada u PlayNice kolekciji – 6 ikoničnih mirisa','collection',null,null,'Od sada u PlayNice kolekciji',array['bvlgari-man-in-black-edp','carolina-herrera-bad-boy-cobalt-edp','prada-luna-rossa-ocean-edt','mancera-aoud-lemon-mint','prada-paradigme-edp','ysl-myslf-edp'],null)
on conflict (id) do update set
  hero_key=excluded.hero_key,
  kind=excluded.kind,
  enabled=excluded.enabled,
  pinned_first=excluded.pinned_first,
  position=excluded.position,
  image=excluded.image,
  desktop_image=excluded.desktop_image,
  mobile_image=excluded.mobile_image,
  alt=excluded.alt,
  action_type=excluded.action_type,
  product_slug=excluded.product_slug,
  preferred_size=excluded.preferred_size,
  collection_title=excluded.collection_title,
  collection_slugs=excluded.collection_slugs,
  manifesto_type=excluded.manifesto_type,
  updated_at=now();
