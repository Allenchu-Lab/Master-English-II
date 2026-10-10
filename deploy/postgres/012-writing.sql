create table if not exists writing_tasks (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references exam_sections(id) on delete cascade,
  part text not null check (part in ('A', 'B')),
  question_number smallint not null,
  prompt text not null check (length(prompt) > 0),
  target_words smallint not null check (target_words > 0),
  points smallint not null check (points > 0),
  chart jsonb,
  source_page smallint,
  status content_status not null default 'draft',
  unique (section_id, part)
);

create table if not exists writing_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  task_id uuid not null references writing_tasks(id) on delete cascade,
  answer text not null default '',
  elapsed_seconds integer not null default 0 check (elapsed_seconds >= 0),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, task_id)
);

create index if not exists writing_tasks_section_id_idx on writing_tasks(section_id);
create index if not exists writing_attempts_user_id_idx on writing_attempts(user_id, updated_at desc);

insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status)
select s.id, 'A', 47,
  'Suppose you are planning a short play based on a classic Chinese novel. Write your friend John an email to:' || E'\n' ||
  '1) introduce the play, and' || E'\n' || '2) invite him to take part in it.' || E'\n\n' ||
  'Write your answer in about 100 words on the ANSWER SHEET.' || E'\n' ||
  'Do not use your own name in your email. Use “Li Ming” instead.',
  100, 10, null, 14, 'published'
from exam_sections s join exam_papers p on p.id = s.paper_id
where p.year = 2025 and s.type = 'writing'
on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words,
  points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;

insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status)
select s.id, 'B', 48,
  'Write an essay based on the chart below. In your essay, you should' || E'\n' ||
  '1) describe and interpret the chart, and' || E'\n' || '2) give your comments.' || E'\n\n' ||
  'Write your answer in about 150 words on the ANSWER SHEET.',
  150, 15,
  '{"title":"某社区老年人主要日常休闲活动调查","unit":"%","items":[{"label":"看电视","value":90.8},{"label":"散步","value":68.3},{"label":"养花","value":34.7},{"label":"阅读","value":31.8},{"label":"下棋","value":18.4}]}'::jsonb,
  14, 'published'
from exam_sections s join exam_papers p on p.id = s.paper_id
where p.year = 2025 and s.type = 'writing'
on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words,
  points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;

insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status)
select s.id, 'A', 47,
  'Suppose your friend Jack has shared with you a video of his family’s travel in China. Write an email to tell him' || E'\n' ||
  '1) how you feel about the video, and' || E'\n' || '2) your wish to learn more about their travel.' || E'\n\n' ||
  'Write your answer in about 100 words on the ANSWER SHEET.' || E'\n' ||
  'Do not use your own name in your email. Use “Li Ming” instead.',
  100, 10, null, 14, 'published'
from exam_sections s join exam_papers p on p.id = s.paper_id
where p.year = 2026 and s.type = 'writing'
on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words,
  points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;

insert into writing_tasks (section_id, part, question_number, prompt, target_words, points, chart, source_page, status)
select s.id, 'B', 48,
  'Write an essay based on the chart below. In your essay, you should' || E'\n' ||
  '1) describe and interpret the chart, and' || E'\n' || '2) give your comments.' || E'\n\n' ||
  'Write your answer in about 150 words on the ANSWER SHEET.',
  150, 15,
  '{"title":"某项关于儿童户外活动看法的调查","unit":"%","items":[{"label":"满足好奇心","value":54.6},{"label":"促进观察力","value":54.5},{"label":"强身健体","value":37.2},{"label":"增强亲子互动","value":33.2}]}'::jsonb,
  14, 'published'
from exam_sections s join exam_papers p on p.id = s.paper_id
where p.year = 2026 and s.type = 'writing'
on conflict (section_id, part) do update set prompt = excluded.prompt, target_words = excluded.target_words,
  points = excluded.points, chart = excluded.chart, source_page = excluded.source_page, status = excluded.status;

update exam_sections s set status = 'published'
from exam_papers p
where p.id = s.paper_id and p.year in (2025, 2026) and s.type = 'writing';
