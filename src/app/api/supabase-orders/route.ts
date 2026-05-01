import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("orders")
    .select("id, ordernummer, klant_naam, klant_email, totaal, status, datum")
    .order("datum", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const klantNaam = String(body?.klant_naam ?? "").trim();
  const klantEmail = String(body?.klant_email ?? "").trim();
  const totaal = Number(body?.totaal ?? 0);
  const merkId = String(body?.merk_id ?? "leather-design");

  if (!klantNaam || !klantEmail || Number.isNaN(totaal)) {
    return NextResponse.json(
      { error: "Invalid payload. Required: klant_naam, klant_email, totaal" },
      { status: 400 }
    );
  }

  const supabase = createClient(cookies());
  const ordernummer = `API-${Date.now()}`;
  const { data, error } = await supabase
    .from("orders")
    .insert({
      ordernummer,
      merk_id: merkId,
      klant_naam: klantNaam,
      klant_email: klantEmail,
      totaal,
      status: "open",
      regels: [],
    })
    .select("id, ordernummer, klant_naam, klant_email, totaal, status, datum")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
