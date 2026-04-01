export interface ChatUser {
  id: string;
  naam: string;
  rol: string;
  online: boolean;
}

export interface ChatConversation {
  id: string;
  type: "channel" | "dm";
  naam: string;
  memberIds: string[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderNaam: string;
  tekst: string;
  at: string;
}

export const CHAT_CURRENT_USER_ID = "u-beheerder";

export const CHAT_USERS: ChatUser[] = [
  { id: "u-beheerder", naam: "Beheerder", rol: "Admin", online: true },
  { id: "u-lisa", naam: "Lisa", rol: "Klantenservice", online: true },
  { id: "u-mark", naam: "Mark", rol: "Magazijn", online: true },
  { id: "u-sanne", naam: "Sanne", rol: "Operations", online: false },
];

export const CHAT_CONVERSATIONS: ChatConversation[] = [
  { id: "c-algemeen", type: "channel", naam: "# algemeen", memberIds: ["u-beheerder", "u-lisa", "u-mark", "u-sanne"] },
  { id: "c-magazijn", type: "channel", naam: "# magazijn", memberIds: ["u-beheerder", "u-mark", "u-sanne"] },
  { id: "d-lisa", type: "dm", naam: "Lisa", memberIds: ["u-beheerder", "u-lisa"] },
  { id: "d-mark", type: "dm", naam: "Mark", memberIds: ["u-beheerder", "u-mark"] },
];

export const CHAT_SEED_MESSAGES: Record<string, ChatMessage[]> = {
  "c-algemeen": [
    {
      id: "m-a-1",
      conversationId: "c-algemeen",
      senderId: "u-lisa",
      senderNaam: "Lisa",
      tekst: "Goedemorgen! Ik pak de open tickets op.",
      at: "2026-04-01T08:05:00Z",
    },
    {
      id: "m-a-2",
      conversationId: "c-algemeen",
      senderId: "u-mark",
      senderNaam: "Mark",
      tekst: "Top, ik start met pick & pack van de orders met prioriteit.",
      at: "2026-04-01T08:08:00Z",
    },
  ],
  "c-magazijn": [
    {
      id: "m-m-1",
      conversationId: "c-magazijn",
      senderId: "u-mark",
      senderNaam: "Mark",
      tekst: "Voorraad update: Doctor's bag nog 6 stuks.",
      at: "2026-04-01T09:15:00Z",
    },
  ],
  "d-lisa": [
    {
      id: "m-dl-1",
      conversationId: "d-lisa",
      senderId: "u-lisa",
      senderNaam: "Lisa",
      tekst: "Kun jij naar ticket t6 kijken? Klant wil spoedvervanging.",
      at: "2026-04-01T10:02:00Z",
    },
  ],
  "d-mark": [
    {
      id: "m-dm-1",
      conversationId: "d-mark",
      senderId: "u-mark",
      senderNaam: "Mark",
      tekst: "Scanstation 2 werkt weer.",
      at: "2026-04-01T10:22:00Z",
    },
  ],
};

export function getChatConversationById(id: string): ChatConversation | undefined {
  return CHAT_CONVERSATIONS.find((c) => c.id === id);
}

export function getChatUserById(id: string): ChatUser | undefined {
  return CHAT_USERS.find((u) => u.id === id);
}
