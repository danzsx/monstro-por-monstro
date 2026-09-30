-- An official item may reach the student only with item-level reproduction evidence.
alter table public.question_versions drop constraint if exists question_versions_purpose_check;
alter table public.question_versions add constraint question_versions_purpose_check
  check (purpose in ('diagnostic', 'practice', 'review', 'exam'));
alter table public.questions drop constraint if exists questions_purpose_check;
alter table public.questions add constraint questions_purpose_check
  check (purpose in ('diagnostic', 'practice', 'review', 'exam'));
alter table public.question_versions add column if not exists rights_evidence jsonb;

create or replace function public.exam_item_is_approved(p_purpose text, p_enem jsonb, p_rights jsonb)
returns boolean language sql immutable set search_path = public as $$
  select p_purpose <> 'exam' or coalesce(
    p_enem->>'exam' = 'ENEM'
    and (p_enem->>'year') ~ '^[0-9]{4}$'
    and (p_enem->>'question_number') ~ '^[1-9][0-9]*$'
    and length(trim(p_rights->>'holder')) > 0
    and length(trim(p_rights->>'authorizationReference')) > 0
    and length(trim(p_rights->>'permittedUse')) > 0
    and length(trim(p_rights->>'verifiedAt')) > 0
    and p_rights->>'includesEmbeddedMedia' = 'true', false);
$$;

-- A student can erase their own study data, including event history and sync receipts.
create or replace function public.delete_my_study_data()
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));
  delete from public.sync_receipts where user_id = v_user;
  delete from public.study_events where user_id = v_user;
  delete from public.student_snapshots where user_id = v_user;
end;
$$;
revoke all on function public.delete_my_study_data() from public, anon;
grant execute on function public.delete_my_study_data() to authenticated;

alter table public.questions add constraint published_exam_rights_required
  check (public.exam_item_is_approved(purpose, content->'enemMetadata', content->'rightsEvidence'));
alter table public.questions add constraint published_exam_shape_required
  check (purpose <> 'exam' or coalesce(
    jsonb_typeof(content->'options') = 'array' and jsonb_array_length(content->'options') = 5
    and jsonb_typeof(content->'answer') = 'number'
    and length(trim(content->>'prompt')) > 0
    and length(trim(content->>'explanation')) > 0, false));

drop policy if exists published_questions_read on public.question_versions;
create policy published_questions_read on public.question_versions for select to authenticated
  using (public.is_admin() or public.exam_item_is_approved(purpose, enem_metadata, rights_evidence)
    and exists (select 1 from public.topic_versions v where v.id = topic_version_id and v.status = 'published'));

create or replace function public.publish_topic_version(p_topic_version_id uuid)
returns void language plpgsql security invoker set search_path = public as $$
declare
  v_topic public.topic_versions%rowtype;
  v_content jsonb;
  v_sources jsonb;
  v_question_count integer;
  v_min_practice integer;
begin
  if not public.is_admin() then raise exception 'Administrator access required' using errcode = '42501'; end if;
  select * into v_topic from public.topic_versions where id = p_topic_version_id and status = 'published';
  if not found then raise exception 'Published topic version not found' using errcode = '22023'; end if;

  select count(*) into v_question_count from public.question_versions where topic_version_id = v_topic.id;
  v_min_practice := 5;
  if v_topic.topic_id in ('proportions', 'rule-of-three', 'cytology', 'genetics') then
    v_min_practice := 6;
  end if;
  if (select count(distinct question_key) from public.question_versions where topic_version_id = v_topic.id) <> v_question_count
    or (select count(*) from public.question_versions where topic_version_id = v_topic.id and purpose = 'practice') < v_min_practice
    or (select count(*) from public.question_versions where topic_version_id = v_topic.id and purpose = 'review') < 5 then
    raise exception 'Publication needs distinct practice and review questions' using errcode = '22023';
  end if;
  if exists (select 1 from public.question_versions where topic_version_id = v_topic.id
    and (provenance_kind = 'unverified' or editorial_reviewed_by is null or length(trim(provenance_note)) = 0
      or (provenance_kind = 'licensed' and provenance_note !~* 'licen[çc]a|permission|permiss')
      or (purpose = 'exam' and (provenance_kind <> 'licensed'
        or not public.exam_item_is_approved(purpose, enem_metadata, rights_evidence))))) then
    raise exception 'Question provenance, editorial review and exam reproduction rights are required' using errcode = '22023';
  end if;
  if v_topic.enem_guidance->>'status' = 'reviewed' and
    (coalesce(jsonb_array_length(v_topic.enem_guidance->'sources'), 0) = 0
      or coalesce(length(trim(v_topic.enem_guidance->>'examsAnalyzed')), 0) = 0
      or coalesce(length(trim(v_topic.enem_guidance->>'method')), 0) = 0) then
    raise exception 'Reviewed ENEM claims require corpus, method and sources' using errcode = '22023';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('title', title, 'url', url, 'publisher', publisher,
    'rightsBasis', rights_basis, 'licenseNote', license_note, 'fallbackInstructions', fallback_instructions,
    'checkedAt', checked_at, 'reviewedAt', reviewed_at) order by position, title), '[]'::jsonb) into v_sources
  from public.topic_sources where topic_version_id = v_topic.id and reviewed_by is not null
    and checked_at >= now() - interval '180 days';
  if not exists (select 1 from public.lesson_blocks where topic_version_id = v_topic.id)
    and jsonb_array_length(v_sources) = 0 then
    raise exception 'Publication without a lesson requires a reviewed current source' using errcode = '22023';
  end if;

  select jsonb_build_object('id', v_topic.topic_id, 'name', v_topic.name, 'discipline', v_topic.discipline,
    'subtitle', v_topic.subtitle, 'description', v_topic.description, 'relevance', v_topic.relevance,
    'learningContext', v_topic.learning_context, 'enemGuidance', v_topic.enem_guidance,
    'priority', v_topic.priority, 'version', v_topic.version, 'curatedSources', v_sources,
    'prerequisiteIds', coalesce((select jsonb_agg(prerequisite_topic_id order by prerequisite_topic_id)
      from public.topic_prerequisite_versions where topic_version_id = v_topic.id), '[]'::jsonb),
    'lessons', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'kind', kind, 'title', title,
      'text', body, 'formula', formula) order by position) from public.lesson_blocks where topic_version_id = v_topic.id), '[]'::jsonb)) into v_content;
  insert into public.topics(id, name, discipline, version, content, published)
    values (v_topic.topic_id, v_topic.name, v_topic.discipline, v_topic.version, v_content, true)
    on conflict (id) do update set name = excluded.name, discipline = excluded.discipline,
      version = excluded.version, content = excluded.content, published = true;
  delete from public.topic_prerequisites where topic_id = v_topic.topic_id;
  insert into public.topic_prerequisites(topic_id, prerequisite_id)
    select v_topic.topic_id, prerequisite_topic_id from public.topic_prerequisite_versions where topic_version_id = v_topic.id;
  delete from public.questions where topic_id = v_topic.topic_id;
  insert into public.questions(id, topic_id, purpose, difficulty, content)
    select question_key, v_topic.topic_id, purpose, difficulty,
      jsonb_build_object('id', question_key, 'topicId', v_topic.topic_id, 'prompt', prompt,
        'options', options, 'answer', answer, 'explanation', explanation, 'difficulty', difficulty,
        'purpose', purpose, 'version', version,
        'enemMetadata', case when purpose = 'exam' then jsonb_build_object(
          'exam', enem_metadata->>'exam', 'year', (enem_metadata->>'year')::integer,
          'color', enem_metadata->>'color', 'questionNumber', (enem_metadata->>'question_number')::integer)
          else enem_metadata end,
        'rightsEvidence', rights_evidence)
    from public.question_versions where topic_version_id = v_topic.id;
end;
$$;
