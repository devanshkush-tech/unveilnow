// Public endpoint for the frontend to fire Meta CAPI events
// (ViewContent, CompleteRegistration, InitiateCheckout).
// Purchase is fired only by the admin approval flow, never from here.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendMetaEvent } from "../_shared/meta-capi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED = new Set([
  "PageView",
  "ViewContent",
  "CompleteRegistration",
  "InitiateCheckout",
]);

// Whitelist of custom_data keys forwarded to Meta. Drops any sensitive product data
// (compatibility scores, relationship preferences, emotional state, chat data, etc.).
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

function sanitize(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (ALLOWED_CUSTOM_KEYS.has(k) && v !== undefined && v !== null) out[k] = v;
  }
  return out;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const payload = await req.json().catch(() => ({}));
    const {
      event_name,
      event_id,
      event_source_url,
      custom_data,
      email: emailIn,
      phone: phoneIn,
      fbp,
      fbc,
    } = payload ?? {};

    if (!event_name || !ALLOWED.has(event_name)) {
      return new Response(JSON.stringify({ error: "invalid event_name" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to enrich with the authenticated user (optional)
    let email: string | null = emailIn ?? null;
    let phone: string | null = phoneIn ?? null;
    let externalId: string | null = null;

    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const userClient = createClient(SUPABASE_URL, ANON, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data } = await userClient.auth.getUser();
      const uid = data?.user?.id ?? null;
      if (uid) {
        externalId = uid;
        if (!email) email = data!.user!.email ?? null;
        if (!phone) {
          const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
          const { data: prof } = await admin
            .from("profiles")
            .select("phone")
            .eq("id", uid)
            .maybeSingle();
          phone = prof?.phone ?? null;
        }
      }
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const ua = req.headers.get("user-agent");

    const result = await sendMetaEvent({
      event_name,
      event_id,
      event_source_url,
      custom_data: sanitize(custom_data),
      user: {
        email,
        phone,
        external_id: externalId,
        client_ip: ip,
        client_user_agent: ua,
        fbp,
        fbc,
      },
    });

    return new Response(JSON.stringify({ ok: result.ok }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[track-event] error", e);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
