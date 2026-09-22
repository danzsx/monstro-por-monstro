-- Editorial CMS: administrator access, versioned content and media.
create type public.editorial_status as enum ('draft', 'review', 'published', 'archived');

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.topic_versions (
  id uuid primary key default gen_random_uuid(),
  topic_id text not null,
  version integer not null check (version > 0),
  status public.editorial_status not null default 'draft',
  name text not null,
  slug text not null,
  discipline text not null,
  subtitle text not null default '',
  description text not null default '',
  relevance text not null default '',
  priority numeric not null default 0,
  monster_asset_path text,
  bestiary_asset_path text,
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (topic_id, version),
  unique (slug, version)
);

create table public.lesson_blocks (
  id uuid primary key default gen_random_uuid(),
  topic_version_id uuid not null references public.topic_versions(id) on delete cascade,
  position integer not null check (position >= 0),
  kind text not null check (kind in ('concept', 'example', 'recall', 'summary', 'pitfall', 'tip', 'review')),
  title text not null,
  body text not null,
  formula text,
  media_asset_id uuid,
  unique (topic_version_id, position)
);

create table public.question_versions (
  id uuid primary key default gen_random_uuid(),
  topic_version_id uuid not null references public.topic_versions(id) on delete cascade,
  question_key text not null,
  version integer not null check (version > 0),
  purpose text not null check (purpose in ('diagnostic', 'practice', 'review')),
  difficulty integer not null check (difficulty between 1 and 3),
  prompt text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  answer integer not null check (answer between 0 and 3),
  explanation text not null,
  lesson_block_id uuid references public.lesson_blocks(id) on delete set null,
  media_asset_id uuid,
  created_by uuid not null references auth.users(id),
  updated_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (topic_version_id, question_key, version)
);

create table public.topic_prerequisite_versions (
  topic_version_id uuid not null references public.topic_versions(id) on delete cascade,
  prerequisite_topic_id text not null,
  primary key (topic_version_id, prerequisite_topic_id),
  check (topic_version_id::text <> prerequisite_topic_id)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'editorial-media',
  path text not null unique,
  filename text not null,
  mime_type text not null check (mime_type in ('image/png', 'image/jpeg', 'image/webp', 'image/svg+xml')),
  bytes integer not null check (bytes > 0 and bytes <= 5242880),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.editorial_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id),
  entity_type text not null,
  entity_id text not null,
  action text not null check (action in ('created', 'updated', 'submitted', 'published', 'archived')),
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security invoker set search_path = public as $$
  select exists (select 1 from public.admin_profiles where user_id = (select auth.uid()) and active);
$$;

alter table public.admin_profiles enable row level security;
alter table public.topic_versions enable row level security;
alter table public.lesson_blocks enable row level security;
alter table public.question_versions enable row level security;
alter table public.topic_prerequisite_versions enable row level security;
alter table public.media_assets enable row level security;
alter table public.editorial_audit_log enable row level security;

revoke all on public.admin_profiles, public.topic_versions, public.lesson_blocks, public.question_versions,
  public.topic_prerequisite_versions, public.media_assets, public.editorial_audit_log from anon, authenticated;
grant select on public.admin_profiles to authenticated;
grant select on public.topic_versions, public.lesson_blocks, public.question_versions, public.topic_prerequisite_versions to authenticated;
grant select, insert, update, delete on public.topic_versions, public.lesson_blocks, public.question_versions,
  public.topic_prerequisite_versions, public.media_assets to authenticated;
grant select on public.editorial_audit_log to authenticated;

create policy admin_self on public.admin_profiles for select to authenticated using (user_id = (select auth.uid()));
create policy published_versions_read on public.topic_versions for select to authenticated using (status = 'published' or public.is_admin());
create policy admin_topic_versions_write on public.topic_versions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy published_blocks_read on public.lesson_blocks for select to authenticated using (exists (select 1 from public.topic_versions v where v.id = topic_version_id and (v.status = 'published' or public.is_admin())));
create policy admin_blocks_write on public.lesson_blocks for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy published_questions_read on public.question_versions for select to authenticated using (exists (select 1 from public.topic_versions v where v.id = topic_version_id and (v.status = 'published' or public.is_admin())));
create policy admin_questions_write on public.question_versions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy published_prerequisites_read on public.topic_prerequisite_versions for select to authenticated using (exists (select 1 from public.topic_versions v where v.id = topic_version_id and (v.status = 'published' or public.is_admin())));
create policy admin_prerequisites_write on public.topic_prerequisite_versions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_media_access on public.media_assets for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_audit_read on public.editorial_audit_log for select to authenticated using (public.is_admin());
create policy admin_audit_insert on public.editorial_audit_log for insert to authenticated with check (public.is_admin() and actor_id = (select auth.uid()));

insert into storage.buckets (id, name, public) values ('editorial-media', 'editorial-media', false) on conflict (id) do nothing;
create policy admin_media_storage_read on storage.objects for select to authenticated using (bucket_id = 'editorial-media' and public.is_admin());
create policy admin_media_storage_insert on storage.objects for insert to authenticated with check (bucket_id = 'editorial-media' and public.is_admin());
create policy admin_media_storage_update on storage.objects for update to authenticated using (bucket_id = 'editorial-media' and public.is_admin()) with check (bucket_id = 'editorial-media' and public.is_admin());
create policy admin_media_storage_delete on storage.objects for delete to authenticated using (bucket_id = 'editorial-media' and public.is_admin());

create or replace view public.editorial_dashboard with (security_invoker = true) as
select
  count(*) filter (where status = 'published') as published_count,
  count(*) filter (where status = 'draft') as draft_count,
  count(*) filter (where status = 'review') as review_count,
  count(*) filter (where status = 'archived') as archived_count
from public.topic_versions
where public.is_admin();
