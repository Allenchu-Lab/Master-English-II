import "server-only";

import { query } from "@/lib/db";

export type AdminDashboard = {
  overview: {
    registeredUsers: number;
    anonymousUsers: number;
    newUsers7d: number;
    activeToday: number;
    active7d: number;
    attempts: number;
    completed: number;
  };
  daily: Array<{ date: string; activeUsers: number; attempts: number; completed: number }>;
  popular: Array<{ year: number; passageNumber: number; users: number; attempts: number; completed: number }>;
  recentUsers: Array<{ email: string; createdAt: Date; attempts: number; completed: number }>;
};

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const [overviewResult, dailyResult, popularResult, recentUsersResult] = await Promise.all([
    query<{
      registered_users: number;
      anonymous_users: number;
      new_users_7d: number;
      active_today: number;
      active_7d: number;
      attempts: number;
      completed: number;
    }>(`
      with eligible_users as (
        select id, is_anonymous, created_at
        from app_users
        where is_anonymous or email not like '%@example.invalid'
      ), eligible_attempts as (
        select a.*
        from practice_attempts a
        join eligible_users u on u.id = a.user_id
      )
      select
        (select count(*)::int from eligible_users where not is_anonymous) as registered_users,
        (select count(*)::int from eligible_users where is_anonymous) as anonymous_users,
        (select count(*)::int from eligible_users where not is_anonymous and created_at >= now() - interval '7 days') as new_users_7d,
        (select count(distinct user_id)::int from eligible_attempts where created_at >= current_date) as active_today,
        (select count(distinct user_id)::int from eligible_attempts where created_at >= now() - interval '7 days') as active_7d,
        (select count(*)::int from eligible_attempts) as attempts,
        (select count(*)::int from eligible_attempts where submitted_at is not null) as completed
    `),
    query<{ date: string; active_users: number; attempts: number; completed: number }>(`
      with days as (
        select generate_series(current_date - interval '6 days', current_date, interval '1 day')::date as day
      ), eligible_attempts as (
        select a.*
        from practice_attempts a
        join app_users u on u.id = a.user_id
        where u.is_anonymous or u.email not like '%@example.invalid'
      )
      select
        to_char(days.day, 'YYYY-MM-DD') as date,
        count(distinct a.user_id)::int as active_users,
        count(a.id)::int as attempts,
        count(a.id) filter (where a.submitted_at is not null)::int as completed
      from days
      left join eligible_attempts a on a.created_at >= days.day and a.created_at < days.day + interval '1 day'
      group by days.day
      order by days.day
    `),
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
      where app_user.is_anonymous or app_user.email not like '%@example.invalid'
      group by paper.year, passage.passage_number
      order by users desc, attempts desc, paper.year desc
      limit 6
    `),
    query<{ email: string; created_at: Date; attempts: number; completed: number }>(`
      select
        u.email,
        u.created_at,
        count(a.id)::int as attempts,
        count(a.id) filter (where a.submitted_at is not null)::int as completed
      from app_users u
      left join practice_attempts a on a.user_id = u.id
      where not u.is_anonymous
        and u.email is not null
        and u.email not like '%@example.invalid'
      group by u.id
      order by u.created_at desc
      limit 8
    `),
  ]);

  const overview = overviewResult.rows[0];
  return {
    overview: {
      registeredUsers: overview.registered_users,
      anonymousUsers: overview.anonymous_users,
      newUsers7d: overview.new_users_7d,
      activeToday: overview.active_today,
      active7d: overview.active_7d,
      attempts: overview.attempts,
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
