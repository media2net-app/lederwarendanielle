"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getBestellingById } from "@/lib/mock-bestellingen";
import { getMerkById } from "@/lib/merken";
import type { BestellingStatus } from "@/lib/mock-bestellingen";

function formatDatum(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBedrag(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

const STATUS_OPTIONS: BestellingStatus[] = ["open", "verwerkt", "verzonden", "afgeleverd"];

export default function BestellingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const bestelling = getBestellingById(id);
  const [status, setStatus] = useState<BestellingStatus | null>(null);
  const [aiSuggestie, setAiSuggestie] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (bestelling) setStatus(bestelling.status);
  }, [bestelling]);

  if (!bestelling) {
    return (
      <main className="flex-1">
        <div className="w-full pl-10 pr-6 py-8">
          <p className="text-gray-500">Bestelling niet gevonden.</p>
          <Link href="/dashboard/bestellingen" className="mt-4 inline-block text-sm text-black hover:underline">
            ← Terug
          </Link>
        </div>
      </main>
    );
  }

  const merk = getMerkById(bestelling.merkId);
  const currentStatus = status ?? bestelling.status;

  const handleAiSuggestie = async () => {
    setAiLoading(true);
    setAiSuggestie(null);
    try {
      const res = await fetch("/api/ai/suggest-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bestellingId: id }),
      });
      const data = await res.json();
      if (res.ok && data.suggestion) setAiSuggestie(data.suggestion);
      else setAiSuggestie(data.error ?? "Geen suggestie ontvangen.");
    } catch {
      setAiSuggestie("Kon geen verbinding maken. Probeer het opnieuw.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <Link href="/dashboard/bestellingen" className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900">
          ← Terug naar bestellingen
        </Link>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Bestelling {bestelling.ordernummer}</h1>
              <p className="mt-1 text-sm text-gray-500">{merk?.naam ?? bestelling.merkId}</p>
              <p className="mt-1 text-xs text-gray-400">{formatDatum(bestelling.datum)}</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Status:</span>
                <select
                  value={currentStatus}
                  onChange={(e) => setStatus(e.target.value as BestellingStatus)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  currentStatus === "open"
                    ? "bg-amber-100 text-amber-800"
                    : currentStatus === "afgeleverd"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-blue-100 text-blue-800"
                }`}
              >
                {currentStatus}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-medium uppercase text-gray-500">Klantgegevens</h2>
              <p className="mt-2 font-medium text-gray-900">{bestelling.klantNaam}</p>
              <p className="text-sm text-gray-600">{bestelling.klantEmail}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium uppercase text-gray-500">Totaal</h2>
              <p className="mt-2 text-xl font-semibold text-gray-900">{formatBedrag(bestelling.totaal)}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-medium uppercase text-gray-500">AI-suggestie</h2>
            <button
              type="button"
              onClick={handleAiSuggestie}
              disabled={aiLoading}
              className="mt-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {aiLoading ? "Bezig…" : "Genereer AI-suggestie"}
            </button>
            {aiSuggestie && (
              <div className="mt-3 rounded-lg bg-gray-100 p-4 text-sm text-gray-800">{aiSuggestie}</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
