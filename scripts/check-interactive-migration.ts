import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { CYTOLOGY_MODULE } from '../src/apostila/cytology';

const adminId = '11111111-1111-4111-8111-111111111111';
const studentId = '22222222-2222-4222-8222-222222222222';
const migration = readFileSync(resolve(__dirname, '../supabase/migrations/20260924042521_interactive_modules.sql'), 'utf8');
const db = new PGlite();
const check = (truth: unknown, message: string) => { if (!truth) throw new Error(message); };
async function rejects(sql: string, message: string) {
  let rejected = false;
  try { await db.exec(sql); } catch { rejected = true; }
  check(rejected, message);
}
async function role(name: 'anon' | 'authenticated' | 'postgres', userId?: string) {
  await db.exec(`set role ${name}; set request.jwt.claim.sub = '${userId ?? ''}';`);
}

async function main() {
try {
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    create type public.editorial_status as enum ('draft', 'review', 'published', 'archived');
    create table public.admin_profiles (user_id uuid primary key references auth.users(id), active boolean not null);
    grant select on public.admin_profiles to authenticated;
    create function public.is_admin() returns boolean language sql stable security invoker as $$
      select exists (select 1 from public.admin_profiles where user_id = auth.uid() and active)
    $$;
    create table public.topics (id text primary key, name text not null, published boolean not null);
    grant select on public.topics to anon, authenticated;
    alter table public.topics enable row level security;
    create policy published_topics on public.topics for select to anon, authenticated using (published);
    insert into auth.users (id) values ('${adminId}'), ('${studentId}');
    insert into public.admin_profiles (user_id, active) values ('${adminId}', true);
    insert into public.topics (id, name, published) values ('cytology', 'Citologia', true);
  `);
  await db.exec(migration);
  const rights = await db.query<{ anon_write: boolean; auth_write: boolean }>(`
    select has_table_privilege('anon', 'public.interactive_module_versions', 'insert') as anon_write,
      has_table_privilege('authenticated', 'public.interactive_module_versions', 'insert') as auth_write
  `);
  check(!rights.rows[0].anon_write && rights.rows[0].auth_write, 'Grants incorretos.');
  await role('authenticated', adminId);
  const content = JSON.stringify(CYTOLOGY_MODULE);
  const first = await db.query<{ id: string }>('insert into public.interactive_module_versions(topic_id,version,content) values ($1,1,$2::jsonb) returning id', ['cytology', content]);
  const firstId = first.rows[0].id;
  const draft = await db.query<{ status: string }>('select status from public.interactive_module_versions where id = $1', [firstId]);
  check(draft.rows[0].status === 'draft', 'O administrador precisa ver o rascunho.');
  await role('anon');
  check((await db.query('select id from public.interactive_module_versions')).rows.length === 0, 'Rascunho exposto ao público.');
  await rejects(`insert into public.interactive_module_versions(topic_id,version,content) values ('cytology',2,'{}'::jsonb)`, 'Visitante conseguiu criar apostila.');
  await role('authenticated', studentId);
  check((await db.query('select id from public.interactive_module_versions')).rows.length === 0, 'Rascunho exposto a estudante.');
  await rejects(`insert into public.interactive_module_versions(topic_id,version,content) values ('cytology',2,'{}'::jsonb)`, 'Estudante conseguiu criar apostila.');
  await rejects(`select public.publish_interactive_module('${firstId}'::uuid)`, 'Estudante conseguiu publicar apostila.');
  await role('authenticated', adminId);
  await rejects(`update public.interactive_module_versions set status = 'published' where id = '${firstId}'`, 'Publicação direta permitida.');
  await db.query('select public.publish_interactive_module($1::uuid)', [firstId]);
  await role('anon');
  const publicFirst = await db.query<{ version: number }>('select version from public.interactive_module_versions');
  check(publicFirst.rows.length === 1 && publicFirst.rows[0].version === 1, 'Publicação inicial invisível.');
  await role('authenticated', adminId);
  await rejects(`update public.interactive_module_versions set content = '{}'::jsonb where id = '${firstId}'`, 'A versão publicada foi editada diretamente.');
  const updated = JSON.stringify({ ...CYTOLOGY_MODULE, title: 'Citologia revisada' });
  const incomplete = JSON.stringify({ ...CYTOLOGY_MODULE, sections: [] });
  const second = await db.query<{ id: string }>('insert into public.interactive_module_versions(topic_id,version,content) values ($1,2,$2::jsonb) returning id', ['cytology', incomplete]);
  await rejects(`select public.publish_interactive_module('${second.rows[0].id}'::uuid)`, 'Rascunho incompleto foi publicado.');
  await role('anon');
  check((await db.query<{ version: number }>('select version from public.interactive_module_versions')).rows[0].version === 1, 'Falha de validação removeu a versão pública.');
  await role('authenticated', adminId);
  await db.query('update public.interactive_module_versions set content = $1::jsonb where id = $2::uuid', [updated, second.rows[0].id]);
  await db.query('select public.publish_interactive_module($1::uuid)', [second.rows[0].id]);
  await role('anon');
  const publicSecond = await db.query<{ version: number }>('select version from public.interactive_module_versions');
  check(publicSecond.rows.length === 1 && publicSecond.rows[0].version === 2, 'Troca de versão não foi atômica.');
  await role('authenticated', adminId);
  await db.query('select public.archive_interactive_module($1::uuid)', [second.rows[0].id]);
  await role('anon');
  check((await db.query('select id from public.interactive_module_versions')).rows.length === 0, 'Versão arquivada ainda está pública.');
  console.log('Apostilas: migração, grants, RLS, publicação e arquivamento OK.');
} finally {
  await db.close();
}
}

void main().catch(error => { console.error(error); process.exitCode = 1; });
