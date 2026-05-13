// Find a Blind Date match — REAL users only, gated by paid + chats_remaining.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function cosine(a: Record<string, number>, b: Record<string, number>): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, na = 0, nb = 0;
  for (const k of keys) {
    const x = Number(a[k] ?? 0), y = Number(b[k] ?? 0);
    dot += x * y; na += x * x; nb += y * y;
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: userRes } = await userClient.auth.getUser();
    const user = userRes?.user;
    if (!user) return json({ error: "unauthorized" }, 401);

    const { data: me } = await supa
      .from("blind_date_profiles")
      .select("user_id, compat_vector, completed, paid, chats_remaining")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!me || !me.completed) return json({ error: "complete_setup" }, 400);
    if (!me.paid) return json({ error: "not_paid" }, 402);
    if ((me.chats_remaining ?? 0) <= 0) return json({ error: "no_credits" }, 402);

    // Candidate pool: only paid, completed, real users (NOT the current user).
    const { data: pool } = await supa
      .from("blind_date_profiles")
      .select("user_id, compat_vector")
      .neq("user_id", user.id)
      .eq("paid", true)
      .eq("completed", true)
      .gt("chats_remaining", 0)
      .limit(100);

    if (!pool || !pool.length) return json({ error: "no_candidates", session_id: null });

    let bestId: string | null = null;
    let bestScore = -1;
    for (const p of pool) {
      const score = cosine(
        (me.compat_vector ?? {}) as Record<string, number>,
        (p.compat_vector ?? {}) as Record<string, number>,
      );
      if (score > bestScore) { bestScore = score; bestId = p.user_id; }
    }
    if (!bestId) return json({ error: "no_candidates", session_id: null });

    const compatibility = Math.max(60, Math.round(60 + Math.max(0, bestScore) * 40));

    const { data: session, error: serr } = await supa
      .from("blind_date_sessions")
      .insert({
        user_a: user.id,
        user_b: bestId,
        compatibility,
        ends_at: new Date(Date.now() + 60_000).toISOString(),
      })
      .select()
      .single();
    if (serr) throw serr;

    const { data: matchProfile } = await supa
      .from("profiles")
      .select("first_name, age, city")
      .eq("id", bestId)
      .maybeSingle();

    return json({
      session_id: session.id,
      match: {
        name: matchProfile?.first_name ?? "Match",
        age: matchProfile?.age ?? 25,
        city: matchProfile?.city ?? "—",
        compatibility,
        vibes: ["Curious", "Genuine", "Open"],
      },
      ends_at: session.ends_at,
    });
  } catch (e: any) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});
