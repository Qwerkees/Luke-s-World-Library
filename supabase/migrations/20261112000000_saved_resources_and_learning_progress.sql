-- Saved external catalogue bookmarks and owner-scoped learning progress.
create table if not exists public.saved_external_resources (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (char_length(source) between 1 and 80),
  title text not null check (char_length(title) between 1 and 500),
  description text not null default '',
  source_url text not null check (source_url ~ '^https?://'),
  collection_name text not null default 'Saved' check (char_length(collection_name) between 1 and 80),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, source_url, collection_name)
);
create index if not exists saved_external_resources_owner_created_idx on public.saved_external_resources(owner_id, created_at desc);
alter table public.saved_external_resources enable row level security;
drop policy if exists "Users manage their own external bookmarks" on public.saved_external_resources;
create policy "Users manage their own external bookmarks" on public.saved_external_resources for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
grant select, insert, update, delete on public.saved_external_resources to authenticated;

create table if not exists public.user_learning_progress (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  module_key text not null check (module_key in ('explore','time','map','learn')),
  item_key text not null check (char_length(item_key) between 1 and 160),
  status text not null default 'started' check (status in ('started','completed')),
  score integer check (score between 0 and 100),
  attempts integer not null default 0 check (attempts >= 0),
  completed_at timestamptz,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, module_key, item_key)
);
create index if not exists user_learning_progress_owner_activity_idx on public.user_learning_progress(owner_id, last_activity_at desc);
alter table public.user_learning_progress enable row level security;
drop policy if exists "Users manage their own learning progress" on public.user_learning_progress;
create policy "Users manage their own learning progress" on public.user_learning_progress for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
grant select, insert, update, delete on public.user_learning_progress to authenticated;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists saved_external_resources_updated_at on public.saved_external_resources;
create trigger saved_external_resources_updated_at before update on public.saved_external_resources for each row execute function public.set_updated_at();
drop trigger if exists user_learning_progress_updated_at on public.user_learning_progress;
create trigger user_learning_progress_updated_at before update on public.user_learning_progress for each row execute function public.set_updated_at();
revoke all on function public.set_updated_at() from public, anon, authenticated;
