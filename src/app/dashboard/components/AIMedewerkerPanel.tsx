"use client";

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function AIMedewerkerPanel() {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hallo, ik ben de AI Medewerker. Stel vragen over bestellingen, tickets, statussen of overzichten.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    setError(null);

    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Er is iets misgegaan.");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Kon geen verbinding maken. Probeer het opnieuw.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
        title="AI Medewerker"
        aria-label="Open AI Medewerker"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-full max-w-md flex-col rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h3 className="font-semibold text-gray-900">AI Medewerker</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Sluiten"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="max-h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-lg px-3 py-2 text-sm ${
                  m.role === "user" ? "ml-8 bg-black text-white" : "mr-8 bg-gray-100 text-gray-900"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="mr-8 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500">Bezig…</div>
            )}
            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="border-t border-gray-200 p-3"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Stel een vraag…"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                Verstuur
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
