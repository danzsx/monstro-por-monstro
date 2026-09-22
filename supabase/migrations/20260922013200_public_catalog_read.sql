-- Allow anon role to read published topics, prerequisites, and questions so student app can view catalog immediately without auth.
grant select on public.topics, public.topic_prerequisites, public.questions to anon;

create policy anon_published_topics on public.topics for select to anon using (published);
create policy anon_published_questions on public.questions for select to anon using (exists (select 1 from public.topics t where t.id = topic_id and t.published));
create policy anon_published_prerequisites on public.topic_prerequisites for select to anon using (exists (select 1 from public.topics t where t.id = topic_id and t.published));
