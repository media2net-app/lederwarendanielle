import { NextResponse } from "next/server";
import { getBestellingen } from "@/lib/mock-bestellingen";
import { getProducten, getProductById } from "@/lib/producten-store";
import { berekenForecast, getWeeklySalesPerProduct } from "@/lib/forecast";

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;
    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product niet gevonden" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const weken = Math.min(52, Math.max(1, parseInt(searchParams.get("weken") ?? "12", 10)));
    const methode = (searchParams.get("methode") ?? "schip") as "schip" | "vliegtuig";

    const bestellingen = getBestellingen();
    const producten = getProducten();
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
