import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

import type { Dagrapportage } from "@/lib/dagrapportage";
import type { DagrapportageCijfers } from "@/lib/dagrapportage";
import type { BestellingStatus } from "@/lib/orders-shared";
import type { TicketKanaal, TicketStatus } from "@/lib/support-shared";
import type { TaakStatus } from "@/lib/tasks-shared";

function groupCounts<T extends string>(items: T[]): Record<T, number> {
  return items.reduce((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {} as Record<T, number>);
}

function toDateISO(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  try {
    const supabase = createClient(cookies());
    const body = await request.json();
    const dateISO = typeof body?.date === "string" ? body.date : toDateISO(new Date());
    const forceRegenerate = body?.force === true;

    if (!forceRegenerate) {
      const { data: existingReport } = await supabase
        .from("dagrapportages")
        .select("date, generated_at, samenvatting, cijfers")
        .eq("date", dateISO)
        .maybeSingle();

      if (existingReport) {
        const cached: Dagrapportage = {
          date: existingReport.date,
          generatedAt: existingReport.generated_at,
          samenvatting: existingReport.samenvatting,
          cijfers: (existingReport.cijfers ?? {}) as DagrapportageCijfers,
        };
        return NextResponse.json(cached);
      }
    }

    const { data: ordersData } = await supabase
      .from("orders")
      .select("status, datum")
      .order("datum", { ascending: false });
    const orders = ordersData ?? [];
    const ordersOpDatum = orders.filter((order) => String(order.datum).slice(0, 10) === dateISO);
    const ordersByStatus = Object.entries(
      groupCounts(ordersOpDatum.map((o) => o.status as BestellingStatus))
    ).map(([status, count]) => ({
      label: status,
      count,
    }));

    const { data: ticketsData } = await supabase
      .from("tickets")
      .select("status, kanaal, created_at")
      .order("created_at", { ascending: false });
    const tickets = ticketsData ?? [];
    const ticketsOpDatum = tickets.filter((ticket) => String(ticket.created_at).slice(0, 10) === dateISO);
    const ticketsByStatus = Object.entries(
      groupCounts(ticketsOpDatum.map((t) => t.status as TicketStatus))
    ).map(([status, count]) => ({ label: status, count }));
    const ticketsByKanaal = Object.entries(
      groupCounts(ticketsOpDatum.map((t) => t.kanaal as TicketKanaal))
    ).map(([kanaal, count]) => ({ label: kanaal, count }));

    const { data: tasksData } = await supabase.from("tasks").select("status, deadline");
    const taken = tasksData ?? [];
    const takenDueVandaag = taken.filter((t) => String(t.deadline) === dateISO);
    const takenAfgerondVandaag = takenDueVandaag.filter((t) => t.status === "afgerond");

    const openBestellingen = orders.filter((order) => order.status === "open").length;
    const openTickets = tickets.filter((ticket) => ticket.status === "open").length;
    const openTaken = taken.filter(
      (task) => (task.status as TaakStatus) === "open" || (task.status as TaakStatus) === "bezig"
    ).length;

    const cijfers: DagrapportageCijfers = {
      ordersCreatedByStatus: ordersByStatus,
      ticketsCreatedByStatus: ticketsByStatus,
      ticketsCreatedByKanaal: ticketsByKanaal,
      takenDueVandaag: takenDueVandaag.length,
      takenAfgerondVandaag: takenAfgerondVandaag.length,
      openBestellingen,
      openTickets,
      openTaken,
    };

    const fallbackSamenvatting = [
      `Dagrapportage ${dateISO}:`,
      `Er zijn ${ordersOpDatum.length} bestellingen op datum gemaakt; ${openBestellingen} bestellingen staan nog open.`,
      `Tickets op datum: ${ticketsOpDatum.length} (open: ${openTickets}).`,
      `Taken op datum (deadline): ${takenDueVandaag.length} (afgerond: ${takenAfgerondVandaag.length}).`,
      `Kernpunten: check de open status op bestellingen/tickets en let extra op de taken die nog niet afgerond zijn.`,
    ].join(" ");

    let finalSamenvatting = fallbackSamenvatting;

    if (apiKey) {
      const summaryPrompt = [
        "Je bent een rapportage-assistent voor het Lederwaren Daniëlle Hoofdportaal.",
        "Maak een dagrapportage in het Nederlands met een duidelijke structuur.",
        "Gebruik uitsluitend de onderstaande cijfers en formuleer geen extra aannames.",
        "Stijl: zakelijk, kort, en met concrete observaties.",
        "Output: geef alleen tekst (geen JSON) van max 120-150 woorden.",
        "",
        `Datum: ${dateISO}`,
        "",
        `Orders op datum: ${ordersOpDatum.length}`,
        `Orders open (totaal): ${openBestellingen}`,
        `Tickets op datum: ${ticketsOpDatum.length}`,
        `Tickets open (totaal): ${openTickets}`,
        `Taken op datum (deadline): ${takenDueVandaag.length}`,
        `Taken afgerond op datum: ${takenAfgerondVandaag.length}`,
        `Taken open (totaal): ${openTaken}`,
        "",
        "Verdeling orders op status:",
        ordersByStatus.length ? ordersByStatus.map((p) => `- ${p.label}: ${p.count}`).join("\n") : "- (geen)",
        "",
        "Verdeling tickets op status:",
        ticketsByStatus.length ? ticketsByStatus.map((p) => `- ${p.label}: ${p.count}`).join("\n") : "- (geen)",
        "",
        "Verdeling tickets op kanaal:",
        ticketsByKanaal.length ? ticketsByKanaal.map((p) => `- ${p.label}: ${p.count}`).join("\n") : "- (geen)",
      ].join("\n");

      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Je schrijft dagrapportages. Houd het kort, feitelijk en in het Nederlands.",
          },
          { role: "user", content: summaryPrompt },
        ],
        max_tokens: 260,
      });

      const samenvatting = completion.choices[0]?.message?.content?.trim() ?? "";
      finalSamenvatting = samenvatting || fallbackSamenvatting;
    }

    const generatedAt = new Date().toISOString();
    await supabase.from("dagrapportages").upsert({
      date: dateISO,
      generated_at: generatedAt,
      samenvatting: finalSamenvatting,
      cijfers,
    });

    const report: Dagrapportage = {
      date: dateISO,
      generatedAt,
      samenvatting: finalSamenvatting,
      cijfers,
    };

    return NextResponse.json(report);
  } catch (err) {
    console.error("Dagrapportage error:", err);
    // Als AI faalt, geven we i.i.g. nog een rapport terug met fallbacktekst.
    return NextResponse.json(
      {
        date: toDateISO(new Date()),
        generatedAt: new Date().toISOString(),
        samenvatting: "Dagrapportage is niet volledig beschikbaar. Probeer later opnieuw.",
        cijfers: {
          ordersCreatedByStatus: [],
          ticketsCreatedByStatus: [],
          ticketsCreatedByKanaal: [],
          takenDueVandaag: 0,
          takenAfgerondVandaag: 0,
          openBestellingen: 0,
          openTickets: 0,
          openTaken: 0,
        },
      } satisfies Dagrapportage,
      { status: 200 }
    );
  }
}

