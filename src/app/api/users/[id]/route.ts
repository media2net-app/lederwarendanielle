import { createClient } from "@/utils/supabase/server";
import { mapDbUser, type DbUserRow } from "@/lib/users-shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, context: RouteContext) {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("user_accounts")
    .select(
      "id, naam, gebruikersnaam, rol, afdeling, email, actief, open_taken, merk_focus, rechten, laatste_login"
    )
    .eq("id", context.params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data: mapDbUser(data as DbUserRow) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const body = await request.json().catch(() => null);
  const update: Record<string, unknown> = {};

  if (typeof body?.naam === "string") update.naam = body.naam.trim();
  if (typeof body?.gebruikersnaam === "string") update.gebruikersnaam = body.gebruikersnaam.trim();
  if (typeof body?.email === "string") update.email = body.email.trim();
  if (typeof body?.rol === "string") update.rol = body.rol.trim();
  if (typeof body?.afdeling === "string") update.afdeling = body.afdeling.trim();
  if (typeof body?.actief === "boolean") update.actief = body.actief;
  if (typeof body?.openTaken === "number") update.open_taken = Math.max(0, body.openTaken);
  if (Array.isArray(body?.merkFocus)) {
    update.merk_focus = body.merkFocus.map((value: unknown) => String(value)).filter(Boolean);
  }
  if (Array.isArray(body?.rechten)) {
    update.rechten = body.rechten.map((value: unknown) => String(value)).filter(Boolean);
  }
  if (typeof body?.laatsteLogin === "string" || body?.laatsteLogin === null) {
    update.laatste_login = body.laatsteLogin;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("user_accounts")
    .update(update)
    .eq("id", context.params.id)
    .select(
      "id, naam, gebruikersnaam, rol, afdeling, email, actief, open_taken, merk_focus, rechten, laatste_login"
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: mapDbUser(data as DbUserRow) });
}
