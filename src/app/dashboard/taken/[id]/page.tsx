"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getTaakById } from "@/lib/dashboard-data";
import { getMerkById } from "@/lib/merken";
import type { TaakStatus } from "@/lib/dashboard-data";

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

const STATUS_OPTIONS: TaakStatus[] = ["open", "bezig", "afgerond"];

export default function TaakDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const taakFromData = id ? getTaakById(id) : undefined;
  const [status, setStatus] = useState<TaakStatus | null>(null);
  const taak = taakFromData ?? null;
  const currentStatus = status ?? taak?.status;

  if (!id || !taak) {
    return (
      <main className="flex-1">
        <div className="w-full pl-10 pr-6 py-8">
          <p className="text-gray-500">Taak niet gevonden.</p>
          <Link href="/dashboard/taken" className="mt-4 inline-block text-sm text-black hover:underline">
            ← Terug naar taken
          </Link>
        </div>
      </main>
    );
  }

  const merk = taak.merkId ? getMerkById(taak.merkId) : null;

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <Link href="/dashboard/taken" className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900">
          ← Terug naar taken
        </Link>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-xl font-semibold text-gray-900">{taak.titel}</h1>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                currentStatus === "afgerond" ? "bg-green-100 text-green-800" : currentStatus === "bezig" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {currentStatus ? statusLabel(currentStatus) : "—"}
            </span>
          </div>

          <dl className="mt-6 space-y-3">
            <div>
              <dt className="text-xs font-medium uppercase text-gray-500">Toegewezen aan</dt>
              <dd className="mt-0.5 text-gray-900">{taak.toegewezenAan}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-gray-500">Merk</dt>
              <dd className="mt-0.5 text-gray-900">{merk?.naam ?? taak.merkId ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-gray-500">Deadline</dt>
              <dd className="mt-0.5 text-gray-900">{taak.deadline}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-gray-500">Prioriteit</dt>
              <dd className="mt-0.5">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    taak.prioriteit === "hoog" ? "bg-red-100 text-red-800" : taak.prioriteit === "normaal" ? "bg-gray-100 text-gray-800" : "bg-gray-50 text-gray-600"
                  }`}
                >
                  {prioriteitLabel(taak.prioriteit)}
                </span>
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <label className="block text-sm font-medium text-gray-700">Status wijzigen</label>
            <select
              value={currentStatus ?? ""}
              onChange={(e) => setStatus(e.target.value as TaakStatus)}
              className="mt-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Wijziging is alleen zichtbaar in deze sessie (demo).</p>
          </div>
        </div>
      </div>
    </main>
  );
}
