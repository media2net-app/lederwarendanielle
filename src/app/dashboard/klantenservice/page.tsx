"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MERKEN, getMerkById } from "@/lib/merken";
import { getKlantenserviceTickets, getKanaalLabel } from "@/lib/mock-klantenservice";
import type { TicketStatus } from "@/lib/mock-klantenservice";

function formatDatum(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TICKET_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Alle statussen" },
  { value: "open", label: "Open" },
  { value: "beantwoord", label: "Beantwoord" },
  { value: "afgehandeld", label: "Afgehandeld" },
];

export default function KlantenservicePage() {
  const [merkFilter, setMerkFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const tickets = useMemo(
    () => getKlantenserviceTickets(merkFilter || undefined, (statusFilter as TicketStatus) || undefined),
    [merkFilter, statusFilter]
  );

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Klantenservice</h2>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <span>Merk:</span>
              <select
                value={merkFilter}
                onChange={(e) => setMerkFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="">Alle merken</option>
                {MERKEN.map((m) => (
                  <option key={m.id} value={m.id}>{m.naam}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                {TICKET_STATUS_OPTIONS.map((o) => (
                  <option key={o.value || "all"} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="space-y-3">
          {tickets.map((t) => {
            const merk = getMerkById(t.merkId);
            return (
              <Link
                key={t.id}
                href={`/dashboard/klantenservice/${t.id}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50/50 hover:border-gray-300 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900">{t.onderwerp}</h3>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {t.klantNaam} · {t.klantEmail}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{formatDatum(t.datum)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {getKanaalLabel(t.kanaal)}
                  </span>
                  <span className="text-sm text-gray-600">{merk?.naam ?? t.merkId}</span>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      t.status === "open"
                        ? "bg-amber-100 text-amber-800"
                        : t.status === "beantwoord"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        {tickets.length === 0 && (
          <p className="mt-4 text-center text-sm text-gray-500">Geen tickets gevonden.</p>
        )}
      </div>
    </main>
  );
}
