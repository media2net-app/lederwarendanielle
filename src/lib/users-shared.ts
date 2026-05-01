export interface Medewerker {
  id: string;
  naam: string;
  gebruikersnaam: string;
  rol: string;
  afdeling: string;
  email: string;
  actief: boolean;
  openTaken: number;
  merkFocus: string[];
  rechten: string[];
  laatsteLogin?: string;
}

export interface DbUserRow {
  id: string;
  naam: string;
  gebruikersnaam: string;
  rol: string;
  afdeling: string;
  email: string;
  actief: boolean;
  open_taken: number;
  merk_focus: unknown;
  rechten: unknown;
  laatste_login: string | null;
}

function normalizeStringList(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.map((value) => String(value)).filter((value) => value.trim().length > 0);
}

export function mapDbUser(row: DbUserRow): Medewerker {
  return {
    id: row.id,
    naam: row.naam,
    gebruikersnaam: row.gebruikersnaam,
    rol: row.rol,
    afdeling: row.afdeling,
    email: row.email,
    actief: row.actief,
    openTaken: Number(row.open_taken ?? 0),
    merkFocus: normalizeStringList(row.merk_focus),
    rechten: normalizeStringList(row.rechten),
    laatsteLogin: row.laatste_login ?? undefined,
  };
}
