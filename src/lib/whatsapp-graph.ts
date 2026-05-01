const GRAPH_BASE = "https://graph.facebook.com";

export function getWhatsAppGraphVersion(): string {
  return (process.env.WHATSAPP_GRAPH_API_VERSION ?? "v21.0").replace(/^v?/, "v");
}

export async function sendWhatsAppTextMessage(toPhoneDigits: string, body: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return { ok: false, error: "WHATSAPP_ACCESS_TOKEN of WHATSAPP_PHONE_NUMBER_ID ontbreekt" };
  }

  const to = toPhoneDigits.replace(/\D/g, "");
  if (!to) {
    return { ok: false, error: "Ongeldig telefoonnummer (to)" };
  }

  const version = getWhatsAppGraphVersion();
  const url = `${GRAPH_BASE}/${version}/${phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body },
    }),
  });

  const data = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
  if (!res.ok) {
    return { ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
  }
  return { ok: true };
}
