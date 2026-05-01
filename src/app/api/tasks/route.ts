import { createClient } from "@/utils/supabase/server";
import { mapDbTask, type DbTaskRow, type TaakPrioriteit, type TaakStatus } from "@/lib/tasks-shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as TaakStatus | null;

  const supabase = createClient(cookies());
  let query = supabase
    .from("tasks")
    .select("id, titel, status, merk_id, toegewezen_aan, deadline, prioriteit, subtasks")
    .order("deadline", { ascending: true });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: (data as DbTaskRow[]).map(mapDbTask) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const titel = String(body?.titel ?? "").trim();
  const status = String(body?.status ?? "open") as TaakStatus;
  const merkId = body?.merkId ? String(body.merkId) : null;
  const toegewezenAan = String(body?.toegewezenAan ?? "").trim();
  const deadline = String(body?.deadline ?? "").trim();
  const prioriteit = String(body?.prioriteit ?? "normaal") as TaakPrioriteit;
  const subtasks = Array.isArray(body?.subtasks) ? body.subtasks : [];

  if (!titel || !toegewezenAan || !deadline) {
    return NextResponse.json(
      { error: "Required fields: titel, toegewezenAan, deadline" },
      { status: 400 }
    );
  }

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      titel,
      status,
      merk_id: merkId,
      toegewezen_aan: toegewezenAan,
      deadline,
      prioriteit,
      subtasks,
    })
    .select("id, titel, status, merk_id, toegewezen_aan, deadline, prioriteit, subtasks")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: mapDbTask(data as DbTaskRow) }, { status: 201 });
}
