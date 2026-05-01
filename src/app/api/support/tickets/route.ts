import { createClient } from "@/utils/supabase/server";
import {
  getKanaalLabel,
  mapMessage,
  type DbMessageRow,
  type DbTicketRow,
  type SupportTicket,
  type TicketKanaal,
  type TicketStatus,
} from "@/lib/support-shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function attachMessages(
  supabase: ReturnType<typeof createClient>,
  tickets: DbTicketRow[]
): Promise<SupportTicket[]> {
  if (tickets.length === 0) return [];
  const conversationIds = Array.from(new Set(tickets.map((ticket) => ticket.conversation_id)));
  const { data: messagesData } = await supabase
    .from("messages")
    .select("id, conversation_id, direction, kanaal, sender_name, sender_email, body, created_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: true });

  const messagesByConversation = new Map<string, ReturnType<typeof mapMessage>[]>();
  (messagesData as DbMessageRow[] | null)?.forEach((message) => {
    const list = messagesByConversation.get(message.conversation_id) ?? [];
    list.push(mapMessage(message));
    messagesByConversation.set(message.conversation_id, list);
  });

  return tickets.map((ticket) => ({
    id: ticket.id,
    conversationId: ticket.conversation_id,
    merkId: ticket.merk_id,
    onderwerp: ticket.onderwerp,
    klantNaam: ticket.klant_naam,
    klantEmail: ticket.klant_email,
    status: ticket.status,
    datum: ticket.created_at,
    kanaal: ticket.kanaal,
    berichten: messagesByConversation.get(ticket.conversation_id) ?? [],
  }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as TicketStatus | null;
  const merkId = searchParams.get("merkId");
  const kanaal = searchParams.get("kanaal") as TicketKanaal | null;
  const liveOnly = searchParams.get("liveOnly") !== "false";

  const supabase = createClient(cookies());

  let liveTicketIds: string[] | null = null;
  if (liveOnly) {
    const { data: liveEvents, error: liveEventsError } = await supabase
      .from("ticket_events")
      .select("ticket_id")
      .eq("event_type", "ticket_created")
      .eq("actor", "webhook");

    if (liveEventsError) {
      return NextResponse.json({ error: liveEventsError.message }, { status: 500 });
    }
    liveTicketIds = Array.from(new Set((liveEvents ?? []).map((event) => event.ticket_id)));
    if (liveTicketIds.length === 0) return NextResponse.json({ data: [] });
  }

  let query = supabase
    .from("tickets")
    .select("id, conversation_id, merk_id, onderwerp, klant_naam, klant_email, status, kanaal, created_at")
    .order("created_at", { ascending: false });

  if (liveTicketIds) query = query.in("id", liveTicketIds);
  if (status) query = query.eq("status", status);
  if (merkId) query = query.eq("merk_id", merkId);
  if (kanaal) query = query.eq("kanaal", kanaal);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const tickets = await attachMessages(supabase, (data ?? []) as DbTicketRow[]);
  return NextResponse.json({ data: tickets });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const onderwerp = String(body?.onderwerp ?? "").trim();
  const merkId = String(body?.merkId ?? "").trim();
  const klantNaam = String(body?.klantNaam ?? "").trim();
  const klantEmail = String(body?.klantEmail ?? "").trim();
  const kanaal = String(body?.kanaal ?? "chat") as TicketKanaal;
  const eersteBericht = String(body?.eersteBericht ?? "").trim();

  if (!onderwerp || !merkId || !klantNaam || !klantEmail || !eersteBericht) {
    return NextResponse.json(
      { error: "Required fields: onderwerp, merkId, klantNaam, klantEmail, eersteBericht" },
      { status: 400 }
    );
  }

  const supabase = createClient(cookies());

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .insert({
      kanaal,
      onderwerp,
      merk_id: merkId,
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (conversationError) {
    return NextResponse.json({ error: conversationError.message }, { status: 500 });
  }

  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .insert({
      conversation_id: conversation.id,
      merk_id: merkId,
      onderwerp,
      klant_naam: klantNaam,
      klant_email: klantEmail,
      status: "open",
      kanaal,
    })
    .select("id, conversation_id, merk_id, onderwerp, klant_naam, klant_email, status, kanaal, created_at")
    .single();

  if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 500 });

  await supabase.from("messages").insert({
    conversation_id: conversation.id,
    ticket_id: ticket.id,
    kanaal,
    direction: "inbound",
    sender_name: klantNaam,
    sender_email: klantEmail,
    body: eersteBericht,
  });

  await supabase.from("ticket_events").insert({
    ticket_id: ticket.id,
    event_type: "ticket_created",
    actor: "api",
    metadata: { kanaalLabel: getKanaalLabel(kanaal) },
  });

  const tickets = await attachMessages(supabase, [ticket as DbTicketRow]);
  return NextResponse.json({ data: tickets[0] }, { status: 201 });
}
