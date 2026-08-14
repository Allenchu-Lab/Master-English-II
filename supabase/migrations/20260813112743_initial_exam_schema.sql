create extension if not exists pgcrypto;

create type public.content_status as enum ('draft', 'published', 'archived');
create type public.question_type as enum ('cloze', 'reading_a', 'reading_b', 'translation', 'writing');

create table public.exam_papers (
  id uuid primary key default gen_random_uuid(),
  year smallint not null unique check (year between 2010 and 2100),
  title text not null,
  source_file text not null,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exam_sections (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid not null references public.exam_papers(id) on delete cascade,
  type public.question_type not null,
  item_count smallint not null check (item_count > 0),
  position smallint not null check (position > 0),
  status public.content_status not null default 'draft',
  unique (paper_id, type),
  unique (paper_id, position)
);

create table public.passages (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.exam_sections(id) on delete cascade,
  passage_number smallint not null check (passage_number > 0),
  body text not null check (length(body) > 0),
  word_count smallint not null check (word_count > 0),
  source_page_start smallint,
  source_page_end smallint,
  status public.content_status not null default 'draft',
  unique (section_id, passage_number)
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  passage_id uuid not null references public.passages(id) on delete cascade,
  question_number smallint not null,
  prompt text not null check (length(prompt) > 0),
  correct_option smallint check (correct_option between 0 and 3),
  explanation text,
  evidence text,
  status public.content_status not null default 'draft',
  unique (passage_id, question_number)
);

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_index smallint not null check (option_index between 0 and 3),
  body text not null check (length(body) > 0),
  unique (question_id, option_index)
);

create table public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  passage_id uuid not null references public.passages(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score smallint check (score between 0 and 5),
  answers jsonb not null default '{}'::jsonb,
  next_review_at timestamptz,
  created_at timestamptz not null default now()
);

create index exam_sections_paper_id_idx on public.exam_sections(paper_id);
create index passages_section_id_idx on public.passages(section_id);
create index questions_passage_id_idx on public.questions(passage_id);
create index question_options_question_id_idx on public.question_options(question_id);
create index practice_attempts_user_passage_idx on public.practice_attempts(user_id, passage_id, created_at desc);
create index practice_attempts_next_review_idx on public.practice_attempts(user_id, next_review_at) where next_review_at is not null;

alter table public.exam_papers enable row level security;
alter table public.exam_sections enable row level security;
alter table public.passages enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.practice_attempts enable row level security;

create policy "published papers are public" on public.exam_papers for select to anon, authenticated using (status = 'published');
create policy "published sections are public" on public.exam_sections for select to anon, authenticated using (status = 'published');
create policy "published passages are public" on public.passages for select to anon, authenticated using (status = 'published');
create policy "published questions are public" on public.questions for select to anon, authenticated using (status = 'published');
create policy "options of published questions are public" on public.question_options for select to anon, authenticated
using (exists (select 1 from public.questions where questions.id = question_options.question_id and questions.status = 'published'));

create policy "users read own attempts" on public.practice_attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy "users create own attempts" on public.practice_attempts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users update own attempts" on public.practice_attempts for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users delete own attempts" on public.practice_attempts for delete to authenticated using ((select auth.uid()) = user_id);

grant select on public.exam_papers, public.exam_sections, public.passages, public.questions, public.question_options to anon, authenticated;
grant select, insert, update, delete on public.practice_attempts to authenticated;
