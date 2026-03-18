import { NextResponse } from "next/server";
import { getProducten, createProduct } from "@/lib/producten-store";
import { MERKEN } from "@/lib/merken";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const merkId = searchParams.get("merkId") ?? undefined;
    const producten = getProducten(merkId ?? undefined);
    return NextResponse.json(producten);
  } catch (e) {
    console.error("GET /api/producten", e);
    return NextResponse.json({ error: "Kon producten niet laden." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
    const product = createProduct({
      merkId,
      naam,
      sku,
      prijs,
      voorraad: body.voorraad,
      imageUrl: body.imageUrl,
      productUrl: body.productUrl,
      beschrijving: body.beschrijving,
      specificaties: body.specificaties,
    });
    return NextResponse.json(product);
  } catch (e) {
    console.error("POST /api/producten", e);
    return NextResponse.json({ error: "Kon product niet aanmaken." }, { status: 500 });
  }
}
