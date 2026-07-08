// Public endpoint to capture a signup lead BEFORE the user verifies email or completes onboarding.
// Upserts on email or phone (case-insensitive email) so re-attempts never create duplicates.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const emailRaw: string | undefined = body.email?.toString().trim();
    const phoneRaw: string | undefined = body.phone?.toString().trim().replace(/\s+/g, '');
    const email = emailRaw ? emailRaw.toLowerCase() : null;
    const phone = phoneRaw || null;

    if (!email && !phone) return json({ error: 'email or phone required' }, 400);

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null;
    const ua = req.headers.get('user-agent') ?? null;

    const patch: Record<string, unknown> = {
      first_name: body.first_name ?? null,
      source: body.source ?? 'signup',
      utm_source: body.utm_source ?? null,
      utm_medium: body.utm_medium ?? null,
      utm_campaign: body.utm_campaign ?? null,
      utm_content: body.utm_content ?? null,
      utm_term: body.utm_term ?? null,
      user_agent: ua,
      ip,
      last_error: body.last_error ?? null,
      signup_attempted_at: new Date().toISOString(),
    };
    if (body.signup_completed === true) patch.signup_completed_at = new Date().toISOString();
    if (body.email_verified === true) patch.email_verified_at = new Date().toISOString();
    if (body.auth_user_id) patch.auth_user_id = body.auth_user_id;

    // Try to find an existing lead by email OR phone.
    let existing: { id: string } | null = null;
    if (email) {
      const { data } = await admin.from('signup_leads').select('id').ilike('email', email).maybeSingle();
      if (data) existing = data;
    }
    if (!existing && phone) {
      const { data } = await admin.from('signup_leads').select('id').eq('phone', phone).maybeSingle();
      if (data) existing = data;
    }

    if (existing) {
      // Update + bump attempts. Keep email/phone if newly provided.
      const updatePatch: Record<string, unknown> = { ...patch };
      if (email) updatePatch.email = email;
      if (phone) updatePatch.phone = phone;
      // Increment attempts atomically via RPC-less approach: read then write.
      const { data: cur } = await admin.from('signup_leads').select('attempts').eq('id', existing.id).maybeSingle();
      updatePatch.attempts = (cur?.attempts ?? 1) + 1;
      const { error } = await admin.from('signup_leads').update(updatePatch).eq('id', existing.id);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, id: existing.id, mode: 'updated' });
    }

    const insertRow: Record<string, unknown> = { email, phone, ...patch };
    const { data, error } = await admin.from('signup_leads').insert(insertRow).select('id').single();
    if (error) {
      // Race: another concurrent capture-lead call inserted first. Fall back to update.
      if ((error as any).code === '23505' || /duplicate key/i.test(error.message)) {
        let found: { id: string } | null = null;
        if (email) {
          const { data: d } = await admin.from('signup_leads').select('id').ilike('email', email).maybeSingle();
          if (d) found = d;
        }
        if (!found && phone) {
          const { data: d } = await admin.from('signup_leads').select('id').eq('phone', phone).maybeSingle();
          if (d) found = d;
        }
        if (found) {
          const updatePatch: Record<string, unknown> = { ...patch };
          if (email) updatePatch.email = email;
          if (phone) updatePatch.phone = phone;
          const { data: cur } = await admin.from('signup_leads').select('attempts').eq('id', found.id).maybeSingle();
          updatePatch.attempts = (cur?.attempts ?? 1) + 1;
          const { error: upErr } = await admin.from('signup_leads').update(updatePatch).eq('id', found.id);
          if (upErr) return json({ error: upErr.message }, 500);
          return json({ ok: true, id: found.id, mode: 'updated_after_race' });
        }
      }
      return json({ error: error.message }, 500);
    }
    return json({ ok: true, id: data.id, mode: 'inserted' });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
