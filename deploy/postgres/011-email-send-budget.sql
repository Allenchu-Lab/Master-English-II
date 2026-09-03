-- Lifetime app budget, not a daily/monthly allowance. Enable only after verifying SES account usage.
begin;
create table if not exists email_send_budget (
  id smallint primary key check (id = 1),
  send_limit integer not null default 0 check (send_limit between 0 and 1000),
  reserved_count integer not null default 0 check (reserved_count >= 0)
);
insert into email_send_budget (id) values (1) on conflict (id) do nothing;
commit;
