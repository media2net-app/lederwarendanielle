export type BestellingStatus =
  | "open"
  | "te_plukken"
  | "gepicked"
  | "verpakt"
  | "verwerkt"
  | "verzonden"
  | "afgeleverd";

export interface BestellingRegel {
  productId: string;
  ean: string;
  sku: string;
  naam: string;
  aantal: number;
  eenheidsprijs: number;
  gepicked?: boolean;
}

export interface Bestelling {
  id: string;
  merkId: string;
  ordernummer: string;
  klantNaam: string;
  klantEmail: string;
  totaal: number;
  status: BestellingStatus;
  datum: string;
  regels: BestellingRegel[];
}

export interface DbOrderRow {
  id: string;
  merk_id: string;
  ordernummer: string;
  klant_naam: string;
  klant_email: string;
  totaal: number | string;
  status: BestellingStatus;
  datum: string;
  regels: unknown;
}

function normalizeRegel(regel: unknown, index: number): BestellingRegel {
  const source = (regel ?? {}) as Partial<BestellingRegel>;
  const productId = source.productId || `regel-${index + 1}`;
  const sku = source.sku || productId;
  return {
    productId,
    sku,
    ean: source.ean || sku,
    naam: source.naam || productId,
    aantal: Number(source.aantal ?? 1),
    eenheidsprijs: Number(source.eenheidsprijs ?? 0),
    gepicked: Boolean(source.gepicked),
  };
}

export function mapDbOrder(row: DbOrderRow): Bestelling {
  const rawRegels = Array.isArray(row.regels) ? row.regels : [];
  return {
    id: row.id,
    merkId: row.merk_id,
    ordernummer: row.ordernummer,
    klantNaam: row.klant_naam,
    klantEmail: row.klant_email,
    totaal: Number(row.totaal),
    status: row.status,
    datum: row.datum,
    regels: rawRegels.map((regel, index) => normalizeRegel(regel, index)),
  };
}
