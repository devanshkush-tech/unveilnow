
-- 1) blind_date_sessions: column-scoped decision updates
DROP POLICY IF EXISTS "Participants update decision" ON public.blind_date_sessions;
CREATE POLICY "Participants update decision"
ON public.blind_date_sessions
FOR UPDATE
USING (user_a = auth.uid() OR user_b = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (user_a = auth.uid() OR user_b = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.bd_sessions_guard_decision_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF has_role(uid, 'admin'::app_role) THEN RETURN NEW; END IF;
  IF uid = OLD.user_a AND NEW.decision_b IS DISTINCT FROM OLD.decision_b THEN
    RAISE EXCEPTION 'Not allowed to modify the other participant''s decision';
  END IF;
  IF uid = OLD.user_b AND NEW.decision_a IS DISTINCT FROM OLD.decision_a THEN
    RAISE EXCEPTION 'Not allowed to modify the other participant''s decision';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS bd_sessions_guard_decision_columns ON public.blind_date_sessions;
CREATE TRIGGER bd_sessions_guard_decision_columns
BEFORE UPDATE ON public.blind_date_sessions
FOR EACH ROW EXECUTE FUNCTION public.bd_sessions_guard_decision_columns();

-- 2) Remove payment_submissions from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.payment_submissions;

-- 3) Column-level grants on profiles. Owner reads sensitive cols via get_my_profile() RPC.
REVOKE SELECT ON public.profiles FROM authenticated;
REVOKE SELECT ON public.profiles FROM anon;

GRANT SELECT (
  id, first_name, age, gender, city, profession, intent, voice_intro_path,
  onboarded, created_at, updated_at, story, looking_for, age_min, age_max,
  distance_km, onboarding_step, last_active_at, interested_in,
  match_period_start, matches_used_this_period, plan_started_at,
  plan_period_end, plan_expires_at
) ON public.profiles TO authenticated;
