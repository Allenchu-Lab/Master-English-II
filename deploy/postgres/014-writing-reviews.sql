alter table writing_attempts
  add column if not exists review jsonb,
  add column if not exists reviewed_at timestamptz;

create table if not exists writing_expressions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  source_attempt_id uuid not null references writing_attempts(id) on delete cascade,
  original text not null,
  rewrite text not null,
  pattern text not null,
  use_cases jsonb not null default '[]'::jsonb,
  status text not null default 'new' check (status in ('new', 'practicing', 'mastered')),
  created_at timestamptz not null default now(),
  unique (user_id, source_attempt_id, pattern)
);

create index if not exists writing_expressions_user_id_idx
  on writing_expressions(user_id, created_at desc);
