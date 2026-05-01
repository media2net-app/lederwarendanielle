import { ingestInboundSupportMessage } from "@/lib/support-ingest";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const payload = {
    onderwerp: String(body?.onderwerp ?? "WhatsApp bericht").trim(),
    merkId: String(body?.merkId ?? "leather-design").trim(),
    klantNaam: String(body?.klantNaam ?? "Onbekende klant").trim(),
    klantEmail: String(body?.klantEmail ?? "onbekend@example.nl").trim(),
    tekst: String(body?.tekst ?? "").trim(),
    externalThreadId: body?.externalThreadId ? String(body.externalThreadId) : undefined,
    externalMessageId: body?.externalMessageId ? String(body.externalMessageId) : undefined,
  };

  if (!payload.tekst) {
    return NextResponse.json({ error: "tekst is required" }, { status: 400 });
  }

  try {
    const result = await ingestInboundSupportMessage({
      kanaal: "whatsapp",
      ...payload,
    });
    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
