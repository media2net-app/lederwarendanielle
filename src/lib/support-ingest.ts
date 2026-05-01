import { createClient } from "@/utils/supabase/server";
import type { TicketKanaal } from "@/lib/support-shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

interface IngestInput {
  kanaal: TicketKanaal;
  onderwerp: string;
  merkId: string;
  klantNaam: string;
  klantEmail: string;
  tekst: string;
  externalThreadId?: string;
  externalMessageId?: string;
}

export async function ingestInboundSupportMessage(input: IngestInput, client?: SupabaseClient) {
  const supabase = client ?? createClient(cookies());
  const {
    kanaal,
    onderwerp,
    merkId,
    klantNaam,
    klantEmail,
    tekst,
    externalThreadId,
    externalMessageId,
  } = input;

  let conversationId: string | null = null;
  let nieuwConversation = false;

  if (externalThreadId) {
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("kanaal", kanaal)
      .eq("external_thread_id", externalThreadId)
      .maybeSingle();
    conversationId = existing?.id ?? null;
  }

  if (!conversationId) {
    nieuwConversation = true;
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        kanaal,
        onderwerp,
        merk_id: merkId,
        external_thread_id: externalThreadId ?? null,
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (conversationError) throw conversationError;
    conversationId = conversation.id;

    const { error: ticketError } = await supabase.from("tickets").insert({
      conversation_id: conversationId,
      merk_id: merkId,
      onderwerp,
      klant_naam: klantNaam,
      klant_email: klantEmail,
      status: "open",
      kanaal,
    });
    if (ticketError) throw ticketError;
  }

  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (ticketError) throw ticketError;

  if (externalMessageId) {
    const { data: dup } = await supabase
      .from("messages")
      .select("id")
      .eq("external_message_id", externalMessageId)
      .maybeSingle();
    if (dup) {
      return { conversationId, ticketId: ticket.id, duplicate: true as const };
    }
  }

  const { error: messageError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    ticket_id: ticket.id,
    kanaal,
    direction: "inbound",
    sender_name: klantNaam,
    sender_email: klantEmail,
    body: tekst,
    external_message_id: externalMessageId ?? null,
  });
  if (messageError) throw messageError;

  if (nieuwConversation) {
    await supabase.from("ticket_events").insert({
      ticket_id: ticket.id,
      event_type: "ticket_created",
      actor: "webhook",
      metadata: { source: "webhook", kanaal },
    });
  }

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  return { conversationId, ticketId: ticket.id };
}
