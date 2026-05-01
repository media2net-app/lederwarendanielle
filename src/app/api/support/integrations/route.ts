import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Kanaal = "whatsapp" | "email" | "chat";

function isConfigured(kanaal: Kanaal): boolean {
  switch (kanaal) {
    case "whatsapp":
      return Boolean(
        process.env.WHATSAPP_ACCESS_TOKEN &&
          process.env.WHATSAPP_PHONE_NUMBER_ID &&
          process.env.WHATSAPP_VERIFY_TOKEN
      );
    case "email":
      return Boolean(process.env.SUPPORT_EMAIL_INBOUND_SECRET);
    case "chat":
      return Boolean(process.env.WEBCHAT_INGEST_SECRET);
    default:
      return false;
  }
}

async function getKanaalStatus(supabase: ReturnType<typeof createClient>, kanaal: Kanaal) {
  const { data: account } = await supabase
    .from("channel_accounts")
    .select("display_name, external_account_id, is_active")
    .eq("kanaal", kanaal)
    .limit(1)
    .maybeSingle();

  const { data: latestInbound } = await supabase
    .from("messages")
    .select("created_at")
    .eq("kanaal", kanaal)
    .eq("direction", "inbound")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { count: activeTickets } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("kanaal", kanaal)
    .in("status", ["open", "in_behandeling", "wacht_op_klant"]);

  const configured = isConfigured(kanaal);
  const connected = configured && Boolean(account?.is_active);

  return {
    kanaal,
    displayName:
      account?.display_name ??
      (kanaal === "whatsapp" ? "WhatsApp Business" : kanaal === "email" ? "E-mail" : "Website chat"),
    configured,
    connected,
    externalAccountId: account?.external_account_id ?? null,
    lastInboundAt: latestInbound?.created_at ?? null,
    activeTickets: activeTickets ?? 0,
  };
}

export async function GET() {
  const supabase = createClient(cookies());
  const [whatsapp, email, chat] = await Promise.all([
    getKanaalStatus(supabase, "whatsapp"),
    getKanaalStatus(supabase, "email"),
    getKanaalStatus(supabase, "chat"),
  ]);

  return NextResponse.json({ data: [whatsapp, email, chat] });
}
