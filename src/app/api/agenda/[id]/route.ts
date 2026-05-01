import { createClient } from "@/utils/supabase/server";
import { mapDbAgendaItem, type DbAgendaRow } from "@/lib/agenda-shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, context: RouteContext) {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("agenda_items")
    .select("id, titel, datum, start_tijd, eind_tijd, locatie, deelnemers, type, notities")
    .eq("id", context.params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data: mapDbAgendaItem(data as DbAgendaRow) });
}
