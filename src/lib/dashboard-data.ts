import type { MerkId } from "./merken";
import { MERKEN } from "./merken";
import { MOCK_BESTELLINGEN } from "./mock-bestellingen";
import { MOCK_KLANTENSERVICE } from "./mock-klantenservice";

export interface MerkStatistiek {
  merkId: MerkId;
  merkNaam: string;
  omzetMaand: number;
  doelMaand: number;
  procentBereikt: number;
  prognoseBehaald: boolean;
  bestellingenMaand: number;
  openTickets: number;
  productenAantal: number;
}

/** Maandelijkse omzetdoelen per merk (demo) */
const DOELEN_PER_MERK: Record<MerkId, number> = {
  "orange-fire": 12500,
  "shelby-brothers": 8000,
  "ratpack": 6000,
  "leather-design": 15000,
  "gaz": 4500,
};

function getStartOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function getEndOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

/** Omzet en doel per merk voor huidige maand; prognose = of we op schema liggen (simpele lineaire extrapolatie). productenPerMerk alleen op server (bijv. uit producten-store) om fs uit client-bundle te houden. */
export function getMerkStatistieken(productenPerMerk?: Partial<Record<MerkId, number>>): MerkStatistiek[] {
  const now = new Date();
  const startMaand = getStartOfMonth(now);
  const eindeMaand = getEndOfMonth(now);
  const dagenInMaand = eindeMaand.getDate();
  const verstrekenDagen = now.getDate();
  const resterendeDagen = Math.max(1, dagenInMaand - verstrekenDagen);

  return MERKEN.map((merk) => {
    const bestellingenMaand = MOCK_BESTELLINGEN.filter(
      (b) => b.merkId === merk.id && new Date(b.datum) >= startMaand && new Date(b.datum) <= eindeMaand
    );
    const omzetMaand = bestellingenMaand.reduce((sum, b) => sum + b.totaal, 0);
    const doelMaand = DOELEN_PER_MERK[merk.id] ?? 10000;
    const procentBereikt = doelMaand > 0 ? Math.round((omzetMaand / doelMaand) * 100) : 0;
    const gemiddeldPerDag = verstrekenDagen > 0 ? omzetMaand / verstrekenDagen : 0;
    const prognoseEindeMaand = omzetMaand + gemiddeldPerDag * resterendeDagen;
    const prognoseBehaald = prognoseEindeMaand >= doelMaand;

    const openTickets = MOCK_KLANTENSERVICE.filter(
      (t) => t.merkId === merk.id && t.status === "open"
    ).length;

    const productenAantal = productenPerMerk?.[merk.id] ?? 0;

    return {
      merkId: merk.id,
      merkNaam: merk.naam,
      omzetMaand,
      doelMaand,
      procentBereikt,
      prognoseBehaald,
      bestellingenMaand: bestellingenMaand.length,
      openTickets,
      productenAantal,
    };
  });
}

export type TaakStatus = "open" | "bezig" | "afgerond";

export interface Taak {
  id: string;
  titel: string;
  status: TaakStatus;
  merkId: MerkId | null;
  toegewezenAan: string;
  deadline: string;
  prioriteit: "hoog" | "normaal" | "laag";
}

export const MOCK_TAKEN: Taak[] = [
  { id: "taak-1", titel: "Bestelling OF-2024-002 verpakken", status: "open", merkId: "orange-fire", toegewezenAan: "Sanne", deadline: "2024-02-26", prioriteit: "hoog" },
  { id: "taak-2", titel: "Retour Maria van Berg verwerken", status: "bezig", merkId: "leather-design", toegewezenAan: "Lisa", deadline: "2024-02-27", prioriteit: "normaal" },
  { id: "taak-3", titel: "Voorraad Leather Design bijwerken", status: "open", merkId: "leather-design", toegewezenAan: "Mark", deadline: "2024-02-28", prioriteit: "normaal" },
  { id: "taak-4", titel: "Ticket GZ voorraadvraag afhandelen", status: "open", merkId: "gaz", toegewezenAan: "Lisa", deadline: "2024-02-25", prioriteit: "hoog" },
  { id: "taak-5", titel: "Nieuwe collectie foto's uploaden", status: "afgerond", merkId: null, toegewezenAan: "Sanne", deadline: "2024-02-24", prioriteit: "laag" },
  { id: "taak-6", titel: "Facturatie week 8 controleren", status: "open", merkId: null, toegewezenAan: "Mark", deadline: "2024-03-01", prioriteit: "normaal" },
  { id: "taak-7", titel: "Offerte bulkbestelling Nina Vink opstellen", status: "open", merkId: "ratpack", toegewezenAan: "Sanne", deadline: "2026-02-26", prioriteit: "hoog" },
  { id: "taak-8", titel: "Verkeerd artikel Robin de Groot – vervanging versturen", status: "bezig", merkId: "orange-fire", toegewezenAan: "Mark", deadline: "2026-02-25", prioriteit: "hoog" },
  { id: "taak-9", titel: "Gravering SB-2026-015 doorgeven aan productie", status: "open", merkId: "shelby-brothers", toegewezenAan: "Sanne", deadline: "2026-02-27", prioriteit: "normaal" },
  { id: "taak-10", titel: "Notificatielijst Doctor's bag bijwerken", status: "open", merkId: "leather-design", toegewezenAan: "Lisa", deadline: "2026-02-26", prioriteit: "laag" },
  { id: "taak-11", titel: "Weekcijfers omzet per merk rapporteren", status: "afgerond", merkId: null, toegewezenAan: "Mark", deadline: "2026-02-24", prioriteit: "normaal" },
];

export function getTaken(status?: TaakStatus): Taak[] {
  let list = [...MOCK_TAKEN];
  if (status) list = list.filter((t) => t.status === status);
  return list;
}

export function getTaakById(id: string): Taak | undefined {
  return MOCK_TAKEN.find((t) => t.id === id);
}

export function getOpenTakenCount(): number {
  return MOCK_TAKEN.filter((t) => t.status === "open" || t.status === "bezig").length;
}

export function getTakenDezeWeekAfgerond(): number {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return MOCK_TAKEN.filter(
    (t) => t.status === "afgerond" && new Date(t.deadline) >= weekStart
  ).length;
}

export interface Medewerker {
  id: string;
  naam: string;
  rol: string;
  email: string;
  actief: boolean;
  openTaken: number;
  merkFocus: string[];
}

export const MOCK_MEDEWERKERS: Medewerker[] = [
  { id: "m1", naam: "Sanne de Jong", rol: "Logistiek & Verkoop", email: "sanne@lederwaren-danielle.nl", actief: true, openTaken: 2, merkFocus: ["Orange Fire", "Leather Design"] },
  { id: "m2", naam: "Lisa Bakker", rol: "Klantenservice", email: "lisa@lederwaren-danielle.nl", actief: true, openTaken: 2, merkFocus: ["Leather Design", "GAZ"] },
  { id: "m3", naam: "Mark Visser", rol: "Operations & Voorraad", email: "mark@lederwaren-danielle.nl", actief: true, openTaken: 2, merkFocus: ["Leather Design", "Ratpack"] },
  { id: "m4", naam: "Emma Jansen", rol: "Marketing", email: "emma@lederwaren-danielle.nl", actief: false, openTaken: 0, merkFocus: [] },
];

export function getMedewerkers(): Medewerker[] {
  return [...MOCK_MEDEWERKERS];
}

export function getTotaalOmzetDezeMaand(): number {
  const now = new Date();
  const startMaand = getStartOfMonth(now);
  const eindeMaand = getEndOfMonth(now);
  return MOCK_BESTELLINGEN.filter(
    (b) => new Date(b.datum) >= startMaand && new Date(b.datum) <= eindeMaand
  ).reduce((sum, b) => sum + b.totaal, 0);
}

export function getTotaalDoelDezeMaand(): number {
  return Object.values(DOELEN_PER_MERK).reduce((a, b) => a + b, 0);
}

export interface Afspraak {
  id: string;
  titel: string;
  datum: string;
  startTijd: string;
  eindTijd: string;
  locatie?: string;
  deelnemers: string[];
  type: "vergadering" | "klant" | "leverancier" | "intern" | "overig";
  notities?: string;
}

export const MOCK_AFSPRAKEN: Afspraak[] = [
  { id: "a1", titel: "Teamoverleg wekelijkse planning", datum: "2026-02-26", startTijd: "09:00", eindTijd: "10:00", deelnemers: ["Sanne", "Lisa", "Mark"], type: "vergadering", locatie: "Kantoor Zuidwolde" },
  { id: "a2", titel: "Leverancier Leather Design – nieuwe collectie", datum: "2026-02-26", startTijd: "14:00", eindTijd: "15:30", deelnemers: ["Mark", "Sanne"], type: "leverancier", locatie: "Showroom" },
  { id: "a3", titel: "Klantgesprek groothandel België", datum: "2026-02-27", startTijd: "11:00", eindTijd: "12:00", deelnemers: ["Sanne"], type: "klant", notities: "Offerte Orange Fire collectie" },
  { id: "a4", titel: "Voorraadtelling magazijn", datum: "2026-02-28", startTijd: "08:00", eindTijd: "12:00", deelnemers: ["Mark"], type: "intern" },
  { id: "a5", titel: "Fotosessie nieuwe producten", datum: "2026-03-03", startTijd: "10:00", eindTijd: "16:00", deelnemers: ["Sanne", "Emma"], type: "intern", locatie: "Studio" },
  { id: "a6", titel: "B2B-offerte bespreken Nina Vink", datum: "2026-02-26", startTijd: "11:00", eindTijd: "11:30", deelnemers: ["Sanne"], type: "klant", notities: "50x Ratpack messengertassen" },
  { id: "a7", titel: "Retour verwerken – Robin de Groot", datum: "2026-02-25", startTijd: "13:00", eindTijd: "14:00", deelnemers: ["Mark"], type: "intern" },
  { id: "a8", titel: "Kwartaalreview omzet merken", datum: "2026-03-05", startTijd: "09:00", eindTijd: "10:30", deelnemers: ["Sanne", "Lisa", "Mark"], type: "vergadering", locatie: "Kantoor Zuidwolde" },
];

export function getAfspraken(vanafDatum?: string, totDatum?: string): Afspraak[] {
  let list = [...MOCK_AFSPRAKEN];
  if (vanafDatum) list = list.filter((a) => a.datum >= vanafDatum);
  if (totDatum) list = list.filter((a) => a.datum <= totDatum);
  return list.sort((a, b) => (a.datum + a.startTijd).localeCompare(b.datum + b.startTijd));
}

export function getAfspraakById(id: string): Afspraak | undefined {
  return MOCK_AFSPRAKEN.find((a) => a.id === id);
}
