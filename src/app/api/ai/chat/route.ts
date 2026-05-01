import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { mapDbOrder, type BestellingStatus, type DbOrderRow } from "@/lib/orders-shared";
import type { TicketStatus } from "@/lib/support-shared";
import type { TaakStatus } from "@/lib/tasks-shared";
import { mapDbProduct, type DbProductRow } from "@/lib/products-shared";
import { getMerkById } from "@/lib/merken";
import type { AIAction, AIChatResponse, AITaskPriority } from "@/lib/ai-actions";

function formatDatum(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function toDateISO(date: Date) {
  return date.toISOString().slice(0, 10);
}

type ContextTicket = {
  id: string;
  onderwerp: string;
  status: string;
  klantNaam: string;
  datum: string;
};

type ContextTask = {
  id: string;
  titel: string;
  status: string;
  toegewezenAan: string;
  deadline: string;
};

type ContextUser = {
  id: string;
  naam: string;
};

function buildPageContext(
  currentPath: string | undefined,
  bestellingen: ReturnType<typeof mapDbOrder>[],
  tickets: ContextTicket[],
  taken: ContextTask[]
): string {
  if (!currentPath || !currentPath.startsWith("/dashboard")) return "";

  const normalized = currentPath.split("?")[0];
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length < 2) return `- Huidige pagina: ${normalized}.\n`;

  const section = parts[1];
  const entityId = parts[2];
  let text = `- Huidige pagina: ${normalized}.\n`;

  if (section === "bestellingen" && entityId) {
    const order = bestellingen.find((item) => item.id === entityId);
    if (order) text += `- Huidige order context: ${order.id}:${order.ordernummer}:${order.status}:${order.klantNaam}.\n`;
  } else if (section === "klantenservice" && entityId) {
    const ticket = tickets.find((item) => item.id === entityId);
    if (ticket) text += `- Huidig ticket context: ${ticket.id}:${ticket.onderwerp}:${ticket.status}:${ticket.klantNaam}.\n`;
  } else if (section === "taken" && entityId) {
    const taak = taken.find((item) => item.id === entityId);
    if (taak) text += `- Huidige taak context: ${taak.id}:${taak.titel}:${taak.status}:${taak.toegewezenAan}.\n`;
  } else {
    text += `- Gebruiker bevindt zich in sectie: ${section}.\n`;
  }

  return text;
}

async function buildContext(currentPath?: string): Promise<string> {
  const supabase = createClient(cookies());
  const [{ data: ordersData }, { data: ticketsData }, { data: tasksData }, { data: usersData }, { data: productsData }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, merk_id, ordernummer, klant_naam, klant_email, totaal, status, datum, regels")
      .order("datum", { ascending: false }),
    supabase
      .from("tickets")
      .select("id, onderwerp, status, klant_naam, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("tasks").select("id, titel, status, toegewezen_aan, deadline").order("deadline", { ascending: true }),
    supabase.from("user_accounts").select("id, naam").order("naam", { ascending: true }),
    supabase
      .from("products")
      .select("id, merk_id, naam, sku, ean, prijs, voorraad, image_url, image_urls, product_url, beschrijving, specificaties"),
  ]);

  const bestellingen = ((ordersData as DbOrderRow[] | null) ?? []).map(mapDbOrder);
  const tickets: ContextTicket[] = (ticketsData ?? []).map((ticket) => ({
    id: ticket.id,
    onderwerp: ticket.onderwerp,
    status: ticket.status,
    klantNaam: ticket.klant_naam,
    datum: ticket.created_at,
  }));
  const taken: ContextTask[] = (tasksData ?? []).map((task) => ({
    id: task.id,
    titel: task.titel,
    status: task.status,
    toegewezenAan: task.toegewezen_aan,
    deadline: task.deadline,
  }));
  const medewerkers: ContextUser[] = (usersData ?? []).map((user) => ({ id: user.id, naam: user.naam }));
  const productCount = ((productsData as DbProductRow[] | null) ?? []).map(mapDbProduct).length;

  const openBestellingen = bestellingen.filter((bestelling) => bestelling.status === "open");
  const openTickets = tickets.filter((ticket) => ticket.status === "open").length;
  const laatsteBestellingen = bestellingen.slice(0, 5);
  const laatsteTickets = tickets.slice(0, 5);
  const takenSnippet = taken.slice(0, 10);
  const todayISO = toDateISO(new Date());
  const ordersVandaag = bestellingen.filter((bestelling) => bestelling.datum.slice(0, 10) === todayISO);
  const ticketsVandaag = tickets.filter((ticket) => ticket.datum.slice(0, 10) === todayISO);
  const takenVandaag = taken.filter((taak) => taak.deadline === todayISO);
  const takenVandaagAfgerond = takenVandaag.filter((taak) => taak.status === "afgerond");

  const fallbackDagrapportage = [
    `Dagrapportage voor ${todayISO}:`,
    `${ordersVandaag.length} nieuwe orders vandaag, ${openBestellingen.length} open orders totaal.`,
    `${ticketsVandaag.length} nieuwe tickets vandaag, ${openTickets} open tickets totaal.`,
    `${takenVandaag.length} taken met deadline vandaag, ${takenVandaagAfgerond.length} afgerond.`,
    "Focus ligt op openstaande orders, tickets en taken die nog aandacht nodig hebben.",
  ].join(" ");

  const navigationOrderRefs = bestellingen
    .slice(0, 12)
    .map((bestelling) => `${bestelling.ordernummer}=>/dashboard/bestellingen/${bestelling.id}`)
    .join("; ");
  const navigationTicketRefs = tickets
    .slice(0, 12)
    .map((ticket) => `${ticket.id}:${ticket.onderwerp}=>/dashboard/klantenservice/${ticket.id}`)
    .join("; ");
  const navigationTaskRefs = takenSnippet
    .slice(0, 10)
    .map((taak) => `${taak.id}:${taak.titel}=>/dashboard/taken/${taak.id}`)
    .join("; ");
  const navigationUserRefs = medewerkers
    .slice(0, 10)
    .map((medewerker) => `${medewerker.naam}=>/dashboard/gebruikers/${medewerker.id}`)
    .join("; ");

  let text = "Actuele gegevens van het Hoofdportaal:\n";
  text += `- Totaal bestellingen: ${bestellingen.length}. Open: ${openBestellingen.length}.\n`;
  text += `- Laatste bestellingen: ${laatsteBestellingen.map((bestelling) => `${bestelling.ordernummer} (${bestelling.status}, ${getMerkById(bestelling.merkId)?.naam ?? bestelling.merkId}, ${formatDatum(bestelling.datum)})`).join("; ")}.\n`;
  text += `- Bestellingen referentie: ${bestellingen.slice(0, 15).map((bestelling) => `${bestelling.id}:${bestelling.ordernummer}:${bestelling.status}:${bestelling.klantNaam}`).join("; ")}.\n`;
  text += `- Klantenservice tickets: ${tickets.length} totaal, ${openTickets} open.\n`;
  text += `- Laatste tickets: ${laatsteTickets.map((ticket) => `"${ticket.onderwerp}" (${ticket.status}, ${ticket.klantNaam})`).join("; ")}.\n`;
  text += `- Tickets referentie: ${tickets.slice(0, 15).map((ticket) => `${ticket.id}:${ticket.onderwerp}:${ticket.status}:${ticket.klantNaam}`).join("; ")}.\n`;
  text += `- Taken referentie: ${takenSnippet.map((taak) => `${taak.id}:${taak.titel}:${taak.status}:${taak.toegewezenAan}`).join("; ")}.\n`;
  text += `- Medewerkers: ${medewerkers.map((medewerker) => medewerker.naam).join("; ")}.\n`;
  text += `- Navigatie referentie bestellingen: ${navigationOrderRefs}.\n`;
  text += `- Navigatie referentie tickets: ${navigationTicketRefs}.\n`;
  text += `- Navigatie referentie taken: ${navigationTaskRefs}.\n`;
  text += `- Navigatie referentie gebruikers: ${navigationUserRefs}.\n`;
  text += `- Aantal producten: ${productCount}.\n`;
  text += `- Dagrapportage vandaag: ${fallbackDagrapportage}\n`;
  text += buildPageContext(currentPath, bestellingen, tickets, taken);
  return text;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseAction(value: unknown): AIAction | undefined {
  if (!isObject(value) || typeof value.type !== "string" || typeof value.summary !== "string") return undefined;

  if (
    value.type === "update_order_status" &&
    typeof value.orderId === "string" &&
    typeof value.orderNumber === "string" &&
    typeof value.newStatus === "string"
  ) {
    return {
      type: "update_order_status",
      orderId: value.orderId,
      orderNumber: value.orderNumber,
      newStatus: value.newStatus as BestellingStatus,
      summary: value.summary,
    };
  }

  if (
    value.type === "update_ticket_status" &&
    typeof value.ticketId === "string" &&
    typeof value.subject === "string" &&
    typeof value.newStatus === "string"
  ) {
    return {
      type: "update_ticket_status",
      ticketId: value.ticketId,
      subject: value.subject,
      newStatus: value.newStatus as TicketStatus,
      summary: value.summary,
    };
  }

  if (
    value.type === "update_task_status" &&
    typeof value.taskId === "string" &&
    typeof value.title === "string" &&
    typeof value.newStatus === "string"
  ) {
    return {
      type: "update_task_status",
      taskId: value.taskId,
      title: value.title,
      newStatus: value.newStatus as TaakStatus,
      summary: value.summary,
    };
  }

  if (
    value.type === "create_task" &&
    typeof value.title === "string" &&
    typeof value.assignedTo === "string" &&
    typeof value.priority === "string" &&
    typeof value.deadline === "string"
  ) {
    return {
      type: "create_task",
      title: value.title,
      assignedTo: value.assignedTo,
      priority: value.priority as AITaskPriority,
      deadline: value.deadline,
      merkId: typeof value.merkId === "string" ? value.merkId : null,
      summary: value.summary,
    };
  }

  if (
    value.type === "add_internal_note" &&
    (value.targetType === "order" || value.targetType === "ticket") &&
    typeof value.targetId === "string" &&
    typeof value.targetLabel === "string" &&
    typeof value.note === "string"
  ) {
    return {
      type: "add_internal_note",
      targetType: value.targetType,
      targetId: value.targetId,
      targetLabel: value.targetLabel,
      note: value.note,
      summary: value.summary,
    };
  }

  if (
    value.type === "navigate" &&
    typeof value.path === "string" &&
    typeof value.label === "string"
  ) {
    return {
      type: "navigate",
      path: value.path,
      label: value.label,
      summary: value.summary,
    };
  }

  return undefined;
}

function tryParseJsonObject(input: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(input) as unknown;
    return isObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function extractJsonObjectCandidate(raw: string): string | null {
  const withoutCodeFence = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const firstBrace = withoutCodeFence.indexOf("{");
  if (firstBrace === -1) return null;

  let depth = 0;
  for (let index = firstBrace; index < withoutCodeFence.length; index += 1) {
    const character = withoutCodeFence[index];
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    if (depth === 0) {
      return withoutCodeFence.slice(firstBrace, index + 1);
    }
  }

  return null;
}

function parseResponse(raw: string): AIChatResponse | null {
  const trimmedRaw = raw.trim();
  const directParsed = tryParseJsonObject(trimmedRaw);
  if (directParsed && typeof directParsed.reply === "string") {
    return {
      reply: directParsed.reply.trim(),
      action: parseAction(directParsed.action),
    };
  }

  const extractedCandidate = extractJsonObjectCandidate(trimmedRaw);
  if (extractedCandidate) {
    const extractedParsed = tryParseJsonObject(extractedCandidate);
    if (extractedParsed && typeof extractedParsed.reply === "string") {
      return {
        reply: extractedParsed.reply.trim(),
        action: parseAction(extractedParsed.action),
      };
    }
  }

  // Fall back to plain text reply so voice/chat keeps working
  if (trimmedRaw.length > 0) {
    return { reply: trimmedRaw, action: undefined };
  }

  return null;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI is niet geconfigureerd. Voeg OPENAI_API_KEY toe." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body.history) ? body.history : [];
    const currentPath = typeof body.currentPath === "string" ? body.currentPath : undefined;
    const channel = body.channel === "voice" ? "voice" : "chat";
    const operatorMode = body.operatorMode === true;

    if (!message) {
      return NextResponse.json({ error: "Bericht is verplicht." }, { status: 400 });
    }

    const context = await buildContext(currentPath);
    const openai = new OpenAI({ apiKey });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: [
          "Je bent de AI-assistent van het Lederwaren Daniëlle Hoofdportaal.",
          "Gebruik alleen feiten uit de context.",
          `Kanaal van de gebruiker: ${channel}.`,
          `Operator mode: ${operatorMode ? "aan" : "uit"}.`,
          "Als de gebruiker vraagt naar de dagrapportage, status van vandaag, of vraagt om deze voor te lezen, geef dan een korte spraakvriendelijke samenvatting in het Nederlands op basis van de context van vandaag.",
          "Als de gebruiker verwijst naar 'deze order', 'dit ticket' of 'deze taak', gebruik dan de huidige pagina-context als die aanwezig is.",
          "Als operator mode aan staat, reageer dan proactiever als een sterke medewerker van het platform: benoem prioriteit, risico of logische vervolgstap kort en concreet.",
          "Je mag naast antwoorden ook precies 1 actie voorstellen als de gebruiker expliciet vraagt om iets uit te voeren en alle informatie daarvoor in de context staat.",
          "Toegestane acties zijn alleen:",
          "- update_order_status",
          "- update_ticket_status",
          "- update_task_status",
          "- create_task",
          "- add_internal_note",
          "- navigate",
          "Gebruik update_task_status voor het wijzigen of afronden van een bestaande taak.",
          "Voor create_task mag je alleen een medewerker gebruiken uit de context en een deadline in formaat YYYY-MM-DD.",
          "Voor add_internal_note mag je alleen targetType order of ticket gebruiken en alleen een doel uit de context of huidige pagina-context.",
          "Voor navigate gebruik je alleen dashboard-paden die bestaan, zoals /dashboard/bestellingen, /dashboard/klantenservice, /dashboard/planning, /dashboard/gebruikers, /dashboard/rapportage, /dashboard/taken of een detailpagina die al in context aanwezig is.",
          "Als informatie ontbreekt, meerdere records mogelijk zijn, of een verwijzing niet eenduidig is, geef dan geen actie terug maar stel eerst precies 1 verduidelijkende vraag in reply.",
          "Ga nooit gokken tussen meerdere mogelijke orders, tickets, taken of gebruikers.",
          "Antwoord ALTIJD als strikte JSON zonder markdown of extra tekst.",
          'Gebruik exact dit formaat: {"reply":"...","action":null}',
          'of {"reply":"...","action":{"type":"update_order_status","orderId":"...","orderNumber":"...","newStatus":"open|te_plukken|gepicked|verpakt|verwerkt|verzonden|afgeleverd","summary":"..."}}',
          'of {"reply":"...","action":{"type":"update_ticket_status","ticketId":"...","subject":"...","newStatus":"open|in_behandeling|wacht_op_klant|opgelost","summary":"..."}}',
          'of {"reply":"...","action":{"type":"update_task_status","taskId":"...","title":"...","newStatus":"open|bezig|afgerond","summary":"..."}}',
          'of {"reply":"...","action":{"type":"create_task","title":"...","assignedTo":"...","priority":"hoog|normaal|laag","deadline":"YYYY-MM-DD","merkId":"orange-fire|shelby-brothers|ratpack|leather-design|gaz" of null,"summary":"..."}}',
          'of {"reply":"...","action":{"type":"add_internal_note","targetType":"order|ticket","targetId":"...","targetLabel":"...","note":"...","summary":"..."}}',
          'of {"reply":"...","action":{"type":"navigate","path":"/dashboard/...","label":"...","summary":"..."}}',
          "Als kanaal voice is, houd reply extra compact en spreekbaar in 1-3 korte zinnen.",
          "Hou reply kort, in het Nederlands en actiegericht.",
        ].join("\n"),
      },
      ...history
        .slice(-8)
        .filter(
          (entry: unknown): entry is { role: "user" | "assistant"; content: string } =>
            isObject(entry) &&
            (entry.role === "user" || entry.role === "assistant") &&
            typeof entry.content === "string"
        )
        .map((entry: { role: "user" | "assistant"; content: string }) => ({
          role: entry.role,
          content: entry.content,
        })),
      {
        role: "user",
        content: `Context:\n${context}\n\nVraag van de gebruiker: ${message}`,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500,
    });

    const rawReply = completion.choices[0]?.message?.content?.trim();
    if (!rawReply) {
      return NextResponse.json({ error: "Geen antwoord van AI." }, { status: 502 });
    }

    const parsed = parseResponse(rawReply);
    if (!parsed?.reply) {
      return NextResponse.json({ error: "AI gaf een ongeldig antwoordformaat terug." }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("OpenAI chat error:", err);
    return NextResponse.json(
      { error: "AI is tijdelijk niet beschikbaar. Probeer het later opnieuw." },
      { status: 500 }
    );
  }
}
