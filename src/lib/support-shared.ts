export type TicketStatus = "open" | "in_behandeling" | "wacht_op_klant" | "opgelost";
export type TicketKanaal = "chat" | "whatsapp" | "email";
export type MessageDirection = "inbound" | "outbound";

export interface SupportMessage {
  id: string;
  datum: string;
  afzender: "klant" | "support";
  tekst: string;
  direction: MessageDirection;
  kanaal: TicketKanaal;
}

export interface SupportTicket {
  id: string;
  conversationId: string;
  merkId: string;
  onderwerp: string;
  klantNaam: string;
  klantEmail: string;
  status: TicketStatus;
  datum: string;
  kanaal: TicketKanaal;
  berichten: SupportMessage[];
}

export interface DbTicketRow {
  id: string;
  conversation_id: string;
  merk_id: string;
  onderwerp: string;
  klant_naam: string;
  klant_email: string;
  status: TicketStatus;
  kanaal: TicketKanaal;
  created_at: string;
}

export interface DbMessageRow {
  id: string;
  conversation_id: string;
  direction: MessageDirection;
  kanaal: TicketKanaal;
  sender_name: string | null;
  sender_email: string | null;
  body: string;
  created_at: string;
}

export function getKanaalLabel(kanaal: TicketKanaal): string {
  switch (kanaal) {
    case "chat":
      return "Chat webshop";
    case "whatsapp":
      return "WhatsApp";
    case "email":
      return "E-mail";
    default:
      return kanaal;
  }
}

export function mapMessage(row: DbMessageRow): SupportMessage {
  return {
    id: row.id,
    datum: row.created_at,
    afzender: row.direction === "inbound" ? "klant" : "support",
    tekst: row.body,
    direction: row.direction,
    kanaal: row.kanaal,
  };
}
