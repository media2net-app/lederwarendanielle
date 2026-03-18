import { NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct } from "@/lib/producten-store";
import { MERKEN } from "@/lib/merken";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = getProductById(params.id);
    if (!product) return NextResponse.json({ error: "Product niet gevonden." }, { status: 404 });
    return NextResponse.json(product);
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
    const product = getProductById(params.id);
    if (!product) return NextResponse.json({ error: "Product niet gevonden." }, { status: 404 });
    const body = await request.json();
    if (body.merkId && !MERKEN.some((m) => m.id === body.merkId)) {
      return NextResponse.json({ error: "Ongeldige merkId." }, { status: 400 });
    }
    const updated = updateProduct(params.id, body);
    return NextResponse.json(updated);
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
    const ok = deleteProduct(params.id);
    if (!ok) return NextResponse.json({ error: "Product niet gevonden." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/producten/[id]", e);
    return NextResponse.json({ error: "Kon product niet verwijderen." }, { status: 500 });
  }
}
