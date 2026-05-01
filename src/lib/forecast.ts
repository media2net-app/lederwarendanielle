import type { Bestelling } from "./orders-shared";

interface Product {
  id: string;
  sku: string;
  naam: string;
  voorraad?: number;
}

export type Verzendmethode = "schip" | "vliegtuig";

const LEVERTIJD_WEKEN: Record<Verzendmethode, number> = {
  schip: 12,
  vliegtuig: 2,
};

export interface VerkoopAggregatie {
  productId: string;
  totaalVerkocht: number;
  aantalOrders: number;
  eersteOrder: string;
  laatsteOrder: string;
}

export interface ForecastRegel {
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


export interface WeekVerkoop {
  weekStart: string;
  weekLabel: string;
  aantal: number;
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

export function getWeeklySalesPerProduct(
  bestellingen: Bestelling[],
  productId: string
): WeekVerkoop[] {
  const verkochteStatussen = ["verzonden", "afgeleverd", "verpakt"] as const;
  const byWeek = new Map<string, number>();

  for (const b of bestellingen) {
    if (!verkochteStatussen.includes(b.status as (typeof verkochteStatussen)[number])) continue;
    for (const r of b.regels) {
      if (r.productId !== productId) continue;
      const key = getWeekKey(new Date(b.datum));
      byWeek.set(key, (byWeek.get(key) ?? 0) + r.aantal);
    }
  }

  return Array.from(byWeek.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, aantal]) => ({
      weekStart,
      weekLabel: new Date(weekStart + "T12:00:00").toLocaleDateString("nl-NL", { day: "2-digit", month: "short" }),
      aantal,
    }));
}

function weekDiff(d1: Date, d2: Date): number {
  const ms = Math.abs(d2.getTime() - d1.getTime());
  return Math.max(1, Math.floor(ms / (7 * 24 * 60 * 60 * 1000)));
}

export function aggregeerVerkoop(bestellingen: Bestelling[]): Map<string, VerkoopAggregatie> {
  const map = new Map<string, VerkoopAggregatie>();
  const verkochteStatussen = ["verzonden", "afgeleverd", "verpakt"] as const;

  for (const b of bestellingen) {
    if (!verkochteStatussen.includes(b.status as (typeof verkochteStatussen)[number])) continue;
    for (const r of b.regels) {
      const bestaand = map.get(r.productId);
      if (bestaand) {
        bestaand.totaalVerkocht += r.aantal;
        bestaand.aantalOrders += 1;
        if (b.datum < bestaand.eersteOrder) bestaand.eersteOrder = b.datum;
        if (b.datum > bestaand.laatsteOrder) bestaand.laatsteOrder = b.datum;
      } else {
        map.set(r.productId, {
          productId: r.productId,
          totaalVerkocht: r.aantal,
          aantalOrders: 1,
          eersteOrder: b.datum,
          laatsteOrder: b.datum,
        });
      }
    }
  }
  return map;
}

export function berekenForecast(
  bestellingen: Bestelling[],
  producten: Product[],
  forecastPeriodeWeken: number,
  verzendmethode: Verzendmethode
): ForecastRegel[] {
  const verkoop = aggregeerVerkoop(bestellingen);
  const levertijdWeken = LEVERTIJD_WEKEN[verzendmethode];
  const result: ForecastRegel[] = [];
  const today = new Date();

  for (const p of producten) {
    const agg = verkoop.get(p.id);
    const voorraad = p.voorraad ?? 0;
    const weeksData = agg
      ? weekDiff(new Date(agg.eersteOrder), new Date(agg.laatsteOrder))
      : 1;
    const gemiddeldPerWeek = agg ? agg.totaalVerkocht / weeksData : 0;
    const verwachteVerkoop = Math.ceil(gemiddeldPerWeek * forecastPeriodeWeken);
    const tekort = Math.max(0, verwachteVerkoop - voorraad);
    const teBestellen = Math.ceil(tekort);

    let bestelVoor: Date;
    if (teBestellen <= 0) {
      bestelVoor = new Date(today);
      bestelVoor.setDate(bestelVoor.getDate() + 30);
    } else if (gemiddeldPerWeek <= 0) {
      bestelVoor = new Date(today);
    } else {
      const wekenTotStockout = voorraad / gemiddeldPerWeek;
      const wekenTotBesteldatum = Math.max(0, wekenTotStockout - levertijdWeken);
      bestelVoor = new Date(today);
      bestelVoor.setDate(bestelVoor.getDate() + Math.floor(wekenTotBesteldatum * 7));
    }

    result.push({
      productId: p.id,
      sku: p.sku,
      naam: p.naam,
      voorraad,
      gemiddeldPerWeek: Math.round(gemiddeldPerWeek * 10) / 10,
      forecastPeriodeWeken,
      verwachteVerkoop,
      teBestellen,
      bestelVoor: bestelVoor.toISOString().slice(0, 10),
      leverancierLevertijd: levertijdWeken,
    });
  }

  return result.sort((a, b) => b.teBestellen - a.teBestellen);
}
