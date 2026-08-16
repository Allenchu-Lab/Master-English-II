"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";

type GuestAttempt = {
  passage_id: string;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  answers: Record<string, number>;
  next_review_at: string | null;
};

export function isEmailUser(user: User | null) {
  return Boolean(user?.email && !user.is_anonymous);
}

export async function requestEmailOtp(client: SupabaseClient, email: string) {
  const { error } = await client.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

export async function verifyEmailOtp(client: SupabaseClient, email: string, token: string) {
  const { data: sessionData } = await client.auth.getSession();
  const guestUser = sessionData.session?.user;
  let guestAttempts: GuestAttempt[] = [];

  if (guestUser?.is_anonymous) {
    const { data } = await client
      .from("practice_attempts")
      .select("passage_id, started_at, submitted_at, score, answers, next_review_at")
      .eq("user_id", guestUser.id);
    guestAttempts = (data ?? []) as GuestAttempt[];
  }

  const { data, error } = await client.auth.verifyOtp({ email, token, type: "email" });
  if (error || !data.user) throw error ?? new Error("Unable to verify email");

  let recordsMigrated = true;
  if (guestUser?.is_anonymous && guestUser.id !== data.user.id && guestAttempts.length) {
    const { error: migrationError } = await client.from("practice_attempts").insert(
      guestAttempts.map((attempt) => ({ ...attempt, user_id: data.user!.id })),
    );
    recordsMigrated = !migrationError;
  }

  return { user: data.user, recordsMigrated };
}

export async function signOut(client: SupabaseClient) {
  const { error } = await client.auth.signOut();
  if (error) throw error;
}
