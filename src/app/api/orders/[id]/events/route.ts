import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, context: RouteContext) {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("order_events")
    .select("id, actor, action, at, metadata")
    .eq("order_id", context.params.id)
    .order("at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => null);
  const actor = String(body?.actor ?? "AI Medewerker").trim();
  const action = String(body?.action ?? "").trim();
  const at = body?.at ? String(body.at) : new Date().toISOString();
  const metadata = typeof body?.metadata === "object" && body?.metadata ? body.metadata : {};

  if (!action) return NextResponse.json({ error: "action is required" }, { status: 400 });

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("order_events")
    .insert({
      order_id: context.params.id,
      actor,
      action,
      at,
      metadata,
    })
    .select("id, actor, action, at, metadata")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
