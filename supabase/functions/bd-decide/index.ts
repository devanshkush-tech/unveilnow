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

    if (decision === "continue" && otherDecision === "continue") {
      update.status = "revealed";
      update.revealed_at = new Date().toISOString();
    } else if (decision === "pass" || otherDecision === "pass") {
      update.status = "decided";
    }

    await supa.from("blind_date_sessions").update(update).eq("id", session_id);

    return new Response(JSON.stringify({
      ok: true,
      revealed: update.status === "revealed",
      both_decided: !!otherDecision,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
