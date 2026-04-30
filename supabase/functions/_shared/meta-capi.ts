// Meta Conversions API helper.
// Sends server-side events to Meta. Never expose META_ACCESS_TOKEN to the client.

const PIXEL_ID = Deno.env.get("META_PIXEL_ID");
const ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");
const API_VERSION = "v18.0";

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizePhone(p?: string | null): string | null {
  if (!p) return null;
  const digits = p.replace(/\D/g, "");
  return digits || null;
}

export type CapiUser = {
  email?: string | null;
  phone?: string | null;
  external_id?: string | null;
  client_ip?: string | null;
  client_user_agent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
};

export type CapiEvent = {
  event_name:
    | "ViewContent"
    | "CompleteRegistration"
    | "InitiateCheckout"
    | "Purchase"
    | string;
  event_time?: number; // unix seconds
  event_id?: string; // for dedup with browser pixel
  event_source_url?: string;
  action_source?: "website" | "system_generated";
  user?: CapiUser;
  custom_data?: Record<string, unknown>;
};

export async function sendMetaEvent(evt: CapiEvent): Promise<{ ok: boolean; status: number; body: unknown; }> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn("[meta-capi] Missing META_PIXEL_ID or META_ACCESS_TOKEN — skipping event", evt.event_name);
    return { ok: false, status: 0, body: { error: "missing_credentials" } };
  }

  const user_data: Record<string, string | string[]> = {};
  if (evt.user?.email) user_data.em = await sha256(evt.user.email);
  const phone = normalizePhone(evt.user?.phone);
  if (phone) user_data.ph = await sha256(phone);
  if (evt.user?.external_id) user_data.external_id = await sha256(evt.user.external_id);
  if (evt.user?.client_ip) user_data.client_ip_address = evt.user.client_ip;
  if (evt.user?.client_user_agent) user_data.client_user_agent = evt.user.client_user_agent;
  if (evt.user?.fbp) user_data.fbp = evt.user.fbp;
  if (evt.user?.fbc) user_data.fbc = evt.user.fbc;

  const body = {
    data: [
      {
        event_name: evt.event_name,
        event_time: evt.event_time ?? Math.floor(Date.now() / 1000),
        event_id: evt.event_id,
        event_source_url: evt.event_source_url,
        action_source: evt.action_source ?? "website",
        user_data,
        custom_data: evt.custom_data ?? {},
      },
    ],
    access_token: ACCESS_TOKEN,
  };

  const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[meta-capi] Failed", evt.event_name, res.status, json);
    } else {
      console.log("[meta-capi] Sent", evt.event_name, json);
    }
    return { ok: res.ok, status: res.status, body: json };
  } catch (e) {
    console.error("[meta-capi] Error", evt.event_name, e);
    return { ok: false, status: 0, body: { error: String(e) } };
  }
}
