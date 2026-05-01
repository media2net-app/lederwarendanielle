import { createClient } from "@/utils/supabase/server";
import { mapDbPipelineLead, type DbPipelineLeadRow, type PipelineStage } from "@/lib/pipeline-shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage") as PipelineStage | null;

  const supabase = createClient(cookies());
  let query = supabase
    .from("pipeline_leads")
    .select("id, bedrijfsnaam, contactpersoon, email, stage, merk_interesse, notities, datum, potentiele_omzet")
    .order("datum", { ascending: false });

  if (stage) query = query.eq("stage", stage);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: (data as DbPipelineLeadRow[]).map(mapDbPipelineLead) });
}
