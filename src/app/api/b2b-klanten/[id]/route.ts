import { createClient } from "@/utils/supabase/server";
import { mapDbB2B, mapDbB2BLog, type DbB2BLogRow, type DbB2BRow } from "@/lib/b2b-shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, context: RouteContext) {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("b2b_customers")
    .select(
      "id, bedrijfsnaam, contactpersoon, email, telefoon, adres, postcode, plaats, land, kvk, btw_nummer, merken, status, klant_sinds, notities, lat, lng"
    )
    .eq("id", context.params.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Klant niet gevonden" }, { status: 404 });

  const { data: logsData } = await supabase
    .from("b2b_customer_logs")
    .select("id, klant_id, datum, type, titel, beschrijving, door")
    .eq("klant_id", context.params.id)
    .order("datum", { ascending: false });

  const klant = {
    ...mapDbB2B(data as DbB2BRow),
    logs: ((logsData as DbB2BLogRow[] | null) ?? []).map(mapDbB2BLog),
  };
  return NextResponse.json({ data: klant });
}
