import Link from "next/link";
import {
  getMerkStatistieken,
  getTotaalOmzetDezeMaand,
  getTotaalDoelDezeMaand,
  getOpenTakenCount,
  getTaken,
  getTakenDezeWeekAfgerond,
  getMedewerkers,
} from "@/lib/dashboard-data";
import { getBestellingen, getBestellingenVandaag, getBestellingenDezeWeek } from "@/lib/mock-bestellingen";
import { MOCK_KLANTENSERVICE } from "@/lib/mock-klantenservice";
import { getB2BKlanten } from "@/lib/mock-b2b-klanten";
import { MOCK_PIPELINE_LEADS, PIPELINE_STAGES } from "@/lib/mock-pipeline";
import { getProducten } from "@/lib/producten-store";
import { getMerkById } from "@/lib/merken";

function formatBedrag(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

export default function RapportagePage() {
  const producten = getProducten();
  const productenPerMerk = producten.reduce(
    (acc, p) => {
      acc[p.merkId] = (acc[p.merkId] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const merkStats = getMerkStatistieken(productenPerMerk);
  const omzetMaand = getTotaalOmzetDezeMaand();
  const doelMaand = getTotaalDoelDezeMaand();
  const procentDoel = doelMaand > 0 ? Math.round((omzetMaand / doelMaand) * 100) : 0;

  const bestellingen = getBestellingen();
  const bestellingenVandaag = getBestellingenVandaag();
  const bestellingenWeek = getBestellingenDezeWeek();
  const openBestellingen = bestellingen.filter((b) => b.status === "open").length;
  const verwerkt = bestellingen.filter((b) => b.status === "verwerkt").length;
  const verzonden = bestellingen.filter((b) => b.status === "verzonden").length;
  const afgeleverd = bestellingen.filter((b) => b.status === "afgeleverd").length;
  const gemiddeldeOrderwaarde =
    bestellingen.length > 0
      ? bestellingen.reduce((s, b) => s + b.totaal, 0) / bestellingen.length
      : 0;

  const ticketsOpen = MOCK_KLANTENSERVICE.filter((t) => t.status === "open").length;
  const ticketsBeantwoord = MOCK_KLANTENSERVICE.filter((t) => t.status === "beantwoord").length;
  const ticketsAfgehandeld = MOCK_KLANTENSERVICE.filter((t) => t.status === "afgehandeld").length;
  const ticketsChat = MOCK_KLANTENSERVICE.filter((t) => t.kanaal === "chat").length;
  const ticketsWhatsapp = MOCK_KLANTENSERVICE.filter((t) => t.kanaal === "whatsapp").length;
  const ticketsEmail = MOCK_KLANTENSERVICE.filter((t) => t.kanaal === "email").length;

  const b2bActief = getB2BKlanten("actief").length;
  const b2bProspect = getB2BKlanten("prospect").length;
  const b2bInactief = getB2BKlanten("inactief").length;

  const pipelinePerStage = PIPELINE_STAGES.map((s) => ({
    ...s,
    count: MOCK_PIPELINE_LEADS.filter((l) => l.stage === s.id).length,
  }));
  const pipelineGewonnen = MOCK_PIPELINE_LEADS.filter((l) => l.stage === "gewonnen").length;
  const pipelineVerloren = MOCK_PIPELINE_LEADS.filter((l) => l.stage === "verloren").length;

  const taken = getTaken();
  const openTaken = getOpenTakenCount();
  const takenAfgerondWeek = getTakenDezeWeekAfgerond();

  const totaalProducten = producten.length;
  const medewerkers = getMedewerkers();

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">Rapportage</h2>
        <p className="mb-8 text-gray-600">
          Overzicht van statistieken en kerncijfers. Gebruik deze gegevens voor periodieke rapporten en export.
        </p>

        {/* KPI-samenvatting */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Kerncijfers</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Omzet deze maand</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{formatBedrag(omzetMaand)}</p>
              <p className="mt-1 text-xs text-gray-600">Doel: {formatBedrag(doelMaand)} ({procentDoel}%)</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Bestellingen</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{bestellingen.length}</p>
              <p className="mt-1 text-xs text-gray-600">Vandaag: {bestellingenVandaag} · Deze week: {bestellingenWeek}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Open tickets</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{ticketsOpen}</p>
              <p className="mt-1 text-xs text-gray-600">Totaal tickets: {MOCK_KLANTENSERVICE.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-500">B2B klanten</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{b2bActief} actief</p>
              <p className="mt-1 text-xs text-gray-600">{b2bProspect} prospect · {b2bInactief} inactief</p>
            </div>
          </div>
        </div>

        {/* Omzet per merk */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Omzet per merk (deze maand)</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Merk</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Omzet</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Doel</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">%</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Orders</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Open tickets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {merkStats.map((s) => (
                  <tr key={s.merkId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.merkNaam}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                      {formatBedrag(s.omzetMaand)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">
                      {formatBedrag(s.doelMaand)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <span className={s.prognoseBehaald ? "text-green-600" : "text-amber-600"}>
                        {s.procentBereikt}%
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">
                      {s.bestellingenMaand}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600">
                      {s.openTickets}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Gemiddelde orderwaarde (totaal): {formatBedrag(gemiddeldeOrderwaarde)}
          </p>
        </div>

        {/* Bestellingen per status */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">Bestellingen per status</h3>
            <ul className="mt-4 space-y-2">
              <li className="flex justify-between text-sm">
                <span className="text-gray-600">Open</span>
                <span className="font-medium text-gray-900">{openBestellingen}</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-gray-600">Verwerkt</span>
                <span className="font-medium text-gray-900">{verwerkt}</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-gray-600">Verzonden</span>
                <span className="font-medium text-gray-900">{verzonden}</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-gray-600">Afgeleverd</span>
                <span className="font-medium text-gray-900">{afgeleverd}</span>
              </li>
            </ul>
            <Link href="/dashboard/bestellingen" className="mt-4 inline-block text-sm text-black hover:underline">
              Naar bestellingen →
            </Link>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">Klantenservice</h3>
            <p className="mt-1 text-xs text-gray-500">Tickets per status en kanaal</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Status</p>
                <ul className="mt-1 space-y-1 text-sm">
                  <li className="flex justify-between"><span>Open</span><span>{ticketsOpen}</span></li>
                  <li className="flex justify-between"><span>Beantwoord</span><span>{ticketsBeantwoord}</span></li>
                  <li className="flex justify-between"><span>Afgehandeld</span><span>{ticketsAfgehandeld}</span></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Kanaal</p>
                <ul className="mt-1 space-y-1 text-sm">
                  <li className="flex justify-between"><span>Chat</span><span>{ticketsChat}</span></li>
                  <li className="flex justify-between"><span>WhatsApp</span><span>{ticketsWhatsapp}</span></li>
                  <li className="flex justify-between"><span>E-mail</span><span>{ticketsEmail}</span></li>
                </ul>
              </div>
            </div>
            <Link href="/dashboard/klantenservice" className="mt-4 inline-block text-sm text-black hover:underline">
              Naar klantenservice →
            </Link>
          </div>
        </div>

        {/* Pipeline & B2B */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">Pipeline (leads)</h3>
            <p className="mt-1 text-xs text-gray-500">Potentiële klanten per fase</p>
            <ul className="mt-4 space-y-2">
              {pipelinePerStage.map((s) => (
                <li key={s.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{s.label}</span>
                  <span className="font-medium text-gray-900">{s.count}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              Gewonnen: {pipelineGewonnen} · Verloren: {pipelineVerloren}
            </p>
            <Link href="/dashboard/pipeline" className="mt-4 inline-block text-sm text-black hover:underline">
              Naar pipeline →
            </Link>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">B2B klanten</h3>
            <p className="mt-1 text-xs text-gray-500">Zakelijke klanten</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-600">Actief</span>
                <span className="font-medium text-green-700">{b2bActief}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Prospect</span>
                <span className="font-medium text-amber-700">{b2bProspect}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Inactief</span>
                <span className="font-medium text-gray-600">{b2bInactief}</span>
              </li>
            </ul>
            <Link href="/dashboard/b2b-klanten" className="mt-4 inline-block text-sm text-black hover:underline">
              Naar B2B klanten →
            </Link>
          </div>
        </div>

        {/* Taken & Producten */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">Taken</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-600">Open / bezig</span>
                <span className="font-medium text-gray-900">{openTaken}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Deze week afgerond</span>
                <span className="font-medium text-gray-900">{takenAfgerondWeek}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Totaal taken</span>
                <span className="font-medium text-gray-900">{taken.length}</span>
              </li>
            </ul>
            <Link href="/dashboard/taken" className="mt-4 inline-block text-sm text-black hover:underline">
              Naar taken →
            </Link>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">Producten</h3>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{totaalProducten}</p>
            <p className="mt-1 text-sm text-gray-600">Producten in catalogus</p>
            <Link href="/dashboard/producten" className="mt-4 inline-block text-sm text-black hover:underline">
              Naar producten →
            </Link>
          </div>
        </div>

        {/* Medewerkers & Export */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">Medewerkers</h3>
            <p className="mt-1 text-sm text-gray-600">{medewerkers.filter((m) => m.actief).length} actief van {medewerkers.length} totaal</p>
            <ul className="mt-3 space-y-1 text-sm text-gray-700">
              {medewerkers.map((m) => (
                <li key={m.id}>{m.naam} · {m.rol} {m.actief ? "" : "(afwezig)"}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
            <h3 className="font-semibold text-gray-900">Export</h3>
            <p className="mt-1 text-sm text-gray-500">
              Rapport exporteren (PDF/Excel) wordt later toegevoegd. Gebruik de cijfers hierboven voor handmatige rapporten.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
