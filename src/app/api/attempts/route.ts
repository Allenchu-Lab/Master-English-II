import { NextResponse } from "next/server";
import { getOrCreateSessionUser } from "@/lib/auth/session";
import { query } from "@/lib/db";

/**
 * 首页文章状态：每篇一条结论。
 *
 * 原先返回该用户的全部练习记录，同一篇做过几次就有几条，由前端按创建顺序
 * 累积推断状态——这依赖了"接口必须升序返回"这个隐含前提，且数据量随使用
 * 持续增长。改为在数据库侧聚合：只要有过一次提交，这篇就算已完成。
 */
export async function GET() {
  const user = await getOrCreateSessionUser();
  const result = await query<{ passage_id: string; submitted: boolean }>(
    `select passage_id, bool_or(submitted_at is not null) as submitted
     from practice_attempts where user_id = $1 group by passage_id`,
    [user.id],
  );
  return NextResponse.json({ attempts: result.rows });
}
