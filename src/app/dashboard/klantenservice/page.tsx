"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MERKEN, getMerkById } from "@/lib/merken";
import { getKanaalLabel, type SupportTicket, type TicketStatus } from "@/lib/support-shared";

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
  { value: "in_behandeling", label: "In behandeling" },
  { value: "wacht_op_klant", label: "Wacht op klant" },
  { value: "opgelost", label: "Opgelost" },
];

interface IntegrationStatus {
  kanaal: "whatsapp" | "email" | "chat";
  displayName: string;
  configured: boolean;
  connected: boolean;
  externalAccountId: string | null;
  lastInboundAt: string | null;
  activeTickets: number;
}

export default function KlantenservicePage() {
  const [merkFilter, setMerkFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [version, setVersion] = useState(0);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadTickets = async () => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (merkFilter) params.set("merkId", merkFilter);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/support/tickets?${params.toString()}`, {
        signal: controller.signal,
      });
      const payload = await res.json();
      if (!res.ok) {
        setTickets([]);
        setError(payload.error ?? "Kon tickets niet ophalen.");
      } else {
        setTickets(payload.data ?? []);
      }
      setLoading(false);
    };

    loadTickets().catch((err) => {
      if (err?.name === "AbortError") return;
      setTickets([]);
      setError("Kon tickets niet ophalen.");
      setLoading(false);
    });

    return () => controller.abort();
  }, [merkFilter, statusFilter, version]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/support/integrations", { signal: controller.signal })
      .then((res) => res.json())
      .then((payload) => setIntegrations(payload.data ?? []))
      .catch(() => setIntegrations([]));
    return () => controller.abort();
  }, [version]);

  return (
    <main className="flex-1">
      <div className="dashboard-page-shell w-full pl-10 pr-6 py-8">
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Status koppelingen</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {integrations.map((integration) => (
              <div key={integration.kanaal} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900">{integration.displayName}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        integration.configured ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {integration.configured ? "Geconfigureerd" : "Niet geconfigureerd"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        integration.connected ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {integration.connected ? "Verbonden" : "Niet verbonden"}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  ID: {integration.externalAccountId ?? "niet ingesteld"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Laatste inbound:{" "}
                  {integration.lastInboundAt
                    ? new Date(integration.lastInboundAt).toLocaleString("nl-NL")
                    : "geen berichten"}
                </p>
                <p className="mt-1 text-xs text-gray-500">Actieve tickets: {integration.activeTickets}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Klantenservice</h2>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setVersion((current) => current + 1)}
              className="ui-btn-secondary rounded-lg px-3 py-2 text-xs font-medium"
            >
              Vernieuwen
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <span>Merk:</span>
              <select
                value={merkFilter}
                onChange={(e) => setMerkFilter(e.target.value)}
                className="ui-select rounded-lg px-3 py-2"
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
                className="ui-select rounded-lg px-3 py-2"
              >
                {TICKET_STATUS_OPTIONS.map((o) => (
                  <option key={o.value || "all"} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {error && <p className="mb-3 text-sm text-rose-600">{error}</p>}
        {loading && <p className="mb-3 text-sm text-gray-500">Tickets laden...</p>}
        <div className="space-y-3">
          {tickets.map((t) => {
            const merk = getMerkById(t.merkId);
            return (
              <Link
                key={t.id}
                href={`/dashboard/klantenservice/${t.id}`}
                className="ui-card flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4 shadow-sm hover:border-white/30 transition-colors"
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
                        : t.status === "in_behandeling"
                          ? "bg-blue-100 text-blue-800"
                          : t.status === "wacht_op_klant"
                            ? "bg-violet-100 text-violet-800"
                            : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {t.status.replaceAll("_", " ")}
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
