"use client";

import { useState, useEffect } from "react";
import ForecastProductDetail from "@/components/ForecastProductDetail";

interface ForecastRegel {
  productId: string;
  sku: string;
  naam: string;
  voorraad: number;
  gemiddeldPerWeek: number;
  forecastPeriodeWeken: number;
  verwachteVerkoop: number;
  teBestellen: number;
  bestelVoor: string;
  leverancierLevertijd: number;
}

const WEEK_OPTIONS = [4, 8, 12, 16, 24] as const;

export default function ForecastPage() {
  const [forecast, setForecast] = useState<ForecastRegel[]>([]);
  const [loading, setLoading] = useState(true);
  const [weken, setWeken] = useState(12);
  const [methode, setMethode] = useState<"schip" | "vliegtuig">("schip");
  const [selectedProduct, setSelectedProduct] = useState<ForecastRegel | null>(null);
  const [detailData, setDetailData] = useState<{ product: { id: string; naam: string; sku: string; voorraad: number }; forecast: ForecastRegel; weekVerkoop: { weekStart: string; weekLabel: string; aantal: number }[] } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [promoFactor, setPromoFactor] = useState(1);
  const [safetyStock, setSafetyStock] = useState(0);

  const handleProductClick = (r: ForecastRegel) => {
    setSelectedProduct(r);
    setLoadingDetail(true);
    setDetailData(null);
    fetch(`/api/forecast/${r.productId}?weken=${weken}&methode=${methode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.product && data?.forecast) {
          setDetailData({
            product: data.product,
            forecast: data.forecast,
            weekVerkoop: Array.isArray(data.weekVerkoop) ? data.weekVerkoop : [],
          });
        }
      })
      .catch(() => setDetailData(null))
      .finally(() => setLoadingDetail(false));
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/forecast?weken=${weken}&methode=${methode}`)
      .then((r) => r.json())
      .then((data) => setForecast(Array.isArray(data) ? data : []))
      .catch(() => setForecast([]))
      .finally(() => setLoading(false));
  }, [weken, methode]);

  const formatDatum = (iso: string) =>
    new Date(iso).toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });

  const adjustedForecast = forecast.map((r) => {
    const adjustedVerkoop = Math.round(r.verwachteVerkoop * promoFactor);
    const adjustedBestel = Math.max(0, adjustedVerkoop + safetyStock - r.voorraad);
    return { ...r, adjustedVerkoop, adjustedBestel };
  });

  const teBestellen = adjustedForecast.filter((r) => r.adjustedBestel > 0);
  const totaalAanvulling = teBestellen.reduce((sum, r) => sum + r.adjustedBestel, 0);
  const kritiekeProducten = adjustedForecast.filter((r) => r.voorraad <= 5 && r.adjustedBestel > 0).length;
  const dekkingScore = adjustedForecast.length > 0
    ? Math.round(((adjustedForecast.length - teBestellen.length) / adjustedForecast.length) * 100)
    : 100;

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">Forecast</h2>
        <p className="mb-6 text-sm text-gray-600">
          Inschatting van benodigde voorraad op basis van verkoop. Bestel tijdig bij leveranciers gezien levertijden (schip 12 weken, vliegtuig 2 weken).
        </p>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Forecastperiode</p>
              <div className="flex flex-wrap gap-2">
                {WEEK_OPTIONS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeken(w)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      weken === w ? "bg-black text-white" : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {w} weken
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Verzending leverancier</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMethode("schip")}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    methode === "schip" ? "bg-black text-white" : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  Schip (12 weken)
                </button>
                <button
                  type="button"
                  onClick={() => setMethode("vliegtuig")}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    methode === "vliegtuig" ? "bg-black text-white" : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  Vliegtuig (2 weken)
                </button>
              </div>
            </div>

            <div className="flex items-end lg:justify-end">
              <button
                type="button"
                onClick={() => {
                  setPromoFactor(1);
                  setSafetyStock(0);
                }}
                className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
              >
                Reset what-if scenario
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2">
          <label className="text-sm text-gray-700">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              What-if promotie-effect ({Math.round((promoFactor - 1) * 100)}%)
            </span>
            <input
              type="range"
              min={0.8}
              max={1.5}
              step={0.05}
              value={promoFactor}
              onChange={(e) => setPromoFactor(parseFloat(e.target.value))}
              className="modern-range w-full"
            />
          </label>
          <label className="text-sm text-gray-700">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              What-if safety stock (+{safetyStock})
            </span>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={safetyStock}
              onChange={(e) => setSafetyStock(parseInt(e.target.value, 10))}
              className="modern-range w-full"
            />
          </label>
        </div>

        {loading ? (
          <p className="text-gray-500">Laden...</p>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Te bestellen</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{teBestellen.length}</p>
                <p className="text-xs text-gray-500">Producten met aanvulling nodig</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Totale aanvulling</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{totaalAanvulling}</p>
                <p className="text-xs text-gray-500">Stuks geadviseerd</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Kritieke voorraad</p>
                <p className="mt-1 text-2xl font-semibold text-amber-700">{kritiekeProducten}</p>
                <p className="text-xs text-gray-500">Voorraad ≤ 5 en vraag verwacht</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Dekkingsscore</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-700">{dekkingScore}%</p>
                <p className="text-xs text-gray-500">Producten zonder aanvullingsadvies</p>
              </div>
            </div>

            {teBestellen.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-semibold text-amber-900">
                  {teBestellen.length} product{teBestellen.length !== 1 ? "en" : ""} te bestellen
                </h3>
                <p className="mt-1 text-sm text-amber-800">
                  Bestel voor de aangegeven datum om op tijd aangevuld te zijn.
                </p>
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-gray-200 bg-gray-50/95 backdrop-blur">
                    <th className="px-4 py-3 font-medium text-gray-900">Product</th>
                    <th className="px-4 py-3 font-medium text-gray-900">SKU</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900">Voorraad</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900">Gem./week</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900">Verwachte verkoop ({weken} weken)</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900">Te bestellen</th>
                    <th className="px-4 py-3 font-medium text-gray-900">Bestel voor</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustedForecast.map((r) => (
                    <tr
                      key={r.productId}
                      onClick={() => handleProductClick(r)}
                      className={`forecast-row cursor-pointer border-b border-gray-100 transition-all duration-200 hover:-translate-y-[1px] hover:bg-gray-50 ${
                        r.adjustedBestel > 0 ? "bg-amber-50/50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{r.naam}</td>
                      <td className="px-4 py-3 text-gray-600">{r.sku}</td>
                      <td className="px-4 py-3 text-right">{r.voorraad}</td>
                      <td className="px-4 py-3 text-right">{r.gemiddeldPerWeek.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right">{r.adjustedVerkoop}</td>
                      <td className="px-4 py-3 text-right">
                        {r.adjustedBestel > 0 ? (
                          <span className="font-semibold text-amber-700">{r.adjustedBestel}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{r.adjustedBestel > 0 ? formatDatum(r.bestelVoor) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {forecast.length === 0 && <p className="text-gray-500">Geen producten of verkoopdata beschikbaar.</p>}
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
          {loadingDetail ? (
            <div className="modal-surface rounded-xl p-8 shadow-xl">
              <p className="text-gray-600">Details laden...</p>
            </div>
          ) : detailData ? (
            <ForecastProductDetail
              product={detailData.product}
              forecast={detailData.forecast}
              weekVerkoop={detailData.weekVerkoop}
              onClose={() => {
                setSelectedProduct(null);
                setDetailData(null);
              }}
            />
          ) : (
            <div className="modal-surface rounded-xl p-8 shadow-xl">
              <p className="text-gray-600">Kon details niet laden.</p>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="mt-4 rounded-lg bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
              >
                Sluiten
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
