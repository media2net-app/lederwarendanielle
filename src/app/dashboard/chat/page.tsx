"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CHAT_CONVERSATIONS,
  CHAT_CURRENT_USER_ID,
  CHAT_SEED_MESSAGES,
  CHAT_USERS,
  getChatConversationById,
  getChatUserById,
  type ChatConversation,
  type ChatMessage,
} from "@/lib/mock-chat";
import {
  appendConversationMessage,
  getChatReadMap,
  getConversationMessages,
  markConversationRead,
} from "@/lib/demo-state";

function formatTijd(iso: string) {
  return new Date(iso).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const [activeId, setActiveId] = useState<string>(CHAT_CONVERSATIONS[0]?.id ?? "");
  const [nieuwBericht, setNieuwBericht] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const activeConversation = useMemo(
    () => getChatConversationById(activeId),
    [activeId]
  );

  const messagesByConversation = useMemo(() => {
    const map: Record<string, ChatMessage[]> = {};
    CHAT_CONVERSATIONS.forEach((conv) => {
      map[conv.id] = getConversationMessages(conv.id, CHAT_SEED_MESSAGES[conv.id] ?? []);
    });
    return map;
  }, [refreshKey]);

  const readMap = useMemo(() => getChatReadMap(), [refreshKey]);

  const unreadByConversation = useMemo(() => {
    const map: Record<string, number> = {};
    CHAT_CONVERSATIONS.forEach((conv) => {
      const lastRead = readMap[conv.id];
      const lastReadTs = lastRead ? new Date(lastRead).getTime() : 0;
      const unread = (messagesByConversation[conv.id] ?? []).filter((m) => {
        const own = m.senderId === CHAT_CURRENT_USER_ID;
        return !own && new Date(m.at).getTime() > lastReadTs;
      }).length;
      map[conv.id] = unread;
    });
    return map;
  }, [messagesByConversation, readMap]);

  const totalUnread = useMemo(
    () => Object.values(unreadByConversation).reduce((sum, n) => sum + n, 0),
    [unreadByConversation]
  );

  const activeMessages = activeConversation ? messagesByConversation[activeConversation.id] ?? [] : [];

  const openConversation = (conv: ChatConversation) => {
    setActiveId(conv.id);
    const last = (messagesByConversation[conv.id] ?? []).at(-1);
    if (last) markConversationRead(conv.id, last.at);
    setRefreshKey((k) => k + 1);
  };

  const handleVerstuur = (e: FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !nieuwBericht.trim()) return;
    const currentUser = getChatUserById(CHAT_CURRENT_USER_ID);
    const message: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: CHAT_CURRENT_USER_ID,
      senderNaam: currentUser?.naam ?? "Beheerder",
      tekst: nieuwBericht.trim(),
      at: new Date().toISOString(),
    };
    appendConversationMessage(activeConversation.id, message);
    markConversationRead(activeConversation.id, message.at);
    setNieuwBericht("");
    setRefreshKey((k) => k + 1);
  };

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Interne chat</h2>
            <p className="text-sm text-gray-600">Chat met collega&apos;s in kanalen of via 1-op-1 gesprekken.</p>
          </div>
          <p className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
            Ongelezen totaal: <span className="font-semibold text-gray-900">{totalUnread}</span>
          </p>
        </div>

        <div className="grid min-h-[70vh] gap-4 lg:grid-cols-[280px_1fr_260px]">
          <aside className="rounded-lg border border-gray-200 bg-white p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Gesprekken</h3>
            <div className="space-y-2">
              {CHAT_CONVERSATIONS.map((conv) => {
                const isActive = conv.id === activeId;
                const unread = unreadByConversation[conv.id] ?? 0;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => openConversation(conv)}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                      isActive ? "border-black bg-gray-100" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900">{conv.naam}</span>
                      {unread > 0 && (
                        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                          {unread}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{conv.type === "channel" ? "Kanaal" : "Direct message"}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="font-medium text-gray-900">{activeConversation?.naam ?? "Gesprek"}</h3>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {activeMessages.length === 0 && (
                <p className="text-sm text-gray-500">Nog geen berichten in dit gesprek.</p>
              )}
              {activeMessages.map((m) => {
                const own = m.senderId === CHAT_CURRENT_USER_ID;
                return (
                  <div key={m.id} className={`max-w-[80%] rounded-lg px-3 py-2 ${own ? "ml-auto bg-black text-white" : "bg-gray-100 text-gray-900"}`}>
                    <p className={`text-[11px] ${own ? "text-gray-200" : "text-gray-500"}`}>
                      {m.senderNaam} · {formatTijd(m.at)}
                    </p>
                    <p className="mt-1 text-sm">{m.tekst}</p>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleVerstuur} className="border-t border-gray-200 p-3">
              <div className="flex gap-2">
                <input
                  value={nieuwBericht}
                  onChange={(e) => setNieuwBericht(e.target.value)}
                  placeholder="Typ een bericht..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Verstuur
                </button>
              </div>
            </form>
          </section>

          <aside className="rounded-lg border border-gray-200 bg-white p-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Gebruikers</h3>
            <ul className="space-y-2">
              {CHAT_USERS.map((u) => (
                <li key={u.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.naam}</p>
                    <p className="text-xs text-gray-500">{u.rol}</p>
                  </div>
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${u.online ? "bg-emerald-500" : "bg-gray-300"}`} />
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}
