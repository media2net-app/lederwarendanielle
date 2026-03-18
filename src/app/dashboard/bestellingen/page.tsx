"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MERKEN, getMerkById } from "@/lib/merken";
import { getBestellingen, type BestellingStatus } from "@/lib/mock-bestellingen";

function formatDatum(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatBedrag(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Alle statussen" },
  { value: "open", label: "Open" },
  { value: "verwerkt", label: "Verwerkt" },
  { value: "verzonden", label: "Verzonden" },
  { value: "afgeleverd", label: "Afgeleverd" },
];

export default function BestellingenPage() {
  const router = useRouter();
  const [merkFilter, setMerkFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const bestellingen = useMemo(
    () => getBestellingen(merkFilter || undefined, (statusFilter as BestellingStatus) || undefined),
    [merkFilter, statusFilter]
  );

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Bestellingen</h2>
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
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value || "all"} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Datum</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Ordernummer</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Merk</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Klant</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Totaal</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {bestellingen.map((b) => {
                const merk = getMerkById(b.merkId);
                return (
                  <tr
                    key={b.id}
                    onClick={() => router.push(`/dashboard/bestellingen/${b.id}`)}
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/dashboard/bestellingen/${b.id}`);
                      }
                    }}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{formatDatum(b.datum)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{b.ordernummer}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{merk?.naam ?? b.merkId}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="block">{b.klantNaam}</span>
                      <span className="text-gray-400">{b.klantEmail}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">{formatBedrag(b.totaal)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          b.status === "open"
                            ? "bg-amber-100 text-amber-800"
                            : b.status === "verzonden" || b.status === "verwerkt"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {bestellingen.length === 0 && (
          <p className="mt-4 text-center text-sm text-gray-500">Geen bestellingen gevonden.</p>
        )}
      </div>
    </main>
  );
}
