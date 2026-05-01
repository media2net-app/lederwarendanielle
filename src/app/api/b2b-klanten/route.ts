import { createClient } from "@/utils/supabase/server";
import { mapDbB2B, type B2BKlant, type DbB2BLogRow, type DbB2BRow } from "@/lib/b2b-shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const supabase = createClient(cookies());

  let query = supabase
    .from("b2b_customers")
    .select(
      "id, bedrijfsnaam, contactpersoon, email, telefoon, adres, postcode, plaats, land, kvk, btw_nummer, merken, status, klant_sinds, notities, lat, lng"
    )
    .order("bedrijfsnaam", { ascending: true });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const klantenBase = ((data as DbB2BRow[] | null) ?? []).map((row) => ({ ...mapDbB2B(row), logs: [] }));
  if (klantenBase.length === 0) return NextResponse.json({ data: [] });

  const ids = klantenBase.map((klant) => klant.id);
  const { data: logsData } = await supabase
    .from("b2b_customer_logs")
    .select("id, klant_id, datum, type, titel, beschrijving, door")
    .in("klant_id", ids)
    .order("datum", { ascending: false });

  const logsByKlant = new Map<string, B2BKlant["logs"]>();
  ((logsData as DbB2BLogRow[] | null) ?? []).forEach((log) => {
    const list = logsByKlant.get(log.klant_id) ?? [];
    list.push({
      id: log.id,
      klantId: log.klant_id,
      datum: log.datum,
      type: log.type,
      titel: log.titel,
      beschrijving: log.beschrijving ?? undefined,
      door: log.door,
    });
    logsByKlant.set(log.klant_id, list);
  });

  const klanten = klantenBase.map((klant) => ({ ...klant, logs: logsByKlant.get(klant.id) ?? [] }));
  return NextResponse.json({ data: klanten });
}
