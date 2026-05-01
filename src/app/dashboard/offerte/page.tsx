"use client";

type OfferteOnderdeel = {
  id: string;
  naam: string;
  type: "eenmalig" | "maandelijks";
  prijs: number;
  omschrijving: string;
  watKanHet: string[];
};

const ONDERDELEN: OfferteOnderdeel[] = [
  {
    id: "basis",
    naam: "Basisplatform (dashboard + rollen)",
    type: "eenmalig",
    prijs: 1800,
    omschrijving: "Centrale werkomgeving voor orders, voorraad, klantenservice en rapportage.",
    watKanHet: [
      "Alle teams werken vanuit een dashboard met live overzicht",
      "Inlog en basisrolverdeling voor intern gebruik",
      "Snelle navigatie tussen operationele modules",
    ],
  },
  {
    id: "orders-magazijn",
    naam: "Orderflow & magazijn",
    type: "eenmalig",
    prijs: 650,
    omschrijving: "Van bestelling naar pick-pack en verzendlabel in 1 proces.",
    watKanHet: [
      "Orderstatus per stap beheren",
      "Pick & pack workflow met scan-simulatie",
      "Verzendlabel genereren en order afronden",
    ],
  },
  {
    id: "forecast",
    naam: "Forecast & inkoopadvies",
    type: "eenmalig",
    prijs: 1250,
    omschrijving: "Voorraadprognose met what-if scenario's voor betere inkoopbeslissingen.",
    watKanHet: [
      "Verwachte vraag per product en periode tonen",
      "What-if op promotie en safety stock",
      "Automatisch besteladvies met prioritering",
    ],
  },
  {
    id: "ai-assistent",
    naam: "AI assistent (service + orderadvies)",
    type: "eenmalig",
    prijs: 950,
    omschrijving: "AI hulp voor klantenservice en operationele besluitvorming.",
    watKanHet: [
      "Suggesties voor antwoord op tickets",
      "Order- en vervolgstapadvies op detailpagina's",
      "Interne AI-chat ondersteuning voor teamvragen",
    ],
  },
  {
    id: "interne-chat",
    naam: "Interne chatmodule",
    type: "eenmalig",
    prijs: 650,
    omschrijving: "Teamcommunicatie via kanalen en 1-op-1 gesprekken binnen het platform.",
    watKanHet: [
      "Kanalen voor afdelingen (magazijn, support, algemeen)",
      "Direct messages tussen collega's",
      "Ongelezen indicatoren en realtime persistentie",
    ],
  },
  {
    id: "support",
    naam: "Hosting",
    type: "maandelijks",
    prijs: 29.95,
    omschrijving: "Maandelijkse hosting en basis beschikbaarheid van het platform.",
    watKanHet: [
      "Veilige hosting van de applicatie",
      "Basis monitoring en uptime",
      "Dagelijkse bereikbaarheid van de omgeving",
    ],
  },
];

function formatEuro(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value);
}

export default function OffertePage() {
  const eenmalig = ONDERDELEN.filter((o) => o.type === "eenmalig");
  const maandelijks = ONDERDELEN.filter((o) => o.type === "maandelijks");
  const totaalEenmalig = eenmalig.reduce((sum, o) => sum + o.prijs, 0);
  const totaalMaandelijks = maandelijks.reduce((sum, o) => sum + o.prijs, 0);

  return (
    <main className="flex-1">
      <div className="w-full pl-10 pr-6 py-8">
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Voorstel</p>
          <h2 className="mt-1 text-2xl font-semibold text-gray-900">Offerteoverzicht Platform</h2>
          <p className="mt-2 text-sm text-gray-600">
            Hieronder staat per onderdeel wat het doet en wat de investering is. Zo is direct duidelijk hoe de totale offerte is opgebouwd.
          </p>
        </div>


        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Belangrijke voorwaarden</p>
          <ul className="mt-2 space-y-2 text-sm text-amber-900">
            <li>Alle genoemde prijzen zijn <strong>exclusief 21% BTW</strong>.</li>
            <li>Doorlooptijd project: <strong>12 weken</strong>.</li>
            <li>Bij akkoord: <strong>50% aanbetaling</strong>.</li>
            <li>
              Bij oplevering plannen we <strong>1 dag op locatie</strong> waarin alles wordt ingesteld en
              we daarnaast <strong>1 dag meedraaien</strong> voor begeleiding en support van medewerkers.
              In principe kan alles op afstand ingericht worden, maar deze dagen worden aangeboden om een
              soepele ingebruikname te garanderen.
            </li>
          </ul>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Offertetotaal</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{formatEuro(totaalEenmalig)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Maandelijkse kosten</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{formatEuro(totaalMaandelijks)}</p>
            <p className="text-xs text-gray-500">Hosting en basis infrastructuur</p>
          </div>
        </div>

        <div className="space-y-4">
          {ONDERDELEN.map((onderdeel) => (
            <article key={onderdeel.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{onderdeel.naam}</h3>
                  <p className="mt-1 text-sm text-gray-600">{onderdeel.omschrijving}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{onderdeel.type === "eenmalig" ? "Eenmalig" : "Per maand"}</p>
                  <p className="text-xl font-semibold text-gray-900">{formatEuro(onderdeel.prijs)}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Wat kan dit onderdeel</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  {onderdeel.watKanHet.map((punt) => (
                    <li key={punt} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-500" />
                      <span>{punt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
