import { sendWhatsAppTextMessage } from "@/lib/whatsapp-graph";
import { createClient } from "@/utils/supabase/server";
import { mapMessage, type DbMessageRow, type TicketKanaal } from "@/lib/support-shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface RouteContext {
  params: { id: string };
}

export async function POST(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => null);
  const tekst = String(body?.tekst ?? "").trim();
  const afzender = String(body?.afzender ?? "support");

  if (!tekst) return NextResponse.json({ error: "tekst is required" }, { status: 400 });

  const direction = afzender === "klant" ? "inbound" : "outbound";
  const supabase = createClient(cookies());
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("id, conversation_id, kanaal, klant_naam, klant_email")
    .eq("id", context.params.id)
    .single();

  if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 404 });

  if (direction === "outbound" && ticket.kanaal === "whatsapp") {
    const send = await sendWhatsAppTextMessage(ticket.klant_email, tekst);
    if (!send.ok) {
      return NextResponse.json(
        {
          error: send.error,
          hint: "klant_email op het ticket moet het WhatsApp-nummer zijn (cijfers, landcode).",
        },
        { status: 502 }
      );
    }
  }

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: ticket.conversation_id,
      ticket_id: ticket.id,
      kanaal: ticket.kanaal as TicketKanaal,
      direction,
      sender_name: afzender === "klant" ? ticket.klant_naam : "Support",
      sender_email: afzender === "klant" ? ticket.klant_email : "support@lederwaren-danielle.nl",
      body: tekst,
    })
    .select("id, conversation_id, direction, kanaal, sender_name, sender_email, body, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", ticket.conversation_id);

  if (direction === "outbound") {
    await supabase
      .from("tickets")
      .update({ status: "wacht_op_klant", first_response_at: new Date().toISOString() })
      .eq("id", ticket.id)
      .in("status", ["open", "in_behandeling"]);
  }

  return NextResponse.json({ data: mapMessage(message as DbMessageRow) }, { status: 201 });
}
