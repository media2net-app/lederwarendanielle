import { createClient } from "@/utils/supabase/server";
import type { ChatBootstrapResponse, ChatConversation, ChatMessage, ChatUser } from "@/lib/internal-chat-shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type UserRow = {
  id: string;
  naam: string;
  rol: string;
  actief: boolean;
};

type ConversationRow = {
  id: string;
  naam: string;
  type: "channel" | "direct";
};

type ParticipantRow = {
  conversation_id: string;
  user_id: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_naam: string;
  tekst: string;
  at: string;
};

type ReadRow = {
  conversation_id: string;
  last_read_at: string;
};

function mapConversation(row: ConversationRow, memberIds: string[]): ChatConversation {
  return {
    id: row.id,
    type: row.type === "direct" ? "dm" : "channel",
    naam: row.naam,
    memberIds,
  };
}

function mapMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    senderNaam: row.sender_naam,
    tekst: row.tekst,
    at: row.at,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = String(searchParams.get("userId") ?? "m1");
  const supabase = createClient(cookies());

  const [{ data: usersData, error: usersError }, { data: conversationsData, error: conversationsError }] =
    await Promise.all([
      supabase.from("user_accounts").select("id, naam, rol, actief").order("naam", { ascending: true }),
      supabase
        .from("internal_chat_conversations")
        .select("id, naam, type")
        .order("updated_at", { ascending: false }),
    ]);

  if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 });
  if (conversationsError) return NextResponse.json({ error: conversationsError.message }, { status: 500 });

  const conversations = (conversationsData as ConversationRow[] | null) ?? [];
  const conversationIds = conversations.map((conversation) => conversation.id);

  const [{ data: participantsData }, { data: messagesData }, { data: readsData }] = await Promise.all([
    conversationIds.length > 0
      ? supabase
          .from("internal_chat_participants")
          .select("conversation_id, user_id")
          .in("conversation_id", conversationIds)
      : Promise.resolve({ data: [] as ParticipantRow[] }),
    conversationIds.length > 0
      ? supabase
          .from("internal_chat_messages")
          .select("id, conversation_id, sender_id, sender_naam, tekst, at")
          .in("conversation_id", conversationIds)
          .order("at", { ascending: true })
      : Promise.resolve({ data: [] as MessageRow[] }),
    conversationIds.length > 0
      ? supabase
          .from("internal_chat_reads")
          .select("conversation_id, last_read_at")
          .eq("user_id", userId)
      : Promise.resolve({ data: [] as ReadRow[] }),
  ]);

  const memberByConversation = new Map<string, string[]>();
  ((participantsData as ParticipantRow[] | null) ?? []).forEach((participant) => {
    const list = memberByConversation.get(participant.conversation_id) ?? [];
    list.push(participant.user_id);
    memberByConversation.set(participant.conversation_id, list);
  });

  const messagesByConversation: Record<string, ChatMessage[]> = {};
  ((messagesData as MessageRow[] | null) ?? []).forEach((message) => {
    const list = messagesByConversation[message.conversation_id] ?? [];
    list.push(mapMessage(message));
    messagesByConversation[message.conversation_id] = list;
  });

  const readMap: Record<string, string> = {};
  ((readsData as ReadRow[] | null) ?? []).forEach((read) => {
    readMap[read.conversation_id] = read.last_read_at;
  });

  const users: ChatUser[] = ((usersData as UserRow[] | null) ?? []).map((user) => ({
    id: user.id,
    naam: user.naam,
    rol: user.rol,
    online: Boolean(user.actief),
  }));

  const payload: ChatBootstrapResponse = {
    users,
    conversations: conversations.map((conversation) =>
      mapConversation(conversation, memberByConversation.get(conversation.id) ?? [])
    ),
    messagesByConversation,
    readMap,
  };

  return NextResponse.json(payload);
}
