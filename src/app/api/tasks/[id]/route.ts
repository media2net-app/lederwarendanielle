import { createClient } from "@/utils/supabase/server";
import { mapDbTask, type DbTaskRow, type TaakStatus } from "@/lib/tasks-shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, context: RouteContext) {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("tasks")
    .select("id, titel, status, merk_id, toegewezen_aan, deadline, prioriteit, subtasks")
    .eq("id", context.params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data: mapDbTask(data as DbTaskRow) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => null);
  const update: Record<string, unknown> = {};

  if (body?.status) update.status = body.status as TaakStatus;
  if (typeof body?.titel === "string") update.titel = body.titel.trim();
  if (typeof body?.deadline === "string") update.deadline = body.deadline;
  if (typeof body?.prioriteit === "string") update.prioriteit = body.prioriteit;
  if (typeof body?.toegewezenAan === "string") update.toegewezen_aan = body.toegewezenAan.trim();
  if ("merkId" in (body ?? {})) update.merk_id = body?.merkId ?? null;
  if (Array.isArray(body?.subtasks)) update.subtasks = body.subtasks;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("tasks")
    .update(update)
    .eq("id", context.params.id)
    .select("id, titel, status, merk_id, toegewezen_aan, deadline, prioriteit, subtasks")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: mapDbTask(data as DbTaskRow) });
}
