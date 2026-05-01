"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Dagrapportage } from "@/lib/dagrapportage";

function getLocalDateISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateLabel(dateISO: string) {
  return new Date(`${dateISO}T12:00:00`).toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getCleanSummaryLines(summary: string) {
  return summary
    .replace(/\*\*/g, "")
    .split(/\n|(?<=\.)\s+(?=[A-ZÀ-ÿ])/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 3);
}

export default function DagrapportageNotice() {
  const [report, setReport] = useState<Dagrapportage | null>(null);
  const [loading, setLoading] = useState(false);
  const dateISO = getLocalDateISO();
  const summaryLines = report ? getCleanSummaryLines(report.samenvatting) : [];

  useEffect(() => {
    setLoading(true);
    fetch("/api/ai/dagrapportage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateISO }),
    })
      .then(async (res) => {
        const data = (await res.json()) as Dagrapportage;
        if (data?.date) {
          setReport(data);
        } else {
          setReport(null);
        }
      })
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [dateISO]);

  return (
    <section className="mb-8">
      <div
        className={`rounded-2xl border px-5 py-4 shadow-sm ${
          report
            ? "border-white/15 bg-gradient-to-r from-zinc-900/90 via-slate-900/80 to-zinc-950/90"
            : loading
              ? "border-white/15 bg-zinc-900/85"
              : "border-white/10 bg-slate-900/70"
        }`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Dagrapportage
              </p>
              <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-xs font-medium text-slate-200">
                {loading ? "Wordt gegenereerd" : report ? "Klaar voor vandaag" : "Niet beschikbaar"}
              </span>
            </div>

            <h3 className="mt-2 text-xl font-semibold text-white">
              Overzicht van {formatDateLabel(dateISO)}
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              Snelle managementsamenvatting met de belangrijkste cijfers van vandaag.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-white/12 bg-black/25 p-3 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Open orders</p>
                <p className="mt-1 text-2xl font-semibold text-white">{report?.cijfers.openBestellingen ?? "—"}</p>
              </div>
              <div className="rounded-xl border border-white/12 bg-black/25 p-3 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Open tickets</p>
                <p className="mt-1 text-2xl font-semibold text-white">{report?.cijfers.openTickets ?? "—"}</p>
              </div>
              <div className="rounded-xl border border-white/12 bg-black/25 p-3 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Open taken</p>
                <p className="mt-1 text-2xl font-semibold text-white">{report?.cijfers.openTaken ?? "—"}</p>
              </div>
              <div className="rounded-xl border border-white/12 bg-black/25 p-3 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Afgerond vandaag</p>
                <p className="mt-1 text-2xl font-semibold text-white">{report?.cijfers.takenAfgerondVandaag ?? "—"}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/15 bg-black/25 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Belangrijkste punten
              </p>
              {report ? (
                <div className="mt-3 space-y-2">
                  {summaryLines.map((line) => (
                    <div key={line} className="flex gap-2 text-sm text-slate-200">
                      <span className="mt-1 h-2 w-2 rounded-full bg-slate-300" />
                      <p className="min-w-0">{line}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-300">
                  {loading
                    ? "We maken vandaag een samenvatting met cijfers en observaties."
                    : "Nog geen dagrapportage beschikbaar."}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 lg:pl-4">
            {report ? (
              <Link
                href="/dashboard/rapportage"
                className="ui-btn-primary rounded-xl px-4 py-2.5 text-sm font-medium shadow-md"
              >
                Open rapportage →
              </Link>
            ) : (
              <div className="text-xs text-slate-400">Even geduld…</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

