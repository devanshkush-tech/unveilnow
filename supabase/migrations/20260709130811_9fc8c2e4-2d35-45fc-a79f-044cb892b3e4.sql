
-- 1) blind_date_sessions: ensure guard trigger exists and tighten policy WITH CHECK
DROP TRIGGER IF EXISTS bd_sessions_guard_decision_columns_trg ON public.blind_date_sessions;
CREATE TRIGGER bd_sessions_guard_decision_columns_trg
BEFORE UPDATE ON public.blind_date_sessions
FOR EACH ROW EXECUTE FUNCTION public.bd_sessions_guard_decision_columns();

-- Rewrite participants update policy so users cannot change the other participant's decision or protected columns
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='blind_date_sessions' AND cmd='UPDATE'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.blind_date_sessions', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "Participants update own decision only"
ON public.blind_date_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_a OR auth.uid() = user_b)
WITH CHECK (
  (auth.uid() = user_a OR auth.uid() = user_b)
  AND (
    auth.uid() <> user_a
    OR NOT (decision_b IS DISTINCT FROM (SELECT decision_b FROM public.blind_date_sessions s WHERE s.id = blind_date_sessions.id))
  )
  AND (
    auth.uid() <> user_b
    OR NOT (decision_a IS DISTINCT FROM (SELECT decision_a FROM public.blind_date_sessions s WHERE s.id = blind_date_sessions.id))
  )
);

-- 2) Scope email_* policies to service_role role only (drop the public-role policies)
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tablename, policyname FROM pg_policies
    WHERE schemaname='public'
      AND tablename IN ('email_send_state','email_send_log','email_unsubscribe_tokens','suppressed_emails')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

CREATE POLICY "service_role manages email_send_state" ON public.email_send_state
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role manages email_send_log" ON public.email_send_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role manages email_unsubscribe_tokens" ON public.email_unsubscribe_tokens
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role manages suppressed_emails" ON public.suppressed_emails
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Revoke any lingering public/anon/authenticated grants on these internal tables
REVOKE ALL ON public.email_send_state, public.email_send_log, public.email_unsubscribe_tokens, public.suppressed_emails FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.email_send_state, public.email_send_log, public.email_unsubscribe_tokens, public.suppressed_emails TO service_role;

-- 3) internal_secrets: add explicit service_role-only policy (fail-closed for everyone else)
CREATE POLICY "service_role manages internal_secrets" ON public.internal_secrets
  FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON public.internal_secrets FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.internal_secrets TO service_role;
