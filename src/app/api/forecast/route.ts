import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { mapDbOrder, type DbOrderRow } from "@/lib/orders-shared";
import { mapDbProduct, type DbProductRow } from "@/lib/products-shared";
import { cookies } from "next/headers";
import { berekenForecast, type Verzendmethode } from "@/lib/forecast";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weken = parseInt(searchParams.get("weken") ?? "12", 10);
    const methode = (searchParams.get("methode") ?? "schip") as Verzendmethode;

    const supabase = createClient(cookies());
    const [{ data: ordersData, error: ordersError }, { data: productsData, error: productsError }] = await Promise.all([
      supabase
      .from("orders")
      .select("id, merk_id, ordernummer, klant_naam, klant_email, totaal, status, datum, regels"),
      supabase
        .from("products")
        .select("id, merk_id, naam, sku, ean, prijs, voorraad, image_url, image_urls, product_url, beschrijving, specificaties"),
    ]);
    if (ordersError) throw new Error(ordersError.message);
    if (productsError) throw new Error(productsError.message);
    const bestellingen = ((ordersData as DbOrderRow[] | null) ?? []).map(mapDbOrder);
    const producten = ((productsData as DbProductRow[] | null) ?? []).map(mapDbProduct);

    const forecast = berekenForecast(
      bestellingen,
      producten,
      Math.min(52, Math.max(1, weken)),
      methode === "vliegtuig" ? "vliegtuig" : "schip"
    );

    return NextResponse.json(forecast);
  } catch (e) {
    console.error("GET /api/forecast", e);
    return NextResponse.json({ error: "Kon forecast niet berekenen." }, { status: 500 });
  }
}
