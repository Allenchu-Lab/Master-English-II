alter table practice_attempts add column if not exists updated_at timestamptz;
update practice_attempts set updated_at=coalesce(started_at,created_at) where updated_at is null;
alter table practice_attempts alter column updated_at set default now();
alter table practice_attempts alter column updated_at set not null;
