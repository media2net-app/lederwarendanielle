import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { mapDbProduct, type DbProductRow } from "@/lib/products-shared";
import { cookies } from "next/headers";
import { MERKEN } from "@/lib/merken";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(cookies());
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, merk_id, naam, sku, ean, prijs, voorraad, image_url, image_urls, product_url, beschrijving, specificaties"
      )
      .eq("id", params.id)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Product niet gevonden." }, { status: 404 });
    return NextResponse.json(mapDbProduct(data as DbProductRow));
  } catch (e) {
    console.error("GET /api/producten/[id]", e);
    return NextResponse.json({ error: "Kon product niet laden." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(cookies());
    const body = await request.json();
    if (body.merkId && !MERKEN.some((m) => m.id === body.merkId)) {
      return NextResponse.json({ error: "Ongeldige merkId." }, { status: 400 });
    }
    const update: Record<string, unknown> = {};
    if (typeof body.merkId === "string") update.merk_id = body.merkId;
    if (typeof body.naam === "string") update.naam = body.naam;
    if (typeof body.sku === "string") update.sku = body.sku;
    if (typeof body.ean === "string" || body.ean === null) update.ean = body.ean;
    if (typeof body.prijs === "number") update.prijs = body.prijs;
    if (typeof body.voorraad === "number" || body.voorraad === null) update.voorraad = body.voorraad;
    if (typeof body.imageUrl === "string" || body.imageUrl === null) update.image_url = body.imageUrl;
    if (typeof body.productUrl === "string" || body.productUrl === null) update.product_url = body.productUrl;
    if (typeof body.beschrijving === "string" || body.beschrijving === null) update.beschrijving = body.beschrijving;
    if (typeof body.specificaties === "string" || body.specificaties === null) update.specificaties = body.specificaties;

    const { data, error } = await supabase
      .from("products")
      .update(update)
      .eq("id", params.id)
      .select(
        "id, merk_id, naam, sku, ean, prijs, voorraad, image_url, image_urls, product_url, beschrijving, specificaties"
      )
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Product niet gevonden." }, { status: 404 });
    return NextResponse.json(mapDbProduct(data as DbProductRow));
  } catch (e) {
    console.error("PATCH /api/producten/[id]", e);
    return NextResponse.json({ error: "Kon product niet bijwerken." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(cookies());
    const { error } = await supabase.from("products").delete().eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/producten/[id]", e);
    return NextResponse.json({ error: "Kon product niet verwijderen." }, { status: 500 });
  }
}
