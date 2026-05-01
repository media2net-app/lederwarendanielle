import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const conversationId = String(body?.conversationId ?? "").trim();
  const userId = String(body?.userId ?? "").trim();
  const at = String(body?.at ?? "").trim();

  if (!conversationId || !userId || !at) {
    return NextResponse.json({ error: "Required fields: conversationId, userId, at" }, { status: 400 });
  }

  const supabase = createClient(cookies());
  const { error } = await supabase.from("internal_chat_reads").upsert({
    conversation_id: conversationId,
    user_id: userId,
    last_read_at: at,
    updated_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
