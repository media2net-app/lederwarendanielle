import { createClient } from "@/utils/supabase/server";
import { mapDbOrder, type BestellingStatus, type DbOrderRow } from "@/lib/orders-shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, context: RouteContext) {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("orders")
    .select("id, merk_id, ordernummer, klant_naam, klant_email, totaal, status, datum, regels")
    .eq("id", context.params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data: mapDbOrder(data as DbOrderRow) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => null);
  const status = body?.status as BestellingStatus | undefined;
  if (!status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", context.params.id)
    .select("id, merk_id, ordernummer, klant_naam, klant_email, totaal, status, datum, regels")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: mapDbOrder(data as DbOrderRow) });
}
