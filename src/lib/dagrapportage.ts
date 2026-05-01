import type { BestellingStatus } from "@/lib/orders-shared";
import type { TicketStatus, TicketKanaal } from "@/lib/support-shared";
import type { TaakStatus } from "@/lib/tasks-shared";

export interface DagrapportageGrafiekPunt {
  label: string;
  count: number;
}

export interface DagrapportageCijfers {
  ordersCreatedByStatus: DagrapportageGrafiekPunt[];
  ticketsCreatedByStatus: DagrapportageGrafiekPunt[];
  ticketsCreatedByKanaal: DagrapportageGrafiekPunt[];
  takenDueVandaag: number;
  takenAfgerondVandaag: number;
  openBestellingen: number;
  openTickets: number;
  openTaken: number;
}

export interface Dagrapportage {
  date: string; // YYYY-MM-DD
  generatedAt: string; // ISO
  samenvatting: string;
  cijfers: DagrapportageCijfers;
}

export type DagrapportageTaskStatus = TaakStatus;
export type DagrapportageBestellingStatus = BestellingStatus;
export type DagrapportageTicketStatus = TicketStatus;
export type DagrapportageTicketKanaal = TicketKanaal;

