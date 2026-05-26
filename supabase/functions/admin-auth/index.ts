// Admin auth: login, verify, logout. Completely separate from end-user Supabase auth.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import bcrypt from 'https://esm.sh/bcryptjs@2.4.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

// 7-day sessions
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const randomToken = () => {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') ?? (await req.clone().json().catch(() => ({}))).action;

    if (action === 'login') {
      const { email, password } = await req.json();
      if (!email || !password) return json({ error: 'Email and password required' }, 400);

      const { data: account } = await admin
        .from('admin_accounts')
        .select('id, email, password_hash, display_name, active')
        .eq('email', String(email).toLowerCase().trim())
        .maybeSingle();

      if (!account || !account.active) {
        // Generic message to avoid enumeration
        return json({ error: 'Invalid credentials' }, 401);
      }
      const ok = await bcrypt.compare(String(password), account.password_hash);
      if (!ok) return json({ error: 'Invalid credentials' }, 401);

      const token = randomToken();
      const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

      await admin.from('admin_sessions').insert({
        token,
        admin_id: account.id,
        expires_at: expiresAt,
        ip: req.headers.get('x-forwarded-for') ?? null,
        user_agent: req.headers.get('user-agent') ?? null,
      });
      await admin.from('admin_accounts').update({ last_login_at: new Date().toISOString() }).eq('id', account.id);

      return json({
        token,
        expires_at: expiresAt,
        admin: { id: account.id, email: account.email, display_name: account.display_name },
      });
    }

    if (action === 'verify') {
      const token = req.headers.get('x-admin-token') ?? (await req.json().catch(() => ({}))).token;
      if (!token) return json({ error: 'No token' }, 401);
      const { data: session } = await admin
        .from('admin_sessions')
        .select('admin_id, expires_at, admin_accounts(id, email, display_name, active)')
        .eq('token', token)
        .maybeSingle();
      if (!session) return json({ error: 'Invalid token' }, 401);
      if (new Date(session.expires_at).getTime() < Date.now()) {
        await admin.from('admin_sessions').delete().eq('token', token);
        return json({ error: 'Expired' }, 401);
      }
      // @ts-ignore relation
      const acc = session.admin_accounts;
      if (!acc?.active) return json({ error: 'Account disabled' }, 403);
      return json({ admin: { id: acc.id, email: acc.email, display_name: acc.display_name } });
    }

    if (action === 'logout') {
      const token = req.headers.get('x-admin-token') ?? (await req.json().catch(() => ({}))).token;
      if (token) await admin.from('admin_sessions').delete().eq('token', token);
      return json({ ok: true });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (e) {
    console.error('admin-auth error', e);
    return json({ error: 'Internal server error' }, 500);
  }
});
