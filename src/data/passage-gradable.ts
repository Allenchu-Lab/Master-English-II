import { query } from "@/lib/db";

/**
 * 判断某篇文章是否具备完整答案，可以判分。
 *
 * 依据是 private.question_keys 对本篇已发布题目的覆盖是否完整。
 * 答案缺失时提交必然失败，因此作答入口应在服务端就拦住，
 * 不能只依赖首页列表的展示状态——用户可以直接访问练习页网址。
 */
export async function isPassageGradable(passageId: string): Promise<boolean> {
  const result = await query<{ question_count: string; key_count: string }>(
    `select count(distinct q.id) question_count, count(distinct k.question_id) key_count
     from questions q
     left join private.question_keys k on k.question_id = q.id
     where q.passage_id = $1 and q.status = 'published'`,
    [passageId],
  );
  const row = result.rows[0];
  if (!row) return false;
  return Number(row.question_count) > 0 && row.question_count === row.key_count;
}
