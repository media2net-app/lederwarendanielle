"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getMerkById } from "@/lib/merken";
import type { Bestelling, BestellingStatus } from "@/lib/orders-shared";

function formatDatum(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBedrag(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

function statusLabel(status: BestellingStatus) {
  switch (status) {
    case "te_plukken":
      return "Klaarzetten";
    case "gepicked":
      return "Verzameld";
    default:
      return status;
  }
}

const STATUS_OPTIONS: BestellingStatus[] = ["open", "te_plukken", "gepicked", "verpakt", "verwerkt", "verzonden", "afgeleverd"];

export default function BestellingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [bestelling, setBestelling] = useState<Bestelling | null>(null);
  const [status, setStatus] = useState<BestellingStatus | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const loadOrder = async () => {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/orders/${id}`, { signal: controller.signal });
      const payload = await res.json();
      if (!res.ok) {
        setBestelling(null);
        setError(payload.error ?? "Bestelling niet gevonden.");
      } else {
        setBestelling(payload.data);
        setStatus(payload.data.status);
      }
      setLoading(false);
    };
    loadOrder().catch((err) => {
      if (err?.name === "AbortError") return;
      setBestelling(null);
      setError("Bestelling niet gevonden.");
      setLoading(false);
    });
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <main className="flex-1">
        <div className="w-full pl-10 pr-6 py-8">
          <p className="text-gray-500">Bestelling laden...</p>
        </div>
      </main>
    );
  }

  if (!bestelling) {
    return (
      <main className="flex-1">
        <div className="w-full pl-10 pr-6 py-8">
          <p className="text-gray-500">{error ?? "Bestelling niet gevonden."}</p>
          <Link href="/dashboard/bestellingen" className="mt-4 inline-block text-sm text-black hover:underline">
            ← Terug
          </Link>
        </div>
      </main>
    );
  }

  const merk = getMerkById(bestelling.merkId);
  const currentStatus = status ?? bestelling.status;
  const totaalItems = bestelling.regels.reduce((sum, regel) => sum + regel.aantal, 0);
  const subtotaal = bestelling.regels.reduce((sum, regel) => sum + regel.aantal * regel.eenheidsprijs, 0);
  const btwBedrag = Math.max(0, bestelling.totaal - subtotaal);



  const handleStatusChange = (nextStatus: BestellingStatus) => {
    setStatus(nextStatus);
    fetch(`/api/orders/${bestelling.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    })
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error ?? "Kon status niet opslaan.");
        setBestelling(payload.data);
        setSaveNotice("Status opgeslagen");
        setTimeout(() => setSaveNotice(null), 2000);
      })
      .catch((err) => {
        setError(err.message || "Kon status niet opslaan.");
      });
  };

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <Link href="/dashboard/bestellingen" className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900">
          ← Terug naar bestellingen
        </Link>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {saveNotice && <p className="mb-3 rounded bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{saveNotice}</p>}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Bestelling {bestelling.ordernummer}</h1>
              <p className="mt-1 text-sm text-gray-500">{merk?.naam ?? bestelling.merkId}</p>
              <p className="mt-1 text-xs text-gray-400">{formatDatum(bestelling.datum)}</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Status:</span>
                <select
                  value={currentStatus}
                  onChange={(e) => handleStatusChange(e.target.value as BestellingStatus)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{statusLabel(s)}</option>
                  ))}
                </select>
              </label>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  currentStatus === "open"
                    ? "bg-amber-100 text-amber-800"
                    : currentStatus === "afgeleverd"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-blue-100 text-blue-800"
                }`}
              >
                {statusLabel(currentStatus)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/dashboard/magazijn/pick-pack?orderId=${bestelling.id}`} className="rounded-lg bg-black px-3 py-2 text-xs font-medium text-white hover:bg-gray-800">
              Naar Pick & Pack
            </Link>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-medium uppercase text-gray-500">Klantgegevens</h2>
              <p className="mt-2 font-medium text-gray-900">{bestelling.klantNaam}</p>
              <p className="text-sm text-gray-600">{bestelling.klantEmail}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium uppercase text-gray-500">Totaal</h2>
              <p className="mt-2 text-xl font-semibold text-gray-900">{formatBedrag(bestelling.totaal)}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase text-gray-500">Productregels</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{bestelling.regels.length}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase text-gray-500">Totaal items</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{totaalItems}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase text-gray-500">Subtotaal</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{formatBedrag(subtotaal)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase text-gray-500">BTW / afronding</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{formatBedrag(btwBedrag)}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">Producten in bestelling</h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-700">Product</th>
                    <th className="px-4 py-3 font-medium text-gray-700">SKU</th>
                    <th className="px-4 py-3 font-medium text-gray-700">EAN</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Aantal</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Eenheidsprijs</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Regeltotaal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {bestelling.regels.map((regel) => (
                    <tr key={`${regel.productId}-${regel.sku}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{regel.naam}</td>
                      <td className="px-4 py-3 text-gray-600">{regel.sku}</td>
                      <td className="px-4 py-3 text-gray-600">{regel.ean}</td>
                      <td className="px-4 py-3 text-right text-gray-900">{regel.aantal}</td>
                      <td className="px-4 py-3 text-right text-gray-900">{formatBedrag(regel.eenheidsprijs)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {formatBedrag(regel.aantal * regel.eenheidsprijs)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700" colSpan={5}>
                      Ordertotaal
                    </td>
                    <td className="px-4 py-3 text-right text-base font-semibold text-gray-900">
                      {formatBedrag(bestelling.totaal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">Interne tijdlijn</h2>
            <p className="mt-3 text-sm text-gray-500">
              Tijdlijn op basis van events wordt in de volgende migratiestap gekoppeld aan de `events` tabel.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
