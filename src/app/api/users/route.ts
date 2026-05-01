import { createClient } from "@/utils/supabase/server";
import { mapDbUser, type DbUserRow } from "@/lib/users-shared";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function buildUserId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `u_${crypto.randomUUID()}`;
  }
  return `u_${Date.now()}`;
}

export async function GET() {
  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("user_accounts")
    .select(
      "id, naam, gebruikersnaam, rol, afdeling, email, actief, open_taken, merk_focus, rechten, laatste_login"
    )
    .order("naam", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: (data as DbUserRow[]).map(mapDbUser) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const naam = String(body?.naam ?? "").trim();
  const gebruikersnaam = String(body?.gebruikersnaam ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const rol = String(body?.rol ?? "Medewerker").trim();
  const afdeling = String(body?.afdeling ?? "").trim();
  const actief = Boolean(body?.actief ?? true);
  const openTaken = Number(body?.openTaken ?? 0);
  const merkFocus = Array.isArray(body?.merkFocus)
    ? body.merkFocus.map((value: unknown) => String(value))
    : [];
  const rechten = Array.isArray(body?.rechten)
    ? body.rechten.map((value: unknown) => String(value))
    : [];
  const laatsteLogin = body?.laatsteLogin ? String(body.laatsteLogin) : new Date().toISOString();

  if (!naam || !gebruikersnaam || !email || !afdeling) {
    return NextResponse.json(
      { error: "Required fields: naam, gebruikersnaam, email, afdeling" },
      { status: 400 }
    );
  }

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("user_accounts")
    .insert({
      id: buildUserId(),
      naam,
      gebruikersnaam,
      email,
      rol,
      afdeling,
      actief,
      open_taken: Number.isFinite(openTaken) ? Math.max(0, openTaken) : 0,
      merk_focus: merkFocus,
      rechten,
      laatste_login: laatsteLogin,
    })
    .select(
      "id, naam, gebruikersnaam, rol, afdeling, email, actief, open_taken, merk_focus, rechten, laatste_login"
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: mapDbUser(data as DbUserRow) }, { status: 201 });
}
