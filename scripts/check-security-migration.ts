import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const adminId = '11111111-1111-4111-8111-111111111111';
const studentId = '22222222-2222-4222-8222-222222222222';

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
    // 1. Setup mock Supabase environment
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
      insert into auth.users (id) values ('${adminId}'), ('${studentId}');

      create schema storage;
      create table storage.buckets (id text primary key, name text, public boolean);
      create table storage.objects (id uuid primary key, bucket_id text, name text);
      alter table storage.objects enable row level security;
      grant all on schema storage to anon, authenticated;
      grant all on storage.buckets, storage.objects to anon, authenticated;
    `);

    // 2. Load all migrations in order
    const migrationFiles = [
      '20260922002559_learning_foundation.sql',
      '20260922013000_editorial_cms.sql',
      '20260922013100_editorial_publish_bridge.sql',
      '20260922013200_public_catalog_read.sql',
      '20260922013300_monster_knowledge.sql',
      '20260922013400_enem_question_metadata.sql',
      '20260924042521_interactive_modules.sql',
      '20260926123000_security_and_publish_bridge_fix.sql',
      '20260926123500_flexible_interactive_figures.sql',
    ];

    for (const file of migrationFiles) {
      const sql = readFileSync(resolve(__dirname, '../supabase/migrations', file), 'utf8');
      await db.exec(sql);
    }

    // 3. Verify Table Privileges: authenticated must NOT have direct insert/update on student_snapshots or study_events
    const privileges = await db.query<{
      snapshot_insert: boolean;
      snapshot_update: boolean;
      event_insert: boolean;
      receipt_insert: boolean;
    }>(`
      select
        has_table_privilege('authenticated', 'public.student_snapshots', 'insert') as snapshot_insert,
        has_table_privilege('authenticated', 'public.student_snapshots', 'update') as snapshot_update,
        has_table_privilege('authenticated', 'public.study_events', 'insert') as event_insert,
        has_table_privilege('authenticated', 'public.sync_receipts', 'insert') as receipt_insert
    `);

    const p = privileges.rows[0];
    check(!p.snapshot_insert, 'Segurança violada: authenticated ainda tem permissão de insert em student_snapshots.');
    check(!p.snapshot_update, 'Segurança violada: authenticated ainda tem permissão de update em student_snapshots.');
    check(!p.event_insert, 'Segurança violada: authenticated ainda tem permissão de insert em study_events.');
    check(!p.receipt_insert, 'Segurança violada: authenticated ainda tem permissão de insert em sync_receipts.');

    // 4. Verify that direct student insert/update fails via SQL
    await role('authenticated', studentId);
    await rejects(
      `insert into public.student_snapshots(user_id, revision, snapshot) values ('${studentId}', 1, '{"version":"1"}'::jsonb)`,
      'Estudante conseguiu inserir snapshot diretamente na tabela sem passar pelo sync_progress.'
    );
    await rejects(
      `insert into public.study_events(user_id, id, kind, occurred_at, payload) values ('${studentId}', gen_random_uuid(), 'attempt', now(), '{}'::jsonb)`,
      'Estudante conseguiu inserir evento diretamente na tabela.'
    );

    // 5. Verify that sync_progress RPC succeeds for authenticated student
    const opId = '33333333-3333-4333-8333-333333333333';
    const eventId = '44444444-4444-4444-8444-444444444444';
    const snapshotPayload = { version: '1', masteries: {} };
    const eventPayload = [{ id: eventId, kind: 'attempt', at: new Date().toISOString(), payload: { score: 1 } }];

    const rpcResult = await db.query<{ sync_progress: number }>(
      'select public.sync_progress($1::uuid, 0, $2::jsonb, $3::jsonb)',
      [opId, JSON.stringify(snapshotPayload), JSON.stringify(eventPayload)]
    );
    check(rpcResult.rows[0].sync_progress === 1, 'sync_progress falhou ao registrar revisão 1.');

    // Verify snapshot was created and student can read their own snapshot
    const readSnapshot = await db.query<{ revision: number; snapshot: any }>(
      'select revision, snapshot from public.student_snapshots where user_id = $1',
      [studentId]
    );
    check(readSnapshot.rows.length === 1 && readSnapshot.rows[0].revision === 1, 'Snapshot não encontrado após sync_progress.');

    // 6. Verify publish_topic_version restores learningContext and enemGuidance
    await role('postgres');
    await db.exec(`insert into public.admin_profiles (user_id, active) values ('${adminId}', true);`);
    await role('authenticated', adminId);

    // Create topic version with learning_context and enem_guidance
    const topicVersion = await db.query<{ id: string }>(`
      insert into public.topic_versions (
        topic_id, version, status, name, slug, discipline,
        learning_context, enem_guidance, created_by, updated_by
      ) values (
        'cytology', 2, 'published', 'Citologia', 'citologia', 'Biologia',
        '{"overview":"Estudo das células vivas."}'::jsonb,
        '{"status":"reviewed","priorities":["Membrana plasmática"]}'::jsonb,
        '${adminId}', '${adminId}'
      ) returning id
    `);
    const tvId = topicVersion.rows[0].id;

    // Add required lesson block and question version
    await db.exec(`
      insert into public.lesson_blocks (topic_version_id, position, kind, title, body)
      values ('${tvId}', 0, 'concept', 'Introdução', 'A célula é a unidade básica da vida.');

      insert into public.question_versions (
        topic_version_id, question_key, version, purpose, difficulty, prompt, options, answer, explanation, created_by, updated_by
      ) values (
        '${tvId}', 'q_cyto_test', 1, 'practice', 2, 'O que é mitocôndria?', '["A","B","C","D"]'::jsonb, 0, 'Organela de respiração.', '${adminId}', '${adminId}'
      );
    `);

    // Call publish_topic_version
    await db.exec(`select public.publish_topic_version('${tvId}'::uuid)`);

    // Verify public.topics content contains learningContext and enemGuidance
    const pubTopic = await db.query<{ content: any }>(
      `select content from public.topics where id = 'cytology'`
    );
    check(pubTopic.rows.length > 0, 'Tópico publicado não encontrado em public.topics.');
    const content = pubTopic.rows[0].content;
    check(content.learningContext?.overview === 'Estudo das células vivas.', 'learningContext foi perdido na publicação!');
    check(content.enemGuidance?.status === 'reviewed', 'enemGuidance foi perdido na publicação!');

    console.log('Sprint 1 Segurança e Migrações: TODAS AS VERIFICAÇÕES PASSARAM COM SUCESSO!');
  } catch (err) {
    console.error('Falha na validação:', err);
    process.exit(1);
  }
}

void main();
