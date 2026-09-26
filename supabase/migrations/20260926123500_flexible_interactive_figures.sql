-- Allow flexible figure identifiers in interactive modules (slug format: ^[a-z0-9-]+$)
-- This allows interactive lessons for Chemistry, Physics, and Math to define custom figures beyond the cytology pilot.

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
      elsif v_block->>'kind' = 'figure' and (nullif(btrim(v_block->>'title'), '') is null or nullif(btrim(v_block->>'caption'), '') is null or nullif(btrim(v_block->>'figureId'), '') is null or v_block->>'figureId' !~ '^[a-z0-9-]+$') then
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
