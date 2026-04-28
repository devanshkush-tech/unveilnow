// Admin data API: list users with filters, get user detail, suspend/ban/delete/verify/reset, xlsx export.
// All requests must include x-admin-token (validated against admin_sessions). Service role only on the server.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...extra },
  });

async function requireAdmin(req: Request): Promise<{ adminId: string } | Response> {
  const token = req.headers.get('x-admin-token');
  if (!token) return json({ error: 'No admin token' }, 401);
  const { data: session } = await admin
    .from('admin_sessions')
    .select('admin_id, expires_at')
    .eq('token', token)
    .maybeSingle();
  if (!session) return json({ error: 'Invalid token' }, 401);
  if (new Date(session.expires_at).getTime() < Date.now()) return json({ error: 'Expired' }, 401);
  return { adminId: session.admin_id };
}

// Build CSV (lighter than xlsx for an edge function; opens cleanly in Excel)
function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const head = columns.join(',');
  const body = rows.map((r) => columns.map((c) => escape(r[c])).join(',')).join('\n');
  return head + '\n' + body;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') ?? (await req.clone().json().catch(() => ({}))).action;

    if (action === 'metrics') {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
      const [
        { count: totalUsers },
        { count: signupsToday },
        { count: verified },
        { count: active7d },
        { count: paid },
        { count: interestsSent },
        { count: matches },
        { count: revealRequested },
        { count: revealsBoth },
        { count: messagesCount },
      ] = await Promise.all([
        admin.from('profiles').select('*', { count: 'exact', head: true }),
        admin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        admin.from('profiles').select('*', { count: 'exact', head: true }).eq('verified', true),
        admin.from('profiles').select('*', { count: 'exact', head: true }).gte('last_active_at', sevenDaysAgo),
        admin.from('profiles').select('*', { count: 'exact', head: true }).neq('plan', 'free'),
        admin.from('interest_requests').select('*', { count: 'exact', head: true }),
        admin.from('matches').select('*', { count: 'exact', head: true }),
        admin.from('matches').select('*', { count: 'exact', head: true }).or('reveal_a.eq.true,reveal_b.eq.true'),
        admin.from('matches').select('*', { count: 'exact', head: true }).eq('reveal_a', true).eq('reveal_b', true),
        admin.from('messages').select('*', { count: 'exact', head: true }),
      ]);

      return json({
        totalUsers: totalUsers ?? 0,
        signupsToday: signupsToday ?? 0,
        verified: verified ?? 0,
        active7d: active7d ?? 0,
        paid: paid ?? 0,
        interestsSent: interestsSent ?? 0,
        matches: matches ?? 0,
        revealRequested: revealRequested ?? 0,
        revealsBoth: revealsBoth ?? 0,
        messages: messagesCount ?? 0,
        revenue: (paid ?? 0) * 0, // placeholder until payment integration logs revenue
      });
    }

    if (action === 'list_users' || action === 'export_users') {
      const body = await req.json().catch(() => ({} as any));
      const { search, gender, interestedIn, city, plan, verified, active, source, dateFrom, dateTo } = body ?? {};

      let q = admin.from('profiles').select('*').order('created_at', { ascending: false }).limit(action === 'export_users' ? 5000 : 200);
      if (gender) q = q.eq('gender', gender);
      if (interestedIn) q = q.eq('looking_for', interestedIn);
      if (city) q = q.ilike('city', `%${city}%`);
      if (plan) q = q.eq('plan', plan);
      if (verified === true) q = q.eq('verified', true);
      if (verified === false) q = q.eq('verified', false);
      if (source) q = q.eq('utm_source', source);
      if (dateFrom) q = q.gte('created_at', dateFrom);
      if (dateTo) q = q.lte('created_at', dateTo);
      if (search) q = q.or(`first_name.ilike.%${search}%,city.ilike.%${search}%`);

      const { data: profiles, error } = await q;
      if (error) return json({ error: error.message }, 500);

      let rows = profiles ?? [];
      if (active === true) {
        const cutoff = Date.now() - 14 * 24 * 3600 * 1000;
        rows = rows.filter((r: any) => r.last_active_at && new Date(r.last_active_at).getTime() > cutoff);
      } else if (active === false) {
        const cutoff = Date.now() - 14 * 24 * 3600 * 1000;
        rows = rows.filter((r: any) => !r.last_active_at || new Date(r.last_active_at).getTime() <= cutoff);
      }

      // Enrich with email from auth.users (admin only)
      const ids = rows.map((r: any) => r.id);
      const emails = new Map<string, string>();
      if (ids.length) {
        // listUsers paginates; for now first page (max 1000).
        const { data: authPage } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        for (const u of authPage?.users ?? []) emails.set(u.id, u.email ?? '');
      }

      const flat = rows.map((p: any) => ({
        id: p.id,
        name: p.first_name ?? '',
        email: emails.get(p.id) ?? '',
        gender: p.gender ?? '',
        interested_in: p.looking_for ?? p.interested_in ?? '',
        age: p.age ?? '',
        city: p.city ?? '',
        signup_date: p.created_at ?? '',
        last_active: p.last_active_at ?? '',
        plan: p.plan ?? 'free',
        utm_source: p.utm_source ?? '',
        utm_campaign: p.utm_campaign ?? '',
        device: p.device ?? '',
        verified: p.verified ? 'Yes' : 'No',
        suspended: p.suspended ? 'Yes' : 'No',
        banned: p.banned ? 'Yes' : 'No',
      }));

      if (action === 'export_users') {
        const cols = ['name','email','gender','interested_in','age','city','signup_date','last_active','plan','utm_source','utm_campaign','device','verified','suspended','banned'];
        const csv = toCsv(flat, cols);
        return new Response(csv, {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="unveil-users-${new Date().toISOString().slice(0,10)}.csv"`,
          },
        });
      }
      return json({ users: flat });
    }

    if (action === 'user_detail') {
      const { id } = await req.json();
      if (!id) return json({ error: 'id required' }, 400);
      const [{ data: profile }, { data: prompts }, { data: photos }, { data: interests }, { data: chatsCount }, { data: matchesCount }, { data: reportsAgainst }] = await Promise.all([
        admin.from('profiles').select('*').eq('id', id).maybeSingle(),
        admin.from('profile_prompts').select('question, answer, position').eq('user_id', id).order('position'),
        admin.from('profile_photos').select('id, storage_path, position').eq('user_id', id).order('position'),
        admin.from('profile_interests').select('interest').eq('user_id', id),
        admin.from('messages').select('id', { count: 'exact', head: true }).eq('sender_id', id) as any,
        admin.from('matches').select('id', { count: 'exact', head: true }).or(`user_a.eq.${id},user_b.eq.${id}`) as any,
        admin.from('reports').select('*').eq('reported_id', id).order('created_at', { ascending: false }),
      ]);

      // Sign first photo for preview
      let photo_urls: string[] = [];
      for (const p of photos ?? []) {
        const { data } = await admin.storage.from('photos').createSignedUrl(p.storage_path, 600);
        if (data?.signedUrl) photo_urls.push(data.signedUrl);
      }

      const { data: authUser } = await admin.auth.admin.getUserById(id);

      return json({
        profile,
        email: authUser?.user?.email ?? null,
        last_sign_in_at: authUser?.user?.last_sign_in_at ?? null,
        prompts: prompts ?? [],
        photo_urls,
        interests: (interests ?? []).map((i: any) => i.interest),
        chats_count: (chatsCount as any)?.count ?? 0,
        matches_count: (matchesCount as any)?.count ?? 0,
        reports: reportsAgainst ?? [],
      });
    }

    if (action === 'set_user_flags') {
      const { id, suspended, banned, verified } = await req.json();
      if (!id) return json({ error: 'id required' }, 400);
      const patch: Record<string, unknown> = {};
      if (typeof suspended === 'boolean') patch.suspended = suspended;
      if (typeof banned === 'boolean') patch.banned = banned;
      if (typeof verified === 'boolean') patch.verified = verified;
      const { error } = await admin.from('profiles').update(patch).eq('id', id);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === 'delete_user') {
      const { id } = await req.json();
      if (!id) return json({ error: 'id required' }, 400);
      // Cascade through profile rows, then auth user
      await admin.from('profiles').delete().eq('id', id);
      await admin.auth.admin.deleteUser(id);
      return json({ ok: true });
    }

    if (action === 'reset_password') {
      const { id } = await req.json();
      if (!id) return json({ error: 'id required' }, 400);
      const { data: u } = await admin.auth.admin.getUserById(id);
      if (!u?.user?.email) return json({ error: 'User has no email' }, 400);
      // Send reset email; redirect back to /login (front-end can route to reset-password)
      const { error } = await admin.auth.resetPasswordForEmail(u.user.email, {
        redirectTo: `${url.origin}/login`,
      });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (e) {
    console.error('admin-data error', e);
    return json({ error: String(e) }, 500);
  }
});
