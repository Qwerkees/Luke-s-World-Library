-- LUKE'S WORLD LIBRARY: reproducible database foundation
create table public.library_divisions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  display_order integer not null unique,
  created_at timestamptz not null default now()
);

create table public.library_resources (
  id uuid primary key default gen_random_uuid(),
  division_id uuid references public.library_divisions(id) on delete set null,
  source_key text not null,
  source_record_id text not null,
  title text not null,
  description text not null default '',
  creators jsonb not null default '[]'::jsonb,
  published_at text,
  source_url text not null,
  canonical_url text,
  content_type text not null default 'record',
  license_code text not null default 'unknown'
    check (license_code in ('public_domain','open_license','all_rights_reserved','restricted','unknown')),
  access_status text not null default 'metadata_only'
    check (access_status in ('open_access','metadata_only','restricted','unavailable')),
  visibility text not null default 'public'
    check (visibility in ('public','private')),
  metadata jsonb not null default '{}'::jsonb,
  indexed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_key, source_record_id)
);

create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_language text not null default 'en'
    check (preferred_language in ('en','es')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.private_library_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  item_type text not null default 'document'
    check (item_type in ('document','image','research','business_plan','code','other')),
  storage_path text,
  original_filename text,
  mime_type text,
  source_url text,
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saved_resources (
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.library_resources(id) on delete cascade,
  collection_name text not null default 'Saved',
  note text,
  created_at timestamptz not null default now(),
  primary key (user_id, resource_id, collection_name)
);

create table public.research_notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  related_resource_ids uuid[] not null default '{}',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index library_resources_division_idx on public.library_resources(division_id);
create index library_resources_source_idx on public.library_resources(source_key);
create index library_resources_title_search_idx
  on public.library_resources using gin (to_tsvector('english', title || ' ' || description));
create index private_library_items_owner_idx
  on public.private_library_items(owner_id, created_at desc);
create index research_notes_owner_idx
  on public.research_notes(owner_id, updated_at desc);

alter table public.library_divisions enable row level security;
alter table public.library_resources enable row level security;
alter table public.user_profiles enable row level security;
alter table public.private_library_items enable row level security;
alter table public.saved_resources enable row level security;
alter table public.research_notes enable row level security;

create policy "Divisions are readable by everyone"
  on public.library_divisions for select to anon, authenticated using (true);
create policy "Public library resource metadata is readable"
  on public.library_resources for select to anon, authenticated using (visibility = 'public');
create policy "Users can insert their own profile"
  on public.user_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can read their own profile"
  on public.user_profiles for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users can update their own profile"
  on public.user_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users manage their own private library items"
  on public.private_library_items for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy "Users manage their own saved resources"
  on public.saved_resources for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users manage their own research notes"
  on public.research_notes for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

grant select on public.library_divisions, public.library_resources to anon, authenticated;
grant select, insert, update on public.user_profiles to authenticated;
grant select, insert, update, delete on
  public.private_library_items, public.saved_resources, public.research_notes
to authenticated;

insert into public.library_divisions (slug,title,description,display_order) values
('world-history','World History & Civilization','Civilizations, primary sources, timelines, and historical research.',1),
('science-medicine','Science & Medicine','Scientific discoveries, research literature, and health knowledge.',2),
('engineering-inventions','Engineering & Inventions','Engineering disciplines, inventions, systems, and technical references.',3),
('geography-culture','World Geography & Culture','Places, languages, cultures, maps, and human geography.',4),
('business-entrepreneurship','Business & Entrepreneurship','Markets, business models, operations, and entrepreneurship.',5),
('technology-ai','Technology & Artificial Intelligence','Computing, software, artificial intelligence, and emerging technology.',6),
('lukes-private-collection','Luke’s Private Collection','A private space for personal documents, research, creative work, and code.',7)
on conflict (slug) do nothing;
