import { createClient } from "@/utils/supabase/server";
import { mapDbAgendaItem, type DbAgendaRow } from "@/lib/agenda-shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("agenda_items")
    .select("id, titel, datum, start_tijd, eind_tijd, locatie, deelnemers, type, notities")
    .order("datum", { ascending: true })
    .order("start_tijd", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: ((data as DbAgendaRow[] | null) ?? []).map(mapDbAgendaItem) });
}
