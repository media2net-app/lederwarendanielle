"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getMerkById } from "@/lib/merken";
import type { Taak, TaakStatus, TaakSubtaak } from "@/lib/tasks-shared";

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
  const [taak, setTaak] = useState<Taak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<TaakStatus | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [subtaskNotice, setSubtaskNotice] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<TaakSubtaak[]>([]);
  const [newSubtask, setNewSubtask] = useState<{ titel: string; status: TaakStatus; deadline: string }>({
    titel: "",
    status: "open",
    deadline: new Date().toISOString().slice(0, 10),
  });
  const currentStatus = status ?? taak?.status ?? null;

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const loadTaak = async () => {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/tasks/${id}`, { signal: controller.signal });
      const payload = await res.json();
      if (!res.ok) {
        setTaak(null);
        setError(payload.error ?? "Taak niet gevonden.");
      } else {
        setTaak(payload.data);
        setStatus(payload.data.status);
        setSubtasks(payload.data.subtasks ?? []);
      }
      setLoading(false);
    };
    loadTaak().catch((err) => {
      if (err?.name === "AbortError") return;
      setTaak(null);
      setError("Taak niet gevonden.");
      setLoading(false);
    });
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <main className="flex-1">
        <div className="w-full pl-10 pr-6 py-8">
          <p className="text-gray-500">Taak laden...</p>
        </div>
      </main>
    );
  }

  if (!id || !taak) {
    return (
      <main className="flex-1">
        <div className="w-full pl-10 pr-6 py-8">
          <p className="text-gray-500">{error ?? "Taak niet gevonden."}</p>
          <Link href="/dashboard/taken" className="mt-4 inline-block text-sm text-black hover:underline">
            ← Terug naar taken
          </Link>
        </div>
      </main>
    );
  }

  const merk = taak.merkId ? getMerkById(taak.merkId) : null;
  const afgerondCount = subtasks.filter((subtask) => subtask.status === "afgerond").length;

  const persistSubtasks = (next: TaakSubtaak[]) => {
    if (!id) return;
    setSubtasks(next);
    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtasks: next }),
    }).catch(() => {});
  };

  const addSubtask = () => {
    if (!id || !newSubtask.titel.trim()) return;
    const entry: TaakSubtaak = {
      id: `sub-${Date.now()}`,
      titel: newSubtask.titel.trim(),
      status: newSubtask.status,
      deadline: newSubtask.deadline,
    };
    persistSubtasks([...subtasks, entry]);
    setNewSubtask((current) => ({ ...current, titel: "" }));
    setSubtaskNotice("Subtaak toegevoegd.");
    setTimeout(() => setSubtaskNotice(null), 1600);
  };

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
              onChange={(e) => {
                const next = e.target.value as TaakStatus;
                setStatus(next);
                fetch(`/api/tasks/${id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: next }),
                })
                  .then(async (res) => {
                    const payload = await res.json();
                    if (!res.ok) throw new Error(payload.error ?? "Kon taakstatus niet opslaan.");
                    setTaak(payload.data);
                    setSaveNotice("Taakstatus opgeslagen");
                    setTimeout(() => setSaveNotice(null), 2000);
                  })
                  .catch((err) => {
                    setError(err.message || "Kon taakstatus niet opslaan.");
                  });
              }}
              className="mt-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Wijziging wordt opgeslagen in Supabase.</p>
            {saveNotice && <p className="mt-2 text-xs text-emerald-700">{saveNotice}</p>}
            {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Checklist en subtaken</h2>
                <p className="text-xs text-gray-500">
                  {subtasks.length === 0
                    ? "Nog geen subtaken toegevoegd."
                    : `${afgerondCount}/${subtasks.length} subtaken afgerond.`}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="grid gap-3 md:grid-cols-[1.2fr_0.6fr_0.6fr_auto] md:items-end">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase text-gray-500">Subtaak</label>
                  <input
                    type="text"
                    value={newSubtask.titel}
                    onChange={(e) => setNewSubtask((current) => ({ ...current, titel: e.target.value }))}
                    placeholder="Bijv. Materialen controleren"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase text-gray-500">Status</label>
                  <select
                    value={newSubtask.status}
                    onChange={(e) => setNewSubtask((current) => ({ ...current, status: e.target.value as TaakStatus }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {statusLabel(option)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase text-gray-500">Datum</label>
                  <input
                    type="date"
                    value={newSubtask.deadline}
                    onChange={(e) => setNewSubtask((current) => ({ ...current, deadline: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <button
                  type="button"
                  onClick={addSubtask}
                  disabled={!newSubtask.titel.trim()}
                  className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  + Toevoegen
                </button>
              </div>
              {subtaskNotice && <p className="mt-3 text-xs text-emerald-700">{subtaskNotice}</p>}
            </div>

            <div className="mt-4 space-y-3">
              {subtasks.map((subtask) => {
                const isAfgerond = subtask.status === "afgerond";
                return (
                <div
                  key={subtask.id}
                  className={`rounded-xl border px-4 py-3 transition-colors ${
                    isAfgerond
                      ? "subtask-row-completed"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="grid gap-3 md:grid-cols-[auto_1fr_0.6fr_0.6fr] md:items-center">
                    <label className={`flex items-center gap-2 text-sm ${isAfgerond ? "subtask-text-completed" : "text-gray-700"}`}>
                      <input
                        type="checkbox"
                        checked={subtask.status === "afgerond"}
                        onChange={(e) => {
                          const nextStatus: TaakStatus = e.target.checked ? "afgerond" : "open";
                          const nextSubtasks = subtasks.map((item) =>
                            item.id === subtask.id ? { ...item, status: nextStatus } : item
                          );
                          persistSubtasks(nextSubtasks);
                        }}
                      />
                      <span className="inline-flex items-center gap-2">
                        <span>Klaar</span>
                        {isAfgerond && (
                          <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                            Afgerond
                          </span>
                        )}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={subtask.titel}
                      onChange={(e) => {
                        const nextSubtasks = subtasks.map((item) =>
                          item.id === subtask.id ? { ...item, titel: e.target.value } : item
                        );
                        persistSubtasks(nextSubtasks);
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                        isAfgerond
                          ? "subtask-field-completed line-through"
                          : "border-gray-300 bg-white text-gray-900 focus:border-black focus:ring-black"
                      }`}
                    />
                    <select
                      value={subtask.status}
                      onChange={(e) => {
                        const nextSubtasks = subtasks.map((item) =>
                          item.id === subtask.id ? { ...item, status: e.target.value as TaakStatus } : item
                        );
                        persistSubtasks(nextSubtasks);
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {statusLabel(option)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={subtask.deadline}
                      onChange={(e) => {
                        const nextSubtasks = subtasks.map((item) =>
                          item.id === subtask.id ? { ...item, deadline: e.target.value } : item
                        );
                        persistSubtasks(nextSubtasks);
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
