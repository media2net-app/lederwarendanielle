import type { MerkId } from "./merken";

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
  merkInteresse: MerkId[];
  notities?: string;
  datum: string;
}

export const PIPELINE_STAGES: { id: PipelineStage; label: string }[] = [
  { id: "nieuw", label: "Nieuw" },
  { id: "contact", label: "Contact opgenomen" },
  { id: "offerte", label: "Offerte verstuurd" },
  { id: "onderhandeling", label: "Onderhandeling" },
  { id: "gewonnen", label: "Gewonnen" },
  { id: "verloren", label: "Verloren" },
];

export const MOCK_PIPELINE_LEADS: PipelineLead[] = [
  { id: "lead-1", bedrijfsnaam: "Leer & Stijl", contactpersoon: "Anna Mulder", email: "anna@leerenstijl.de", stage: "offerte", merkInteresse: ["leather-design", "gaz"], notities: "Vraagt om bulkkorting", datum: "2026-02-20" },
  { id: "lead-2", bedrijfsnaam: "Tassen Direct", contactpersoon: "Kees van Dam", email: "kees@tassendirect.nl", stage: "nieuw", merkInteresse: ["orange-fire", "ratpack"], datum: "2026-02-25" },
  { id: "lead-3", bedrijfsnaam: "Accessoires Groep", contactpersoon: "Sandra de Jong", email: "sandra@accessoiresgroep.nl", stage: "contact", merkInteresse: ["leather-design", "shelby-brothers"], notities: "Bel terug volgende week", datum: "2026-02-23" },
  { id: "lead-4", bedrijfsnaam: "Mode Partners BV", contactpersoon: "Frank Visser", email: "frank@modepartners.nl", stage: "onderhandeling", merkInteresse: ["leather-design", "orange-fire", "gaz"], notities: "Min. orderbespreking", datum: "2026-02-18" },
  { id: "lead-5", bedrijfsnaam: "Lederhuis België", contactpersoon: "Marie Dubois", email: "marie@lederhuis.be", stage: "nieuw", merkInteresse: ["leather-design"], datum: "2026-02-24" },
  { id: "lead-6", bedrijfsnaam: "Retail Collect", contactpersoon: "Paul Jansen", email: "paul@retailcollect.nl", stage: "offerte", merkInteresse: ["ratpack", "shelby-brothers"], datum: "2026-02-22" },
  { id: "lead-7", bedrijfsnaam: "Stijlvolle Zaken", contactpersoon: "Eva Vermeer", email: "eva@stijlvollezaken.nl", stage: "gewonnen", merkInteresse: ["leather-design", "gaz"], datum: "2026-02-10" },
  { id: "lead-8", bedrijfsnaam: "Bags Unlimited", contactpersoon: "Mike Brown", email: "mike@bagsunlimited.co.uk", stage: "verloren", merkInteresse: ["orange-fire"], notities: "Koos voor andere leverancier", datum: "2026-02-12" },
];

export function getPipelineLeads(stage?: PipelineStage): PipelineLead[] {
  let list = [...MOCK_PIPELINE_LEADS];
  if (stage) list = list.filter((l) => l.stage === stage);
  return list;
}

export function getLeadById(id: string): PipelineLead | undefined {
  return MOCK_PIPELINE_LEADS.find((l) => l.id === id);
}
