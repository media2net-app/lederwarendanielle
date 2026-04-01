"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface WeekVerkoop {
  weekStart: string;
  weekLabel: string;
  aantal: number;
}

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

interface ForecastProductDetailProps {
  product: { id: string; naam: string; sku: string; voorraad: number };
  forecast: ForecastRegel;
  weekVerkoop: WeekVerkoop[];
  onClose: () => void;
}

function generateDemoWeeks(gemiddeld: number, count: number): WeekVerkoop[] {
  if (count <= 0) return [];
  const now = new Date();
  const result: WeekVerkoop[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    const base = Math.floor(gemiddeld);
    const variant = Math.floor(gemiddeld * 0.3 * (Math.sin(i) + 1));
    result.push({
      weekStart: d.toISOString().slice(0, 10),
      weekLabel: d.toLocaleDateString("nl-NL", { day: "2-digit", month: "short" }),
      aantal: Math.max(0, base + variant),
    });
  }
  return result;
}

export default function ForecastProductDetail({
  product,
  forecast,
  weekVerkoop,
  onClose,
}: ForecastProductDetailProps) {
  const chartData =
    weekVerkoop.length > 0
      ? weekVerkoop
      : generateDemoWeeks(forecast.gemiddeldPerWeek, 12);

  const forecastData = chartData.map((w, i) => ({
    ...w,
    prognose: i >= chartData.length - 1 ? forecast.gemiddeldPerWeek : undefined,
  }));

  const formatDatum = (iso: string) =>
    new Date(iso).toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl bg-white shadow-xl">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{product.naam}</h3>
              <p className="text-sm text-gray-500">SKU: {product.sku}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="text-xs font-medium uppercase text-gray-500">Huidige voorraad</div>
              <div className="text-2xl font-bold text-gray-900">{product.voorraad}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="text-xs font-medium uppercase text-gray-500">Gemiddeld per week</div>
              <div className="text-2xl font-bold text-gray-900">{forecast.gemiddeldPerWeek.toFixed(1)}</div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="text-xs font-medium uppercase text-amber-700">Verwachte verkoop ({forecast.forecastPeriodeWeken} weken)</div>
              <div className="text-2xl font-bold text-amber-900">{forecast.verwachteVerkoop}</div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="text-xs font-medium uppercase text-amber-700">Te bestellen</div>
              <div className="text-2xl font-bold text-amber-900">{forecast.teBestellen}</div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-medium text-gray-900">Verkoop per week</h4>
            <p className="mb-4 text-sm text-gray-600">
              De grafiek toont de historische verkoop per week. De forecast is gebaseerd op het gemiddelde ({forecast.gemiddeldPerWeek.toFixed(1)} stuks/week).
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [String(value ?? 0), "Verkocht"]}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.weekStart
                        ? formatDatum(payload[0].payload.weekStart + "T12:00:00")
                        : ""
                    }
                  />
                  <ReferenceLine
                    y={forecast.gemiddeldPerWeek}
                    stroke="#d97706"
                    strokeDasharray="4 4"
                    label={{ value: "Gemiddelde", position: "right", fontSize: 10 }}
                  />
                  <Bar dataKey="aantal" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Verkocht" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <h4 className="mb-2 font-medium text-gray-900">Uitleg forecast</h4>
            <ul className="list-inside list-disc space-y-1">
              <li>Verwachte verkoop = gemiddelde per week × {forecast.forecastPeriodeWeken} weken</li>
              <li>Te bestellen = verwachte verkoop − huidige voorraad (indien positief)</li>
              <li>Levertijd leverancier: {forecast.leverancierLevertijd} weken</li>
              <li>Bestel vóór {formatDatum(forecast.bestelVoor)} om op tijd aangevuld te zijn</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
