import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { mapDbProduct, type DbProductRow } from "@/lib/products-shared";
import { cookies } from "next/headers";
import { MERKEN } from "@/lib/merken";

export async function GET(request: Request) {
  try {
    const supabase = createClient(cookies());
    const { searchParams } = new URL(request.url);
    const ean = searchParams.get("ean");
    if (ean) {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, merk_id, naam, sku, ean, prijs, voorraad, image_url, image_urls, product_url, beschrijving, specificaties"
        )
        .eq("ean", ean)
        .maybeSingle();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (!data) return NextResponse.json({ error: "Product niet gevonden" }, { status: 404 });
      return NextResponse.json(mapDbProduct(data as DbProductRow));
    }
    const merkId = searchParams.get("merkId") ?? undefined;
    let query = supabase
      .from("products")
      .select(
        "id, merk_id, naam, sku, ean, prijs, voorraad, image_url, image_urls, product_url, beschrijving, specificaties"
      )
      .order("naam", { ascending: true });
    if (merkId) query = query.eq("merk_id", merkId);
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(((data as DbProductRow[] | null) ?? []).map(mapDbProduct));
  } catch (e) {
    console.error("GET /api/producten", e);
    return NextResponse.json({ error: "Kon producten niet laden." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(cookies());
    const body = await request.json();
    const { merkId, naam, sku, prijs } = body;
    if (!merkId || !naam || !sku || typeof prijs !== "number") {
      return NextResponse.json(
        { error: "Verplicht: merkId, naam, sku, prijs (getal)." },
        { status: 400 }
      );
    }
    const validMerk = MERKEN.some((m) => m.id === merkId);
    if (!validMerk) {
      return NextResponse.json({ error: "Ongeldige merkId." }, { status: 400 });
    }
    const id = `p-${Date.now()}`;
    const { data, error } = await supabase
      .from("products")
      .insert({
        id,
        merk_id: merkId,
        naam,
        sku,
        ean: body.ean ?? null,
        prijs,
        voorraad: typeof body.voorraad === "number" ? body.voorraad : null,
        image_url: body.imageUrl ?? null,
        product_url: body.productUrl ?? null,
        beschrijving: body.beschrijving ?? null,
        specificaties: body.specificaties ?? null,
      })
      .select(
        "id, merk_id, naam, sku, ean, prijs, voorraad, image_url, image_urls, product_url, beschrijving, specificaties"
      )
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(mapDbProduct(data as DbProductRow));
  } catch (e) {
    console.error("POST /api/producten", e);
    return NextResponse.json({ error: "Kon product niet aanmaken." }, { status: 500 });
  }
}
