// Edge function: returns signed URLs for a match's photos, but only if BOTH users have consented to reveal.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify caller
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const me = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const matchId: string | undefined = body.match_id;
    if (!matchId) {
      return new Response(JSON.stringify({ error: 'match_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: match, error: matchErr } = await admin
      .from('matches').select('user_a, user_b, reveal_a, reveal_b').eq('id', matchId).maybeSingle();
    if (matchErr || !match) {
      return new Response(JSON.stringify({ error: 'Match not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (me !== match.user_a && me !== match.user_b) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!match.reveal_a || !match.reveal_b) {
      return new Response(JSON.stringify({ error: 'Both users have not consented to reveal yet', revealed: false }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const otherId = me === match.user_a ? match.user_b : match.user_a;
    const { data: photos } = await admin
      .from('profile_photos').select('storage_path, position').eq('user_id', otherId).order('position');

    const signed: { url: string; position: number }[] = [];
    for (const p of photos ?? []) {
      const { data: s } = await admin.storage.from('photos').createSignedUrl(p.storage_path, 60 * 10);
      if (s?.signedUrl) signed.push({ url: s.signedUrl, position: p.position });
    }

    return new Response(JSON.stringify({ revealed: true, photos: signed }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
