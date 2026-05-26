import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Allowlist of acceptable return URL origins to prevent open redirect via Stripe.
const ALLOWED_RETURN_ORIGINS = new Set<string>([
  "https://unveilnow.in",
  "https://www.unveilnow.in",
  "https://unveilnow.lovable.app",
  "https://id-preview--df75384f-6009-4eae-9633-eaca38cbd9f1.lovable.app",
]);

function isAllowedReturnUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (ALLOWED_RETURN_ORIGINS.has(u.origin)) return true;
    // Allow Lovable preview subdomains for this project
    if (u.hostname.endsWith(".lovable.app") || u.hostname.endsWith(".lovableproject.com")) {
      return u.protocol === "https:";
    }
    return false;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    // Require an authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = claimsData.claims.sub as string;
    const callerEmail = (claimsData.claims as any).email as string | undefined;

    const body = await req.json();
    const { priceId, quantity, customerEmail, userId, returnUrl, environment } = body ?? {};
    if (!priceId || typeof priceId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(priceId)) {
      throw new Error("Invalid priceId");
    }
    if (!returnUrl || typeof returnUrl !== "string" || !isAllowedReturnUrl(returnUrl)) {
      throw new Error("Invalid returnUrl");
    }
    if (environment !== "sandbox" && environment !== "live") throw new Error("Invalid environment");

    // userId, if provided, must match the authenticated caller
    if (userId && userId !== callerId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const effectiveUserId = callerId;
    const effectiveEmail = customerEmail || callerEmail;

    const env = environment as StripeEnv;
    const stripe = createStripeClient(env);
    const prices = await stripe.prices.list({ lookup_keys: [priceId] });
    if (!prices.data.length) throw new Error("Price not found");
    const stripePrice = prices.data[0];
    const isRecurring = stripePrice.type === "recurring";

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: stripePrice.id, quantity: quantity || 1 }],
      mode: isRecurring ? "subscription" : "payment",
      ui_mode: "embedded",
      return_url: returnUrl,
      ...(effectiveEmail && { customer_email: effectiveEmail }),
      metadata: { userId: effectiveUserId },
      ...(isRecurring && { subscription_data: { metadata: { userId: effectiveUserId } } }),
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-checkout error:", e);
    return new Response(JSON.stringify({ error: "Unable to create checkout session" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
