// Admin data API: list users with filters, get user detail, suspend/ban/delete/verify/reset, xlsx export.
// All requests must include x-admin-token (validated against admin_sessions). Service role only on the server.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { sendMetaEvent } from '../_shared/meta-capi.ts';

const PLAN_PRICE_INR: Record<string, number> = {
  starter: 99,
  premium: 199,
  elite: 299,
};

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
        active7d: active7d ?? 0,
        paid: paid ?? 0,
        interestsSent: interestsSent ?? 0,
        matches: matches ?? 0,
        revealRequested: revealRequested ?? 0,
        revealsBoth: revealsBoth ?? 0,
        messages: messagesCount ?? 0,
        revenue: (paid ?? 0) * 0,
      });
    }

    if (action === 'list_users' || action === 'export_users') {
      const body = await req.json().catch(() => ({} as any));
      const { search, gender, interestedIn, city, plan, active, source, utmCampaign, dateFrom, dateTo } = body ?? {};

      const limit = action === 'export_users' ? 5000 : 500;
      let q = admin.from('profiles').select('*').order('created_at', { ascending: false }).limit(limit);
      if (gender) q = q.eq('gender', gender);
      if (interestedIn) q = q.eq('looking_for', interestedIn);
      if (city) q = q.ilike('city', `%${city}%`);
      if (plan) q = q.eq('plan', plan);
      if (source) q = q.ilike('utm_source', `%${source}%`);
      if (utmCampaign) q = q.ilike('utm_campaign', `%${utmCampaign}%`);
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

      // Build auth-user map (email + verification status for every profile).
      const authMap = new Map<string, { email: string; confirmed: boolean; phone: string }>();
      const emailToAuthId = new Map<string, string>();
      const { data: authPage } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      for (const u of authPage?.users ?? []) {
        const email = (u.email ?? '').toLowerCase();
        authMap.set(u.id, {
          email: u.email ?? '',
          confirmed: !!(u.email_confirmed_at || (u as any).confirmed_at || u.phone_confirmed_at),
          phone: u.phone || '',
        });
        if (email) emailToAuthId.set(email, u.id);
      }

      // Pull every signup lead — we will merge in any lead that hasn't graduated
      // to a profile so admins see EVERY signup attempt (verified or not).
      const { data: leadsAll } = await admin
        .from('signup_leads').select('*').order('created_at', { ascending: false }).limit(limit);
      const profileIds = new Set(rows.map((r: any) => r.id));
      const leadByProfileId = new Map<string, any>();
      const orphanLeads: any[] = [];
      for (const l of leadsAll ?? []) {
        const linkedId = l.auth_user_id || (l.email ? emailToAuthId.get(String(l.email).toLowerCase()) : null);
        if (linkedId && profileIds.has(linkedId)) {
          leadByProfileId.set(linkedId, l);
        } else {
          orphanLeads.push(l);
        }
      }

      const flat = rows.map((p: any) => {
        const a = authMap.get(p.id);
        const lead = leadByProfileId.get(p.id);
        const verified = !!(a?.confirmed);
        const stage = !verified ? 'Email unverified'
          : !p.onboarded ? 'Onboarding'
          : (p.payment_status === 'approved' || (p.plan && p.plan !== 'free')) ? 'Active'
          : 'Awaiting payment';
        return {
          id: p.id,
          source_kind: 'profile',
          name: p.first_name ?? lead?.first_name ?? '',
          email: a?.email ?? lead?.email ?? '',
          phone: p.phone || a?.phone || lead?.phone || '',
          gender: p.gender ?? '',
          interested_in: p.looking_for ?? p.interested_in ?? '',
          age: p.age ?? '',
          city: p.city ?? '',
          signup_date: lead?.created_at ?? p.created_at ?? '',
          last_active: p.last_active_at ?? '',
          plan: p.plan ?? 'free',
          plan_started_at: p.plan_started_at ?? '',
          plan_expires_at: p.plan_expires_at ?? '',
          utm_source: p.utm_source ?? lead?.utm_source ?? '',
          utm_campaign: p.utm_campaign ?? lead?.utm_campaign ?? '',
          device: p.device ?? '',
          suspended: p.suspended ? 'Yes' : 'No',
          banned: p.banned ? 'Yes' : 'No',
          email_verified: verified ? 'Yes' : 'No',
          onboarded: p.onboarded ? 'Yes' : 'No',
          payment_status: p.payment_status ?? 'none',
          stage,
        };
      });

      // Append orphan leads (people who entered email/phone but never produced a profile)
      const term = (search || '').toString().trim().toLowerCase();
      for (const l of orphanLeads) {
        if (term) {
          const hay = `${l.first_name ?? ''} ${l.email ?? ''} ${l.phone ?? ''}`.toLowerCase();
          if (!hay.includes(term)) continue;
        }
        if (gender || interestedIn || city || plan || source || active !== undefined) continue;
        const verified = !!l.email_verified_at;
        flat.push({
          id: `lead:${l.id}`,
          source_kind: 'lead',
          name: l.first_name ?? '',
          email: l.email ?? '',
          phone: l.phone ?? '',
          gender: '',
          interested_in: '',
          age: '',
          city: '',
          signup_date: l.created_at ?? '',
          last_active: '',
          plan: '',
          plan_started_at: '',
          plan_expires_at: '',
          utm_source: l.utm_source ?? '',
          utm_campaign: l.utm_campaign ?? '',
          device: '',
          suspended: 'No',
          banned: 'No',
          email_verified: verified ? 'Yes' : 'No',
          onboarded: 'No',
          payment_status: 'none',
          stage: l.last_error ? 'Signup error' : verified ? 'Verified, no profile' : 'Form filled',
        });
      }

      flat.sort((a, b) => (b.signup_date || '').localeCompare(a.signup_date || ''));

      if (action === 'export_users') {
        const cols = ['name','email','phone','gender','interested_in','age','city','signup_date','last_active','plan','stage','email_verified','onboarded','payment_status','utm_source','utm_campaign','device','suspended','banned'];
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

      // Lead-only entry (no profile yet) — return a synthetic detail with full journey.
      if (typeof id === 'string' && id.startsWith('lead:')) {
        const leadId = id.slice(5);
        const { data: lead } = await admin.from('signup_leads').select('*').eq('id', leadId).maybeSingle();
        if (!lead) return json({ error: 'Lead not found' }, 404);
        const verified = !!lead.email_verified_at;
        const journey = [
          { key: 'form_filled', label: 'Form filled (email/phone entered)', completed: true, at: lead.created_at, detail: `${lead.attempts ?? 1} attempt(s)` },
          { key: 'account_created', label: 'Account created', completed: !!lead.auth_user_id, at: null, detail: lead.last_error ? `Error: ${lead.last_error}` : null },
          { key: 'email_verified', label: 'Email verified', completed: verified, at: lead.email_verified_at },
          { key: 'onboarding_completed', label: 'Onboarding completed', completed: false, at: null },
          { key: 'plan_selected', label: 'Plan selected', completed: false, at: null },
          { key: 'payment_submitted', label: 'Payment submitted', completed: false, at: null },
          { key: 'payment_approved', label: 'Payment approved · account active', completed: false, at: null },
        ];
        const droppedAtIndex = journey.findIndex((s) => !s.completed);
        return json({
          profile: { id, first_name: lead.first_name, phone: lead.phone, plan: 'free', is_lead_only: true },
          email: lead.email,
          last_sign_in_at: null,
          prompts: [], photo_urls: [], interests: [],
          chats_count: 0, matches_count: 0, reports: [],
          journey,
          dropped_off_at: droppedAtIndex === -1 ? null : journey[droppedAtIndex].label,
          last_error: lead.last_error,
          lead,
        });
      }
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

      // Build the signup funnel/journey for this user.
      const email = (authUser?.user?.email ?? '').toLowerCase();
      let lead: any = null;
      if (email) {
        const { data } = await admin.from('signup_leads').select('*').ilike('email', email).maybeSingle();
        lead = data;
      }
      if (!lead) {
        const { data } = await admin.from('signup_leads').select('*').eq('auth_user_id', id).maybeSingle();
        lead = data;
      }

      const { data: payments } = await admin.from('payment_submissions')
        .select('id, plan, status, created_at, reviewed_at')
        .eq('user_id', id).order('created_at', { ascending: true });

      const firstApprovedPayment = (payments ?? []).find((p: any) => p.status === 'approved');
      const journey = [
        {
          key: 'form_filled',
          label: 'Form filled (email/phone entered)',
          completed: !!lead || !!profile,
          at: lead?.created_at ?? profile?.created_at ?? null,
          detail: lead ? `${lead.attempts ?? 1} attempt${(lead.attempts ?? 1) > 1 ? 's' : ''}` : null,
        },
        {
          key: 'account_created',
          label: 'Account created',
          completed: !!authUser?.user,
          at: authUser?.user?.created_at ?? null,
          detail: authUser?.user?.email ?? null,
        },
        {
          key: 'email_verified',
          label: 'Email verified',
          completed: !!(authUser?.user?.email_confirmed_at || (authUser?.user as any)?.confirmed_at),
          at: authUser?.user?.email_confirmed_at ?? (authUser?.user as any)?.confirmed_at ?? lead?.email_verified_at ?? null,
        },
        {
          key: 'onboarding_completed',
          label: 'Onboarding completed',
          completed: !!profile?.onboarded,
          at: profile?.onboarded ? profile?.updated_at ?? null : null,
          detail: !profile?.onboarded
            ? `Stopped at step ${profile?.onboarding_step ?? 0}`
            : null,
        },
        {
          key: 'plan_selected',
          label: 'Plan selected',
          completed: !!profile?.selected_plan,
          at: null,
          detail: profile?.selected_plan ?? null,
        },
        {
          key: 'payment_submitted',
          label: 'Payment submitted',
          completed: (payments ?? []).length > 0,
          at: payments?.[0]?.created_at ?? null,
          detail: (payments ?? []).length ? `${payments?.length} submission(s)` : null,
        },
        {
          key: 'payment_approved',
          label: 'Payment approved · account active',
          completed: !!firstApprovedPayment || profile?.account_status === 'active',
          at: firstApprovedPayment?.reviewed_at ?? null,
          detail: firstApprovedPayment?.plan ?? profile?.plan ?? null,
        },
      ];
      const droppedAtIndex = journey.findIndex((s) => !s.completed);
      const dropped_off_at = droppedAtIndex === -1 ? null : journey[droppedAtIndex].label;
      const last_error = lead?.last_error ?? null;

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
        journey,
        dropped_off_at,
        last_error,
        lead,
      });
    }

    if (action === 'set_user_flags') {
      const { id, suspended, banned } = await req.json();
      if (!id) return json({ error: 'id required' }, 400);
      const patch: Record<string, unknown> = {};
      if (typeof suspended === 'boolean') patch.suspended = suspended;
      if (typeof banned === 'boolean') patch.banned = banned;
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

    if (action === 'list_tickets') {
      const { search: q, status, type, sort } = await req.json().catch(() => ({}));
      let query = admin.from('support_tickets').select('*');
      if (status) query = query.eq('status', status);
      if (type) query = query.eq('ticket_type', type);
      if (q && q.trim()) {
        const term = `%${q.trim()}%`;
        query = query.or(`full_name.ilike.${term},email.ilike.${term},subject.ilike.${term},message.ilike.${term},transaction_id.ilike.${term}`);
      }
      query = query.order('created_at', { ascending: sort === 'oldest' });
      const { data, error } = await query.limit(500);
      if (error) return json({ error: error.message }, 500);
      return json({ tickets: data ?? [] });
    }

    if (action === 'update_ticket') {
      const { id, status, priority, admin_notes } = await req.json();
      if (!id) return json({ error: 'id required' }, 400);
      const patch: Record<string, unknown> = {};
      if (status) patch.status = status;
      if (priority) patch.priority = priority;
      if (typeof admin_notes === 'string') patch.admin_notes = admin_notes;
      const { error } = await admin.from('support_tickets').update(patch).eq('id', id);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === 'get_setting') {
      const { key } = await req.json();
      if (!key) return json({ error: 'key required' }, 400);
      const { data, error } = await admin.from('app_settings').select('value, updated_at').eq('key', key).maybeSingle();
      if (error) return json({ error: error.message }, 500);
      return json({ value: data?.value ?? null, updated_at: data?.updated_at ?? null });
    }

    if (action === 'set_setting') {
      const { key, value } = await req.json();
      if (!key || typeof value === 'undefined') return json({ error: 'key and value required' }, 400);
      const { error } = await admin.from('app_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    // ---------- PAYMENTS ----------
    if (action === 'list_payments') {
      const { status, search: q } = await req.json().catch(() => ({}));
      let query = admin.from('payment_submissions').select('*').order('created_at', { ascending: false }).limit(500);
      if (status) query = query.eq('status', status);
      const { data: subs, error } = await query;
      if (error) return json({ error: error.message }, 500);

      // Enrich with profile + email
      const ids = Array.from(new Set((subs ?? []).map((s: any) => s.user_id)));
      const profilesMap = new Map<string, any>();
      if (ids.length) {
        const { data: profs } = await admin.from('profiles')
          .select('id, first_name, account_status, payment_status, selected_plan, phone, is_admin_created, plan')
          .in('id', ids);
        for (const p of profs ?? []) profilesMap.set(p.id, p);
      }
      const { data: authPage } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const emails = new Map<string, string>();
      for (const u of authPage?.users ?? []) emails.set(u.id, u.email ?? '');

      let rows = (subs ?? []).map((s: any) => ({
        ...s,
        name: profilesMap.get(s.user_id)?.first_name ?? '',
        email: emails.get(s.user_id) ?? '',
        account_status: profilesMap.get(s.user_id)?.account_status ?? 'locked',
        is_admin_created: !!profilesMap.get(s.user_id)?.is_admin_created,
      }));

      if (q && q.trim()) {
        const term = q.trim().toLowerCase();
        rows = rows.filter((r: any) =>
          (r.name ?? '').toLowerCase().includes(term)
          || (r.email ?? '').toLowerCase().includes(term)
          || (r.phone ?? '').toLowerCase().includes(term)
          || (r.upi_reference ?? '').toLowerCase().includes(term)
        );
      }
      return json({ payments: rows });
    }

    if (action === 'update_payment_status') {
      const { id, status, admin_notes } = await req.json();
      if (!id || !['approved', 'rejected', 'pending'].includes(status)) return json({ error: 'Invalid input' }, 400);

      const { data: sub, error: subErr } = await admin.from('payment_submissions').select('*').eq('id', id).maybeSingle();
      if (subErr || !sub) return json({ error: 'Payment not found' }, 404);

      const patch: any = { status, reviewed_at: new Date().toISOString(), reviewed_by: auth.adminId };
      if (typeof admin_notes === 'string') patch.admin_notes = admin_notes;
      const { error: upErr } = await admin.from('payment_submissions').update(patch).eq('id', id);
      if (upErr) return json({ error: upErr.message }, 500);

      // Mirror to profile
      const profPatch: any = { payment_status: status };
      if (status === 'approved') {
        profPatch.account_status = 'active';
        profPatch.plan = sub.plan;
        profPatch.selected_plan = sub.plan;
        const start = new Date();
        const end = new Date(start);
        end.setDate(end.getDate() + 30); // default 30-day cycle; admin can override later
        profPatch.plan_started_at = start.toISOString();
        profPatch.plan_expires_at = end.toISOString();
      } else if (status === 'rejected') {
        profPatch.account_status = 'locked';
      }
      await admin.from('profiles').update(profPatch).eq('id', sub.user_id);

      // Fire Meta CAPI Purchase event ONCE per approval (only when transitioning to approved).
      if (status === 'approved' && sub.status !== 'approved') {
        try {
          const value = PLAN_PRICE_INR[sub.plan] ?? 0;
          const { data: userResp } = await admin.auth.admin.getUserById(sub.user_id);
          const email = userResp?.user?.email ?? null;
          await sendMetaEvent({
            event_name: 'Purchase',
            event_id: `purchase_${sub.id}`,
            action_source: 'system_generated',
            user: { email, phone: sub.phone, external_id: sub.user_id },
            custom_data: {
              currency: 'INR',
              value,
              content_name: sub.plan,
              content_type: 'subscription',
            },
          });
        } catch (e) {
          console.error('[admin-data] Meta Purchase send failed', e);
        }
      }
      return json({ ok: true });
    }

    if (action === 'assign_plan') {
      const { user_id, plan, plan_started_at, plan_expires_at, duration_days } = await req.json();
      if (!user_id || !plan) return json({ error: 'user_id and plan required' }, 400);
      const patch: Record<string, unknown> = { plan, selected_plan: plan };

      // Resolve start date (defaults to now when not provided)
      let startISO: string | null = null;
      if (plan_started_at) startISO = new Date(plan_started_at).toISOString();
      else startISO = new Date().toISOString();
      patch.plan_started_at = startISO;

      // Resolve expiry: explicit date wins, else duration_days from start, else null (no expiry)
      if (plan_expires_at) {
        patch.plan_expires_at = new Date(plan_expires_at).toISOString();
      } else if (duration_days && Number.isFinite(Number(duration_days))) {
        const start = new Date(startISO);
        start.setDate(start.getDate() + Number(duration_days));
        patch.plan_expires_at = start.toISOString();
      } else {
        patch.plan_expires_at = null;
      }

      const { error } = await admin.from('profiles').update(patch).eq('id', user_id);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === 'set_account_status') {
      const { user_id, account_status } = await req.json();
      if (!user_id || !['locked', 'active'].includes(account_status)) return json({ error: 'Invalid' }, 400);
      const { error } = await admin.from('profiles').update({ account_status }).eq('id', user_id);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    // ---------- CREATE PROFILE (admin) ----------
    if (action === 'create_admin_profile') {
      const { email, password, first_name, age, gender, city, looking_for, story, plan, prompts, interests } = await req.json();
      if (!email || !password || !first_name) return json({ error: 'email, password, first_name required' }, 400);

      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { first_name },
      });
      if (cErr || !created?.user) return json({ error: cErr?.message ?? 'Could not create user' }, 500);

      const newId = created.user.id;
      await admin.from('profiles').update({
        first_name,
        age: age ?? null,
        gender: gender ?? null,
        city: city ?? null,
        looking_for: looking_for ?? null,
        story: story ?? null,
        is_admin_created: true,
        onboarded: true,
        account_status: 'active',
        payment_status: 'approved',
        plan: plan ?? 'starter',
        selected_plan: plan ?? 'starter',
      }).eq('id', newId);

      const promptRows = (prompts ?? [])
        .filter((p: any) => p && p.question && p.answer)
        .map((p: any, i: number) => ({ user_id: newId, question: String(p.question), answer: String(p.answer), position: i }));
      if (promptRows.length) await admin.from('profile_prompts').insert(promptRows);

      const interestRows = (interests ?? [])
        .filter((i: any) => typeof i === 'string' && i.trim())
        .map((i: string) => ({ user_id: newId, interest: i.trim() }));
      if (interestRows.length) await admin.from('profile_interests').insert(interestRows);

      return json({ ok: true, user_id: newId });
    }

    // ---------- PAYMENT HISTORY ----------
    if (action === 'payment_history') {
      const { search: q, status, plan, dateFrom, dateTo } = await req.json().catch(() => ({}));
      let query = admin.from('payment_submissions').select('*').order('created_at', { ascending: false }).limit(1000);
      if (status) query = query.eq('status', status);
      if (plan) query = query.eq('plan', plan);
      if (dateFrom) query = query.gte('created_at', dateFrom);
      if (dateTo) query = query.lte('created_at', dateTo);
      const { data: subs, error } = await query;
      if (error) return json({ error: error.message }, 500);

      const ids = Array.from(new Set((subs ?? []).map((s: any) => s.user_id)));
      const profilesMap = new Map<string, any>();
      if (ids.length) {
        const { data: profs } = await admin.from('profiles')
          .select('id, first_name, account_status, payment_status, phone, is_admin_created')
          .in('id', ids);
        for (const p of profs ?? []) profilesMap.set(p.id, p);
      }
      const { data: authPage } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const emails = new Map<string, string>();
      for (const u of authPage?.users ?? []) emails.set(u.id, u.email ?? '');

      let rows = (subs ?? []).map((s: any) => ({
        ...s,
        name: profilesMap.get(s.user_id)?.first_name ?? '',
        email: emails.get(s.user_id) ?? '',
        account_status: profilesMap.get(s.user_id)?.account_status ?? 'locked',
      }));

      if (q && q.trim()) {
        const term = q.trim().toLowerCase();
        rows = rows.filter((r: any) =>
          (r.name ?? '').toLowerCase().includes(term)
          || (r.email ?? '').toLowerCase().includes(term)
          || (r.phone ?? '').toLowerCase().includes(term)
          || (r.upi_reference ?? '').toLowerCase().includes(term)
        );
      }

      const totals = {
        total: rows.length,
        approved: rows.filter((r: any) => r.status === 'approved').length,
        rejected: rows.filter((r: any) => r.status === 'rejected').length,
        pending: rows.filter((r: any) => r.status === 'pending').length,
      };
      return json({ payments: rows, totals });
    }

    // ---------- IMPERSONATE (read-only) ----------
    // Returns a short-lived signed read token + lightweight snapshot of the user's view.
    if (action === 'impersonate_view') {
      const { user_id } = await req.json();
      if (!user_id) return json({ error: 'user_id required' }, 400);

      const [{ data: profile }, { data: matchesRows }, { data: photos }] = await Promise.all([
        admin.from('profiles').select('*').eq('id', user_id).maybeSingle(),
        admin.from('matches').select('*').or(`user_a.eq.${user_id},user_b.eq.${user_id}`).order('created_at', { ascending: false }),
        admin.from('profile_photos').select('storage_path, position').eq('user_id', user_id).order('position'),
      ]);

      // Pull other-side profile snippets + last messages per match
      const otherIds = (matchesRows ?? []).map((m: any) => m.user_a === user_id ? m.user_b : m.user_a);
      const profMap = new Map<string, any>();
      if (otherIds.length) {
        const { data: profs } = await admin.from('profiles').select('id, first_name, age, city').in('id', otherIds);
        for (const p of profs ?? []) profMap.set(p.id, p);
      }

      const matches: any[] = [];
      for (const m of matchesRows ?? []) {
        const otherId = m.user_a === user_id ? m.user_b : m.user_a;
        const { data: msgs } = await admin
          .from('messages').select('id, body, sender_id, created_at')
          .eq('match_id', m.id).order('created_at', { ascending: true }).limit(50);
        matches.push({
          id: m.id,
          other: profMap.get(otherId) ?? { id: otherId },
          messages: msgs ?? [],
          created_at: m.created_at,
        });
      }

      let photo_urls: string[] = [];
      for (const p of photos ?? []) {
        const { data } = await admin.storage.from('photos').createSignedUrl(p.storage_path, 600);
        if (data?.signedUrl) photo_urls.push(data.signedUrl);
      }

      return json({ profile, matches, photo_urls });
    }

    if (action === 'list_leads' || action === 'export_leads') {
      const body = await req.clone().json().catch(() => ({}));
      let q = admin.from('signup_leads').select('*').order('created_at', { ascending: false }).limit(action === 'export_leads' ? 5000 : 500);
      if (body.search) {
        const s = String(body.search).trim();
        q = q.or(`email.ilike.%${s}%,phone.ilike.%${s}%,first_name.ilike.%${s}%`);
      }
      if (body.status === 'unverified') q = q.is('email_verified_at', null);
      if (body.status === 'verified') q = q.not('email_verified_at', 'is', null);
      if (body.status === 'incomplete') q = q.is('signup_completed_at', null);
      if (body.status === 'completed') q = q.not('signup_completed_at', 'is', null);
      const { data, error } = await q;
      if (error) return json({ error: error.message }, 500);
      const rows = (data ?? []).map((l) => ({
        id: l.id,
        first_name: l.first_name ?? '',
        email: l.email ?? '',
        phone: l.phone ?? '',
        attempts: l.attempts ?? 1,
        attempted_at: l.signup_attempted_at,
        verified_at: l.email_verified_at,
        completed_at: l.signup_completed_at,
        auth_user_id: l.auth_user_id ?? '',
        last_error: l.last_error ?? '',
        source: l.source ?? '',
        utm_source: l.utm_source ?? '',
        ip: l.ip ?? '',
        created_at: l.created_at,
      }));
      if (action === 'export_leads') {
        const cols = ['first_name','email','phone','attempts','attempted_at','verified_at','completed_at','auth_user_id','last_error','source','utm_source','ip','created_at'];
        const csv = toCsv(rows as any, cols);
        return new Response(csv, { headers: { ...corsHeaders, 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="leads.csv"' } });
      }
      return json({ leads: rows });
    }

    if (action === 'delete_lead') {
      const body = await req.clone().json().catch(() => ({}));
      const { error } = await admin.from('signup_leads').delete().eq('id', body.id);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (e) {
    console.error('admin-data error', e);
    return json({ error: String(e) }, 500);
  }
});
