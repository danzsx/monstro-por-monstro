alter table public.topic_versions
  add column learning_context jsonb not null default '{"overview":"","applications":[],"limitations":""}'::jsonb,
  add column enem_guidance jsonb not null default '{"status":"pending","priorities":[],"commonPatterns":[],"lowerIncidence":[],"examsAnalyzed":"","sources":[]}'::jsonb;

-- Pilot context: apply it to existing cytology editorial versions that have no content yet.
update public.topic_versions
set learning_context = '{
  "overview": "Citologia estuda a célula: como sua membrana, seu material genético e suas estruturas trabalham juntas para manter a vida. Mais do que decorar nomes, vale compreender a função de cada estrutura e como a célula responde ao que acontece ao seu redor.",
  "applications": [
    "Em clínicas de fertilização, profissionais acompanham a fecundação e as primeiras divisões celulares de embriões com microscópios.",
    "Na biotecnologia, células podem ser cultivadas em laboratório para pesquisar processos biológicos e produzir substâncias de interesse médico.",
    "Na saúde, exames de células ajudam equipes especializadas a observar alterações em tecidos e orientar investigações clínicas."
  ],
  "limitations": "Conhecer as estruturas celulares ajuda a interpretar esses contextos, mas não substitui técnicas laboratoriais, dados clínicos ou a avaliação de profissionais. Em cada situação, é preciso combinar citologia com outros conhecimentos."
}'::jsonb
where topic_id = 'cytology'
  and coalesce(learning_context->>'overview', '') = '';

-- Make the pilot visible immediately for readers of the already-published catalog.
update public.topics t
set content = jsonb_set(
  coalesce(t.content, '{}'::jsonb),
  '{learningContext}',
  v.learning_context,
  true
)
from (
  select distinct on (topic_id) topic_id, learning_context
  from public.topic_versions
  where status = 'published'
  order by topic_id, version desc
) v
where t.id = v.topic_id
  and t.id = 'cytology'
  and coalesce(t.content #>> '{learningContext,overview}', '') = '';

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
      jsonb_build_object('id', question_key, 'topicId', v_topic.topic_id, 'prompt', prompt, 'options', options, 'answer', answer, 'explanation', explanation, 'difficulty', difficulty, 'purpose', purpose)
    from public.question_versions where topic_version_id = v_topic.id;
end;
$$;
