import { createClient } from "@/utils/supabase/server";
import { mapDbOrder, type BestellingStatus, type DbOrderRow } from "@/lib/orders-shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const merkId = searchParams.get("merkId");
  const status = searchParams.get("status") as BestellingStatus | null;

  const supabase = createClient(cookies());
  let query = supabase
    .from("orders")
    .select("id, merk_id, ordernummer, klant_naam, klant_email, totaal, status, datum, regels")
    .order("datum", { ascending: false });

  if (merkId) query = query.eq("merk_id", merkId);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const mapped = (data as DbOrderRow[]).map(mapDbOrder);
  return NextResponse.json({ data: mapped });
}
