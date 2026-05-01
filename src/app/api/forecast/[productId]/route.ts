import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { mapDbOrder, type DbOrderRow } from "@/lib/orders-shared";
import { mapDbProduct, type DbProductRow } from "@/lib/products-shared";
import { cookies } from "next/headers";
import { berekenForecast, getWeeklySalesPerProduct } from "@/lib/forecast";

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;
    const supabase = createClient(cookies());
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("id, merk_id, naam, sku, ean, prijs, voorraad, image_url, image_urls, product_url, beschrijving, specificaties")
      .eq("id", productId)
      .maybeSingle();
    if (productError) throw new Error(productError.message);
    if (!productData) return NextResponse.json({ error: "Product niet gevonden" }, { status: 404 });
    const product = mapDbProduct(productData as DbProductRow);

    const { searchParams } = new URL(request.url);
    const weken = Math.min(52, Math.max(1, parseInt(searchParams.get("weken") ?? "12", 10)));
    const methode = (searchParams.get("methode") ?? "schip") as "schip" | "vliegtuig";

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
    const forecast = berekenForecast(bestellingen, producten, weken, methode);
    const regel = forecast.find((r) => r.productId === productId);
    const weekVerkoop = getWeeklySalesPerProduct(bestellingen, productId);

    if (!regel) {
      return NextResponse.json({ error: "Forecast niet gevonden" }, { status: 404 });
    }

    return NextResponse.json({
      product: {
        id: product.id,
        naam: product.naam,
        sku: product.sku,
        voorraad: product.voorraad ?? 0,
      },
      forecast: regel,
      weekVerkoop,
    });
  } catch (e) {
    console.error("GET /api/forecast/[productId]", e);
    return NextResponse.json({ error: "Kon gegevens niet laden." }, { status: 500 });
  }
}
