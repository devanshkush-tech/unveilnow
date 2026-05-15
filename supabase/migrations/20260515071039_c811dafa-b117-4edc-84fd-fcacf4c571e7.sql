
DROP FUNCTION IF EXISTS public.get_my_match_usage();

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_period_end timestamptz;

CREATE OR REPLACE FUNCTION public.plan_period_interval(_plan text)
RETURNS interval LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN _plan = 'starter' THEN interval '7 days'
    WHEN _plan = 'premium' THEN interval '30 days'
    WHEN _plan = 'elite'   THEN interval '30 days'
    ELSE interval '7 days'
  END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_match_period(_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _plan text; _ivl interval;
BEGIN
  SELECT COALESCE(selected_plan,'starter') INTO _plan FROM public.profiles WHERE id = _user_id;
  _ivl := public.plan_period_interval(_plan);
  UPDATE public.profiles
     SET matches_used_this_period = 0,
         match_period_start = now(),
         plan_period_end = now() + _ivl
   WHERE id = _user_id
     AND (match_period_start < (now() - _ivl) OR plan_period_end IS NULL);
END;
$$;

CREATE FUNCTION public.get_my_match_usage()
RETURNS TABLE(plan text, used integer, "limit" integer, period_start timestamptz, period_end timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _plan text; _used int; _start timestamptz; _end timestamptz; _ivl interval;
BEGIN
  IF _uid IS NULL THEN RETURN; END IF;
  SELECT COALESCE(selected_plan,'starter'), matches_used_this_period, match_period_start, plan_period_end
    INTO _plan, _used, _start, _end
    FROM public.profiles WHERE id = _uid;
  _ivl := public.plan_period_interval(_plan);
  IF _start IS NULL OR _start < (now() - _ivl) THEN
    _used := 0; _start := now(); _end := now() + _ivl;
  END IF;
  IF _end IS NULL THEN _end := _start + _ivl; END IF;
  plan := _plan; used := COALESCE(_used,0);
  "limit" := public.match_limit_for_plan(_plan);
  period_start := _start; period_end := _end;
  RETURN NEXT;
END;
$$;

ALTER TABLE public.payment_submissions
  ADD COLUMN IF NOT EXISTS target_user_id uuid;

CREATE TABLE IF NOT EXISTS public.interest_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  payment_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_user_id)
);
ALTER TABLE public.interest_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view their own unlocks" ON public.interest_unlocks;
CREATE POLICY "Users view their own unlocks" ON public.interest_unlocks
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins manage unlocks" ON public.interest_unlocks;
CREATE POLICY "Admins manage unlocks" ON public.interest_unlocks
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  cta_text text,
  cta_link text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins manage notifications" ON public.notifications;
CREATE POLICY "Admins manage notifications" ON public.notifications
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.notification_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  type text NOT NULL DEFAULT 'announcement',
  cta_text text,
  cta_link text,
  audience jsonb NOT NULL DEFAULT '{}'::jsonb,
  send_in_app boolean NOT NULL DEFAULT true,
  send_email boolean NOT NULL DEFAULT false,
  sent_count integer NOT NULL DEFAULT 0,
  email_status text,
  sent_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage campaigns" ON public.notification_campaigns;
CREATE POLICY "Admins manage campaigns" ON public.notification_campaigns
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications(user_id, type, title, body, cta_text, cta_link, data)
  VALUES (NEW.liked_id, 'like', 'Someone liked you', 'A member just liked your profile.',
          'Unlock to view', '/unlock-interest/' || NEW.liker_id::text,
          jsonb_build_object('from_user_id', NEW.liker_id));
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_on_like ON public.likes;
CREATE TRIGGER trg_notify_on_like AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();

CREATE OR REPLACE FUNCTION public.notify_on_match()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications(user_id, type, title, body, cta_text, cta_link, data)
  VALUES
    (NEW.user_a, 'match', 'It''s a match!', 'You and a member matched. Start a conversation.',
     'Open match', '/dashboard/matches', jsonb_build_object('match_id', NEW.id, 'with_user_id', NEW.user_b)),
    (NEW.user_b, 'match', 'It''s a match!', 'You and a member matched. Start a conversation.',
     'Open match', '/dashboard/matches', jsonb_build_object('match_id', NEW.id, 'with_user_id', NEW.user_a));
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_on_match ON public.matches;
CREATE TRIGGER trg_notify_on_match AFTER INSERT ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.notify_on_match();

CREATE OR REPLACE FUNCTION public.notify_on_interest()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications(user_id, type, title, body, cta_text, cta_link, data)
    VALUES (NEW.receiver_id, 'interest', 'Someone showed interest in your profile',
            'Unlock to view who it was.', 'Unlock for ₹99',
            '/unlock-interest/' || NEW.sender_id::text,
            jsonb_build_object('from_user_id', NEW.sender_id));
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_on_interest ON public.interest_requests;
CREATE TRIGGER trg_notify_on_interest AFTER INSERT ON public.interest_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_on_interest();

CREATE OR REPLACE FUNCTION public.notify_on_payment_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' AND COALESCE(OLD.status,'') <> 'approved' THEN
    INSERT INTO public.notifications(user_id, type, title, body, cta_text, cta_link, data)
    VALUES (NEW.user_id, 'payment_success', 'Payment approved',
            'Your payment has been approved. Welcome aboard!', 'Open dashboard', '/dashboard',
            jsonb_build_object('payment_id', NEW.id, 'plan', NEW.plan));
    IF NEW.feature = 'unlock_interest' AND NEW.target_user_id IS NOT NULL THEN
      INSERT INTO public.interest_unlocks(user_id, target_user_id, payment_id)
      VALUES (NEW.user_id, NEW.target_user_id, NEW.id)
      ON CONFLICT DO NOTHING;
    END IF;
    IF NEW.feature = 'core' THEN
      UPDATE public.profiles
         SET selected_plan = NEW.plan,
             plan_started_at = now(),
             plan_period_end = now() + public.plan_period_interval(NEW.plan),
             match_period_start = now(),
             matches_used_this_period = 0,
             payment_status = 'paid',
             account_status = 'active'
       WHERE id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_notify_on_payment_status ON public.payment_submissions;
CREATE TRIGGER trg_notify_on_payment_status AFTER UPDATE ON public.payment_submissions
FOR EACH ROW EXECUTE FUNCTION public.notify_on_payment_status();

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
