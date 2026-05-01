"use client";

import { useEffect, useMemo, useState } from "react";

type WeekStatus = "Niet gestart" | "Actief" | "Gereed" | "Geblokkeerd";

interface PlanningWeek {
  week: number;
  period: string;
  title: string;
  phase: string;
  goals: string[];
  deliverables: string[];
}

interface WeekProgressState {
  status: WeekStatus;
  owner: string;
  notes: string;
  completedTasks: string[];
}

const STORAGE_KEY = "projectplanning_12_weken_state";
const WEEK1_COMPLETED_TASKS = [
  "Kick-off sessie uitvoeren",
  "Scope document finaliseren",
  "Prioriteitenlijst bepalen",
  "Projectrollen vastleggen",
  "Weekupdate en reviewritme bepalen",
  "Plan voor legacy-data uitfaseren en Supabase opleveren",
  "Legacy-data uitschakelen voor kernmodules",
  "Supabase tabellen opleveren voor kernmodules",
  "API-routes migreren naar Supabase",
  "Dashboard laten draaien op echte data",
];
const WEEK1_DEFAULT_NOTES =
  "Week 1 afgerond: governance, migratie naar Supabase en uitfaseren van legacy-data zijn gerealiseerd. Klaar voor start week 2.";
const WEEK2_DEFAULT_NOTES =
  "Week 2 inhoudelijk uitgewerkt: functioneel ontwerp en technische basis zijn gedocumenteerd. Klaar voor review en start uitvoer fase 2.";
const WEEK2_COMPLETED_TASKS = [
  "Orderflow uitschrijven",
  "Klantenserviceflow uitschrijven",
  "Taken- en AI-actiemodel finaliseren",
  "Basisstructuur voor state en API-routes bevestigen",
  "Tracking voor voortgang inrichten",
];

const taskNotes: Record<number, Record<string, string>> = {
  1: {
    "Kick-off sessie uitvoeren":
      "Kick-off afgerond op 21 april 2026. Startscope, bouwvolgorde en werkwijze voor weekreviews zijn bevestigd.",
    "Scope document finaliseren":
      "Werk de scope uit op paginaniveau en leg vast welke modules in fase 1 live moeten kunnen draaien op echte data.",
    "Prioriteitenlijst bepalen":
      "Label alles als must-have / should-have / later, zodat de sprintvolgorde strak blijft en scope creep wordt voorkomen.",
    "Projectrollen vastleggen":
      "Bevestig eigenaar per domein: orders, taken, klantenservice, producten, AI en data/migratie.",
    "Weekupdate en reviewritme bepalen":
      "Leg vaste momenten vast voor weekstart, tussentijdse update en weekreview met duidelijke beslismomenten.",
    "Plan voor legacy-data uitfaseren en Supabase opleveren":
      "Dit plan is gestart: inventarisatie en eerste Supabase tabellen (todos + orders) staan al operationeel.",
    "Legacy-data uitschakelen voor kernmodules":
      "Schakel mock- en tijdelijke databronnen uit voor orders, taken, tickets en producten zodat UI alleen echte databasegegevens toont.",
    "Supabase tabellen opleveren voor kernmodules":
      "Rond tabellen en constraints af voor users, tasks, tickets, products en events, inclusief basis-RLS.",
    "API-routes migreren naar Supabase":
      "Zet kernroutes om van mock imports naar server-side Supabase queries met nette foutafhandeling.",
    "Dashboard laten draaien op echte data":
      "Laat bestellingen, taken en klantenservicepagina's lezen uit Supabase zonder standaard fallback naar mock.",
  },
};

const planningWeeks: PlanningWeek[] = [
  {
    week: 1,
    period: "21 apr - 26 apr",
    title: "Kick-off en scopebevestiging + technische start",
    phase: "Fase 1",
    goals: [
      "Projectstart met klant en kernteam (aanbetaling ontvangen)",
      "Scope, prioriteiten en must-haves bevestigen",
      "Succescriteria, livegangdoel en bouwstart vastleggen",
    ],
    deliverables: [
      "Kick-off sessie uitvoeren",
      "Scope document finaliseren",
      "Prioriteitenlijst bepalen",
      "Projectrollen vastleggen",
      "Weekupdate en reviewritme bepalen",
      "Plan voor legacy-data uitfaseren en Supabase opleveren",
      "Legacy-data uitschakelen voor kernmodules",
      "Supabase tabellen opleveren voor kernmodules",
      "API-routes migreren naar Supabase",
      "Dashboard laten draaien op echte data",
    ],
  },
  {
    week: 2,
    period: "27 apr - 03 mei",
    title: "Functioneel ontwerp en technische basis",
    phase: "Fase 1",
    goals: [
      "Belangrijkste processen volledig uitschrijven",
      "Technische basis klaarzetten voor stabiele ontwikkeling",
    ],
    deliverables: [
      "Orderflow uitschrijven",
      "Klantenserviceflow uitschrijven",
      "Taken- en AI-actiemodel finaliseren",
      "Basisstructuur voor state en API-routes bevestigen",
      "Tracking voor voortgang inrichten",
    ],
  },
  {
    week: 3,
    period: "04 mei - 10 mei",
    title: "Bestellingenmodule",
    phase: "Fase 2",
    goals: [
      "Orderbeheer operationeel maken",
      "Statusflow en eventlog stabiel krijgen",
    ],
    deliverables: [
      "Bestellingenoverzicht afronden",
      "Filters en zoeklogica verbeteren",
      "Detailpagina verder afmaken",
      "Statusupdates en eventlog nalopen",
      "Koppeling met pick-pack flow controleren",
    ],
  },
  {
    week: 4,
    period: "11 mei - 17 mei",
    title: "Klantenservice en taken",
    phase: "Fase 2",
    goals: [
      "Support- en taakprocessen volledig bruikbaar maken",
      "Mutaties direct zichtbaar laten terugkomen in UI",
    ],
    deliverables: [
      "Klantenservice overzicht verbeteren",
      "Ticketdetail en antwoordflow afronden",
      "Ticketstatus mutaties valideren",
      "Takenoverzicht afronden",
      "Opslag en live update van taken controleren",
    ],
  },
  {
    week: 5,
    period: "18 mei - 24 mei",
    title: "Producten, merken en rapportagebasis",
    phase: "Fase 2",
    goals: [
      "Operationele context verbreden",
      "Dashboard en rapportage van betere input voorzien",
    ],
    deliverables: [
      "Productoverzicht nalopen en verrijken",
      "Merken- en webshopinformatie structureren",
      "KPI-blokken en rapportagebasis verbeteren",
      "Dataconsistentie tussen modules nalopen",
      "Legacy-data opschonen",
    ],
  },
  {
    week: 6,
    period: "25 mei - 31 mei",
    title: "AI assistent fase 1",
    phase: "Fase 3",
    goals: [
      "AI laten adviseren binnen operationele context",
      "Consistente antwoorden en suggesties neerzetten",
    ],
    deliverables: [
      "AI-context verder structureren",
      "Prompts aanscherpen",
      "AI-suggesties op ticket/order verbeteren",
      "Fallbackteksten verbeteren",
      "Logging van AI-antwoorden nalopen",
    ],
  },
  {
    week: 7,
    period: "01 jun - 07 jun",
    title: "AI assistent fase 2",
    phase: "Fase 3",
    goals: [
      "AI laten handelen met bevestiging",
      "Veilige actieflows stabiel maken",
    ],
    deliverables: [
      "AI-acties voor bestellingstatus afronden",
      "AI-acties voor ticketstatus afronden",
      "AI-acties voor taken aanmaken afronden",
      "Bevestigingsflow finetunen",
      "Uitgevoerde acties zichtbaar maken in UI",
    ],
  },
  {
    week: 8,
    period: "08 jun - 14 jun",
    title: "Voice, mobiel en gebruikerservaring",
    phase: "Fase 3",
    goals: [
      "Voice en mobiel echt gebruiksvriendelijk maken",
      "Interaction design afmaken",
    ],
    deliverables: [
      "Voice orb interactie finetunen",
      "Split-screen voice/chat optimaliseren",
      "Mobiele topbar en overlays nalopen",
      "Stemkeuze en voice-flow verbeteren",
      "Responsive controle uitvoeren",
    ],
  },
  {
    week: 9,
    period: "15 jun - 21 jun",
    title: "Testen en kwaliteitsverbetering",
    phase: "Fase 4",
    goals: [
      "Bugs en regressies reduceren",
      "Edge cases en performance verbeteren",
    ],
    deliverables: [
      "Regressierondes uitvoeren",
      "Bekende bugs oplossen",
      "Foutmeldingen verduidelijken",
      "Edge cases in AI-acties testen",
      "Performance en rendering nalopen",
    ],
  },
  {
    week: 10,
    period: "22 jun - 28 jun",
    title: "Acceptatievoorbereiding",
    phase: "Fase 4",
    goals: [
      "Systeem klaarzetten voor beoordeling door klant en team",
      "Test- en acceptatiescenario's structureren",
    ],
    deliverables: [
      "Acceptatiescenario's uitschrijven",
      "Testscript per module opstellen",
      "Acceptatiescript finaliseren",
      "Trainingspunten verzamelen",
      "Restpunten classificeren",
    ],
  },
  {
    week: 11,
    period: "29 jun - 05 jul",
    title: "UAT en finetuning",
    phase: "Fase 5",
    goals: [
      "Klantfeedback verwerken",
      "Go-live checklist compleet maken",
    ],
    deliverables: [
      "UAT uitvoeren",
      "Bevindingen registreren",
      "Prioriteit 1 feedback oplossen",
      "Prioriteit 2 feedback beoordelen",
      "Go-live checklist valideren",
    ],
  },
  {
    week: 12,
    period: "06 jul - 12 jul",
    title: "Oplevering en livegangvoorbereiding",
    phase: "Fase 5",
    goals: [
      "Project gecontroleerd afronden",
      "Livegang en nazorg voorbereiden",
    ],
    deliverables: [
      "Eindcontrole op functionaliteit",
      "Overdracht documenteren",
      "Training of uitleg geven",
      "Livegang- en nazorgafspraken vastleggen",
      "Backlog voor fase 2 opstellen",
    ],
  },
];

const milestones = [
  { label: "Scope akkoord", week: 1 },
  { label: "Technische basis gereed", week: 2 },
  { label: "Kernmodules werkend", week: 5 },
  { label: "AI-acties werkend", week: 7 },
  { label: "Mobiel en voice stabiel", week: 8 },
  { label: "Acceptatieklaar", week: 10 },
  { label: "Oplevering gereed", week: 12 },
];

const plannedStartDate = new Date("2026-04-21T00:00:00");
const plannedEndDate = new Date(plannedStartDate);
plannedEndDate.setDate(plannedEndDate.getDate() + (12 * 7) - 1);
const actualStartDate = new Date("2026-04-21T00:00:00");

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function createDefaultState(): Record<number, WeekProgressState> {
  return Object.fromEntries(
    planningWeeks.map((week) => [
      week.week,
      {
        status: week.week === 1 ? "Gereed" : week.week === 2 ? "Actief" : "Niet gestart",
        owner: week.week === 1 || week.week === 2 ? "AI Medewerker" : "",
        notes: week.week === 1 ? WEEK1_DEFAULT_NOTES : week.week === 2 ? WEEK2_DEFAULT_NOTES : "",
        completedTasks: week.week === 1 ? WEEK1_COMPLETED_TASKS : week.week === 2 ? WEEK2_COMPLETED_TASKS : [],
      },
    ])
  );
}

function statusClasses(status: WeekStatus) {
  switch (status) {
    case "Gereed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Actief":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Geblokkeerd":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export default function PlanningPage() {
  const [planningState, setPlanningState] = useState<Record<number, WeekProgressState>>(createDefaultState);
  const [selectedStatus, setSelectedStatus] = useState<WeekStatus | "Alle">("Alle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<number, Omit<WeekProgressState, "status"> & { status: WeekStatus | "Bezig" }>;
      const normalized = Object.fromEntries(
        Object.entries(parsed).map(([week, value]) => [
          week,
          {
            ...value,
            status: value.status === "Bezig" ? "Actief" : value.status,
          },
        ])
      ) as Record<number, WeekProgressState>;
      setPlanningState({
        ...createDefaultState(),
        ...normalized,
        1: {
          ...createDefaultState()[1],
          ...(normalized[1] ?? {}),
          status: "Gereed",
          completedTasks: Array.from(
            new Set([...(normalized[1]?.completedTasks ?? []), ...WEEK1_COMPLETED_TASKS])
          ),
          notes:
            normalized[1]?.notes?.trim() ||
            WEEK1_DEFAULT_NOTES,
        },
        2: {
          ...createDefaultState()[2],
          ...(normalized[2] ?? {}),
          status: "Actief",
          owner: normalized[2]?.owner?.trim() || "AI Medewerker",
          completedTasks: Array.from(
            new Set([...(normalized[2]?.completedTasks ?? []), ...WEEK2_COMPLETED_TASKS])
          ),
          notes:
            normalized[2]?.notes?.trim() ||
            WEEK2_DEFAULT_NOTES,
        },
      });
    } catch {
      setPlanningState(createDefaultState());
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(planningState));
  }, [planningState]);

  const totalTasks = planningWeeks.reduce((sum, week) => sum + week.deliverables.length, 0);
  const completedTasks = planningWeeks.reduce(
    (sum, week) => sum + (planningState[week.week]?.completedTasks.length ?? 0),
    0
  );
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const completedWeeks = planningWeeks.filter((week) => planningState[week.week]?.status === "Gereed").length;
  const activeWeeks = planningWeeks.filter((week) => planningState[week.week]?.status === "Actief").length;
  const blockedWeeks = planningWeeks.filter((week) => planningState[week.week]?.status === "Geblokkeerd").length;

  const visibleWeeks = useMemo(() => {
    if (selectedStatus === "Alle") return planningWeeks;
    return planningWeeks.filter((week) => planningState[week.week]?.status === selectedStatus);
  }, [planningState, selectedStatus]);

  const updateWeek = (weekNumber: number, patch: Partial<WeekProgressState>) => {
    setPlanningState((current) => ({
      ...current,
      [weekNumber]: {
        ...current[weekNumber],
        ...patch,
      },
    }));
  };

  const toggleTask = (weekNumber: number, task: string) => {
    const currentTasks = planningState[weekNumber]?.completedTasks ?? [];
    const nextTasks = currentTasks.includes(task)
      ? currentTasks.filter((item) => item !== task)
      : [...currentTasks, task];
    updateWeek(weekNumber, { completedTasks: nextTasks });
  };

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">Projectplanning</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900">12 weken implementatieplanning</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-600">
              Een visuele en bewerkbare projectplanning voor de implementatie vanaf dinsdag 21 april 2026. Werk per week de status,
              eigenaar, taken en notities bij om direct inzicht te houden in voortgang en risico's.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 shadow-sm">
            <div>
              Startdatum project: <span className="font-semibold">{formatDate(actualStartDate)}</span>
            </div>
            <div>
              Geplande einddatum: <span className="font-semibold">{formatDate(plannedEndDate)}</span>
            </div>
            <div>
              Status aanbetaling: <span className="font-semibold">Betaald op 21 april 2026</span>
            </div>
            <div>
              Projectstatus: <span className="font-semibold">Actief</span>
            </div>
            <div className="mt-2 text-xs text-emerald-800">
              Aanbetaling is binnen, de bouw is officieel gestart.
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Totale voortgang</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{overallProgress}%</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
            <p className="mt-2 text-xs text-gray-500">{completedTasks} van {totalTasks} taken afgerond</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Weken gereed</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{completedWeeks}/12</p>
            <p className="mt-2 text-xs text-gray-500">Volledig afgeronde projectweken</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Actief in uitvoering</p>
            <p className="mt-1 text-3xl font-semibold text-emerald-700">{activeWeeks}</p>
            <p className="mt-2 text-xs text-gray-500">Weken die nu in behandeling zijn</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Geblokkeerd</p>
            <p className="mt-1 text-3xl font-semibold text-red-700">{blockedWeeks}</p>
            <p className="mt-2 text-xs text-gray-500">Weken met risico of blokkade</p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Mijlpalen</h2>
              <p className="mt-1 text-sm text-gray-600">Belangrijkste checkpoints richting oplevering.</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <span>Filter:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as WeekStatus | "Alle")}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="Alle">Alle statussen</option>
                <option value="Niet gestart">Niet gestart</option>
                <option value="Actief">Actief</option>
                <option value="Gereed">Gereed</option>
                <option value="Geblokkeerd">Geblokkeerd</option>
              </select>
            </label>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {milestones.map((milestone) => (
              <div key={milestone.label} className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Week {milestone.week}</p>
                <p className="mt-1 font-medium text-emerald-950">{milestone.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          {visibleWeeks.map((week) => {
            const state = planningState[week.week] ?? createDefaultState()[week.week];
            const weekProgress = week.deliverables.length > 0
              ? Math.round((state.completedTasks.length / week.deliverables.length) * 100)
              : 0;

            return (
              <section key={week.week} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                        {week.phase}
                      </span>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(state.status)}`}>
                        {state.status}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-gray-900">
                      Week {week.week}: {week.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{week.period}</p>
                  </div>
                  <div className="min-w-[220px] rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-600">Weekvoortgang</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{weekProgress}%</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${weekProgress}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">{state.completedTasks.length} van {week.deliverables.length} taken afgerond</p>
                  </div>
                </div>

                {state.completedTasks.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Afgeronde taken</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {state.completedTasks.map((task) => (
                        <span
                          key={`${week.week}-${task}`}
                          className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800"
                        >
                          {task}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_1.2fr_0.9fr]">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Doelen</h4>
                    <ul className="mt-3 space-y-2">
                      {week.goals.map((goal) => (
                        <li key={goal} className="rounded-xl bg-white px-3 py-2 text-sm text-gray-800 shadow-sm">
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Taken en opleveringen</h4>
                    <div className="mt-3 space-y-2">
                      {week.deliverables.map((task) => {
                        const checked = state.completedTasks.includes(task);
                        return (
                          <label
                            key={task}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm transition-colors ${
                              checked ? "border-emerald-200 bg-emerald-50" : "border-white bg-white hover:border-gray-200"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleTask(week.week, task)}
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className={checked ? "text-emerald-900 line-through decoration-emerald-500/70" : "text-gray-800"}>
                                  {task}
                                </span>
                                {checked && (
                                  <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                                    Afgerond
                                  </span>
                                )}
                              </div>
                              {taskNotes[week.week]?.[task] && (
                                <p className="mt-1 text-xs text-gray-500">{taskNotes[week.week][task]}</p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Bijhouden</h4>
                    <div className="mt-3 space-y-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Status</label>
                        <select
                          value={state.status}
                          onChange={(e) => updateWeek(week.week, { status: e.target.value as WeekStatus })}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        >
                          <option value="Niet gestart">Niet gestart</option>
                          <option value="Actief">Actief</option>
                          <option value="Gereed">Gereed</option>
                          <option value="Geblokkeerd">Geblokkeerd</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Eigenaar</label>
                        <input
                          type="text"
                          value={state.owner}
                          onChange={(e) => updateWeek(week.week, { owner: e.target.value })}
                          placeholder="Bijv. Tom / Sanne / extern bureau"
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Notities / blokkades</label>
                        <textarea
                          value={state.notes}
                          onChange={(e) => updateWeek(week.week, { notes: e.target.value })}
                          placeholder="Wat speelt er deze week, wat loopt goed, wat blokkeert?"
                          rows={6}
                          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
