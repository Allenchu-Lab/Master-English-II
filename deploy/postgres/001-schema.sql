create extension if not exists pgcrypto;

create type content_status as enum ('draft', 'published', 'archived');
create type question_type as enum ('cloze', 'reading_a', 'reading_b', 'translation', 'writing');

create table app_users (
  id uuid primary key default gen_random_uuid(),
  email text,
  is_anonymous boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index app_users_email_idx on app_users (lower(email)) where email is not null;

create table user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index user_sessions_expires_idx on user_sessions(expires_at);

create table email_login_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  attempts smallint not null default 0,
  created_at timestamptz not null default now()
);
create index email_login_codes_lookup_idx on email_login_codes(lower(email), created_at desc);

create table exam_papers (
  id uuid primary key default gen_random_uuid(), year smallint not null unique check (year between 2010 and 2100),
  title text not null, source_file text not null, status content_status not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table exam_sections (
  id uuid primary key default gen_random_uuid(), paper_id uuid not null references exam_papers(id) on delete cascade,
  type question_type not null, item_count smallint not null check (item_count > 0), position smallint not null check (position > 0),
  status content_status not null default 'draft', unique (paper_id, type), unique (paper_id, position)
);
create table passages (
  id uuid primary key default gen_random_uuid(), section_id uuid not null references exam_sections(id) on delete cascade,
  passage_number smallint not null check (passage_number > 0), body text not null check (length(body) > 0),
  paragraphs jsonb not null default '[]'::jsonb check (jsonb_typeof(paragraphs) = 'array'),
  word_count smallint not null check (word_count > 0), source_page_start smallint, source_page_end smallint,
  status content_status not null default 'draft', unique (section_id, passage_number)
);
create table questions (
  id uuid primary key default gen_random_uuid(), passage_id uuid not null references passages(id) on delete cascade,
  question_number smallint not null, prompt text not null check (length(prompt) > 0), correct_option smallint check (correct_option between 0 and 3),
  explanation text, evidence text, status content_status not null default 'draft', unique (passage_id, question_number)
);
create table question_options (
  id uuid primary key default gen_random_uuid(), question_id uuid not null references questions(id) on delete cascade,
  option_index smallint not null check (option_index between 0 and 3), body text not null check (length(body) > 0), unique (question_id, option_index)
);
create table practice_attempts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references app_users(id) on delete cascade,
  passage_id uuid not null references passages(id) on delete cascade, started_at timestamptz not null default now(),
  submitted_at timestamptz, score smallint check (score between 0 and 5), answers jsonb not null default '{}'::jsonb,
  next_review_at timestamptz, created_at timestamptz not null default now()
);
create table writing_tasks (
  id uuid primary key default gen_random_uuid(), section_id uuid not null references exam_sections(id) on delete cascade,
  part text not null check (part in ('A', 'B')), question_number smallint not null,
  prompt text not null check (length(prompt) > 0), target_words smallint not null check (target_words > 0),
  points smallint not null check (points > 0), chart jsonb, source_page smallint,
  status content_status not null default 'draft', unique (section_id, part)
);
create table writing_attempts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references app_users(id) on delete cascade,
  task_id uuid not null references writing_tasks(id) on delete cascade, answer text not null default '',
  elapsed_seconds integer not null default 0 check (elapsed_seconds >= 0), submitted_at timestamptz,
  review jsonb, reviewed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table writing_expressions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references app_users(id) on delete cascade,
  source_attempt_id uuid not null references writing_attempts(id) on delete cascade,
  original text not null, rewrite text not null, pattern text not null,
  use_cases jsonb not null default '[]'::jsonb,
  status text not null default 'new' check (status in ('new', 'practicing', 'mastered')),
  created_at timestamptz not null default now(), unique (user_id, source_attempt_id, pattern)
);
create index exam_sections_paper_id_idx on exam_sections(paper_id);
create index passages_section_id_idx on passages(section_id);
create index questions_passage_id_idx on questions(passage_id);
create index question_options_question_id_idx on question_options(question_id);
create index practice_attempts_user_passage_idx on practice_attempts(user_id, passage_id, created_at desc);
create index writing_tasks_section_id_idx on writing_tasks(section_id);
create index writing_attempts_user_id_idx on writing_attempts(user_id, updated_at desc);
create unique index writing_attempts_open_draft_idx on writing_attempts(user_id, task_id) where submitted_at is null;
create index writing_expressions_user_id_idx on writing_expressions(user_id, created_at desc);

create schema private;
create table private.question_keys (
  question_id uuid primary key references questions(id) on delete cascade,
  correct_option smallint not null check (correct_option between 0 and 3), prompt_zh text not null,
  option_translations jsonb not null check (jsonb_typeof(option_translations) = 'array' and jsonb_array_length(option_translations) = 4),
  explanation text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
