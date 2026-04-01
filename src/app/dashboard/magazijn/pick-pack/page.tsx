"use client";

import { useState, useMemo, useEffect } from "react";
import { getBestellingen, getBestellingById, type BestellingRegel } from "@/lib/mock-bestellingen";
import { addOrderEvent, getOrderStatusMap, setOrderStatus } from "@/lib/demo-state";
import BarcodeInput from "@/components/BarcodeInput";
import Verzendlabel from "@/components/Verzendlabel";

const PICK_STATUSES = ["te_plukken", "gepicked", "open"] as const;

export default function PickPackPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scannedCounts, setScannedCounts] = useState<Record<string, number>>({});
  const [showLabel, setShowLabel] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const orders = useMemo(() => {
    const statusMap = getOrderStatusMap();
    return getBestellingen()
      .map((b) => ({ ...b, status: statusMap[b.id] ?? b.status }))
      .filter((b) => PICK_STATUSES.includes(b.status as typeof PICK_STATUSES[number]));
  }, [saveNotice]);
  const selected = useMemo(() => {
    if (!selectedId) return null;
    const base = getBestellingById(selectedId);
    if (!base) return null;
    const statusMap = getOrderStatusMap();
    return { ...base, status: statusMap[base.id] ?? base.status };
  }, [selectedId, saveNotice]);



  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("orderId");
    if (fromQuery) setSelectedId(fromQuery);
  }, []);

  const handleScan = (value: string) => {
    if (!selected) return;
    const regel = selected.regels.find((r) => r.ean === value || r.sku === value);
    if (regel) {
      setScannedCounts((prev) => {
        const key = `${regel.productId}-${regel.sku}`;
        const cur = prev[key] ?? 0;
        const next = Math.min(cur + 1, regel.aantal);
        return { ...prev, [key]: next };
      });
    }
  };

  const getScanned = (r: BestellingRegel) => scannedCounts[`${r.productId}-${r.sku}`] ?? 0;

  const allPicked = selected?.regels.every((r) => getScanned(r) >= r.aantal) ?? false;

  const handleVerzendlabel = () => {
    if (selected) setShowLabel(true);
  };

  const handleVerpakt = () => {
    if (selected && allPicked) {
      setOrderStatus(selected.id, "verpakt");
      addOrderEvent(selected.id, "Order verpakt in Pick & Pack");
      setSaveNotice("Orderstatus opgeslagen: verpakt");
      setTimeout(() => setSaveNotice(null), 2200);
      setShowLabel(false);
      setSelectedId(null);
      setScannedCounts({});
    }
  };

  const handleDemoLabel = () => {
    if (selected) {
      setScannedCounts(
        selected.regels.reduce(
          (acc, r) => ({ ...acc, [`${r.productId}-${r.sku}`]: r.aantal }),
          {} as Record<string, number>
        )
      );
      setShowLabel(true);
    }
  };

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900">Pick & Pack</h2>
        {saveNotice && <p className="mb-4 rounded bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{saveNotice}</p>}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-medium text-gray-900">Open orders</h3>
            <ul className="space-y-2">
              {orders.slice(0, 15).map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => { setSelectedId(b.id); setScannedCounts({}); }}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                      selectedId === b.id ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-medium">{b.ordernummer}</span>
                    <span className="ml-2 text-gray-500">– {b.klantNaam}</span>
                    <span className="ml-2 text-sm text-gray-400">({b.regels.length} regels)</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            {selected ? (
              <>
                <h3 className="mb-4 font-medium text-gray-900">Picklijst – {selected.ordernummer}</h3>
                <BarcodeInput onScan={handleScan} placeholder="Scan product (EAN/SKU)..." autoFocus />

                <div className="mt-6 space-y-2">
                  {selected.regels.map((r) => {
                    const scanned = getScanned(r);
                    const done = scanned >= r.aantal;
                    return (
                      <div
                        key={`${r.productId}-${r.sku}`}
                        className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                          done ? "border-green-200 bg-green-50" : "border-gray-200"
                        }`}
                      >
                        <div>
                          <span className="font-medium">{r.naam}</span>
                          <span className="ml-2 text-gray-500">SKU: {r.sku}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={done ? "font-medium text-green-700" : "text-gray-600"}>
                            {scanned} / {r.aantal}
                          </span>
                          {done && <span className="text-green-600">✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleDemoLabel}
                    className="w-full rounded-lg border-2 border-dashed border-amber-500 bg-amber-50 px-4 py-3 font-medium text-amber-800 hover:bg-amber-100"
                  >
                    Producten gescand (demo)
                  </button>
                  {allPicked && (
                    <>
                      <button
                        type="button"
                        onClick={handleVerzendlabel}
                        className="w-full rounded-lg bg-amber-600 px-4 py-3 font-medium text-white hover:bg-amber-700"
                      >
                        Verzendlabel printen
                      </button>
                      <button
                        type="button"
                        onClick={handleVerpakt}
                        className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
                      >
                        Verpakt – order afronden
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => { setSelectedId(null); setScannedCounts({}); }}
                  className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Selectie annuleren
                </button>
              </>
            ) : (
              <p className="text-gray-500">Selecteer een order om te beginnen met plukken.</p>
            )}
          </div>
        </div>
      </div>

      {showLabel && selected && (
        <div className="verzendlabel-print-container fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] overflow-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold print:hidden">Verzendlabel – {selected.ordernummer}</h3>
            <Verzendlabel
              bestelling={selected}
              onClose={() => setShowLabel(false)}
              showActions={true}
            />
          </div>
        </div>
      )}
    </main>
  );
}
