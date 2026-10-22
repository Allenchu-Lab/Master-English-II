begin;
insert into exam_sections(paper_id,type,item_count,position,status)
select id,'translation',1,4,'draft' from exam_papers where year between 2010 and 2026
on conflict(paper_id,type) do nothing;
create table if not exists translation_tasks (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null unique references exam_sections(id) on delete cascade,
  question_number smallint not null default 46,
  passage text not null check (length(trim(passage)) > 0),
  points smallint not null default 15,
  source_page smallint,
  status content_status not null default 'draft'
);
create table if not exists translation_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  task_id uuid not null references translation_tasks(id) on delete cascade,
  answer text not null default '',
  elapsed_seconds integer not null default 0 check (elapsed_seconds >= 0),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists translation_attempts_draft_idx
  on translation_attempts(user_id, task_id) where submitted_at is null;
create index if not exists translation_attempts_user_idx
  on translation_attempts(user_id, task_id, updated_at desc);
commit;
