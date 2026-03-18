import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getTicketById } from "@/lib/mock-klantenservice";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI is niet geconfigureerd." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const ticketId = body.ticketId ?? body.id;
    const ticket = ticketId ? getTicketById(ticketId) : null;

    if (!ticket) {
      return NextResponse.json({ error: "Ticket niet gevonden." }, { status: 404 });
    }

    const laatsteBerichten = ticket.berichten.slice(-4).map((b) => `${b.afzender}: ${b.tekst}`).join("\n");
    const openai = new OpenAI({ apiKey });

    const prompt = `Klantenservice ticket. Onderwerp: ${ticket.onderwerp}. Klant: ${ticket.klantNaam} (${ticket.klantEmail}). Kanaal: ${ticket.kanaal}.
Laatste berichten:\n${laatsteBerichten}

Schrijf een kort, professioneel antwoord namens support (1-4 zinnen, Nederlands, vriendelijk en oplossingsgericht). Geen aanhef of handtekening.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    const suggestion = completion.choices[0]?.message?.content?.trim();
    if (!suggestion) {
      return NextResponse.json({ error: "Geen suggestie ontvangen." }, { status: 502 });
    }

    return NextResponse.json({ suggestion });
  } catch (err) {
    console.error("OpenAI suggest-reply error:", err);
    return NextResponse.json(
      { error: "AI is tijdelijk niet beschikbaar." },
      { status: 500 }
    );
  }
}
