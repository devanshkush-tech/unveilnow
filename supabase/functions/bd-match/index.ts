// Find a Blind Date match for the current user. Creates a session with a 60s timer.
// Falls back to a mock match when there are no real candidates yet.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MOCK = [
  { name: "Priya", age: 24, city: "Mumbai", vibes: ["Deep Talks", "Adventurous", "Serious"] },
  { name: "Ananya", age: 26, city: "Bangalore", vibes: ["Music Lover", "Night Owl", "Playful"] },
  { name: "Sara", age: 23, city: "Delhi", vibes: ["Mountains", "Calm", "Deep Talks"] },
];

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
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load my profile (compat_vector via service role)
    const { data: me } = await supa
      .from("blind_date_profiles")
      .select("user_id, compat_vector, sessions_used, sessions_limit")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!me) {
      return new Response(JSON.stringify({ error: "complete_setup" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Quota check (null = unlimited)
    if (me.sessions_limit !== null && me.sessions_used >= me.sessions_limit) {
      return new Response(JSON.stringify({ error: "limit_reached" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Candidate pool
    const { data: pool } = await supa
      .from("blind_date_profiles")
      .select("user_id, compat_vector")
      .neq("user_id", user.id)
      .limit(50);

    let bestId: string | null = null;
    let bestScore = 0;
    if (pool && pool.length) {
      for (const p of pool) {
        const score = cosine(
          (me.compat_vector ?? {}) as Record<string, number>,
          (p.compat_vector ?? {}) as Record<string, number>,
        );
        if (score > bestScore) { bestScore = score; bestId = p.user_id; }
      }
    }

    const compatibility = bestId ? Math.round(60 + bestScore * 40) : 80 + Math.floor(Math.random() * 15);

    if (bestId) {
      // Create real session
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

      await supa.from("blind_date_profiles")
        .update({ sessions_used: me.sessions_used + 1 })
        .eq("user_id", user.id);

      return new Response(JSON.stringify({
        session_id: session.id,
        match: {
          name: matchProfile?.first_name ?? "Match",
          age: matchProfile?.age ?? 25,
          city: matchProfile?.city ?? "—",
          compatibility,
          vibes: ["Curious", "Genuine", "Open"],
        },
        ends_at: session.ends_at,
        mock: false,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fallback mock
    const mock = MOCK[Math.floor(Math.random() * MOCK.length)];
    await supa.from("blind_date_profiles")
      .update({ sessions_used: me.sessions_used + 1 })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({
      session_id: null,
      match: { ...mock, compatibility },
      ends_at: new Date(Date.now() + 60_000).toISOString(),
      mock: true,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
