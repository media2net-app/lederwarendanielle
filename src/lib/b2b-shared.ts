export type KlantLogType = "telefoon" | "email" | "afspraak" | "notitie" | "bestelling" | "offerte";

export interface KlantLog {
  id: string;
  klantId: string;
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
  merken: string[];
  status: "actief" | "inactief" | "prospect";
  klantSinds: string;
  notities?: string;
  lat?: number;
  lng?: number;
  logs: KlantLog[];
}

export interface DbB2BRow {
  id: string;
  bedrijfsnaam: string;
  contactpersoon: string;
  email: string;
  telefoon: string;
  adres: string | null;
  postcode: string | null;
  plaats: string;
  land: string;
  kvk: string | null;
  btw_nummer: string | null;
  merken: unknown;
  status: "actief" | "inactief" | "prospect";
  klant_sinds: string;
  notities: string | null;
  lat: number | null;
  lng: number | null;
}

export interface DbB2BLogRow {
  id: string;
  klant_id: string;
  datum: string;
  type: KlantLogType;
  titel: string;
  beschrijving: string | null;
  door: string;
}

export function mapDbB2B(row: DbB2BRow): Omit<B2BKlant, "logs"> {
  return {
    id: row.id,
    bedrijfsnaam: row.bedrijfsnaam,
    contactpersoon: row.contactpersoon,
    email: row.email,
    telefoon: row.telefoon,
    adres: row.adres ?? undefined,
    postcode: row.postcode ?? undefined,
    plaats: row.plaats,
    land: row.land,
    kvk: row.kvk ?? undefined,
    btwNummer: row.btw_nummer ?? undefined,
    merken: Array.isArray(row.merken) ? row.merken.map((value) => String(value)) : [],
    status: row.status,
    klantSinds: row.klant_sinds,
    notities: row.notities ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
  };
}

export function mapDbB2BLog(row: DbB2BLogRow): KlantLog {
  return {
    id: row.id,
    klantId: row.klant_id,
    datum: row.datum,
    type: row.type,
    titel: row.titel,
    beschrijving: row.beschrijving ?? undefined,
    door: row.door,
  };
}

export function getLogTypeLabel(type: KlantLogType): string {
  switch (type) {
    case "telefoon":
      return "Telefoon";
    case "email":
      return "E-mail";
    case "afspraak":
      return "Afspraak";
    case "notitie":
      return "Notitie";
    case "bestelling":
      return "Bestelling";
    case "offerte":
      return "Offerte";
    default:
      return type;
  }
}
