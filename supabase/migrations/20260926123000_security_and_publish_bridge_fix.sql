-- Fix publish_topic_version regression: restore learningContext and enemGuidance in published topics
-- Secure student study data: revoke direct mutation privileges on student_snapshots, study_events, sync_receipts;
-- enforce atomic mutations strictly through the sync_progress RPC (security definer).

-- 1. Restore learningContext and enemGuidance in publish_topic_version
create or replace function public.publish_topic_version(p_topic_version_id uuid)
returns void language plpgsql security invoker set search_path = public as $$
declare
  v_topic public.topic_versions%rowtype;
  v_content jsonb;
begin
  if not public.is_admin() then raise exception 'Administrator access required' using errcode = '42501'; end if;
  select * into v_topic from public.topic_versions where id = p_topic_version_id and status = 'published';
  if not found then raise exception 'Published topic version not found' using errcode = '22023'; end if;
  if not exists (select 1 from public.lesson_blocks where topic_version_id = v_topic.id)
    or not exists (select 1 from public.question_versions where topic_version_id = v_topic.id) then
    raise exception 'A published topic needs lessons and questions' using errcode = '22023';
  end if;
  select jsonb_build_object(
    'id', v_topic.topic_id, 'name', v_topic.name, 'discipline', v_topic.discipline,
    'subtitle', v_topic.subtitle, 'description', v_topic.description, 'relevance', v_topic.relevance,
    'learningContext', v_topic.learning_context, 'enemGuidance', v_topic.enem_guidance,
    'priority', v_topic.priority, 'version', v_topic.version,
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
      jsonb_build_object(
        'id', question_key,
        'topicId', v_topic.topic_id,
        'prompt', prompt,
        'options', options,
        'answer', answer,
        'explanation', explanation,
        'difficulty', difficulty,
        'purpose', purpose,
        'enemMetadata', enem_metadata
      )
    from public.question_versions where topic_version_id = v_topic.id;
end;
$$;

-- 2. Secure student snapshots and study events
-- Revoke direct table mutation privileges from client roles
revoke insert, update, delete on public.student_snapshots from authenticated, anon;
revoke insert, update, delete on public.study_events from authenticated, anon;
revoke insert, update, delete on public.sync_receipts from authenticated, anon;

-- Drop obsolete direct insert/update policies
drop policy if exists own_snapshot_insert on public.student_snapshots;
drop policy if exists own_snapshot_update on public.student_snapshots;
drop policy if exists own_event_insert on public.study_events;
drop policy if exists own_receipt_insert on public.sync_receipts;

-- 3. Elevate sync_progress to security definer with protected search_path
-- This ensures that only validated operations through this RPC can modify student progress.
create or replace function public.sync_progress(p_operation_id uuid, p_expected_revision bigint, p_snapshot jsonb, p_events jsonb)
returns bigint language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_user uuid := auth.uid();
  v_revision bigint;
  v_event jsonb;
begin
  if v_user is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if p_snapshot->>'version' is distinct from '1' or jsonb_typeof(p_events) is distinct from 'array' then
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
