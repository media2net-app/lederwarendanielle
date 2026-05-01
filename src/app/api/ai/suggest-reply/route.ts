import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { DbMessageRow, DbTicketRow } from "@/lib/support-shared";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI is niet geconfigureerd." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const ticketId = body.ticketId ?? body.id;
    const supabase = createClient(cookies());
    const { data: ticket, error: ticketError } = ticketId
      ? await supabase
          .from("tickets")
          .select("id, conversation_id, onderwerp, klant_naam, klant_email, kanaal")
          .eq("id", ticketId)
          .single()
      : { data: null, error: null };

    if (!ticket || ticketError) {
      return NextResponse.json({ error: "Ticket niet gevonden." }, { status: 404 });
    }

    const { data: messages } = await supabase
      .from("messages")
      .select("direction, body, created_at")
      .eq("conversation_id", (ticket as DbTicketRow).conversation_id)
      .order("created_at", { ascending: true })
      .limit(50);
    const laatsteBerichten = ((messages ?? []) as DbMessageRow[])
      .slice(-4)
      .map((b) => `${b.direction === "inbound" ? "klant" : "support"}: ${b.body}`)
      .join("\n");
    const openai = new OpenAI({ apiKey });

    const prompt = `Klantenservice ticket. Onderwerp: ${(ticket as DbTicketRow).onderwerp}. Klant: ${(ticket as DbTicketRow).klant_naam} (${(ticket as DbTicketRow).klant_email}). Kanaal: ${(ticket as DbTicketRow).kanaal}.
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
