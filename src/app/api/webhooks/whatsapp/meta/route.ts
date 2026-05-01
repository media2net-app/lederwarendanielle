import { ingestInboundSupportMessage } from "@/lib/support-ingest";
import { createAnonSupabaseClient } from "@/utils/supabase/route-anon";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getVerifyToken() {
  return (process.env.WHATSAPP_VERIFY_TOKEN ?? "").trim();
}

/** Meta subscription verify (GET). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = (url.searchParams.get("hub.verify_token") ?? "").trim();
  const challenge = url.searchParams.get("hub.challenge");
  const expected = getVerifyToken();

  if (!expected) {
    return NextResponse.json(
      {
        error: "WHATSAPP_VERIFY_TOKEN ontbreekt op de server",
        hint: "Zet in Vercel/hosting dezelfde waarde als in Meta 'Verify token', daarna redeploy.",
      },
      { status: 503 }
    );
  }

  if (mode === "subscribe" && token && token === expected) {
    return new NextResponse(challenge ?? "", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return NextResponse.json(
    {
      error: "Forbidden",
      hint: "Verify token komt niet overeen of query ontbreekt (hub.mode, hub.verify_token).",
    },
    { status: 403 }
  );
}

type MetaContact = { profile?: { name?: string }; wa_id?: string };
type MetaTextMessage = {
  id?: string;
  from?: string;
  type?: string;
  text?: { body?: string };
};

async function ensureWhatsappChannelRow(supabase: SupabaseClient) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!phoneId) return;
  await supabase.from("channel_accounts").upsert(
    {
      kanaal: "whatsapp",
      external_account_id: phoneId,
      display_name: "WhatsApp Business",
      is_active: true,
    },
    { onConflict: "kanaal,external_account_id" }
  );
}

/** Inkomende WhatsApp Business webhooks (POST). */
export async function POST(request: Request) {
  const verifyToken = getVerifyToken();
  if (!verifyToken || !process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    return NextResponse.json({ error: "WhatsApp niet geconfigureerd op server" }, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const body = payload as {
    object?: string;
    entry?: {
      changes?: {
        field?: string;
        value?: {
          metadata?: { phone_number_id?: string };
          contacts?: MetaContact[];
          messages?: MetaTextMessage[];
          statuses?: unknown[];
        };
      }[];
    }[];
  };

  if (body.object !== "whatsapp_business_account") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const supabase = createAnonSupabaseClient();
  await ensureWhatsappChannelRow(supabase);

  const merkId = process.env.WHATSAPP_DEFAULT_MERK_ID ?? "leather-design";

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;
      const value = change.value;
      if (value?.statuses?.length && !value?.messages?.length) {
        continue;
      }
      const contacts = value?.contacts ?? [];
      const phoneNumberId = value?.metadata?.phone_number_id ?? "";

      for (const msg of value?.messages ?? []) {
        if (msg.type !== "text" || !msg.from) continue;
        const bodyText = msg.text?.body?.trim() ?? "";
        if (!bodyText) continue;

        const waId = msg.from.replace(/\D/g, "");
        const contactName = contacts.find((c) => (c.wa_id ?? "").replace(/\D/g, "") === waId)?.profile?.name;

        try {
          await ingestInboundSupportMessage(
            {
              kanaal: "whatsapp",
              onderwerp: `WhatsApp ${phoneNumberId || "chat"}`,
              merkId,
              klantNaam: contactName?.trim() || `WhatsApp ${waId}`,
              klantEmail: waId,
              tekst: bodyText,
              externalThreadId: waId,
              externalMessageId: msg.id,
            },
            supabase
          );
        } catch (e) {
          console.error("[whatsapp/meta webhook]", e);
        }
      }
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
