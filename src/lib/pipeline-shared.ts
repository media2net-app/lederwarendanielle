export type PipelineStage =
  | "nieuw"
  | "contact"
  | "offerte"
  | "onderhandeling"
  | "gewonnen"
  | "verloren";

export interface PipelineLead {
  id: string;
  bedrijfsnaam: string;
  contactpersoon: string;
  email: string;
  stage: PipelineStage;
  merkInteresse: string[];
  notities?: string;
  datum: string;
  potentieleOmzet: number;
}

export interface DbPipelineLeadRow {
  id: string;
  bedrijfsnaam: string;
  contactpersoon: string;
  email: string;
  stage: PipelineStage;
  merk_interesse: unknown;
  notities: string | null;
  datum: string;
  potentiele_omzet: number | string;
}

export const PIPELINE_STAGES: { id: PipelineStage; label: string }[] = [
  { id: "nieuw", label: "Nieuw" },
  { id: "contact", label: "Contact opgenomen" },
  { id: "offerte", label: "Offerte verstuurd" },
  { id: "onderhandeling", label: "Onderhandeling" },
  { id: "gewonnen", label: "Gewonnen" },
  { id: "verloren", label: "Verloren" },
];

function normalizeMerkInteresse(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.map((value) => String(value)).filter(Boolean);
}

export function mapDbPipelineLead(row: DbPipelineLeadRow): PipelineLead {
  return {
    id: row.id,
    bedrijfsnaam: row.bedrijfsnaam,
    contactpersoon: row.contactpersoon,
    email: row.email,
    stage: row.stage,
    merkInteresse: normalizeMerkInteresse(row.merk_interesse),
    notities: row.notities ?? undefined,
    datum: row.datum,
    potentieleOmzet: Number(row.potentiele_omzet),
  };
}
