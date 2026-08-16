import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  await query("select 1");
  return NextResponse.json({ ok: true });
}
