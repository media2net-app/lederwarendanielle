import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

function getWeekStartISO() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return weekStart.toISOString();
}

export async function GET() {
  const supabase = createClient(cookies());
  const todayISO = getTodayISO();
  const weekStartISO = getWeekStartISO();

  const [{ data: ordersData }, { data: ticketsData }, { data: tasksData }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, ordernummer, klant_naam, status, datum")
      .order("datum", { ascending: false }),
    supabase
      .from("tickets")
      .select("id, onderwerp, status, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("id, titel, status, prioriteit, toegewezen_aan, deadline")
      .order("deadline", { ascending: true }),
  ]);

  const orders = ordersData ?? [];
  const tickets = ticketsData ?? [];
  const tasks = tasksData ?? [];

  const bestellingenVandaag = orders.filter((order) => String(order.datum).slice(0, 10) === todayISO).length;
  const bestellingenDezeWeek = orders.filter((order) => new Date(order.datum) >= new Date(weekStartISO)).length;
  const openTickets = tickets.filter((ticket) => ticket.status === "open").length;
  const openTaken = tasks.filter((task) => task.status === "open" || task.status === "bezig").length;

  return NextResponse.json({
    bestellingenVandaag,
    bestellingenDezeWeek,
    openTickets,
    openTaken,
    taken: tasks,
    laatsteOrder: orders[0]
      ? {
          ordernummer: orders[0].ordernummer,
          klantNaam: orders[0].klant_naam,
          status: orders[0].status,
        }
      : null,
    laatsteTicket: tickets[0]
      ? {
          onderwerp: tickets[0].onderwerp,
          status: tickets[0].status,
        }
      : null,
    recenteOrders: orders.slice(0, 5).map((order) => ({
      id: order.id,
      ordernummer: order.ordernummer,
      status: order.status,
    })),
    recenteTickets: tickets.slice(0, 5).map((ticket) => ({
      id: ticket.id,
      onderwerp: ticket.onderwerp,
      status: ticket.status,
    })),
  });
}
