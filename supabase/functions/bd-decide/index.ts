// Record a user's decision (continue/pass) on a Blind Date session.
// When both users continue, mark the session revealed.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const Body = z.object({
  session_id: z.string().uuid(),
  decision: z.enum(["continue", "pass"]),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: u } = await userClient.auth.getUser();
    const user = u?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { session_id, decision } = parsed.data;

    // Validate caller still has Blind Date access (paid + credits) before continuing.
    if (decision === "continue") {
      const { data: bd } = await supa.from("blind_date_profiles")
        .select("paid, chats_remaining").eq("user_id", user.id).maybeSingle();
      if (!bd?.paid || (bd?.chats_remaining ?? 0) <= 0) {
        return new Response(JSON.stringify({ error: "no_credits" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: s } = await supa.from("blind_date_sessions")
      .select("*").eq("id", session_id).maybeSingle();
    if (!s || (s.user_a !== user.id && s.user_b !== user.id)) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isA = s.user_a === user.id;
    const update: Record<string, unknown> = isA ? { decision_a: decision } : { decision_b: decision };
    const otherDecision = isA ? s.decision_b : s.decision_a;

    if (decision === "pass" || otherDecision === "pass") {
      update.status = "decided";
    }
    // Note: when both = 'continue', the BEFORE UPDATE trigger
    // bd_on_mutual_continue sets status='matched' AND consumes one credit
    // from each user atomically. Do not duplicate that logic here.

    await supa.from("blind_date_sessions").update(update).eq("id", session_id);

    // Re-read the session to know the post-trigger status.
    const { data: after } = await supa.from("blind_date_sessions")
      .select("status, decision_a, decision_b, revealed_at")
      .eq("id", session_id).maybeSingle();

    const matched = after?.status === "matched" || after?.status === "revealed";
    if (matched && !after?.revealed_at) {
      await supa.from("blind_date_sessions")
        .update({ revealed_at: new Date().toISOString() })
        .eq("id", session_id);
    }

    return new Response(JSON.stringify({
      ok: true,
      revealed: matched,
      both_decided: !!(after?.decision_a && after?.decision_b),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
