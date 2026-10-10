create table public.writing_tasks (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.exam_sections(id) on delete cascade,
  part text not null check (part in ('A', 'B')),
  question_number smallint not null,
  prompt text not null check (length(prompt) > 0),
  target_words smallint not null check (target_words > 0),
  points smallint not null check (points > 0),
  chart jsonb,
  source_page smallint,
  status public.content_status not null default 'draft',
  unique (section_id, part)
);

create table public.writing_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.writing_tasks(id) on delete cascade,
  answer text not null default '',
  elapsed_seconds integer not null default 0 check (elapsed_seconds >= 0),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, task_id)
);

create index writing_tasks_section_id_idx on public.writing_tasks(section_id);
create index writing_attempts_user_id_idx on public.writing_attempts(user_id, updated_at desc);

alter table public.writing_tasks enable row level security;
alter table public.writing_attempts enable row level security;

create policy "published writing tasks are public" on public.writing_tasks for select to anon, authenticated
using (status = 'published');
create policy "users read own writing attempts" on public.writing_attempts for select to authenticated
using ((select auth.uid()) = user_id);
create policy "users create own writing attempts" on public.writing_attempts for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "users update own writing attempts" on public.writing_attempts for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant select on public.writing_tasks to anon, authenticated;
grant select, insert, update on public.writing_attempts to authenticated;
