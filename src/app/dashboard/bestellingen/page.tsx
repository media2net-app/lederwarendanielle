"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MERKEN, getMerkById } from "@/lib/merken";
import type { Bestelling, BestellingStatus } from "@/lib/orders-shared";

function formatDatum(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatBedrag(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

function statusLabel(status: string) {
  switch (status) {
    case "te_plukken":
      return "Klaarzetten";
    case "gepicked":
      return "Verzameld";
    default:
      return status;
  }
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Alle statussen" },
  { value: "open", label: "Open" },
  { value: "te_plukken", label: "Klaarzetten" },
  { value: "verwerkt", label: "Verwerkt" },
  { value: "verzonden", label: "Verzonden" },
  { value: "afgeleverd", label: "Afgeleverd" },
];

export default function BestellingenPage() {
  const router = useRouter();
  const [merkFilter, setMerkFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [version, setVersion] = useState(0);
  const [bestellingen, setBestellingen] = useState<Bestelling[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredBestellingen = useMemo(() => {
    if (!statusFilter) return bestellingen;
    return bestellingen.filter((b) => b.status === statusFilter);
  }, [bestellingen, statusFilter]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (merkFilter) params.set("merkId", merkFilter);
      const res = await fetch(`/api/orders?${params.toString()}`, { signal: controller.signal });
      const payload = await res.json();
      if (!isMounted) return;
      if (!res.ok) {
        setError(payload.error ?? "Kon bestellingen niet ophalen.");
        setBestellingen([]);
      } else {
        setBestellingen(payload.data ?? []);
      }
      setLoading(false);
    };

    loadOrders().catch((err) => {
      if (!isMounted || err?.name === "AbortError") return;
      setError("Kon bestellingen niet ophalen.");
      setBestellingen([]);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [merkFilter, version]);

  return (
    <main className="flex-1">
      <div className="dashboard-page-shell w-full pl-10 pr-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Bestellingen</h2>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setVersion((v) => v + 1)}
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
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value || "all"} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="ui-table-shell overflow-x-auto rounded-lg border shadow-sm">
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
              {filteredBestellingen.map((b) => {
                const merk = getMerkById(b.merkId);
                const rowStatusClass =
                  b.status === "verzonden"
                    ? "order-row--verzonden"
                    : b.status === "open"
                      ? "order-row--open"
                      : b.status === "te_plukken"
                        ? "order-row--te-plukken"
                        : b.status === "gepicked"
                          ? "order-row--gepicked"
                          : b.status === "verpakt"
                            ? "order-row--verpakt"
                            : b.status === "verwerkt"
                              ? "order-row--verwerkt"
                              : "order-row--afgeleverd";
                return (
                  <tr
                    key={b.id}
                    onClick={() => router.push(`/dashboard/bestellingen/${b.id}`)}
                    className={`order-row cursor-pointer transition-colors ${rowStatusClass}`}
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
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">{statusLabel(b.status)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {error && <p className="mt-4 text-center text-sm text-rose-600">{error}</p>}
        {loading && <p className="mt-4 text-center text-sm text-gray-500">Bestellingen laden...</p>}
        {!loading && filteredBestellingen.length === 0 && (
          <p className="mt-4 text-center text-sm text-gray-500">Geen bestellingen gevonden.</p>
        )}
      </div>
    </main>
  );
}
