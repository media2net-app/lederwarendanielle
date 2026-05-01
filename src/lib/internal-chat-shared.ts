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

export interface ChatBootstrapResponse {
  users: ChatUser[];
  conversations: ChatConversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  readMap: Record<string, string>;
}
