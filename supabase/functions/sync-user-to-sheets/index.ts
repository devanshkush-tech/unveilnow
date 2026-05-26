import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_URL = Deno.env.get("SHEETS_WEBHOOK_URL");

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

async function buildPayload(userId: string | null, leadId: string | null) {
  let profile: any = null;
  let authUser: any = null;
  let payment: any = null;
  let interests: string[] = [];
  let prompts: string[] = [];
  let lead: any = null;

  if (userId) {
    const { data: p } = await admin.from("profiles").select("*").eq("id", userId).maybeSingle();
    profile = p;

    const { data: u } = await admin.auth.admin.getUserById(userId);
    authUser = u?.user ?? null;

    const { data: pay } = await admin
      .from("payment_submissions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    payment = pay;

    const { data: ints } = await admin.from("profile_interests").select("interest").eq("user_id", userId);
    interests = (ints ?? []).map((r: any) => r.interest);

    const { data: prs } = await admin.from("profile_prompts").select("question,answer").eq("user_id", userId);
    prompts = (prs ?? []).map((r: any) => `${r.question}: ${r.answer}`);
  }

  if (leadId) {
    const { data } = await admin.from("signup_leads").select("*").eq("id", leadId).maybeSingle();
    lead = data;
  } else if (userId && authUser?.email) {
    const { data } = await admin
      .from("signup_leads")
      .select("*")
      .ilike("email", authUser.email)
      .maybeSingle();
    lead = data;
  }

  return {
    user_id: userId ?? "",
    lead_id: leadId ?? lead?.id ?? "",
    name: profile?.first_name ?? lead?.first_name ?? "",
    email: authUser?.email ?? lead?.email ?? "",
    phone: profile?.phone ?? lead?.phone ?? "",
    gender: profile?.gender ?? "",
    age: profile?.age ?? "",
    city: profile?.city ?? "",
    profession: profile?.profession ?? "",
    intent: profile?.intent ?? "",
    story: profile?.story ?? "",
    interests: interests.join(", "),
    prompts: prompts.join(" | "),
    selected_plan: profile?.selected_plan ?? "",
    plan: profile?.plan ?? "",
    payment_status: profile?.payment_status ?? "none",
    payment_amount: payment?.amount_label ?? "",
    payment_completed_at: payment?.reviewed_at ?? "",
    payment_submission_status: payment?.status ?? "",
    account_status: profile?.account_status ?? "",
    onboarded: profile?.onboarded ?? false,
    onboarding_step: profile?.onboarding_step ?? 0,
    suspended: profile?.suspended ?? false,
    banned: profile?.banned ?? false,
    email_verified: !!authUser?.email_confirmed_at || !!lead?.email_verified_at,
    signup_completed_at: lead?.signup_completed_at ?? "",
    created_at: profile?.created_at ?? lead?.created_at ?? authUser?.created_at ?? "",
    last_active_at: profile?.last_active_at ?? "",
    utm_source: profile?.utm_source ?? lead?.utm_source ?? "",
    utm_medium: profile?.utm_medium ?? lead?.utm_medium ?? "",
    utm_campaign: profile?.utm_campaign ?? lead?.utm_campaign ?? "",
    utm_content: profile?.utm_content ?? lead?.utm_content ?? "",
    utm_term: profile?.utm_term ?? lead?.utm_term ?? "",
    updated_at: new Date().toISOString(),
  };
}

async function postWithRetry(url: string, body: unknown, attempts = 3): Promise<{ ok: boolean; error?: string }> {
  let lastErr = "";
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) return { ok: true };
      lastErr = `HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`;
      if (res.status < 500 && res.status !== 429) return { ok: false, error: lastErr };
    } catch (e) {
      lastErr = (e as Error).message;
    }
    await new Promise((r) => setTimeout(r, 500 * Math.pow(2, i)));
  }
  return { ok: false, error: lastErr };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Only accept calls bearing the service-role key (used by our DB trigger
  // and other internal callers). Reject anonymous / user-token callers.
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token || token !== SERVICE_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { user_id, lead_id, log_id } = await req.json().catch(() => ({}));
    if (!user_id && !lead_id) {
      return new Response(JSON.stringify({ error: "user_id or lead_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await buildPayload(user_id ?? null, lead_id ?? null);

    if (!WEBHOOK_URL) {
      const msg = "SHEETS_WEBHOOK_URL not configured";
      if (log_id) {
        await admin.from("sheet_sync_log").update({
          status: "failed", last_error: msg, attempts: 1, updated_at: new Date().toISOString(),
        }).eq("id", log_id);
      }
      return new Response(JSON.stringify({ ok: false, error: msg, payload }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await postWithRetry(WEBHOOK_URL, payload);

    if (log_id) {
      await admin.from("sheet_sync_log").update({
        status: result.ok ? "success" : "failed",
        attempts: 1,
        last_error: result.error ?? null,
        updated_at: new Date().toISOString(),
      }).eq("id", log_id);
    }

    return new Response(JSON.stringify({ ok: result.ok, error: result.error }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sync-user-to-sheets error", e);
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
