"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMerkById } from "@/lib/merken";
import type { Taak, TaakStatus } from "@/lib/tasks-shared";

function statusLabel(s: TaakStatus) {
  switch (s) {
    case "open": return "Open";
    case "bezig": return "Bezig";
    case "afgerond": return "Afgerond";
    default: return s;
  }
}

function prioriteitLabel(p: string) {
  switch (p) {
    case "hoog": return "Hoog";
    case "normaal": return "Normaal";
    case "laag": return "Laag";
    default: return p;
  }
}

export default function TakenPage() {
  const router = useRouter();
  const [version, setVersion] = useState(0);
  const [takenData, setTakenData] = useState<Taak[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadTaken = async () => {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/tasks", { signal: controller.signal });
      const payload = await res.json();
      if (!res.ok) {
        setTakenData([]);
        setError(payload.error ?? "Kon taken niet ophalen.");
      } else {
        setTakenData(payload.data ?? []);
      }
      setLoading(false);
    };

    loadTaken().catch((err) => {
      if (err?.name === "AbortError") return;
      setTakenData([]);
      setError("Kon taken niet ophalen.");
      setLoading(false);
    });
    return () => controller.abort();
  }, [version]);

  const taken = useMemo(() => {
    const baseTaken = [...takenData];
    const statusOrder: Record<TaakStatus, number> = {
      open: 0,
      bezig: 1,
      afgerond: 2,
    };
    return baseTaken.sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return a.deadline.localeCompare(b.deadline);
    });
  }, [takenData]);
  const openCount = taken.filter((t) => t.status === "open" || t.status === "bezig").length;

  return (
    <main className="flex-1">
      <div className="dashboard-page-shell w-full pl-10 pr-6 py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">Taken</h2>
            <p className="text-gray-600">
              Overzicht van alle taken. {openCount} open of bezig.
            </p>
          </div>
          <Link
            href="/dashboard/taken/nieuw"
            className="ui-btn-primary inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium"
          >
            + Nieuwe taak toevoegen
          </Link>
        </div>
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setVersion((current) => current + 1)}
            className="ui-btn-secondary rounded-lg px-3 py-2 text-xs font-medium"
          >
            Vernieuwen
          </button>
        </div>
        {error && <p className="mb-3 text-sm text-rose-600">{error}</p>}
        {loading && <p className="mb-3 text-sm text-gray-500">Taken laden...</p>}

        <div className="ui-table-shell overflow-x-auto rounded-lg border shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Taak</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Toegewezen aan</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Merk</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Deadline</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Prioriteit</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {taken.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => router.push(`/dashboard/taken/${t.id}`)}
                  className={`cursor-pointer transition-colors ${
                    t.status === "afgerond"
                      ? "task-row-completed"
                      : "hover:bg-gray-100"
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/dashboard/taken/${t.id}`);
                    }
                  }}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{t.titel}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{t.toegewezenAan}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {t.merkId ? getMerkById(t.merkId)?.naam ?? t.merkId : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{t.deadline}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        t.prioriteit === "hoog" ? "bg-red-100 text-red-800" : t.prioriteit === "normaal" ? "bg-gray-100 text-gray-800" : "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {prioriteitLabel(t.prioriteit)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        t.status === "afgerond" ? "bg-green-100 text-green-800" : t.status === "bezig" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {statusLabel(t.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {taken.length === 0 && (
          <p className="mt-4 text-center text-sm text-gray-500">Geen taken.</p>
        )}
      </div>
    </main>
  );
}
