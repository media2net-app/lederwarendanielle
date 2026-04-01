import Link from "next/link";
import {
  getBestellingenVandaag,
  getBestellingenDezeWeek,
  getLaatsteBestellingen,
} from "@/lib/mock-bestellingen";
import { getOpenTicketsCount, getLaatsteTickets } from "@/lib/mock-klantenservice";
import { getProducten } from "@/lib/producten-store";
import { getMerkById } from "@/lib/merken";
import {
  getMerkStatistieken,
  getOpenTakenCount,
  getTakenDezeWeekAfgerond,
  getTaken,
  getMedewerkers,
  getTotaalOmzetDezeMaand,
  getTotaalDoelDezeMaand,
} from "@/lib/dashboard-data";

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

export default function DashboardPage() {
  const bestellingenVandaag = getBestellingenVandaag();
  const bestellingenDezeWeek = getBestellingenDezeWeek();
  const openTickets = getOpenTicketsCount();
  const openTaken = getOpenTakenCount();
  const takenDezeWeekAfgerond = getTakenDezeWeekAfgerond();
  const totaalProducten = getProducten().length;
  const omzetMaand = getTotaalOmzetDezeMaand();
  const doelMaand = getTotaalDoelDezeMaand();
  const procentDoelTotaal = doelMaand > 0 ? Math.round((omzetMaand / doelMaand) * 100) : 0;

  const producten = getProducten();
  const productenPerMerk = producten.reduce(
    (acc, p) => {
      acc[p.merkId] = (acc[p.merkId] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const merkStats = getMerkStatistieken(productenPerMerk);
  const openTakenLijst = getTaken().filter((t) => t.status === "open" || t.status === "bezig");
  const medewerkers = getMedewerkers();
  const laatsteBestellingen = getLaatsteBestellingen(3);
  const laatsteTickets = getLaatsteTickets(3);

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">Dashboard</h2>
        <p className="mb-8 text-gray-600">
          Welkom in het AI Headquarters. Overzicht van hoe Lederwaren Daniëlle er voor staat.
        </p>

        <div className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Demo script (10 min)</p>
          <p className="mt-1 text-sm text-indigo-900">1) Bestellingen 2) Pick & Pack 3) Forecast 4) Klantenservice 5) AI Studio</p>
          <p className="mt-1 text-xs text-indigo-700">Laatst bijgewerkt: {new Date().toLocaleString("nl-NL")}</p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard/bestellingen"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Bekijk bestellingen
          </Link>
          <Link
            href="/dashboard/klantenservice"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Open tickets
          </Link>
          <Link
            href="/dashboard/producten"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Producten
          </Link>
          <Link
            href="/dashboard/merken"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Merken & webshops
          </Link>
        </div>

        {/* KPI-kaarten */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Bestellingen vandaag</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{bestellingenVandaag}</p>
            <Link href="/dashboard/bestellingen" className="mt-2 inline-block text-sm text-black hover:underline">
              Bekijk bestellingen →
            </Link>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Bestellingen deze week</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{bestellingenDezeWeek}</p>
            <Link href="/dashboard/bestellingen" className="mt-2 inline-block text-sm text-black hover:underline">
              Bekijk bestellingen →
            </Link>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Open tickets</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{openTickets}</p>
            <Link href="/dashboard/klantenservice" className="mt-2 inline-block text-sm text-black hover:underline">
              Bekijk tickets →
            </Link>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Open taken</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{openTaken}</p>
            <p className="mt-1 text-xs text-gray-500">{takenDezeWeekAfgerond} deze week afgerond</p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Omzet deze maand</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{formatBedrag(omzetMaand)}</p>
            <p className="mt-1 text-sm text-gray-600">
              Doel: {formatBedrag(doelMaand)} ({procentDoelTotaal}%)
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Producten (totaal)</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{totaalProducten}</p>
            <Link href="/dashboard/producten" className="mt-2 inline-block text-sm text-black hover:underline">
              Bekijk producten →
            </Link>
          </div>
        </div>

        {/* Per merk: hoe staat Lederwaren Daniëlle er voor */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Per merk – omzet, doel en prognose
          </h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Merk</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Omzet maand</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Doel</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">%</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Prognose doel</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Orders</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Open tickets</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Producten</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {merkStats.map((s) => (
                  <tr key={s.merkId} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{s.merkNaam}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                      {formatBedrag(s.omzetMaand)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">
                      {formatBedrag(s.doelMaand)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                      {s.procentBereikt}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          s.prognoseBehaald ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {s.prognoseBehaald ? "Op schema" : "Achter"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">
                      {s.bestellingenMaand}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">
                      {s.openTickets}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">
                      {s.productenAantal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Open taken */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Open taken</h3>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <ul className="divide-y divide-gray-200">
              {openTakenLijst.length === 0 ? (
                <li className="px-4 py-4 text-sm text-gray-500">Geen open taken.</li>
              ) : (
                openTakenLijst.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{t.titel}</p>
                      <p className="text-xs text-gray-500">
                        {t.toegewezenAan} · deadline {t.deadline}
                        {t.merkId && ` · ${getMerkById(t.merkId)?.naam ?? t.merkId}`}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        t.status === "bezig" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {t.status}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Medewerkers overzicht */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Medewerkers overzicht</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Naam</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Rol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Open taken</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Merk focus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {medewerkers.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{m.naam}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{m.rol}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          m.actief ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {m.actief ? "Actief" : "Afwezig"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                      {m.openTaken}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {m.merkFocus.length ? m.merkFocus.join(", ") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-medium text-gray-900">Laatste bestellingen</h3>
            <ul className="mt-3 space-y-2">
              {laatsteBestellingen.map((b) => {
                const merk = getMerkById(b.merkId);
                return (
                  <li key={b.id}>
                    <Link
                      href={`/dashboard/bestellingen/${b.id}`}
                      className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-900">{b.ordernummer}</span>
                      <span className="text-gray-500">{formatBedrag(b.totaal)}</span>
                    </Link>
                    <p className="ml-2 text-xs text-gray-400">
                      {formatDatum(b.datum)} · {merk?.naam}
                    </p>
                  </li>
                );
              })}
            </ul>
            <Link href="/dashboard/bestellingen" className="mt-3 inline-block text-sm text-black hover:underline">
              Alle bestellingen →
            </Link>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-medium text-gray-900">Laatste tickets</h3>
            <ul className="mt-3 space-y-2">
              {laatsteTickets.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/dashboard/klantenservice/${t.id}`}
                    className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">{t.onderwerp}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        t.status === "open" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t.status}
                    </span>
                  </Link>
                  <p className="ml-2 text-xs text-gray-400">
                    {formatDatum(t.datum)} · {t.klantNaam}
                  </p>
                </li>
              ))}
            </ul>
            <Link href="/dashboard/klantenservice" className="mt-3 inline-block text-sm text-black hover:underline">
              Alle tickets →
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-medium text-gray-900">Merken & webshops</h3>
            <p className="mt-1 text-sm text-gray-500">
              Beheer koppelingen naar Orange Fire, Leather Design, GAZ en meer.
            </p>
            <Link href="/dashboard/merken" className="mt-2 inline-block text-sm text-black hover:underline">
              Naar merken →
            </Link>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-medium text-gray-900">Instellingen</h3>
            <p className="mt-1 text-sm text-gray-500">Account en voorkeuren.</p>
            <Link href="/dashboard/instellingen" className="mt-2 inline-block text-sm text-black hover:underline">
              Naar instellingen →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
