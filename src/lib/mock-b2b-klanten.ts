import type { MerkId } from "./merken";

export type KlantLogType = "telefoon" | "email" | "afspraak" | "notitie" | "bestelling" | "offerte";

export interface KlantLog {
  id: string;
  datum: string;
  type: KlantLogType;
  titel: string;
  beschrijving?: string;
  door: string;
}

export interface B2BKlant {
  id: string;
  bedrijfsnaam: string;
  contactpersoon: string;
  email: string;
  telefoon: string;
  adres?: string;
  postcode?: string;
  plaats: string;
  land: string;
  kvk?: string;
  btwNummer?: string;
  merken: MerkId[];
  status: "actief" | "inactief" | "prospect";
  klantSinds: string;
  notities?: string;
  logs: KlantLog[];
  /** Coördinaten voor klantkaart (lat, lng) */
  lat?: number;
  lng?: number;
}

export const MOCK_B2B_KLANTEN: B2BKlant[] = [
  {
    id: "b2b-1",
    bedrijfsnaam: "Lederwaren Van Berg",
    contactpersoon: "Maria van Berg",
    email: "inkoop@lederwarenvanberg.nl",
    telefoon: "020 123 4567",
    adres: "Kalverstraat 12",
    postcode: "1012 NX",
    plaats: "Amsterdam",
    land: "Nederland",
    kvk: "12345678",
    btwNummer: "NL123456789B01",
    merken: ["leather-design", "orange-fire"],
    status: "actief",
    klantSinds: "2022-03-15",
    notities: "Voorkeur voor snelle levering. Tweemaal per jaar collectiebezoek.",
    lat: 52.3676,
    lng: 4.9041,
    logs: [
      { id: "log-1-1", datum: "2026-02-20T10:00:00Z", type: "telefoon", titel: "Bel over voorjaarscollectie", beschrijving: "Maria wil nieuwe Orange Fire-lijn zien. Afspraak showroom 28 feb.", door: "Sanne" },
      { id: "log-1-2", datum: "2026-02-15T14:30:00Z", type: "bestelling", titel: "Bestelling LD-2026-089", beschrijving: "Order 15 stuks Leather Design tassen. Verzonden.", door: "Systeem" },
      { id: "log-1-3", datum: "2026-02-10T09:00:00Z", type: "email", titel: "Offerte aangevraagd", beschrijving: "Vraag om offerte voor bulk Orange Fire laptoptassen. Offerte verstuurd.", door: "Sanne" },
      { id: "log-1-4", datum: "2026-01-22T11:00:00Z", type: "afspraak", titel: "Showroombezoek", beschrijving: "Collectie bekeken. Geïnteresseerd in nieuwe schoudermodellen.", door: "Mark" },
    ],
  },
  {
    id: "b2b-2",
    bedrijfsnaam: "Modehuis De Vries",
    contactpersoon: "Jan de Vries",
    email: "jan@modehuisdevries.be",
    telefoon: "+32 2 123 4567",
    adres: "Rue Neuve 88",
    postcode: "1000",
    plaats: "Brussel",
    land: "België",
    kvk: "BE0123456789",
    merken: ["leather-design", "gaz", "ratpack"],
    status: "actief",
    klantSinds: "2021-08-01",
    notities: "Belgische groothandel. Maandelijkse bestellingen.",
    lat: 50.8503,
    lng: 4.3517,
    logs: [
      { id: "log-2-1", datum: "2026-02-24T16:00:00Z", type: "email", titel: "Vraag levertijd GAZ riemen", beschrijving: "Jan vroeg om levertijd voor 50 stuks. Bevestigd: 5 werkdagen.", door: "Lisa" },
      { id: "log-2-2", datum: "2026-02-18T10:00:00Z", type: "bestelling", titel: "Bestelling RP-2026-036", beschrijving: "Ratpack messengertassen 20 stuks. In verwerking.", door: "Systeem" },
      { id: "log-2-3", datum: "2026-02-05T14:00:00Z", type: "telefoon", titel: "Kwartaaloverleg", beschrijving: "Tevreden over samenwerking. Wil uitbreiden naar meer Leather Design.", door: "Sanne" },
    ],
  },
  {
    id: "b2b-3",
    bedrijfsnaam: "Accessoires Jansen",
    contactpersoon: "Piet Jansen",
    email: "piet@accessoiresjansen.nl",
    telefoon: "030 987 6543",
    adres: "Oudegracht 234",
    postcode: "3511 NR",
    plaats: "Utrecht",
    land: "Nederland",
    merken: ["shelby-brothers", "orange-fire"],
    status: "actief",
    klantSinds: "2023-01-10",
    lat: 52.0907,
    lng: 5.1214,
    logs: [
      { id: "log-3-1", datum: "2026-02-22T09:30:00Z", type: "offerte", titel: "Offerte Shelby Brothers portemonnees", beschrijving: "Offerte voor 100 stuks. Geldig tot 15 maart.", door: "Sanne" },
      { id: "log-3-2", datum: "2026-02-10T11:00:00Z", type: "notitie", titel: "Beursbezoek", beschrijving: "Piet zagen op Modefabriek. Afgesproken follow-up.", door: "Mark" },
    ],
  },
  {
    id: "b2b-4",
    bedrijfsnaam: "Tassen & Co",
    contactpersoon: "Lisa Bakker",
    email: "lisa@tassenco.nl",
    telefoon: "010 555 1234",
    adres: "Coolsingel 42",
    postcode: "3011 AD",
    plaats: "Rotterdam",
    land: "Nederland",
    kvk: "87654321",
    btwNummer: "NL987654321B01",
    merken: ["leather-design", "ratpack", "gaz"],
    status: "actief",
    klantSinds: "2020-11-20",
    notities: "Grootste B2B-klant. Vaste besteldag donderdag.",
    lat: 51.9225,
    lng: 4.4792,
    logs: [
      { id: "log-4-1", datum: "2026-02-25T08:00:00Z", type: "bestelling", titel: "Wekelijkse bestelling", beschrijving: "Standaard order Leather Design + Ratpack. Verwerkt.", door: "Systeem" },
      { id: "log-4-2", datum: "2026-02-20T13:00:00Z", type: "afspraak", titel: "Kwaliteitscheck levering", beschrijving: "Lisa tevreden. Geen klachten over laatste zending.", door: "Sanne" },
      { id: "log-4-3", datum: "2026-02-12T10:00:00Z", type: "telefoon", titel: "Vraag nieuwe GAZ-collectie", beschrijving: "Wil catalogus nieuwe riemen. Per mail verstuurd.", door: "Lisa" },
    ],
  },
  {
    id: "b2b-5",
    bedrijfsnaam: "Groothandel Smit",
    contactpersoon: "Tom Smit",
    email: "tom@groothandelsmit.nl",
    telefoon: "040 777 8899",
    adres: "Stratumsedijk 100",
    postcode: "5611 NA",
    plaats: "Eindhoven",
    land: "Nederland",
    merken: ["orange-fire", "shelby-brothers", "leather-design"],
    status: "actief",
    klantSinds: "2019-05-12",
    lat: 51.4416,
    lng: 5.4697,
    logs: [
      { id: "log-5-1", datum: "2026-02-23T14:00:00Z", type: "email", titel: "Herinnering openstaande factuur", beschrijving: "Vriendelijke herinnering. Tom beloofde betaling deze week.", door: "Mark" },
      { id: "log-5-2", datum: "2026-02-15T09:00:00Z", type: "bestelling", titel: "Grote order Orange Fire", beschrijving: "50 stuks laptoptassen. Verzonden 18 feb.", door: "Systeem" },
    ],
  },
  {
    id: "b2b-6",
    bedrijfsnaam: "Leer & Stijl",
    contactpersoon: "Anna Mulder",
    email: "anna@leerenstijl.de",
    telefoon: "+49 30 123 4567",
    plaats: "Berlijn",
    land: "Duitsland",
    merken: ["leather-design", "gaz"],
    status: "prospect",
    klantSinds: "2024-02-01",
    notities: "Duitse prospect. Eerste offerte verstuurd. Wacht op reactie.",
    lat: 52.52,
    lng: 13.405,
    logs: [
      { id: "log-6-1", datum: "2026-02-22T11:00:00Z", type: "offerte", titel: "Offerte Leather Design + GAZ", beschrijving: "Eerste offerte voor groothandel. Bulkkorting 15%.", door: "Sanne" },
      { id: "log-6-2", datum: "2026-02-18T15:00:00Z", type: "email", titel: "Eerste contact", beschrijving: "Anna reageerde op website. Vraag om catalogus en voorwaarden.", door: "Sanne" },
    ],
  },
];

export function getB2BKlanten(status?: B2BKlant["status"]): B2BKlant[] {
  let list = [...MOCK_B2B_KLANTEN];
  if (status) list = list.filter((k) => k.status === status);
  return list;
}

export function getB2BKlantById(id: string): B2BKlant | undefined {
  return MOCK_B2B_KLANTEN.find((k) => k.id === id);
}

export function getLogTypeLabel(type: KlantLogType): string {
  switch (type) {
    case "telefoon": return "Telefoon";
    case "email": return "E-mail";
    case "afspraak": return "Afspraak";
    case "notitie": return "Notitie";
    case "bestelling": return "Bestelling";
    case "offerte": return "Offerte";
    default: return type;
  }
}
