import Link from "next/link";
import { getMerkById } from "@/lib/merken";
import DagrapportageNotice from "./components/DagrapportageNotice";
import OperatorRecommendations from "./components/OperatorRecommendations";
import { getDashboardDbData } from "@/lib/dashboard-db";

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

function getOperatorStatus(openTaken: number, openTickets: number, bestellingenVandaag: number) {
  if (openTaken >= 8 || openTickets >= 5) return "Aandacht nodig";
  if (bestellingenVandaag >= 3) return "Drukke flow";
  return "Stabiel";
}

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function DashboardPage() {
  const { bestellingen, tickets, taken, medewerkers, productenAantal, merkStats, omzetMaand, doelMaand } =
    await getDashboardDbData();
  const todayISO = getTodayISO();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const bestellingenVandaag = bestellingen.filter((bestelling) => bestelling.datum.slice(0, 10) === todayISO).length;
  const bestellingenDezeWeek = bestellingen.filter((bestelling) => new Date(bestelling.datum) >= weekStart).length;
  const openTickets = tickets.filter((ticket) => ticket.status === "open").length;
  const openTaken = taken.filter((taak) => taak.status === "open" || taak.status === "bezig").length;
  const takenDezeWeekAfgerond = taken.filter(
    (taak) => taak.status === "afgerond" && new Date(`${taak.deadline}T00:00:00`) >= weekStart
  ).length;
  const totaalProducten = productenAantal;
  const procentDoelTotaal = doelMaand > 0 ? Math.round((omzetMaand / doelMaand) * 100) : 0;
  const openTakenLijst = taken.filter((taak) => taak.status === "open" || taak.status === "bezig");
  const laatsteBestellingen = bestellingen.slice(0, 3);
  const laatsteTickets = tickets.slice(0, 3);
  const operatorStatus = getOperatorStatus(openTaken, openTickets, bestellingenVandaag);
  const priorityTasks = openTakenLijst.filter((taak) => taak.prioriteit === "hoog").slice(0, 3);
  const morningBriefing = [
    `Goedemorgen. Operator status voor ${todayISO}: ${operatorStatus}.`,
    `Er staan ${openTickets} open tickets, ${openTaken} open taken en ${bestellingenVandaag} bestellingen vandaag.`,
    priorityTasks.length > 0
      ? `Top focus: ${priorityTasks.map((task) => task.titel).join(", ")}.`
      : "Er zijn geen hoge prioriteitstaken open.",
  ].join(" ");
  const operatorRecommendations: Array<{
    id: string;
    title: string;
    detail: string;
    tone: "attention" | "focus" | "stable";
  }> = [
    {
      id: "tickets",
      title: "Support eerst stabiliseren",
      detail:
        openTickets > 0
          ? `${openTickets} tickets staan open. Werk eerst klantvragen met directe opvolging af.`
          : "Geen open support-escalaties. Houd follow-up op recente klantvragen in de gaten.",
      tone: openTickets >= 5 ? "attention" : "focus",
    },
    {
      id: "taken",
      title: "Operationele focus",
      detail:
        priorityTasks.length > 0
          ? `Pak eerst deze taken op: ${priorityTasks.map((task) => task.titel).join(", ")}.`
          : "Er zijn geen hoge prioriteitstaken. Verdeel capaciteit op basis van open bestellingen en tickets.",
      tone: priorityTasks.length > 0 ? "attention" : "stable",
    },
    {
      id: "flow",
      title: "Flow en capaciteit",
      detail:
        bestellingenVandaag > 0
          ? `${bestellingenVandaag} nieuwe bestellingen vandaag. Check pick-pack en verzending voor bottlenecks.`
          : "Er zijn nog geen nieuwe bestellingen vandaag. Gebruik ruimte voor follow-up, optimalisatie en backlog.",
      tone: bestellingenVandaag >= 3 ? "focus" : "stable",
    },
  ];

  return (
    <main className="flex-1">
      <div className="dashboard-page-shell w-full pl-10 pr-6 py-8">
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">Dashboard</h2>
        <p className="mb-8 text-gray-600">
          Welkom in het AI Headquarters. Overzicht van hoe Lederwaren Daniëlle er voor staat.
        </p>

        <DagrapportageNotice />
        <OperatorRecommendations
          dateISO={todayISO}
          briefing={morningBriefing}
          recommendations={operatorRecommendations}
        />

        <section className="mb-8 rounded-2xl border border-slate-900 bg-slate-950 px-5 py-5 text-white shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Command Center</p>
              <h3 className="mt-2 text-2xl font-semibold">Operator status: {operatorStatus}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                AI operator mode werkt als werkmotor van het platform: prioriteert open acties, ondersteunt voice-commando&apos;s
                en stuurt vervolgacties op bestellingen, tickets en taken.
              </p>
            </div>

            <div className="grid min-w-[280px] gap-3 sm:grid-cols-3 lg:min-w-[360px] lg:grid-cols-1">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Open tickets</p>
                <p className="mt-1 text-2xl font-semibold">{openTickets}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Open taken</p>
                <p className="mt-1 text-2xl font-semibold">{openTaken}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Orders vandaag</p>
                <p className="mt-1 text-2xl font-semibold">{bestellingenVandaag}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Top prioriteiten</p>
              <div className="mt-3 grid gap-3">
                {priorityTasks.length > 0 ? (
                  priorityTasks.map((task) => (
                    <div key={task.id} className="rounded-lg border border-white/10 bg-black/20 px-3 py-3">
                      <p className="text-sm font-medium text-white">{task.titel}</p>
                      <p className="mt-1 text-xs text-slate-300">
                        {task.toegewezenAan} · deadline {task.deadline} · prioriteit {task.prioriteit}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-300">Er staan nu geen hoge prioriteitstaken open.</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">Voice operator commando&apos;s</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-200">
                {[
                  "dagstart",
                  "prioriteiten",
                  "open bestellingen",
                  "werkqueue support",
                  "werkqueue operations",
                  "lees de dagrapportage voor",
                ].map((command) => (
                  <span key={command} className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
                    {command}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-300">
                Gebruik operator mode voor handsfree sturing van dagelijkse flow, vervolgacties en teamfocus.
              </p>
            </div>
          </div>
        </section>

        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard/bestellingen"
            className="ui-btn-primary rounded-lg px-4 py-2 text-sm font-medium"
          >
            Bekijk bestellingen
          </Link>
          <Link
            href="/dashboard/klantenservice"
            className="ui-btn-secondary rounded-lg border px-4 py-2 text-sm font-medium"
          >
            Open tickets
          </Link>
          <Link
            href="/dashboard/producten"
            className="ui-btn-secondary rounded-lg border px-4 py-2 text-sm font-medium"
          >
            Producten
          </Link>
          <Link
            href="/dashboard/merken"
            className="ui-btn-secondary rounded-lg border px-4 py-2 text-sm font-medium"
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
