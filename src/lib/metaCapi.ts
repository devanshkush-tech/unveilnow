// Lightweight client helper to fire Meta Pixel + CAPI events with deduplication.
// - Browser pixel and server CAPI share the same `event_id` (eventID) so Meta dedups.
// - We strip sensitive product data before sending to Meta (no compatibility scores,
//   relationship preferences, emotional state, chat data, profile answers, etc.).
// - Uses fetch with { keepalive: true } so events still flush on iOS/Safari nav/unload.
import { supabase } from "@/integrations/supabase/client";

type EventName =
  | "PageView"
  | "ViewContent"
  | "CompleteRegistration"
  | "InitiateCheckout";

// Only these custom_data keys are ever forwarded to Meta. Anything else is dropped.
const ALLOWED_CUSTOM_KEYS = new Set([
  "currency",
  "value",
  "content_name",
  "content_category",
  "content_type",
  "content_ids",
  "num_items",
  "status",
]);

function sanitizeCustomData(input?: Record<string, unknown>): Record<string, unknown> {
  if (!input) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (ALLOWED_CUSTOM_KEYS.has(k) && v !== undefined && v !== null) out[k] = v;
  }
  return out;
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : undefined;
}

function getFbq(): ((...args: unknown[]) => void) | undefined {
  const fbq = (typeof window !== "undefined" ? (window as any).fbq : undefined);
  return typeof fbq === "function" ? fbq : undefined;
}

export async function trackMetaEvent(
  event_name: EventName,
  opts: {
    event_id?: string;
    custom_data?: Record<string, unknown>;
    email?: string | null;
    phone?: string | null;
  } = {}
) {
  const custom_data = sanitizeCustomData(opts.custom_data);
  const event_id = opts.event_id ?? `${event_name}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // 1) Fire browser Pixel (deduped by eventID)
  try {
    const fbq = getFbq();
    if (fbq) fbq("track", event_name, custom_data, { eventID: event_id });
  } catch (e) {
    console.warn("[meta] pixel fire failed", e);
  }

  // 2) Fire server CAPI via edge function. Use fetch with keepalive so Safari/iOS
  //    flushes the request even during navigation/unload (supabase.functions.invoke
  //    does not pass `keepalive`, so we call the URL directly with the anon key).
  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-event`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    };
    // Attach the user's JWT when available so the server can enrich with profile data
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch {/* anonymous is fine */}

    const body = JSON.stringify({
      event_name,
      event_id,
      event_source_url: typeof window !== "undefined" ? window.location.href : undefined,
      custom_data,
      email: opts.email ?? null,
      phone: opts.phone ?? null,
      fbp: readCookie("_fbp"),
      fbc: readCookie("_fbc"),
    });

    await fetch(url, { method: "POST", headers, body, keepalive: true });
  } catch (e) {
    console.warn("[meta] CAPI fire failed", e);
  }
}
