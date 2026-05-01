import type { MerkId } from "./merken";
import { MERKEN } from "./merken";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { mapDbOrder, type Bestelling, type DbOrderRow } from "./orders-shared";
import { mapDbTask, type DbTaskRow, type Taak } from "./tasks-shared";
import { mapDbUser, type DbUserRow, type Medewerker } from "./users-shared";
import { mapDbProduct, type DbProductRow } from "./products-shared";

export interface TicketSummary {
  id: string;
  onderwerp: string;
  status: string;
  klantNaam: string;
  datum: string;
  kanaal: string;
  merkId: string;
}

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

export interface DashboardDbData {
  bestellingen: Bestelling[];
  tickets: TicketSummary[];
  taken: Taak[];
  medewerkers: Medewerker[];
  productenAantal: number;
  merkStats: MerkStatistiek[];
  omzetMaand: number;
  doelMaand: number;
}

const DOELEN_PER_MERK: Record<MerkId, number> = {
  "orange-fire": 12500,
  "shelby-brothers": 8000,
  ratpack: 6000,
  "leather-design": 15000,
  gaz: 4500,
};

function getStartOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function getEndOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function getDashboardDbData(): Promise<DashboardDbData> {
  const supabase = createClient(cookies());
  const [{ data: ordersData }, { data: ticketsData }, { data: tasksData }, { data: usersData }, { data: productsData }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id, merk_id, ordernummer, klant_naam, klant_email, totaal, status, datum, regels")
        .order("datum", { ascending: false }),
      supabase
        .from("tickets")
        .select("id, onderwerp, status, klant_naam, kanaal, merk_id, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("tasks")
        .select("id, titel, status, merk_id, toegewezen_aan, deadline, prioriteit, subtasks")
        .order("deadline", { ascending: true }),
      supabase
        .from("user_accounts")
        .select("id, naam, gebruikersnaam, rol, afdeling, email, actief, open_taken, merk_focus, rechten, laatste_login")
        .order("naam", { ascending: true }),
      supabase
        .from("products")
        .select("id, merk_id, naam, sku, ean, prijs, voorraad, image_url, image_urls, product_url, beschrijving, specificaties"),
    ]);

  const bestellingen = ((ordersData as DbOrderRow[] | null) ?? []).map(mapDbOrder);
  const tickets: TicketSummary[] = (ticketsData ?? []).map((ticket) => ({
    id: ticket.id,
    onderwerp: ticket.onderwerp,
    status: ticket.status,
    klantNaam: ticket.klant_naam,
    datum: ticket.created_at,
    kanaal: ticket.kanaal,
    merkId: ticket.merk_id,
  }));
  const taken = ((tasksData as DbTaskRow[] | null) ?? []).map(mapDbTask);
  const medewerkers = ((usersData as DbUserRow[] | null) ?? []).map(mapDbUser);

  const producten = ((productsData as DbProductRow[] | null) ?? []).map(mapDbProduct);
  const productenPerMerk = producten.reduce(
    (acc, product) => {
      acc[product.merkId] = (acc[product.merkId] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const now = new Date();
  const startMaand = getStartOfMonth(now);
  const eindeMaand = getEndOfMonth(now);
  const dagenInMaand = eindeMaand.getDate();
  const verstrekenDagen = now.getDate();
  const resterendeDagen = Math.max(1, dagenInMaand - verstrekenDagen);

  const merkStats: MerkStatistiek[] = MERKEN.map((merk) => {
    const bestellingenMaand = bestellingen.filter(
      (bestelling) =>
        bestelling.merkId === merk.id &&
        new Date(bestelling.datum) >= startMaand &&
        new Date(bestelling.datum) <= eindeMaand
    );
    const omzetMaand = bestellingenMaand.reduce((sum, bestelling) => sum + bestelling.totaal, 0);
    const doelMaand = DOELEN_PER_MERK[merk.id] ?? 10000;
    const procentBereikt = doelMaand > 0 ? Math.round((omzetMaand / doelMaand) * 100) : 0;
    const gemiddeldPerDag = verstrekenDagen > 0 ? omzetMaand / verstrekenDagen : 0;
    const prognoseEindeMaand = omzetMaand + gemiddeldPerDag * resterendeDagen;
    const prognoseBehaald = prognoseEindeMaand >= doelMaand;
    const openTickets = tickets.filter(
      (ticket) => ticket.merkId === merk.id && ticket.status === "open"
    ).length;
    const productenAantal = productenPerMerk[merk.id] ?? 0;

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

  const omzetMaand = bestellingen
    .filter((bestelling) => new Date(bestelling.datum) >= startMaand && new Date(bestelling.datum) <= eindeMaand)
    .reduce((sum, bestelling) => sum + bestelling.totaal, 0);
  const doelMaand = Object.values(DOELEN_PER_MERK).reduce((sum, value) => sum + value, 0);

  return {
    bestellingen,
    tickets,
    taken,
    medewerkers,
    productenAantal: producten.length,
    merkStats,
    omzetMaand,
    doelMaand,
  };
}
