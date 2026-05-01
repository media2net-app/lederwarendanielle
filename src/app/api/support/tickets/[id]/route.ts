import { createClient } from "@/utils/supabase/server";
import { mapMessage, type DbMessageRow, type DbTicketRow, type TicketStatus } from "@/lib/support-shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface RouteContext {
  params: { id: string };
}

const ALLOWED_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  open: ["in_behandeling"],
  in_behandeling: ["wacht_op_klant", "opgelost"],
  wacht_op_klant: ["in_behandeling"],
  opgelost: ["in_behandeling"],
};

export async function GET(_request: Request, context: RouteContext) {
  const supabase = createClient(cookies());
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("id, conversation_id, merk_id, onderwerp, klant_naam, klant_email, status, kanaal, created_at")
    .eq("id", context.params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  const { data: messagesData } = await supabase
    .from("messages")
    .select("id, conversation_id, direction, kanaal, sender_name, sender_email, body, created_at")
    .eq("conversation_id", (ticket as DbTicketRow).conversation_id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    data: {
      id: ticket.id,
      conversationId: (ticket as DbTicketRow).conversation_id,
      merkId: ticket.merk_id,
      onderwerp: ticket.onderwerp,
      klantNaam: ticket.klant_naam,
      klantEmail: ticket.klant_email,
      status: ticket.status,
      datum: ticket.created_at,
      kanaal: ticket.kanaal,
      berichten: ((messagesData ?? []) as DbMessageRow[]).map(mapMessage),
    },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => null);
  const update: Record<string, unknown> = {};
  if (body?.status) update.status = body.status as TicketStatus;
  if (typeof body?.onderwerp === "string") update.onderwerp = body.onderwerp.trim();
  if (typeof body?.assignedTo === "string") update.assigned_to = body.assignedTo.trim();

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  const supabase = createClient(cookies());
  const { data: currentTicket, error: currentError } = await supabase
    .from("tickets")
    .select("status")
    .eq("id", context.params.id)
    .single();
  if (currentError) return NextResponse.json({ error: currentError.message }, { status: 404 });

  if (update.status) {
    const fromStatus = currentTicket.status as TicketStatus;
    const toStatus = update.status as TicketStatus;
    const allowed = ALLOWED_STATUS_TRANSITIONS[fromStatus] ?? [];
    if (fromStatus !== toStatus && !allowed.includes(toStatus)) {
      return NextResponse.json(
        { error: `Ongeldige statusovergang: ${fromStatus} -> ${toStatus}` },
        { status: 400 }
      );
    }
  }

  const { data, error } = await supabase
    .from("tickets")
    .update(update)
    .eq("id", context.params.id)
    .select("id, conversation_id, merk_id, onderwerp, klant_naam, klant_email, status, kanaal, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (update.status) {
    await supabase.from("ticket_events").insert({
      ticket_id: context.params.id,
      event_type: "status_changed",
      actor: "api",
      metadata: { status: update.status },
    });
  }

  return NextResponse.json({
    data: {
      id: data.id,
      conversationId: data.conversation_id,
      merkId: data.merk_id,
      onderwerp: data.onderwerp,
      klantNaam: data.klant_naam,
      klantEmail: data.klant_email,
      status: data.status,
      datum: data.created_at,
      kanaal: data.kanaal,
    },
  });
}
