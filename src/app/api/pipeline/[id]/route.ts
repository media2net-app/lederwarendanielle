import { createClient } from "@/utils/supabase/server";
import { mapDbPipelineLead, type DbPipelineLeadRow, type PipelineStage } from "@/lib/pipeline-shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, context: RouteContext) {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("pipeline_leads")
    .select("id, bedrijfsnaam, contactpersoon, email, stage, merk_interesse, notities, datum, potentiele_omzet")
    .eq("id", context.params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data: mapDbPipelineLead(data as DbPipelineLeadRow) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => null);
  const update: Record<string, unknown> = {};

  if (typeof body?.stage === "string") update.stage = body.stage as PipelineStage;
  if (typeof body?.bedrijfsnaam === "string") update.bedrijfsnaam = body.bedrijfsnaam.trim();
  if (typeof body?.contactpersoon === "string") update.contactpersoon = body.contactpersoon.trim();
  if (typeof body?.email === "string") update.email = body.email.trim();
  if (typeof body?.notities === "string" || body?.notities === null) update.notities = body.notities;
  if (typeof body?.datum === "string") update.datum = body.datum;
  if (Array.isArray(body?.merkInteresse)) {
    update.merk_interesse = body.merkInteresse.map((value: unknown) => String(value)).filter(Boolean);
  }
  if (typeof body?.potentieleOmzet === "number") update.potentiele_omzet = body.potentieleOmzet;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("pipeline_leads")
    .update(update)
    .eq("id", context.params.id)
    .select("id, bedrijfsnaam, contactpersoon, email, stage, merk_interesse, notities, datum, potentiele_omzet")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: mapDbPipelineLead(data as DbPipelineLeadRow) });
}
