import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { PoolClient } from "pg";
import { query, transaction } from "@/lib/db";

const cookieName = "master_english_session";
const sessionDays = 30;

export type SessionUser = { id: string; email: string | null; isAnonymous: boolean };

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function createSession(client: PoolClient, userId: string) {
  const token = randomBytes(32).toString("base64url");
  await client.query(
    "insert into user_sessions (user_id, token_hash, expires_at) values ($1, $2, now() + interval '30 days')",
    [userId, hashToken(token)],
  );
  return token;
}

async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
    path: "/",
    maxAge: sessionDays * 24 * 60 * 60,
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  const result = await query<{ id: string; email: string | null; is_anonymous: boolean }>(
    `select u.id, u.email, u.is_anonymous
     from user_sessions s join app_users u on u.id = s.user_id
     where s.token_hash = $1 and s.expires_at > now()`,
    [hashToken(token)],
  );
  const user = result.rows[0];
  return user ? { id: user.id, email: user.email, isAnonymous: user.is_anonymous } : null;
}

export async function getOrCreateSessionUser() {
  const current = await getSessionUser();
  if (current) return current;

  const result = await transaction(async (client) => {
    const created = await client.query<{ id: string }>("insert into app_users (is_anonymous) values (true) returning id");
    const userId = created.rows[0].id;
    const token = await createSession(client, userId);
    return { user: { id: userId, email: null, isAnonymous: true } satisfies SessionUser, token };
  });
  await setSessionCookie(result.token);
  return result.user;
}

export async function replaceSession(userId: string, previousUserId?: string) {
  const token = await transaction(async (client) => {
    if (previousUserId && previousUserId !== userId) {
      await client.query("update practice_attempts set user_id = $1 where user_id = $2", [userId, previousUserId]);
      await client.query("delete from app_users where id = $1 and is_anonymous = true", [previousUserId]);
    }
    await client.query("delete from user_sessions where user_id = $1", [userId]);
    return createSession(client, userId);
  });
  await setSessionCookie(token);
}

export async function clearSession() {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (token) await query("delete from user_sessions where token_hash = $1", [hashToken(token)]);
  store.delete(cookieName);
}
