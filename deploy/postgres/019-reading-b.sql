begin;
create table if not exists reading_b_tasks (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null unique references exam_sections(id) on delete cascade,
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  status content_status not null default 'draft'
);
create table if not exists private.reading_b_keys (
  task_id uuid primary key references reading_b_tasks(id) on delete cascade,
  keys jsonb not null check (jsonb_typeof(keys) = 'array' and jsonb_array_length(keys) = 5)
);
create table if not exists reading_b_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  task_id uuid not null references reading_b_tasks(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  elapsed_seconds integer not null default 0 check (elapsed_seconds between 0 and 604800),
  score smallint check (score between 0 and 10),
  feedback jsonb,
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create unique index if not exists reading_b_open_draft_idx on reading_b_attempts(user_id, task_id) where submitted_at is null;
create index if not exists reading_b_attempts_user_task_idx on reading_b_attempts(user_id, task_id, created_at desc);
commit;
