-- Personal study data. All exposed objects use ownership RLS and minimal grants.
create table public.topics (
  id text primary key, name text not null, discipline text not null,
  version integer not null check (version > 0), content jsonb not null,
  published boolean not null default false
);
create table public.topic_prerequisites (
  topic_id text references public.topics(id), prerequisite_id text references public.topics(id),
  primary key (topic_id, prerequisite_id), check (topic_id <> prerequisite_id)
);
create table public.questions (
  id text primary key, topic_id text not null references public.topics(id),
  purpose text not null check (purpose in ('diagnostic', 'practice', 'review')),
  difficulty integer not null check (difficulty between 1 and 3), content jsonb not null
);
create table public.student_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null default 0 check (revision >= 0),
  snapshot jsonb not null check (snapshot->>'version' = '1'),
  updated_at timestamptz not null default now()
);
create table public.study_events (
  user_id uuid not null references auth.users(id) on delete cascade, id uuid not null,
  kind text not null check (kind in ('attempt', 'affective', 'analytics')),
  occurred_at timestamptz not null, received_at timestamptz not null default now(), payload jsonb not null,
  primary key (user_id, id)
);
create index study_events_user_kind_time on public.study_events(user_id, kind, occurred_at);
create table public.sync_receipts (
  user_id uuid not null references auth.users(id) on delete cascade,
  operation_id uuid not null, revision bigint not null, created_at timestamptz not null default now(),
  primary key (user_id, operation_id)
);

alter table public.topics enable row level security;
alter table public.topic_prerequisites enable row level security;
alter table public.questions enable row level security;
alter table public.student_snapshots enable row level security;
alter table public.study_events enable row level security;
alter table public.sync_receipts enable row level security;
revoke all on public.topics, public.topic_prerequisites, public.questions, public.student_snapshots, public.study_events, public.sync_receipts from anon, authenticated;
grant select on public.topics, public.topic_prerequisites, public.questions to authenticated;
grant select, insert, update on public.student_snapshots to authenticated;
grant select, insert on public.study_events, public.sync_receipts to authenticated;
create policy published_topics on public.topics for select to authenticated using (published);
create policy published_questions on public.questions for select to authenticated using (exists (select 1 from public.topics t where t.id = topic_id and t.published));
create policy published_prerequisites on public.topic_prerequisites for select to authenticated using (exists (select 1 from public.topics t where t.id = topic_id and t.published));
create policy own_snapshot_read on public.student_snapshots for select to authenticated using (user_id = (select auth.uid()));
create policy own_snapshot_insert on public.student_snapshots for insert to authenticated with check (user_id = (select auth.uid()));
create policy own_snapshot_update on public.student_snapshots for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own_event_read on public.study_events for select to authenticated using (user_id = (select auth.uid()));
create policy own_event_insert on public.study_events for insert to authenticated with check (user_id = (select auth.uid()));
create policy own_receipt_read on public.sync_receipts for select to authenticated using (user_id = (select auth.uid()));
create policy own_receipt_insert on public.sync_receipts for insert to authenticated with check (user_id = (select auth.uid()));

-- One transaction commits both evidence and its materialized learner state.
-- INVOKER intentionally retains all RLS checks, also for anonymous Auth users.
create function public.sync_progress(p_operation_id uuid, p_expected_revision bigint, p_snapshot jsonb, p_events jsonb)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare v_user uuid := auth.uid(); v_revision bigint; v_event jsonb;
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

create view public.my_learning_metrics with (security_invoker = true) as
select user_id,
  count(*) filter (where payload->>'name' = 'diagnostic_completed') as diagnostics_completed,
  count(*) filter (where payload->>'name' = 'battle_started') as battles_started,
  count(*) filter (where payload->>'name' = 'battle_completed') as battles_completed,
  bool_or(payload->>'name' = 'returned_within_7_days') as returned_within_7_days
from public.study_events where kind = 'analytics' group by user_id;
revoke all on public.my_learning_metrics from anon, authenticated;
grant select on public.my_learning_metrics to authenticated;
