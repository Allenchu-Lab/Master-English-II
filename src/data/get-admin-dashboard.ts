import "server-only";

import { query } from "@/lib/db";

const PUBLIC_LAUNCH_AT = "2026-09-05T17:00:00+08:00";

export type AdminDashboard = {
  overview: {
    registeredAccounts: number;
    learningUsers: number;
    effectiveAttempts: number;
    completed: number;
  };
  daily: Array<{ date: string; activeUsers: number; attempts: number; completed: number }>;
  popular: Array<{ year: number; passageNumber: number; users: number; attempts: number; completed: number }>;
  recentUsers: Array<{ email: string; createdAt: Date; attempts: number; completed: number }>;
};

export async function getAdminDashboard(days: 7 | 30 = 7): Promise<AdminDashboard> {
  const [overviewResult, dailyResult, popularResult, recentUsersResult] = await Promise.all([
    query<{
      registered_accounts: number;
      learning_users: number;
      effective_attempts: number;
      completed: number;
    }>(`
      with eligible_users as (
        select id, is_anonymous, created_at
        from app_users
        where is_anonymous or email not like '%@example.invalid'
      ), effective_attempts as (
        select a.*
        from practice_attempts a
        join eligible_users u on u.id = a.user_id
        where a.created_at >= $1::timestamptz
          and (a.answers <> '{}'::jsonb or a.submitted_at is not null)
      )
      select
        (select count(*)::int from eligible_users where not is_anonymous and created_at >= $1::timestamptz) as registered_accounts,
        (select count(distinct user_id)::int from effective_attempts) as learning_users,
        (select count(*)::int from effective_attempts) as effective_attempts,
        (select count(*)::int from effective_attempts where submitted_at is not null) as completed
    `, [PUBLIC_LAUNCH_AT]),
    query<{ date: string; active_users: number; attempts: number; completed: number }>(`
      with days as (
        select generate_series(
          (now() at time zone 'Asia/Shanghai')::date - ($2::int - 1),
          (now() at time zone 'Asia/Shanghai')::date,
          interval '1 day'
        )::date as day
      ), effective_attempts as (
        select a.*
        from practice_attempts a
        join app_users u on u.id = a.user_id
        where (u.is_anonymous or u.email not like '%@example.invalid')
          and a.created_at >= $1::timestamptz
          and (a.answers <> '{}'::jsonb or a.submitted_at is not null)
      )
      select
        to_char(days.day, 'YYYY-MM-DD') as date,
        count(distinct a.user_id)::int as active_users,
        count(a.id)::int as attempts,
        count(a.id) filter (where a.submitted_at is not null)::int as completed
      from days
      left join effective_attempts a
        on a.created_at >= (days.day::timestamp at time zone 'Asia/Shanghai')
        and a.created_at < ((days.day + 1)::timestamp at time zone 'Asia/Shanghai')
      group by days.day
      order by days.day
    `, [PUBLIC_LAUNCH_AT, days]),
    query<{ year: number; passage_number: number; users: number; attempts: number; completed: number }>(`
      select
        paper.year,
        passage.passage_number,
        count(distinct attempt.user_id)::int as users,
        count(attempt.id)::int as attempts,
        count(attempt.id) filter (where attempt.submitted_at is not null)::int as completed
      from practice_attempts attempt
      join app_users app_user on app_user.id = attempt.user_id
      join passages passage on passage.id = attempt.passage_id
      join exam_sections section on section.id = passage.section_id
      join exam_papers paper on paper.id = section.paper_id
      where (app_user.is_anonymous or app_user.email not like '%@example.invalid')
        and attempt.created_at >= $1::timestamptz
        and (attempt.answers <> '{}'::jsonb or attempt.submitted_at is not null)
      group by paper.year, passage.passage_number
      order by users desc, attempts desc, paper.year desc
      limit 6
    `, [PUBLIC_LAUNCH_AT]),
    query<{ email: string; created_at: Date; attempts: number; completed: number }>(`
      select
        u.email,
        u.created_at,
        count(a.id) filter (where a.answers <> '{}'::jsonb or a.submitted_at is not null)::int as attempts,
        count(a.id) filter (where a.submitted_at is not null)::int as completed
      from app_users u
      left join practice_attempts a on a.user_id = u.id and a.created_at >= $1::timestamptz
      where not u.is_anonymous
        and u.email is not null
        and u.email not like '%@example.invalid'
        and u.created_at >= $1::timestamptz
      group by u.id
      order by u.created_at desc
      limit 8
    `, [PUBLIC_LAUNCH_AT]),
  ]);

  const overview = overviewResult.rows[0];
  return {
    overview: {
      registeredAccounts: overview.registered_accounts,
      learningUsers: overview.learning_users,
      effectiveAttempts: overview.effective_attempts,
      completed: overview.completed,
    },
    daily: dailyResult.rows.map((row) => ({
      date: row.date,
      activeUsers: row.active_users,
      attempts: row.attempts,
      completed: row.completed,
    })),
    popular: popularResult.rows.map((row) => ({
      year: row.year,
      passageNumber: row.passage_number,
      users: row.users,
      attempts: row.attempts,
      completed: row.completed,
    })),
    recentUsers: recentUsersResult.rows.map((row) => ({
      email: row.email,
      createdAt: row.created_at,
      attempts: row.attempts,
      completed: row.completed,
    })),
  };
}
