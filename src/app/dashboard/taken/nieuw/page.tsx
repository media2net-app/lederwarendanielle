"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TaakPrioriteit, TaakStatus } from "@/lib/tasks-shared";
import { MERKEN } from "@/lib/merken";

const STATUS_OPTIONS: TaakStatus[] = ["open", "bezig", "afgerond"];

interface NieuweTaakFormState {
  titel: string;
  status: TaakStatus;
  merkId: string | null;
  toegewezenAan: string;
  deadline: string;
  prioriteit: TaakPrioriteit;
}

export default function NieuweTaakPage() {
  const router = useRouter();
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<NieuweTaakFormState>({
    titel: "",
    status: "open",
    merkId: null,
    toegewezenAan: "Sanne",
    deadline: new Date().toISOString().slice(0, 10),
    prioriteit: "normaal" as TaakPrioriteit,
  });

  const saveTaak = async () => {
    if (!formState.titel.trim() || !formState.toegewezenAan.trim()) return;
    setError(null);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formState,
        titel: formState.titel.trim(),
      }),
    });
    const payload = await res.json();
    if (!res.ok) {
      setError(payload.error ?? "Kon taak niet opslaan.");
      return;
    }
    setSaveNotice("Nieuwe taak opgeslagen.");
    setTimeout(() => {
      setSaveNotice(null);
      router.push(`/dashboard/taken/${payload.data.id}`);
    }, 600);
  };

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <Link href="/dashboard/taken" className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900">
          ← Terug naar taken
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Nieuwe taak toevoegen</h1>
          <p className="mt-2 text-sm text-gray-600">
            Voeg een taak toe en beheer daarna checklist/subtaken op de detailpagina.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {saveNotice && <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{saveNotice}</p>}
          {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Taaktitel</label>
              <input
                type="text"
                value={formState.titel}
                onChange={(e) => setFormState((current) => ({ ...current, titel: e.target.value }))}
                placeholder="Bijv. Leverancierscontrole april"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Toegewezen aan</label>
              <input
                type="text"
                value={formState.toegewezenAan}
                onChange={(e) => setFormState((current) => ({ ...current, toegewezenAan: e.target.value }))}
                placeholder="Bijv. Sanne"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Merk</label>
              <select
                value={formState.merkId ?? ""}
                onChange={(e) => {
                  const merkId = e.target.value || null;
                  setFormState((current) => ({ ...current, merkId }));
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="">Geen merk</option>
                {MERKEN.map((merk) => (
                  <option key={merk.id} value={merk.id}>{merk.naam}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Deadline</label>
              <input
                type="date"
                value={formState.deadline}
                onChange={(e) => setFormState((current) => ({ ...current, deadline: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Prioriteit</label>
              <select
                value={formState.prioriteit}
                onChange={(e) =>
                  setFormState((current) => ({ ...current, prioriteit: e.target.value as TaakPrioriteit }))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="hoog">Hoog</option>
                <option value="normaal">Normaal</option>
                <option value="laag">Laag</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formState.status}
                onChange={(e) => setFormState((current) => ({ ...current, status: e.target.value as TaakStatus }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status === "open" ? "Open" : status === "bezig" ? "Bezig" : "Afgerond"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={saveTaak}
              disabled={!formState.titel.trim() || !formState.toegewezenAan.trim()}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Taak opslaan
            </button>
            <Link href="/dashboard/taken" className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Annuleren
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
