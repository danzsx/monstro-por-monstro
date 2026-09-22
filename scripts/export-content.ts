import { writeFileSync } from 'node:fs';
import { TOPICS } from '../src/content/catalog';
const sql = (value: unknown) => "'" + JSON.stringify(value).replaceAll("'", "''") + "'::jsonb";
const literal = (value: string) => "'" + value.replaceAll("'", "''") + "'";
const statements = ['-- Generated from src/content. Run npm run content:seed after editorial changes.', 'begin;'];
for (const topic of TOPICS) {
  const { questions, ...content } = topic;
  statements.push(`insert into public.topics(id,name,discipline,version,content,published) values (${literal(topic.id)},${literal(topic.name)},${literal(topic.discipline)},${topic.version},${sql(content)},true) on conflict(id) do update set name=excluded.name,discipline=excluded.discipline,version=excluded.version,content=excluded.content,published=true;`);
  for (const q of questions) statements.push(`insert into public.questions(id,topic_id,purpose,difficulty,content) values (${literal(q.id)},${literal(topic.id)},${literal(q.purpose)},${q.difficulty},${sql(q)}) on conflict(id) do update set purpose=excluded.purpose,difficulty=excluded.difficulty,content=excluded.content;`);
}
for (const topic of TOPICS) for (const p of topic.prerequisiteIds) statements.push(`insert into public.topic_prerequisites values (${literal(topic.id)},${literal(p)}) on conflict do nothing;`);
statements.push('commit;');
writeFileSync('supabase/seed.sql', statements.join('\n') + '\n', 'utf8');
console.log(`Seed: ${TOPICS.length} monstros e ${TOPICS.reduce((n,t) => n + t.questions.length, 0)} questões.`);
