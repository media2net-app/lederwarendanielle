import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const conversationId = String(body?.conversationId ?? "").trim();
  const senderId = String(body?.senderId ?? "").trim();
  const senderNaam = String(body?.senderNaam ?? "").trim();
  const tekst = String(body?.tekst ?? "").trim();

  if (!conversationId || !senderId || !senderNaam || !tekst) {
    return NextResponse.json(
      { error: "Required fields: conversationId, senderId, senderNaam, tekst" },
      { status: 400 }
    );
  }

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("internal_chat_messages")
    .insert({
      id: `m-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: senderId,
      sender_naam: senderNaam,
      tekst,
    })
    .select("id, conversation_id, sender_id, sender_naam, tekst, at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data: {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      senderNaam: data.sender_naam,
      tekst: data.tekst,
      at: data.at,
    },
  });
}
