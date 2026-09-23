-- Add enem_metadata jsonb to question_versions and ensure publish_topic_version bridges it
alter table public.question_versions
  add column if not exists enem_metadata jsonb;

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
