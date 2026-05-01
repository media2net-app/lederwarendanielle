"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Dagrapportage, DagrapportageGrafiekPunt } from "@/lib/dagrapportage";

function getLocalDateISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function fetchDagrapportage(dateISO: string): Promise<Dagrapportage> {
  const res = await fetch("/api/ai/dagrapportage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: dateISO }),
  });
  const data = (await res.json()) as Dagrapportage;
  if (!data?.date) throw new Error("Ongeldige dagrapportage respons");
  return data;
}

function toChartData(points: DagrapportageGrafiekPunt[]) {
  return points.map((p) => ({ label: p.label, value: p.count }));
}

function formatDateLabel(dateISO: string) {
  return new Date(`${dateISO}T12:00:00`).toLocaleDateString("nl-NL", {
    weekday: "long",
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
    .filter(Boolean);
}

function EmptyChartState({ label }: { label: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-center text-sm text-gray-500">
      Geen data beschikbaar voor {label.toLowerCase()} vandaag.
    </div>
  );
}

export default function DagrapportagePanel() {
  const dateISO = useMemo(() => getLocalDateISO(), []);
  const [report, setReport] = useState<Dagrapportage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchDagrapportage(dateISO)
      .then((data) => {
        setReport(data);
      })
      .catch(() => setError("Kon dagrapportage niet ophalen. Probeer opnieuw."))
      .finally(() => setLoading(false));
  }, [dateISO]);

  const ordersChart = useMemo(() => toChartData(report?.cijfers.ordersCreatedByStatus ?? []), [report]);
  const ticketsChart = useMemo(
    () => toChartData(report?.cijfers.ticketsCreatedByStatus ?? []),
    [report]
  );

  const tasksDue = report?.cijfers.takenDueVandaag ?? 0;
  const tasksDone = report?.cijfers.takenAfgerondVandaag ?? 0;
  const openOrders = report?.cijfers.openBestellingen ?? 0;
  const openTickets = report?.cijfers.openTickets ?? 0;
  const openTaken = report?.cijfers.openTaken ?? 0;
  const summaryLines = report ? getCleanSummaryLines(report.samenvatting).slice(0, 5) : [];

  return (
    <section className="mb-10">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Dagrapportage (vandaag)</h3>
        <p className="mt-1 text-sm text-gray-600">Laatste status + cijfers + grafieken.</p>
      </div>

      <div
        className={`rounded-2xl border bg-white p-5 shadow-sm ${
          loading ? "border-amber-200" : "border-emerald-200"
        }`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {dateISO}
              </p>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                Laatst bijgewerkt: {report ? new Date(report.generatedAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
              </span>
            </div>

            <h4 className="mt-2 text-lg font-semibold text-gray-900">
              {formatDateLabel(dateISO)}
            </h4>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Open orders</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{openOrders}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Open tickets</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{openTickets}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Open taken</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{openTaken}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Taken vandaag</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{tasksDue}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Afgerond vandaag</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{tasksDone}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Samenvatting</p>
              {report ? (
                <div className="mt-3 grid gap-2">
                  {summaryLines.map((line) => (
                    <div key={line} className="flex gap-2 text-sm text-gray-700">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                      <p>{line}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 text-sm text-gray-700">
                  {loading ? "Dagrapportage wordt gegenereerd..." : error ?? "—"}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setError(null);
                try {
                  const res = await fetch("/api/ai/dagrapportage", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ date: dateISO, force: true }),
                  });
                  const data = (await res.json()) as Dagrapportage;
                  if (!data?.date) throw new Error("Ongeldige dagrapportage respons");
                  setReport(data);
                } catch {
                  setError("Kon dagrapportage niet regenereren.");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Even geduld..." : "Vandaag opnieuw"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900">Orders op status</p>
              <p className="text-xs text-gray-600">{ordersChart.reduce((s, d) => s + d.value, 0)} totaal</p>
            </div>
            <div className="mt-3">
              {ordersChart.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChartState label="orders" />
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900">Tickets op status</p>
              <p className="text-xs text-gray-600">{ticketsChart.reduce((s, d) => s + d.value, 0)} totaal</p>
            </div>
            <div className="mt-3">
              {ticketsChart.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ticketsChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChartState label="tickets" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

