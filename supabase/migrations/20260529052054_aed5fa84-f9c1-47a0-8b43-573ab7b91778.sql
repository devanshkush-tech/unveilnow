
-- Restore missing table privileges on public schema. RLS still enforces row-level access.
-- This fixes "permission denied for table profiles" and similar errors caused by
-- previous REVOKE statements that left tables without any baseline grants.

-- service_role: full access on everything (used by edge functions, admin paths).
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- authenticated: SELECT on every public table (RLS still applies).
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- General-purpose write grants for user-facing tables.
GRANT INSERT, UPDATE, DELETE ON
  public.blind_date_messages,
  public.blind_date_profiles,
  public.blind_date_sessions,
  public.blocked_users,
  public.interest_requests,
  public.likes,
  public.matches,
  public.message_reads,
  public.messages,
  public.notifications,
  public.payment_submissions,
  public.profile_interests,
  public.profile_photos,
  public.profile_prompts,
  public.reports,
  public.support_tickets,
  public.subscriptions
TO authenticated;

-- profiles: keep column-level grants (already set by 20260526104200). No table-level write grants.

-- Strictly internal tables: no authenticated access.
REVOKE ALL ON public.internal_secrets FROM anon, authenticated;
REVOKE ALL ON public.signup_leads FROM anon, authenticated;
REVOKE ALL ON public.sheet_sync_log FROM anon, authenticated;
REVOKE ALL ON public.admin_accounts FROM anon, authenticated;
REVOKE ALL ON public.admin_sessions FROM anon, authenticated;
REVOKE ALL ON public.email_send_log FROM anon, authenticated;
REVOKE ALL ON public.email_send_state FROM anon, authenticated;
REVOKE ALL ON public.suppressed_emails FROM anon, authenticated;
REVOKE ALL ON public.email_unsubscribe_tokens FROM anon, authenticated;

-- Public-readable tables (RLS open): allow anon to read.
GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT ON public.prompts_library TO anon;

-- Re-grant EXECUTE on user-facing RPCs that were revoked.
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_match_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
