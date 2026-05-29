
-- Restore Data API access for all public schema tables.
-- RLS is still enforced; grants are required for PostgREST to reach the tables at all.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Broad baseline: authenticated can do CRUD subject to RLS; service_role bypasses RLS.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;

-- Anon only needs read access to a few publicly-viewable tables (none currently exposed),
-- so we keep anon locked out by default. Re-grant explicitly per table if needed.

-- Lock down sensitive internal tables (defense in depth).
REVOKE ALL ON public.internal_secrets   FROM anon, authenticated;
REVOKE ALL ON public.admin_accounts     FROM anon, authenticated;
REVOKE ALL ON public.admin_sessions     FROM anon, authenticated;
REVOKE ALL ON public.email_send_log     FROM anon, authenticated;
REVOKE ALL ON public.email_send_state   FROM anon, authenticated;
REVOKE ALL ON public.email_unsubscribe_tokens FROM anon, authenticated;
REVOKE ALL ON public.suppressed_emails  FROM anon, authenticated;
REVOKE ALL ON public.sheet_sync_log     FROM anon;

-- Default privileges for any future tables created by the postgres role.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO authenticated, service_role;
