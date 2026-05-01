import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";
import { mapDbOrder, type DbOrderRow } from "@/lib/orders-shared";
import { cookies } from "next/headers";
import { getMerkById } from "@/lib/merken";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI is niet geconfigureerd." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const bestellingId = body.bestellingId ?? body.id;
    const supabase = createClient(cookies());
    const { data } = bestellingId
      ? await supabase
          .from("orders")
          .select("id, merk_id, ordernummer, klant_naam, klant_email, totaal, status, datum, regels")
          .eq("id", bestellingId)
          .maybeSingle()
      : { data: null };
    const bestelling = data ? mapDbOrder(data as DbOrderRow) : null;

    if (!bestelling) {
      return NextResponse.json({ error: "Bestelling niet gevonden." }, { status: 404 });
    }

    const merk = getMerkById(bestelling.merkId);
    const openai = new OpenAI({ apiKey });
    const totaalStr = bestelling.totaal.toFixed(2);

    const prompt =
      "Bestelling: " +
      bestelling.ordernummer +
      ". Merk: " +
      (merk?.naam ?? bestelling.merkId) +
      ". Klant: " +
      bestelling.klantNaam +
      ". Totaal: €" +
      totaalStr +
      ". Huidige status: " +
      bestelling.status +
      ". Geef één korte suggestie voor de volgende actie of status (max 2 zinnen, Nederlands).";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });

    const suggestion = completion.choices[0]?.message?.content?.trim();
    if (!suggestion) {
      return NextResponse.json({ error: "Geen suggestie ontvangen." }, { status: 502 });
    }

    return NextResponse.json({ suggestion });
  } catch (err) {
    console.error("OpenAI suggest-order error:", err);
    return NextResponse.json(
      { error: "AI is tijdelijk niet beschikbaar." },
      { status: 500 }
    );
  }
}
