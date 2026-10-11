alter table writing_attempts
  drop constraint if exists writing_attempts_user_id_task_id_key;

create unique index if not exists writing_attempts_open_draft_idx
  on writing_attempts(user_id, task_id)
  where submitted_at is null;
