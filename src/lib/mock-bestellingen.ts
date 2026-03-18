import type { MerkId } from "./merken";

export type BestellingStatus = "open" | "verwerkt" | "verzonden" | "afgeleverd";

export interface Bestelling {
  id: string;
  merkId: MerkId;
  ordernummer: string;
  klantNaam: string;
  klantEmail: string;
  totaal: number;
  status: BestellingStatus;
  datum: string; // ISO date
}

export const MOCK_BESTELLINGEN: Bestelling[] = [
  { id: "1", merkId: "orange-fire", ordernummer: "OF-2024-001", klantNaam: "Jan de Vries", klantEmail: "jan@example.nl", totaal: 189.95, status: "verzonden", datum: "2024-02-20T10:00:00Z" },
  { id: "2", merkId: "leather-design", ordernummer: "LD-2024-042", klantNaam: "Maria van Berg", klantEmail: "maria@example.nl", totaal: 245.00, status: "open", datum: "2024-02-25T09:15:00Z" },
  { id: "3", merkId: "ratpack", ordernummer: "RP-2024-018", klantNaam: "Piet Jansen", klantEmail: "piet@example.nl", totaal: 129.50, status: "verwerkt", datum: "2024-02-24T14:30:00Z" },
  { id: "4", merkId: "gaz", ordernummer: "GZ-2024-003", klantNaam: "Lisa Bakker", klantEmail: "lisa@example.nl", totaal: 89.99, status: "afgeleverd", datum: "2024-02-18T11:00:00Z" },
  { id: "5", merkId: "shelby-brothers", ordernummer: "SB-2024-027", klantNaam: "Tom Smit", klantEmail: "tom@example.nl", totaal: 312.00, status: "open", datum: "2024-02-25T08:00:00Z" },
  { id: "6", merkId: "orange-fire", ordernummer: "OF-2024-002", klantNaam: "Anna Mulder", klantEmail: "anna@example.nl", totaal: 156.00, status: "verzonden", datum: "2024-02-23T16:45:00Z" },
  { id: "7", merkId: "leather-design", ordernummer: "LD-2024-041", klantNaam: "Kees de Boer", klantEmail: "kees@example.nl", totaal: 278.50, status: "verwerkt", datum: "2024-02-22T12:00:00Z" },
  { id: "8", merkId: "orange-fire", ordernummer: "OF-2026-101", klantNaam: "Robin de Groot", klantEmail: "robin@example.nl", totaal: 219.00, status: "verzonden", datum: "2026-02-10T09:00:00Z" },
  { id: "9", merkId: "leather-design", ordernummer: "LD-2026-088", klantNaam: "Sophie van Dam", klantEmail: "sophie@example.nl", totaal: 94.95, status: "open", datum: "2026-02-24T14:00:00Z" },
  { id: "10", merkId: "gaz", ordernummer: "GZ-2026-012", klantNaam: "Luuk Hendriks", klantEmail: "luuk@example.nl", totaal: 149.00, status: "verwerkt", datum: "2026-02-20T11:30:00Z" },
  { id: "11", merkId: "ratpack", ordernummer: "RP-2026-033", klantNaam: "Nina Vink", klantEmail: "nina@example.nl", totaal: 179.95, status: "verzonden", datum: "2026-02-18T16:00:00Z" },
  { id: "12", merkId: "shelby-brothers", ordernummer: "SB-2026-015", klantNaam: "Daan Mulder", klantEmail: "daan@example.nl", totaal: 285.00, status: "open", datum: "2026-02-25T08:45:00Z" },
  { id: "13", merkId: "orange-fire", ordernummer: "OF-2026-102", klantNaam: "Eva Dekker", klantEmail: "eva@example.nl", totaal: 349.90, status: "verzonden", datum: "2026-02-15T10:20:00Z" },
  { id: "14", merkId: "leather-design", ordernummer: "LD-2026-089", klantNaam: "Ruben Visser", klantEmail: "ruben@example.nl", totaal: 129.95, status: "open", datum: "2026-02-25T11:00:00Z" },
  { id: "15", merkId: "ratpack", ordernummer: "RP-2026-034", klantNaam: "Iris de Leeuw", klantEmail: "iris@example.nl", totaal: 199.95, status: "verwerkt", datum: "2026-02-23T09:30:00Z" },
  { id: "16", merkId: "gaz", ordernummer: "GZ-2026-013", klantNaam: "Noah van Dijk", klantEmail: "noah@example.nl", totaal: 67.50, status: "afgeleverd", datum: "2026-02-12T14:00:00Z" },
  { id: "17", merkId: "shelby-brothers", ordernummer: "SB-2026-016", klantNaam: "Femke Jansen", klantEmail: "femke@example.nl", totaal: 412.00, status: "verzonden", datum: "2026-02-20T16:45:00Z" },
  { id: "18", merkId: "orange-fire", ordernummer: "OF-2026-103", klantNaam: "Lars van den Berg", klantEmail: "lars@example.nl", totaal: 178.00, status: "open", datum: "2026-02-25T07:30:00Z" },
  { id: "19", merkId: "leather-design", ordernummer: "LD-2026-090", klantNaam: "Julia Smit", klantEmail: "julia@example.nl", totaal: 279.90, status: "verwerkt", datum: "2026-02-22T13:15:00Z" },
  { id: "20", merkId: "ratpack", ordernummer: "RP-2026-035", klantNaam: "Thijs Bakker", klantEmail: "thijs@example.nl", totaal: 149.95, status: "verzonden", datum: "2026-02-19T11:00:00Z" },
  { id: "21", merkId: "gaz", ordernummer: "GZ-2026-014", klantNaam: "Maud Hendriks", klantEmail: "maud@example.nl", totaal: 95.00, status: "open", datum: "2026-02-24T15:20:00Z" },
  { id: "22", merkId: "shelby-brothers", ordernummer: "SB-2026-017", klantNaam: "Bram de Groot", klantEmail: "bram@example.nl", totaal: 228.00, status: "afgeleverd", datum: "2026-02-10T09:00:00Z" },
  { id: "23", merkId: "orange-fire", ordernummer: "OF-2026-104", klantNaam: "Sara Vermeer", klantEmail: "sara@example.nl", totaal: 265.00, status: "verwerkt", datum: "2026-02-21T10:00:00Z" },
  { id: "24", merkId: "leather-design", ordernummer: "LD-2026-091", klantNaam: "Oscar Mulder", klantEmail: "oscar@example.nl", totaal: 62.95, status: "verzonden", datum: "2026-02-18T12:30:00Z" },
  { id: "25", merkId: "ratpack", ordernummer: "RP-2026-036", klantNaam: "Lotte Vink", klantEmail: "lotte@example.nl", totaal: 189.00, status: "open", datum: "2026-02-25T09:15:00Z" },
  { id: "26", merkId: "gaz", ordernummer: "GZ-2026-015", klantNaam: "Sem de Jong", klantEmail: "sem@example.nl", totaal: 124.00, status: "verwerkt", datum: "2026-02-17T08:45:00Z" },
  { id: "27", merkId: "shelby-brothers", ordernummer: "SB-2026-018", klantNaam: "Roos van Dam", klantEmail: "roos@example.nl", totaal: 356.00, status: "verzonden", datum: "2026-02-14T14:00:00Z" },
  { id: "28", merkId: "orange-fire", ordernummer: "OF-2026-105", klantNaam: "Levi Jansen", klantEmail: "levi@example.nl", totaal: 412.50, status: "afgeleverd", datum: "2026-02-08T16:00:00Z" },
  { id: "29", merkId: "leather-design", ordernummer: "LD-2026-092", klantNaam: "Noor de Boer", klantEmail: "noor@example.nl", totaal: 94.95, status: "open", datum: "2026-02-25T12:00:00Z" },
  { id: "30", merkId: "ratpack", ordernummer: "RP-2026-037", klantNaam: "Finn Visser", klantEmail: "finn@example.nl", totaal: 159.95, status: "verwerkt", datum: "2026-02-23T17:00:00Z" },
];

export function getBestellingen(merkId?: MerkId, status?: BestellingStatus): Bestelling[] {
  let list = [...MOCK_BESTELLINGEN];
  if (merkId) list = list.filter((b) => b.merkId === merkId);
  if (status) list = list.filter((b) => b.status === status);
  return list;
}

export function getBestellingById(id: string): Bestelling | undefined {
  return MOCK_BESTELLINGEN.find((b) => b.id === id);
}

export function getBestellingenVandaag(): number {
  const today = new Date().toISOString().slice(0, 10);
  return MOCK_BESTELLINGEN.filter((b) => b.datum.slice(0, 10) === today).length;
}

export function getBestellingenDezeWeek(): number {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return MOCK_BESTELLINGEN.filter((b) => new Date(b.datum) >= weekStart).length;
}

export function getLaatsteBestellingen(limit: number): Bestelling[] {
  return [...MOCK_BESTELLINGEN]
    .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
    .slice(0, limit);
}
