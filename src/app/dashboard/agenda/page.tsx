"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getAfspraken } from "@/lib/dashboard-data";
import type { Afspraak } from "@/lib/dashboard-data";

function typeLabel(type: string) {
  switch (type) {
    case "vergadering": return "Vergadering";
    case "klant": return "Klant";
    case "leverancier": return "Leverancier";
    case "intern": return "Intern";
    case "overig": return "Overig";
    default: return type;
  }
}

function formatDatum(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function pad(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

export default function AgendaPage() {
  const [toonMeer, setToonMeer] = useState(false);

  const vandaag = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  const alleAfspraken = useMemo(() => getAfspraken(), []);
  const komendeAfspraken = useMemo(
    () => alleAfspraken.filter((a) => a.datum >= vandaag),
    [alleAfspraken, vandaag]
  );
  const teTonenAfspraken = toonMeer ? komendeAfspraken : komendeAfspraken.slice(0, 3);
  const heeftMeer = komendeAfspraken.length > 3;

  const { kalenderDagen, maandNaam, jaar } = useMemo(() => {
    const now = new Date();
    const jaar = now.getFullYear();
    const maand = now.getMonth();
    const eerste = new Date(jaar, maand, 1);
    const laatste = new Date(jaar, maand + 1, 0);
    const startWeekdag = (eerste.getDay() + 6) % 7;
    const numDagen = laatste.getDate();
    const dagen: (number | null)[] = [];
    for (let i = 0; i < startWeekdag; i++) dagen.push(null);
    for (let d = 1; d <= numDagen; d++) dagen.push(d);
    const rest = 42 - dagen.length;
    for (let i = 0; i < rest; i++) dagen.push(null);
    const maandNaam = eerste.toLocaleDateString("nl-NL", { month: "long" });
    return { kalenderDagen: dagen, maandNaam, jaar };
  }, []);

  const afsprakenPerDag = useMemo(() => {
    const map: Record<string, Afspraak[]> = {};
    const [y, m] = [new Date().getFullYear(), new Date().getMonth()];
    const prefix = `${y}-${pad(m + 1)}-`;
    alleAfspraken.forEach((a) => {
      if (a.datum.startsWith(prefix)) {
        if (!map[a.datum]) map[a.datum] = [];
        map[a.datum].push(a);
      }
    });
    return map;
  }, [alleAfspraken]);

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">Agenda</h2>
        <p className="mb-6 text-gray-600">
          Overzicht van afspraken en geplande activiteiten.
        </p>

        <section className="mb-10">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
            Komende afspraken
          </h3>
          <div className="space-y-4">
            {teTonenAfspraken.map((a) => (
              <Link
                key={a.id}
                href={`/dashboard/agenda/${a.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{a.titel}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatDatum(a.datum)} · {a.startTijd} – {a.eindTijd}
                    </p>
                    {a.locatie && (
                      <p className="mt-1 text-sm text-gray-500">Locatie: {a.locatie}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Deelnemers: {a.deelnemers.join(", ")}
                    </p>
                    {a.notities && (
                      <p className="mt-2 text-sm text-gray-600">{a.notities}</p>
                    )}
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {typeLabel(a.type)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {komendeAfspraken.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">Geen komende afspraken.</p>
          )}
          {heeftMeer && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setToonMeer(!toonMeer)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {toonMeer ? "Toon minder" : "Toon meer"}
              </button>
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
            Kalender — {maandNaam} {jaar}
          </h3>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((dag) => (
                <div key={dag} className="py-1 text-xs font-medium text-gray-500">
                  {dag}
                </div>
              ))}
              {kalenderDagen.map((dag, i) => {
                if (dag === null) {
                  return <div key={`empty-${i}`} className="min-h-[4rem]" />;
                }
                const datumStr = `${jaar}-${pad(new Date().getMonth() + 1)}-${pad(dag)}`;
                const afspraken = afsprakenPerDag[datumStr] ?? [];
                const isVandaag = datumStr === vandaag;
                return (
                  <div
                    key={dag}
                    className={`min-h-[4rem] rounded-md border p-1.5 text-left ${
                      isVandaag ? "border-black bg-gray-100 font-medium" : "border-gray-100"
                    }`}
                  >
                    <span className="text-sm text-gray-900">{dag}</span>
                    {afspraken.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {afspraken.slice(0, 2).map((a) => (
                          <Link
                            key={a.id}
                            href={`/dashboard/agenda/${a.id}`}
                            className="block truncate rounded bg-gray-200 px-1 py-0.5 text-xs text-gray-800 hover:bg-gray-300"
                            title={a.titel}
                          >
                            {a.startTijd} {a.titel}
                          </Link>
                        ))}
                        {afspraken.length > 2 && (
                          <div className="text-xs text-gray-500">+{afspraken.length - 2}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
