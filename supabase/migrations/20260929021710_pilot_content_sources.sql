-- Phase 4: a curated external source can replace an in-app lesson.
-- Draft editorial rows are never exposed directly to learners.
create table public.topic_sources (
  id uuid primary key default gen_random_uuid(),
  topic_version_id uuid not null references public.topic_versions(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  url text not null check (url ~ '^https://[^[:space:]]+$'),
  publisher text not null check (length(trim(publisher)) > 0),
  rights_basis text not null check (rights_basis in ('link_only', 'licensed')),
  license_note text not null default '',
  fallback_instructions text not null check (length(trim(fallback_instructions)) > 0),
  checked_at timestamptz not null,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  position integer not null default 0 check (position >= 0),
  unique (topic_version_id, url),
  check ((reviewed_by is null) = (reviewed_at is null)),
  check (rights_basis <> 'licensed' or length(trim(license_note)) > 0)
);
create index topic_sources_version_position on public.topic_sources(topic_version_id, position);
alter table public.topic_sources enable row level security;
revoke all on public.topic_sources from anon, authenticated;
grant select, insert, update, delete on public.topic_sources to authenticated;
create policy admin_topic_sources on public.topic_sources for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.question_versions
  add column provenance_kind text not null default 'unverified'
    check (provenance_kind in ('unverified', 'original', 'licensed', 'exam_reference')),
  add column provenance_note text not null default '',
  add column editorial_reviewed_by uuid references auth.users(id),
  add column editorial_reviewed_at timestamptz,
  add constraint question_review_pair check ((editorial_reviewed_by is null) = (editorial_reviewed_at is null));

create or replace function public.publish_topic_version(p_topic_version_id uuid)
returns void language plpgsql security invoker set search_path = public as $$
declare
  v_topic public.topic_versions%rowtype;
  v_content jsonb;
  v_sources jsonb;
  v_question_count integer;
begin
  if not public.is_admin() then raise exception 'Administrator access required' using errcode = '42501'; end if;
  select * into v_topic from public.topic_versions where id = p_topic_version_id and status = 'published';
  if not found then raise exception 'Published topic version not found' using errcode = '22023'; end if;

  select count(*) into v_question_count from public.question_versions where topic_version_id = v_topic.id;
  if (select count(distinct question_key) from public.question_versions where topic_version_id = v_topic.id) <> v_question_count
    or (select count(*) from public.question_versions where topic_version_id = v_topic.id and purpose = 'practice') < 5
    or (select count(*) from public.question_versions where topic_version_id = v_topic.id and purpose = 'review') < 5 then
    raise exception 'Publication needs five distinct practice and five review questions' using errcode = '22023';
  end if;
  if exists (select 1 from public.question_versions where topic_version_id = v_topic.id
    and (provenance_kind = 'unverified' or editorial_reviewed_by is null
      or length(trim(provenance_note)) = 0
      or (provenance_kind = 'licensed' and provenance_note !~* 'licen[çc]a|permission|permiss')) ) then
    raise exception 'Question provenance and editorial review are required' using errcode = '22023';
  end if;
  if v_topic.enem_guidance->>'status' = 'reviewed' and
    (coalesce(jsonb_array_length(v_topic.enem_guidance->'sources'), 0) = 0
      or coalesce(length(trim(v_topic.enem_guidance->>'examsAnalyzed')), 0) = 0
      or coalesce(length(trim(v_topic.enem_guidance->>'method')), 0) = 0) then
    raise exception 'Reviewed ENEM claims require corpus, method and sources' using errcode = '22023';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'title', title, 'url', url, 'publisher', publisher, 'rightsBasis', rights_basis,
    'licenseNote', license_note, 'fallbackInstructions', fallback_instructions,
    'checkedAt', checked_at, 'reviewedAt', reviewed_at
  ) order by position, title), '[]'::jsonb) into v_sources
  from public.topic_sources where topic_version_id = v_topic.id and reviewed_by is not null
    and checked_at >= now() - interval '180 days';
  if not exists (select 1 from public.lesson_blocks where topic_version_id = v_topic.id)
    and jsonb_array_length(v_sources) = 0 then
    raise exception 'Publication without a lesson requires a reviewed current source' using errcode = '22023';
  end if;

  select jsonb_build_object(
    'id', v_topic.topic_id, 'name', v_topic.name, 'discipline', v_topic.discipline,
    'subtitle', v_topic.subtitle, 'description', v_topic.description, 'relevance', v_topic.relevance,
    'learningContext', v_topic.learning_context, 'enemGuidance', v_topic.enem_guidance,
    'priority', v_topic.priority, 'version', v_topic.version, 'curatedSources', v_sources,
    'prerequisiteIds', coalesce((select jsonb_agg(prerequisite_topic_id order by prerequisite_topic_id) from public.topic_prerequisite_versions where topic_version_id = v_topic.id), '[]'::jsonb),
    'lessons', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'kind', kind, 'title', title, 'text', body, 'formula', formula) order by position) from public.lesson_blocks where topic_version_id = v_topic.id), '[]'::jsonb)
  ) into v_content;
  insert into public.topics(id, name, discipline, version, content, published)
    values (v_topic.topic_id, v_topic.name, v_topic.discipline, v_topic.version, v_content, true)
    on conflict (id) do update set name = excluded.name, discipline = excluded.discipline, version = excluded.version, content = excluded.content, published = true;
  delete from public.topic_prerequisites where topic_id = v_topic.topic_id;
  insert into public.topic_prerequisites(topic_id, prerequisite_id)
    select v_topic.topic_id, prerequisite_topic_id from public.topic_prerequisite_versions where topic_version_id = v_topic.id;
  delete from public.questions where topic_id = v_topic.topic_id;
  insert into public.questions(id, topic_id, purpose, difficulty, content)
    select question_key, v_topic.topic_id, purpose, difficulty,
      jsonb_build_object('id', question_key, 'topicId', v_topic.topic_id, 'prompt', prompt,
        'options', options, 'answer', answer, 'explanation', explanation,
        'difficulty', difficulty, 'purpose', purpose, 'version', version,
        'enemMetadata', enem_metadata)
    from public.question_versions where topic_version_id = v_topic.id;
end;
$$;
revoke all on function public.publish_topic_version(uuid) from public, anon;
grant execute on function public.publish_topic_version(uuid) to authenticated;

-- Release order: apply this compatible database change before the v2 app writes.
alter table public.student_snapshots drop constraint if exists student_snapshots_snapshot_check;
alter table public.student_snapshots add constraint student_snapshots_snapshot_check
  check (snapshot->>'version' in ('1', '2'));
create or replace function public.sync_progress(p_operation_id uuid, p_expected_revision bigint, p_snapshot jsonb, p_events jsonb)
returns bigint language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_user uuid := auth.uid();
  v_revision bigint;
  v_event jsonb;
begin
  if v_user is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if not coalesce(p_snapshot->>'version' in ('1', '2'), false) or jsonb_typeof(p_events) is distinct from 'array' then
    raise exception 'Invalid progress envelope' using errcode = '22023';
  end if;
  if octet_length(p_snapshot::text) > 2000000 or jsonb_array_length(p_events) > 200 then
    raise exception 'Progress envelope too large' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));
  select revision into v_revision from public.sync_receipts where user_id = v_user and operation_id = p_operation_id;
  if found then return v_revision; end if;
  select revision into v_revision from public.student_snapshots where user_id = v_user for update;
  if not found then v_revision := 0; end if;
  if v_revision <> p_expected_revision then raise exception 'Revision conflict' using errcode = '40001'; end if;
  for v_event in select value from jsonb_array_elements(p_events) loop
    insert into public.study_events(user_id, id, kind, occurred_at, payload)
      values (v_user, (v_event->>'id')::uuid, v_event->>'kind', (v_event->>'at')::timestamptz, v_event->'payload')
      on conflict (user_id, id) do nothing;
  end loop;
  v_revision := v_revision + 1;
  insert into public.student_snapshots(user_id, revision, snapshot) values (v_user, v_revision, p_snapshot)
    on conflict (user_id) do update set revision = excluded.revision, snapshot = excluded.snapshot, updated_at = now();
  insert into public.sync_receipts(user_id, operation_id, revision) values (v_user, p_operation_id, v_revision);
  return v_revision;
end;
$$;
revoke all on function public.sync_progress(uuid, bigint, jsonb, jsonb) from public, anon;
grant execute on function public.sync_progress(uuid, bigint, jsonb, jsonb) to authenticated;
