export type AfspraakType = "vergadering" | "klant" | "leverancier" | "intern" | "overig";

export interface Afspraak {
  id: string;
  titel: string;
  datum: string;
  startTijd: string;
  eindTijd: string;
  locatie?: string;
  deelnemers: string[];
  type: AfspraakType;
  notities?: string;
}

export interface DbAgendaRow {
  id: string;
  titel: string;
  datum: string;
  start_tijd: string;
  eind_tijd: string;
  locatie: string | null;
  deelnemers: unknown;
  type: AfspraakType;
  notities: string | null;
}

export function mapDbAgendaItem(row: DbAgendaRow): Afspraak {
  return {
    id: row.id,
    titel: row.titel,
    datum: row.datum,
    startTijd: row.start_tijd,
    eindTijd: row.eind_tijd,
    locatie: row.locatie ?? undefined,
    deelnemers: Array.isArray(row.deelnemers) ? row.deelnemers.map((value) => String(value)) : [],
    type: row.type,
    notities: row.notities ?? undefined,
  };
}
