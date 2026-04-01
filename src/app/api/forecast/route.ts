import { NextResponse } from "next/server";
import { getBestellingen } from "@/lib/mock-bestellingen";
import { getProducten } from "@/lib/producten-store";
import { berekenForecast, type Verzendmethode } from "@/lib/forecast";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weken = parseInt(searchParams.get("weken") ?? "12", 10);
    const methode = (searchParams.get("methode") ?? "schip") as Verzendmethode;

    const bestellingen = getBestellingen();
    const producten = getProducten();

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
