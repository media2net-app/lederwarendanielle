"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getTicketById, getKanaalLabel } from "@/lib/mock-klantenservice";
import { getMerkById } from "@/lib/merken";
import type { TicketStatus } from "@/lib/mock-klantenservice";
import type { GesprekBericht } from "@/lib/mock-klantenservice";

function formatDatum(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_OPTIONS: TicketStatus[] = ["open", "beantwoord", "afgehandeld"];

export default function TicketDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const ticket = id ? getTicketById(id) : undefined;
  const [status, setStatus] = useState<TicketStatus | null>(null);
  const [berichten, setBerichten] = useState<GesprekBericht[]>([]);
  const [nieuwAntwoord, setNieuwAntwoord] = useState("");
  const [aiSuggestie, setAiSuggestie] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [gebruikAiStandaard, setGebruikAiStandaard] = useState(true);

  useEffect(() => {
    if (!id || !gebruikAiStandaard) return;
    setAiLoading(true);
    setAiError(null);
    fetch("/api/ai/suggest-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.suggestion) {
          setAiSuggestie(data.suggestion);
          setNieuwAntwoord(data.suggestion);
        } else setAiError(data.error ?? "Geen suggestie ontvangen.");
      })
      .catch(() => setAiError("Kon geen verbinding maken."))
      .finally(() => setAiLoading(false));
  }, [id, gebruikAiStandaard]);

  if (!ticket) {
    return (
      <main className="flex-1">
        <div className="w-full pl-10 pr-6 py-8">
          <p className="text-gray-500">Ticket niet gevonden.</p>
          <Link href="/dashboard/klantenservice" className="mt-4 inline-block text-sm text-black hover:underline">
            ← Terug
          </Link>
        </div>
      </main>
    );
  }

  const merk = getMerkById(ticket.merkId);
  const currentStatus = status ?? ticket.status;
  const alleBerichten = [...ticket.berichten, ...berichten];

  const handleAntwoord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nieuwAntwoord.trim()) return;
    setBerichten((prev) => [
      ...prev,
      {
        datum: new Date().toISOString(),
        afzender: "support",
        tekst: nieuwAntwoord.trim(),
      },
    ]);
    setNieuwAntwoord("");
  };

  const handleAiOpnieuw = () => {
    setGebruikAiStandaard(true);
    setNieuwAntwoord("");
    setAiSuggestie(null);
    setAiError(null);
  };

  const handleZelfTypen = () => {
    setGebruikAiStandaard(false);
    setNieuwAntwoord("");
    setAiSuggestie(null);
    setAiError(null);
  };

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <Link href="/dashboard/klantenservice" className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900">
          ← Terug naar klantenservice
        </Link>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{ticket.onderwerp}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {ticket.klantNaam} · {ticket.klantEmail}
              </p>
              <p className="mt-1 text-xs text-gray-400">{formatDatum(ticket.datum)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {getKanaalLabel(ticket.kanaal)}
              </span>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Status:</span>
                <select
                  value={currentStatus}
                  onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              {merk && <span className="text-sm text-gray-600">{merk.naam}</span>}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">Gespreksgeschiedenis</h2>
            <ul className="mt-4 space-y-4">
              {alleBerichten.map((msg, i) => (
                <li key={i} className={`flex gap-3 ${msg.afzender === "support" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-3 ${
                      msg.afzender === "klant" ? "bg-gray-100 text-gray-900" : "bg-black text-white"
                    }`}
                  >
                    <p className="text-sm font-medium opacity-80">
                      {msg.afzender === "klant" ? ticket.klantNaam : "Support"}
                    </p>
                    <p className="mt-1 text-sm">{msg.tekst}</p>
                    <p className="mt-2 text-xs opacity-70">{formatDatum(msg.datum)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleAntwoord} className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-medium uppercase text-gray-500">Antwoord toevoegen</h2>
            {aiSuggestie && nieuwAntwoord === aiSuggestie && (
              <p className="mt-2 text-xs text-gray-500">AI-voorgesteld antwoord — goedkeuren of bewerken en dan versturen.</p>
            )}
            <textarea
              value={nieuwAntwoord}
              onChange={(e) => setNieuwAntwoord(e.target.value)}
              placeholder={aiLoading ? "AI-antwoord wordt gegenereerd…" : "Typ uw antwoord…"}
              rows={4}
              disabled={aiLoading}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
            />
            {aiError && (
              <div className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{aiError}</div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={!nieuwAntwoord.trim()}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                Verstuur antwoord
              </button>
              <button
                type="button"
                onClick={handleZelfTypen}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                Zelf antwoord typen
              </button>
              {!gebruikAiStandaard && (
                <button
                  type="button"
                  onClick={handleAiOpnieuw}
                  disabled={aiLoading}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {aiLoading ? "Bezig…" : "Opnieuw AI-antwoord genereren"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
