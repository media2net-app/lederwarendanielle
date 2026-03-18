import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getBestellingen, getLaatsteBestellingen } from "@/lib/mock-bestellingen";
import { getKlantenserviceTickets, getOpenTicketsCount, getLaatsteTickets } from "@/lib/mock-klantenservice";
import { getMerkById } from "@/lib/merken";
import { MOCK_PRODUCTEN } from "@/lib/mock-producten";

function formatDatum(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function buildContext(): string {
  const bestellingen = getBestellingen();
  const openBestellingen = bestellingen.filter((b) => b.status === "open");
  const laatsteBestellingen = getLaatsteBestellingen(5);
  const tickets = getKlantenserviceTickets();
  const openTickets = getOpenTicketsCount();
  const laatsteTickets = getLaatsteTickets(5);
  const productCount = MOCK_PRODUCTEN.length;

  let text = `Actuele gegevens van het Hoofdportaal:\n`;
  text += `- Totaal bestellingen: ${bestellingen.length}. Open: ${openBestellingen.length}.\n`;
  text += `- Laatste bestellingen: ${laatsteBestellingen.map((b) => `${b.ordernummer} (${b.status}, ${getMerkById(b.merkId)?.naam ?? b.merkId}, ${formatDatum(b.datum)})`).join("; ")}.\n`;
  text += `- Klantenservice tickets: ${tickets.length} totaal, ${openTickets} open.\n`;
  text += `- Laatste tickets: ${laatsteTickets.map((t) => `"${t.onderwerp}" (${t.status}, ${t.klantNaam})`).join("; ")}.\n`;
  text += `- Aantal producten: ${productCount}.\n`;
  return text;
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

    if (!message) {
      return NextResponse.json({ error: "Bericht is verplicht." }, { status: 400 });
    }

    const context = buildContext();
    const openai = new OpenAI({ apiKey });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `Je bent de AI-assistent van het Lederwaren Daniëlle Hoofdportaal. Gebruik onderstaande actuele gegevens om vragen over bestellingen, klantenservice, statussen en overzichten te beantwoorden. Antwoord kort en in het Nederlands. Gebruik alleen feiten uit de context. Als je iets niet weet, zeg dat. Geen beleefdheidszinnen overschieten.`,
      },
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

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json({ error: "Geen antwoord van AI." }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("OpenAI chat error:", err);
    return NextResponse.json(
      { error: "AI is tijdelijk niet beschikbaar. Probeer het later opnieuw." },
      { status: 500 }
    );
  }
}
