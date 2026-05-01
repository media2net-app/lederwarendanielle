"use client";

import { useState, useMemo, useEffect } from "react";
import type { Bestelling, BestellingRegel } from "@/lib/orders-shared";
import BarcodeInput from "@/components/BarcodeInput";
import Verzendlabel from "@/components/Verzendlabel";

const PICK_STATUSES = ["te_plukken", "gepicked", "open"] as const;
const AISLES = ["A", "B", "C", "D"] as const;

interface WarehouseLocation {
  code: string;
  aisle: string;
  rack: number;
  x: number;
  y: number;
}

interface PickStop {
  regel: BestellingRegel;
  location: WarehouseLocation;
}

function hashString(value: string): number {
  return value.split("").reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 0);
}

function getLocationForSku(sku: string): WarehouseLocation {
  const hash = hashString(sku);
  const aisleIndex = hash % AISLES.length;
  const rack = (Math.floor(hash / AISLES.length) % 6) + 1;
  const aisle = AISLES[aisleIndex];

  return {
    code: `${aisle}-${String(rack).padStart(2, "0")}`,
    aisle,
    rack,
    x: aisleIndex,
    y: rack - 1,
  };
}

function sortByRoute(stops: PickStop[]): PickStop[] {
  return [...stops].sort((a, b) => {
    if (a.location.x !== b.location.x) return a.location.x - b.location.x;
    return a.location.y - b.location.y;
  });
}

export default function PickPackPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scannedCounts, setScannedCounts] = useState<Record<string, number>>({});
  const [showLabel, setShowLabel] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [ordersData, setOrdersData] = useState<Bestelling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/orders", { signal: controller.signal });
      const payload = await res.json();
      if (!res.ok) {
        setOrdersData([]);
        setError(payload.error ?? "Kon orders niet laden.");
      } else {
        setOrdersData(payload.data ?? []);
      }
      setLoading(false);
    };
    loadOrders().catch((err) => {
      if (err?.name === "AbortError") return;
      setOrdersData([]);
      setError("Kon orders niet laden.");
      setLoading(false);
    });
    return () => controller.abort();
  }, [saveNotice]);

  const orders = useMemo(
    () => ordersData.filter((b) => PICK_STATUSES.includes(b.status as (typeof PICK_STATUSES)[number])),
    [ordersData]
  );

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return ordersData.find((item) => item.id === selectedId) ?? null;
  }, [ordersData, selectedId]);

  const routeStops = useMemo(() => {
    if (!selected) return [];
    const stops = selected.regels.map((regel) => ({
      regel,
      location: getLocationForSku(regel.sku),
    }));
    return sortByRoute(stops);
  }, [selected]);

  const routeCodes = useMemo(
    () => new Set(routeStops.map((stop) => stop.location.code)),
    [routeStops]
  );

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
      fetch(`/api/orders/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "verpakt" }),
      })
        .then(async (res) => {
          const payload = await res.json();
          if (!res.ok) throw new Error(payload.error ?? "Kon status niet opslaan.");
          setSaveNotice("Orderstatus opgeslagen: verpakt");
          setTimeout(() => setSaveNotice(null), 2200);
          setShowLabel(false);
          setSelectedId(null);
          setScannedCounts({});
        })
        .catch((err) => {
          setError(err.message || "Kon status niet opslaan.");
        });
    }
  };

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900">Pick &amp; Pack</h2>
        {saveNotice && <p className="mb-4 rounded bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{saveNotice}</p>}
        {error && <p className="mb-4 rounded bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-medium text-gray-900">Open orders</h3>
            {loading && <p className="mb-3 text-sm text-gray-500">Orders laden...</p>}
            <ul className="space-y-2">
              {orders.slice(0, 15).map((b) => {
                const isSelected = selectedId === b.id;
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(b.id);
                        setScannedCounts({});
                      }}
                      className={`pick-order-button w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                        isSelected ? "pick-order-button--selected" : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span className={`font-medium ${isSelected ? "pick-order-button__title-selected" : "text-gray-900"}`}>
                        {b.ordernummer}
                      </span>
                      <span className={`ml-2 ${isSelected ? "pick-order-button__meta-selected" : "text-gray-500"}`}>
                        - {b.klantNaam}
                      </span>
                      <span className={`ml-2 text-sm ${isSelected ? "pick-order-button__meta-selected" : "text-gray-400"}`}>
                        ({b.regels.length} regels)
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            {selected ? (
              <>
                <h3 className="mb-4 font-medium text-gray-900">Picklijst - {selected.ordernummer}</h3>
                <BarcodeInput onScan={handleScan} placeholder="Scan product (EAN/SKU)..." autoFocus />

                <div className="mt-6 space-y-2">
                  {selected.regels.map((r) => {
                    const scanned = getScanned(r);
                    const done = scanned >= r.aantal;
                    const location = getLocationForSku(r.sku);
                    return (
                      <div
                        key={`${r.productId}-${r.sku}`}
                        className={`pick-line-item flex items-center justify-between rounded-lg border px-4 py-3 ${
                          done ? "pick-line-item--done" : "border-gray-200"
                        }`}
                      >
                        <div>
                          <span className={`font-medium ${done ? "pick-line-item__title-done" : "text-gray-100"}`}>{r.naam}</span>
                          <span className={`ml-2 ${done ? "pick-line-item__meta-done" : "text-gray-500"}`}>SKU: {r.sku}</span>
                          <span
                            className={`ml-2 rounded px-2 py-0.5 text-xs font-medium ${
                              done
                                ? "pick-line-item__location-done"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            Locatie {location.code}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={done ? "pick-line-item__count-done font-medium" : "text-gray-600"}>
                            {scanned} / {r.aantal}
                          </span>
                          {done && <span className="pick-line-item__count-done">✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col gap-2">
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
                        Verpakt - order afronden
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(null);
                    setScannedCounts({});
                  }}
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

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-medium text-gray-900">Magazijnkaart</h3>
            <p className="mt-2 text-sm text-gray-500">
              Gangpaden hebben letters (A-D). Stellingen hebben locatiecodes zoals A-01. Geselecteerde picklocaties lichten op.
            </p>

            <div className="mt-5 grid grid-cols-4 gap-2">
              {AISLES.map((aisle, aisleIdx) => (
                <div key={aisle} className="space-y-2">
                  <div className="rounded bg-slate-100 px-2 py-1 text-center text-xs font-semibold text-slate-700">
                    Gangpad {aisle}
                  </div>
                  {Array.from({ length: 6 }).map((_, rackIdx) => {
                    const code = `${aisle}-${String(rackIdx + 1).padStart(2, "0")}`;
                    const active = routeCodes.has(code);
                    return (
                      <div
                        key={code}
                        className={`rounded border px-2 py-2 text-center text-xs ${
                          active
                            ? "border-amber-400 bg-amber-100 font-semibold text-amber-900"
                            : "border-slate-200 bg-white text-slate-500"
                        }`}
                        title={active ? `Route stop: ${code}` : `Locatie ${code}`}
                      >
                        {code}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-medium text-gray-900">Looproute op pakbon</h3>
            {selected ? (
              <>
                <p className="mt-2 text-sm text-gray-500">
                  Deze volgorde minimaliseert lopen door locaties te sorteren per gangpad en stelling.
                </p>
                <ol className="mt-5 space-y-2">
                  {routeStops.map((stop, idx) => (
                    <li
                      key={`${stop.regel.productId}-${stop.location.code}-${idx}`}
                      className="route-stop-item flex items-center justify-between rounded border px-3 py-2 text-sm"
                    >
                      <span>
                        <span className="route-stop-item__index mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold">
                          {idx + 1}
                        </span>
                        <span className="route-stop-item__name">{stop.regel.naam}</span>
                      </span>
                      <span className="route-stop-item__location rounded px-2 py-0.5 text-xs font-semibold">
                        {stop.location.code}
                      </span>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Kies eerst een order om de route voor de pakbon te tonen.</p>
            )}
          </section>
        </div>
      </div>

      {showLabel && selected && (
        <div className="verzendlabel-print-container modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="modal-surface max-h-[90vh] overflow-auto rounded-xl p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold print:hidden">Verzendlabel - {selected.ordernummer}</h3>
            <Verzendlabel bestelling={selected} onClose={() => setShowLabel(false)} showActions={true} />
          </div>
        </div>
      )}
    </main>
  );
}
