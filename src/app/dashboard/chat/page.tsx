"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ChatBootstrapResponse, ChatConversation, ChatMessage, ChatUser } from "@/lib/internal-chat-shared";

const CHAT_CURRENT_USER_ID = "m1";

function formatTijd(iso: string) {
  return new Date(iso).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatMessage[]>>({});
  const [readMap, setReadMap] = useState<Record<string, string>>({});
  const [activeId, setActiveId] = useState<string>("");
  const [nieuwBericht, setNieuwBericht] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/internal-chat?userId=${CHAT_CURRENT_USER_ID}`)
      .then(async (res) => {
        const payload = (await res.json()) as ChatBootstrapResponse & { error?: string };
        if (!res.ok) throw new Error(payload.error ?? "Kon chat niet laden.");
        if (!mounted) return;
        setUsers(payload.users ?? []);
        setConversations(payload.conversations ?? []);
        setMessagesByConversation(payload.messagesByConversation ?? {});
        setReadMap(payload.readMap ?? {});
        setActiveId((payload.conversations ?? [])[0]?.id ?? "");
      })
      .catch((err: unknown) => {
        if (mounted) setError(err instanceof Error ? err.message : "Kon chat niet laden.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId),
    [activeId, conversations]
  );

  const unreadByConversation = useMemo(() => {
    const map: Record<string, number> = {};
    conversations.forEach((conv) => {
      const lastRead = readMap[conv.id];
      const lastReadTs = lastRead ? new Date(lastRead).getTime() : 0;
      const unread = (messagesByConversation[conv.id] ?? []).filter((m) => {
        const own = m.senderId === CHAT_CURRENT_USER_ID;
        return !own && new Date(m.at).getTime() > lastReadTs;
      }).length;
      map[conv.id] = unread;
    });
    return map;
  }, [conversations, messagesByConversation, readMap]);

  const totalUnread = useMemo(
    () => Object.values(unreadByConversation).reduce((sum, n) => sum + n, 0),
    [unreadByConversation]
  );

  const activeMessages = activeConversation ? messagesByConversation[activeConversation.id] ?? [] : [];

  const openConversation = (conv: ChatConversation) => {
    setActiveId(conv.id);
    const last = (messagesByConversation[conv.id] ?? []).at(-1);
    if (last) {
      setReadMap((prev) => ({ ...prev, [conv.id]: last.at }));
      fetch("/api/internal-chat/reads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conv.id, userId: CHAT_CURRENT_USER_ID, at: last.at }),
      }).catch(() => {});
    }
  };

  const handleVerstuur = (e: FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !nieuwBericht.trim()) return;
    const currentUser = users.find((user) => user.id === CHAT_CURRENT_USER_ID);
    const message: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: CHAT_CURRENT_USER_ID,
      senderNaam: currentUser?.naam ?? "Beheerder",
      tekst: nieuwBericht.trim(),
      at: new Date().toISOString(),
    };

    setMessagesByConversation((prev) => ({
      ...prev,
      [activeConversation.id]: [...(prev[activeConversation.id] ?? []), message],
    }));
    setReadMap((prev) => ({ ...prev, [activeConversation.id]: message.at }));
    setNieuwBericht("");

    fetch("/api/internal-chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: activeConversation.id,
        senderId: CHAT_CURRENT_USER_ID,
        senderNaam: message.senderNaam,
        tekst: message.tekst,
      }),
    })
      .then(async (res) => {
        const payload = (await res.json()) as { data?: ChatMessage; error?: string };
        if (!res.ok || !payload.data) throw new Error(payload.error ?? "Bericht versturen mislukt.");
        setMessagesByConversation((prev) => ({
          ...prev,
          [activeConversation.id]: [
            ...(prev[activeConversation.id] ?? []).filter((item) => item.id !== message.id),
            payload.data as ChatMessage,
          ],
        }));
        return payload.data;
      })
      .then((saved) => {
        if (!saved) return;
        return fetch("/api/internal-chat/reads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: activeConversation.id, userId: CHAT_CURRENT_USER_ID, at: saved.at }),
        });
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Bericht versturen mislukt.");
      });
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
              {conversations.map((conv) => {
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
                    <p className="mt-0.5 text-xs text-gray-500">
                      {conv.type === "channel" ? "Kanaal" : "Direct message"}
                    </p>
                  </button>
                );
              })}
              {loading && <p className="text-xs text-gray-500">Chat laden...</p>}
              {!loading && conversations.length === 0 && <p className="text-xs text-gray-500">Geen gesprekken gevonden.</p>}
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
              {users.map((u) => (
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
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
