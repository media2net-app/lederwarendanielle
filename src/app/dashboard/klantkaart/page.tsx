"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import type { B2BKlant } from "@/lib/b2b-shared";
import KlantkaartMap from "./components/KlantkaartMap";

const LEDERWAREN_START: { naam: string; plaats: string; adres?: string; lat: number; lng: number } = {
  naam: "Lederwaren Daniëlle",
  plaats: "Hoogeveen",
  adres: "Handelsweg 6, 7921 JR Zuidwolde",
  lat: 52.7325,
  lng: 6.4764,
};

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function minutesToTime(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = Math.floor(min % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export default function KlantkaartPage() {
  const [klanten, setKlanten] = useState<B2BKlant[]>([]);
  useEffect(() => {
    fetch("/api/b2b-klanten")
      .then(async (res) => {
        const payload = (await res.json()) as { data?: B2BKlant[] };
        setKlanten(payload.data ?? []);
      })
      .catch(() => setKlanten([]));
  }, []);
  const klantenMetCoords = useMemo(() => klanten.filter((k) => k.lat != null && k.lng != null), [klanten]);
  const [routeSelection, setRouteSelection] = useState<Set<string>>(new Set());
  const [vertrektijd, setVertrektijd] = useState("08:00");
  const [standaardBezoekUur, setStandaardBezoekUur] = useState(1);
  const [bezoekUurPerKlant, setBezoekUurPerKlant] = useState<Record<string, number>>({});
  const [lunchStart, setLunchStart] = useState("");
  const [lunchEnd, setLunchEnd] = useState("");
  const [routeLegs, setRouteLegs] = useState<{ distanceM: number; durationS: number }[] | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const toggleRoute = (id: string) => {
    setRouteSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const routeKlanten = useMemo(
    () => Array.from(routeSelection).map((id) => klanten.find((k) => k.id === id)).filter(Boolean) as B2BKlant[],
    [routeSelection, klanten]
  );

  const getBezoekUur = (klantId: string) => bezoekUurPerKlant[klantId] ?? standaardBezoekUur;
  const setBezoekUur = (klantId: string, uur: number) => {
    setBezoekUurPerKlant((prev) => ({ ...prev, [klantId]: uur }));
  };

  const waypointsCoords = useMemo(() => {
    if (routeKlanten.length === 0) return "";
    const points = [
      [LEDERWAREN_START.lng, LEDERWAREN_START.lat],
      ...routeKlanten.map((k) => [k.lng!, k.lat!]),
      [LEDERWAREN_START.lng, LEDERWAREN_START.lat],
    ];
    return points.map(([lng, lat]) => `${lng},${lat}`).join(";");
  }, [routeKlanten]);

  useEffect(() => {
    if (waypointsCoords.length === 0) {
      setRouteLegs(null);
      setRouteError(null);
      return;
    }
    setRouteLoading(true);
    setRouteError(null);
    fetch(`/api/route-osrm?coords=${encodeURIComponent(waypointsCoords)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setRouteError(data.error);
          setRouteLegs(null);
        } else {
          setRouteLegs(data.legs ?? null);
        }
      })
      .catch(() => {
        setRouteError("Kon route niet ophalen.");
        setRouteLegs(null);
      })
      .finally(() => setRouteLoading(false));
  }, [waypointsCoords]);

  const routeStops = useMemo(() => {
    const stops: { volgorde: number; type: "start" | "klant" | "eind"; naam: string; plaats: string; adres?: string; klant?: B2BKlant }[] = [];
    stops.push({ volgorde: 1, type: "start", naam: LEDERWAREN_START.naam, plaats: LEDERWAREN_START.plaats, adres: LEDERWAREN_START.adres });
    routeKlanten.forEach((k, i) => {
      stops.push({ volgorde: i + 2, type: "klant", naam: k.bedrijfsnaam, plaats: k.plaats, adres: k.adres, klant: k });
    });
    if (routeKlanten.length > 0) {
      stops.push({ volgorde: routeKlanten.length + 2, type: "eind", naam: LEDERWAREN_START.naam, plaats: LEDERWAREN_START.plaats, adres: LEDERWAREN_START.adres });
    }
    return stops;
  }, [routeKlanten]);

  const lunchStartMin = lunchStart ? timeToMinutes(lunchStart) : null;
  const lunchEndMin = lunchEnd ? timeToMinutes(lunchEnd) : null;
  const hasLunch = lunchStartMin != null && lunchEndMin != null && lunchEndMin > lunchStartMin;

  const timeline = useMemo(() => {
    if (!routeLegs || routeLegs.length === 0) return [];
    let currentMin = timeToMinutes(vertrektijd);
    const applyLunch = (min: number) => {
      if (!hasLunch || lunchStartMin == null || lunchEndMin == null) return min;
      if (min >= lunchStartMin && min < lunchEndMin) return lunchEndMin;
      return min;
    };
    const result: { aankomst: string; vertrek: string; legKm: number | null; legMin: number | null; bezoekUur: number }[] = [];
    for (let i = 0; i < routeStops.length; i++) {
      const stop = routeStops[i];
      const leg = i === 0 ? null : routeLegs[i - 1];
      const legKm = leg ? leg.distanceM / 1000 : null;
      const legMin = leg ? leg.durationS / 60 : null;

      if (i > 0 && leg) {
        currentMin += leg.durationS / 60;
        currentMin = applyLunch(currentMin);
      }
      const aankomst = minutesToTime(currentMin);
      let vertrekMin = currentMin;
      if (stop.type === "klant" && stop.klant) {
        const bezoekUur = getBezoekUur(stop.klant.id);
        vertrekMin = currentMin + bezoekUur * 60;
        vertrekMin = applyLunch(vertrekMin);
      }
      currentMin = vertrekMin;
      const vertrek = minutesToTime(vertrekMin);
      const bezoekUur = stop.type === "klant" && stop.klant ? getBezoekUur(stop.klant.id) : 0;
      result.push({ aankomst, vertrek, legKm, legMin, bezoekUur });
    }
    return result;
  }, [routeLegs, routeStops, vertrektijd, hasLunch, lunchStartMin, lunchEndMin, standaardBezoekUur, bezoekUurPerKlant]);

  const totalen = useMemo(() => {
    if (!routeLegs || routeLegs.length === 0) return null;
    const totaalKm = routeLegs.reduce((s, l) => s + l.distanceM / 1000, 0);
    const totaalRijMin = routeLegs.reduce((s, l) => s + l.durationS / 60, 0);
    const terugTijd = timeline.length > 0 ? timeline[timeline.length - 1].vertrek : vertrektijd;
    return { totaalKm, totaalRijMin, terugTijd };
  }, [routeLegs, timeline, vertrektijd]);

  const googleMapsRouteUrl = useMemo(() => {
    if (routeKlanten.length === 0) return null;
    const origin = `${LEDERWAREN_START.lat},${LEDERWAREN_START.lng}`;
    const destination = origin;
    const waypoints = routeKlanten.map((k) => `${k.lat},${k.lng}`);
    const params = new URLSearchParams({
      api: "1",
      origin,
      destination,
      travelmode: "driving",
    });
    if (waypoints.length > 0) params.set("waypoints", waypoints.join("|"));
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }, [routeKlanten]);

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">Klantkaart</h2>
        <p className="mb-6 text-gray-600">
          Kaart van Nederland en omgeving met alle B2B-klanten. Selecteer klanten om een route te berekenen: start bij Lederwaren Daniëlle (Hoogeveen), langs de klanten, en terug.
        </p>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 flex flex-col gap-4">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
              <KlantkaartMap klanten={klantenMetCoords} />
            </div>

            {routeStops.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <h3 className="px-4 py-3 border-b border-gray-200 font-medium text-gray-900">Route-overzicht</h3>
                {routeLoading && (
                  <p className="px-4 py-2 text-sm text-gray-500">Route wordt berekend…</p>
                )}
                {routeError && (
                  <p className="px-4 py-2 text-sm text-amber-600">{routeError}</p>
                )}
                {totalen && !routeLoading && (
                  <div className="px-4 py-2 flex flex-wrap gap-4 text-sm border-b border-gray-100 bg-gray-50">
                    <span className="font-medium text-gray-900">Totaal: {totalen.totaalKm.toFixed(1)} km</span>
                    <span className="text-gray-600">Rijtijd: {Math.floor(totalen.totaalRijMin / 60)} u {Math.round(totalen.totaalRijMin % 60)} min</span>
                    <span className="text-gray-600">Terug in Hoogeveen: {totalen.terugTijd}</span>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-4 py-2.5 font-medium text-gray-700 w-12">#</th>
                        <th className="px-4 py-2.5 font-medium text-gray-700">Locatie</th>
                        <th className="px-4 py-2.5 font-medium text-gray-700">Plaats</th>
                        <th className="px-4 py-2.5 font-medium text-gray-700 w-20">Aankomst</th>
                        <th className="px-4 py-2.5 font-medium text-gray-700 w-20">Vertrek</th>
                        <th className="px-4 py-2.5 font-medium text-gray-700 w-24">Bezoek (uur)</th>
                        <th className="px-4 py-2.5 font-medium text-gray-700 w-16">Km</th>
                        <th className="px-4 py-2.5 font-medium text-gray-700 w-20">Reistijd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routeStops.map((stop, i) => {
                        const tl = timeline[i];
                        return (
                          <tr key={stop.volgorde + (stop.klant?.id ?? stop.type)} className="border-b border-gray-100 hover:bg-gray-50/50">
                            <td className="px-4 py-2.5 font-medium text-gray-900">{stop.volgorde}</td>
                            <td className="px-4 py-2.5">
                              {stop.type === "klant" && stop.klant ? (
                                <Link href={`/dashboard/b2b-klanten/${stop.klant.id}`} className="text-black hover:underline font-medium">
                                  {stop.naam}
                                </Link>
                              ) : (
                                <span className={stop.type === "start" ? "text-gray-700 font-medium" : "text-gray-600"}>
                                  {stop.naam}
                                  {stop.type === "start" && " (start)"}
                                  {stop.type === "eind" && " (terug)"}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-gray-600">{stop.plaats}</td>
                            <td className="px-4 py-2.5 text-gray-700">{tl?.aankomst ?? "—"}</td>
                            <td className="px-4 py-2.5 text-gray-700">{tl?.vertrek ?? "—"}</td>
                            <td className="px-4 py-2.5">
                              {stop.type === "klant" && stop.klant ? (
                                <select
                                  value={getBezoekUur(stop.klant.id)}
                                  onChange={(e) => setBezoekUur(stop.klant!.id, Number(e.target.value))}
                                  className="w-16 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-gray-900"
                                >
                                  {[0.5, 1, 1.5, 2, 2.5, 3].map((u) => (
                                    <option key={u} value={u}>{u} u</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-gray-600">{tl?.legKm != null ? tl.legKm.toFixed(1) : "—"}</td>
                            <td className="px-4 py-2.5 text-gray-600">
                              {tl?.legMin != null
                                ? `${Math.floor(tl.legMin / 60)}u ${Math.round(tl.legMin % 60)}m`
                                : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {googleMapsRouteUrl && (
                  <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <a
                      href={googleMapsRouteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      Route openen in Google Maps →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-full lg:w-80 shrink-0 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="font-medium text-gray-900">Route berekenen</h3>
              <p className="mt-1 text-sm text-gray-500">
                Selecteer een of meer klanten. De route start bij Lederwaren Daniëlle (Hoogeveen), loopt langs de geselecteerde klanten en eindigt weer in Hoogeveen.
              </p>
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-gray-600">Vertrektijd</span>
                  <input
                    type="time"
                    value={vertrektijd}
                    onChange={(e) => setVertrektijd(e.target.value)}
                    className="mt-0.5 w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-gray-600">Standaard bezoektijd per klant (uur)</span>
                  <select
                    value={standaardBezoekUur}
                    onChange={(e) => setStandaardBezoekUur(Number(e.target.value))}
                    className="mt-0.5 w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900"
                  >
                    {[0.5, 1, 1.5, 2, 2.5, 3].map((u) => (
                      <option key={u} value={u}>{u} uur</option>
                    ))}
                  </select>
                </label>
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-600">Lunchpauze (optioneel)</span>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="time"
                      value={lunchStart}
                      onChange={(e) => setLunchStart(e.target.value)}
                      placeholder="Start"
                      className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
                    />
                    <span className="text-gray-400">–</span>
                    <input
                      type="time"
                      value={lunchEnd}
                      onChange={(e) => setLunchEnd(e.target.value)}
                      placeholder="Einde"
                      className="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">Aankomst tijdens lunch wordt na lunch geteld.</p>
                </div>
              </div>
              <ul className="mt-3 max-h-40 overflow-y-auto space-y-2">
                {klantenMetCoords.map((k) => (
                  <li key={k.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`route-${k.id}`}
                      checked={routeSelection.has(k.id)}
                      onChange={() => toggleRoute(k.id)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`route-${k.id}`} className="text-sm text-gray-900 cursor-pointer">
                      {k.bedrijfsnaam} ({k.plaats})
                    </label>
                  </li>
                ))}
              </ul>
              {routeSelection.size > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  {routeSelection.size} klant(en) geselecteerd. Route wordt onder de kaart getoond.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="font-medium text-gray-900">Klanten op de kaart</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {klantenMetCoords.map((k) => (
                  <li key={k.id}>
                    <Link href={`/dashboard/b2b-klanten/${k.id}`} className="text-black hover:underline">
                      {k.bedrijfsnaam} · {k.plaats}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
