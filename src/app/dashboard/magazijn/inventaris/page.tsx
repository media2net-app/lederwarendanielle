"use client";

import { useState, useCallback } from "react";
import BarcodeInput from "@/components/BarcodeInput";

interface InventarisRegel {
  productId: string;
  sku: string;
  naam: string;
  verwacht: number;
  geteld: number;
  delta: number;
}

export default function InventarisPage() {
  const [sessie, setSessie] = useState<InventarisRegel[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [afgerond, setAfgerond] = useState(false);

  const startInventaris = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/producten");
      if (!res.ok) throw new Error("Producten niet geladen");
      const producten = await res.json();
      const regels: InventarisRegel[] = producten.map((p: { id: string; sku: string; naam: string; voorraad?: number }) => ({
        productId: p.id,
        sku: p.sku,
        naam: p.naam,
        verwacht: p.voorraad ?? 0,
        geteld: 0,
        delta: 0,
      }));
      setSessie(regels);
      setAfgerond(false);
    } catch {
      setMessage({ type: "error", text: "Kon producten niet laden" });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleScan = useCallback(
    async (value: string) => {
      if (!sessie) return;
      setMessage(null);
      try {
        const res = await fetch(`/api/producten?ean=${encodeURIComponent(value)}`);
        if (!res.ok) {
          setMessage({ type: "error", text: "Product niet gevonden" });
          return;
        }
        const p = await res.json();
        setSessie((prev) => {
          if (!prev) return prev;
          const idx = prev.findIndex((r) => r.productId === p.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = {
              ...next[idx],
              geteld: next[idx].geteld + 1,
              delta: next[idx].geteld + 1 - next[idx].verwacht,
            };
            return next;
          }
          return [
            ...prev,
            {
              productId: p.id,
              sku: p.sku,
              naam: p.naam,
              verwacht: p.voorraad ?? 0,
              geteld: 1,
              delta: 1 - (p.voorraad ?? 0),
            },
          ];
        });
      } catch {
        setMessage({ type: "error", text: "Kon product niet ophalen" });
      }
    },
    [sessie]
  );

  const setGeteld = (productId: string, geteld: number) => {
    setSessie((prev) => {
      if (!prev) return prev;
      return prev.map((r) =>
        r.productId === productId ? { ...r, geteld: Math.max(0, geteld), delta: Math.max(0, geteld) - r.verwacht } : r
      );
    });
  };

  const handleAfronden = useCallback(async () => {
    if (!sessie) return;
    setLoading(true);
    setMessage(null);
    try {
      for (const r of sessie) {
        if (r.geteld !== r.verwacht) {
          await fetch(`/api/producten/${r.productId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ voorraad: r.geteld }),
          });
        }
      }
      setAfgerond(true);
      setMessage({ type: "success", text: "Inventaris afgerond. Voorraad bijgewerkt." });
    } catch {
      setMessage({ type: "error", text: "Kon voorraad niet bijwerken" });
    } finally {
      setLoading(false);
    }
  }, [sessie]);

  const verschillen = sessie?.filter((r) => r.delta !== 0) ?? [];

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900">Inventaris / Inname</h2>

        {!sessie ? (
          <div>
            <button
              type="button"
              onClick={startInventaris}
              disabled={loading}
              className="rounded-lg bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? "Laden..." : "Start inventaris"}
            </button>
            {message && (
              <div className={`mt-4 rounded-lg px-4 py-3 ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                {message.text}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <BarcodeInput onScan={handleScan} placeholder="Scan product om te tellen..." autoFocus />

            {message && (
              <div className={`rounded-lg px-4 py-3 ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                {message.text}
              </div>
            )}

            {verschillen.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-medium text-amber-900">Verschillen ({verschillen.length})</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  {verschillen.map((r) => (
                    <li key={r.productId} className="flex justify-between">
                      <span>{r.naam} (SKU: {r.sku})</span>
                      <span>
                        verwacht {r.verwacht} → geteld{" "}
                        <input
                          type="number"
                          min={0}
                          value={r.geteld}
                          onChange={(e) => setGeteld(r.productId, parseInt(e.target.value, 10) || 0)}
                          className="w-16 rounded border border-amber-300 bg-white px-1 text-right"
                        />
                        {r.delta !== 0 && (
                          <span className={r.delta > 0 ? "text-green-600" : "text-red-600"}>
                            {" "}({r.delta > 0 ? "+" : ""}{r.delta})
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Product</th>
                    <th className="px-4 py-3 text-right">Verwacht</th>
                    <th className="px-4 py-3 text-right">Geteld</th>
                    <th className="px-4 py-3 text-right">Verschil</th>
                  </tr>
                </thead>
                <tbody>
                  {sessie.map((r) => (
                    <tr key={r.productId} className="border-b border-gray-100">
                      <td className="px-4 py-3">{r.naam} <span className="text-gray-500">({r.sku})</span></td>
                      <td className="px-4 py-3 text-right">{r.verwacht}</td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          min={0}
                          value={r.geteld}
                          onChange={(e) => setGeteld(r.productId, parseInt(e.target.value, 10) || 0)}
                          className="w-16 rounded border border-gray-300 px-1 text-right"
                        />
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${r.delta === 0 ? "text-gray-500" : r.delta > 0 ? "text-green-600" : "text-red-600"}`}>
                        {r.delta === 0 ? "–" : r.delta > 0 ? `+${r.delta}` : r.delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!afgerond && (
              <button
                type="button"
                onClick={handleAfronden}
                disabled={loading}
                className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Bezig..." : "Inventaris afronden"}
              </button>
            )}

            <button
              type="button"
              onClick={() => { setSessie(null); setAfgerond(false); }}
              className="block rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Nieuwe sessie starten
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
