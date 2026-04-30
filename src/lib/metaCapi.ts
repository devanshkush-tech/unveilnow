// Lightweight client helper to fire Meta CAPI events via our backend.
// Backend hashes user data and never exposes the access token.
import { supabase } from "@/integrations/supabase/client";

type EventName = "ViewContent" | "CompleteRegistration" | "InitiateCheckout";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : undefined;
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
  try {
    // Also fire browser pixel (deduped by event_id) when available
    const fbq = (typeof window !== "undefined" ? (window as any).fbq : undefined);
    if (typeof fbq === "function") {
      fbq("track", event_name, opts.custom_data ?? {}, opts.event_id ? { eventID: opts.event_id } : undefined);
    }

    await supabase.functions.invoke("track-event", {
      body: {
        event_name,
        event_id: opts.event_id,
        event_source_url: typeof window !== "undefined" ? window.location.href : undefined,
        custom_data: opts.custom_data ?? {},
        email: opts.email ?? null,
        phone: opts.phone ?? null,
        fbp: readCookie("_fbp"),
        fbc: readCookie("_fbc"),
      },
    });
  } catch (e) {
    // Never break UX over analytics
    console.warn("[meta] trackMetaEvent failed", e);
  }
}
