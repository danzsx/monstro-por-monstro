-- Versioned interactive lessons. Drafts stay private; only one version per topic is public.
create table public.interactive_module_versions (
  id uuid primary key default gen_random_uuid(),
  topic_id text not null references public.topics(id) on delete cascade,
  version integer not null check (version > 0),
  status public.editorial_status not null default 'draft',
  content jsonb not null check (jsonb_typeof(content) = 'object' and octet_length(content::text) <= 200000),
  updated_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (topic_id, version)
);
create unique index interactive_module_one_draft on public.interactive_module_versions (topic_id) where status = 'draft';
create unique index interactive_module_one_published on public.interactive_module_versions (topic_id) where status = 'published';
create index interactive_module_published_lookup on public.interactive_module_versions (topic_id) where status = 'published';

alter table public.interactive_module_versions enable row level security;
revoke all on public.interactive_module_versions from anon, authenticated;
grant select on public.interactive_module_versions to anon;
grant select, insert, delete on public.interactive_module_versions to authenticated;
grant update (content, updated_by) on public.interactive_module_versions to authenticated;

create policy interactive_module_published_read on public.interactive_module_versions
  for select to anon, authenticated using (status = 'published');
create policy interactive_module_admin_read on public.interactive_module_versions
  for select to authenticated using (public.is_admin());
create policy interactive_module_admin_insert on public.interactive_module_versions
  for insert to authenticated with check (public.is_admin() and status = 'draft');
create policy interactive_module_admin_update on public.interactive_module_versions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy interactive_module_admin_delete on public.interactive_module_versions
  for delete to authenticated using (public.is_admin() and status <> 'published');

create or replace function public.prevent_published_module_edit()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if old.status = 'published' and
    (new.content is distinct from old.content or new.topic_id is distinct from old.topic_id or new.version is distinct from old.version
      or new.status not in ('published', 'archived')) then
    raise exception 'Clone a published module into a new draft before editing' using errcode = '22023';
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger protect_published_interactive_module
before update on public.interactive_module_versions
for each row execute function public.prevent_published_module_edit();

create or replace function public.publish_interactive_module(p_module_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_module public.interactive_module_versions%rowtype;
  v_section jsonb;
  v_block jsonb;
  v_section_ids text[] := '{}';
  v_block_ids text[];
begin
  if not public.is_admin() then raise exception 'Administrator access required' using errcode = '42501'; end if;
  select * into v_module from public.interactive_module_versions where id = p_module_id for update;
  if not found or v_module.status not in ('draft', 'review') then
    raise exception 'A saved draft or review is required' using errcode = '22023';
  end if;
  if not exists (select 1 from public.topics where id = v_module.topic_id and published) then
    raise exception 'The linked topic must be published' using errcode = '22023';
  end if;
  if v_module.content->>'schemaVersion' <> '1' or v_module.content->>'topicId' <> v_module.topic_id
    or nullif(btrim(v_module.content->>'title'), '') is null
    or nullif(btrim(v_module.content->>'intro'), '') is null
    or jsonb_typeof(v_module.content->'sections') is distinct from 'array'
    or jsonb_array_length(v_module.content->'sections') = 0 then
    raise exception 'Invalid interactive module' using errcode = '22023';
  end if;
  for v_section in select value from jsonb_array_elements(v_module.content->'sections') loop
    if nullif(btrim(v_section->>'id'), '') is null or v_section->>'id' = any(v_section_ids)
      or nullif(btrim(v_section->>'title'), '') is null
      or nullif(btrim(v_section->>'objective'), '') is null
      or jsonb_typeof(v_section->'blocks') is distinct from 'array'
      or jsonb_array_length(v_section->'blocks') = 0 then
      raise exception 'Invalid interactive module section' using errcode = '22023';
    end if;
    v_section_ids := array_append(v_section_ids, v_section->>'id');
    v_block_ids := '{}';
    for v_block in select value from jsonb_array_elements(v_section->'blocks') loop
      if nullif(btrim(v_block->>'id'), '') is null or v_block->>'id' = any(v_block_ids) then
        raise exception 'Invalid or duplicate module block ID' using errcode = '22023';
      end if;
      v_block_ids := array_append(v_block_ids, v_block->>'id');
      if v_block->>'kind' = 'text' and (nullif(btrim(v_block->>'title'), '') is null or nullif(btrim(v_block->>'body'), '') is null) then
        raise exception 'Incomplete text block' using errcode = '22023';
      elsif v_block->>'kind' = 'analogy' and (nullif(btrim(v_block->>'title'), '') is null or nullif(btrim(v_block->>'body'), '') is null or nullif(btrim(v_block->>'limit'), '') is null) then
        raise exception 'Incomplete analogy block' using errcode = '22023';
      elsif v_block->>'kind' = 'list' and (nullif(btrim(v_block->>'title'), '') is null or jsonb_typeof(v_block->'items') is distinct from 'array' or jsonb_array_length(v_block->'items') = 0) then
        raise exception 'Incomplete list block' using errcode = '22023';
      elsif v_block->>'kind' = 'figure' and (nullif(btrim(v_block->>'title'), '') is null or nullif(btrim(v_block->>'caption'), '') is null or v_block->>'figureId' not in ('cell-types', 'membrane-transport', 'osmosis', 'cell-workflow')) then
        raise exception 'Incomplete figure block' using errcode = '22023';
      elsif v_block->>'kind' = 'check' and (nullif(btrim(v_block->>'prompt'), '') is null or jsonb_typeof(v_block->'options') is distinct from 'array' or jsonb_array_length(v_block->'options') <> 4 or coalesce(v_block->>'answer', '') !~ '^[0-3]$' or nullif(btrim(v_block->>'explanation'), '') is null) then
        raise exception 'Incomplete checkpoint block' using errcode = '22023';
      elsif v_block->>'kind' is null or v_block->>'kind' not in ('text', 'analogy', 'list', 'figure', 'check') then
        raise exception 'Unknown module block type' using errcode = '22023';
      end if;
      if v_block->>'kind' = 'list' and exists (
        select 1 from jsonb_array_elements(v_block->'items') as item(value)
        where jsonb_typeof(item.value) <> 'string' or nullif(btrim(item.value #>> '{}'), '') is null
      ) then
        raise exception 'List items must be nonempty text' using errcode = '22023';
      end if;
      if v_block->>'kind' = 'check' and (
        exists (
          select 1 from jsonb_array_elements(v_block->'options') as option(value)
          where jsonb_typeof(option.value) <> 'string' or nullif(btrim(option.value #>> '{}'), '') is null
        ) or (
          select count(distinct lower(btrim(option.value #>> '{}')))
          from jsonb_array_elements(v_block->'options') as option(value)
        ) <> 4
      ) then
        raise exception 'Checkpoint options must be four distinct texts' using errcode = '22023';
      end if;
    end loop;
  end loop;
  update public.interactive_module_versions set status = 'archived', updated_by = auth.uid()
    where topic_id = v_module.topic_id and status = 'published';
  update public.interactive_module_versions set status = 'published', published_at = now(), updated_by = auth.uid()
    where id = v_module.id;
end;
$$;
revoke all on function public.publish_interactive_module(uuid) from public, anon;
grant execute on function public.publish_interactive_module(uuid) to authenticated;

create or replace function public.archive_interactive_module(p_module_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Administrator access required' using errcode = '42501'; end if;
  update public.interactive_module_versions set status = 'archived', updated_by = auth.uid()
    where id = p_module_id and status = 'published';
  if not found then raise exception 'A published module is required' using errcode = '22023'; end if;
end;
$$;
revoke all on function public.archive_interactive_module(uuid) from public, anon;
grant execute on function public.archive_interactive_module(uuid) to authenticated;
