CREATE OR REPLACE FUNCTION public.record_spotlight_view(_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _viewer_id uuid := auth.uid();
  _campaign_id uuid;
BEGIN
  IF _viewer_id IS NULL OR _profile_id IS NULL OR _profile_id = _viewer_id THEN
    RETURN;
  END IF;

  INSERT INTO public.spotlight_view_events (campaign_id, viewer_id)
  SELECT c.id, _viewer_id
  FROM public.spotlight_campaigns c
  JOIN public.profiles p ON p.id = c.user_id
  WHERE c.user_id = _profile_id
    AND c.starts_at <= now()
    AND c.ends_at > now()
    AND p.onboarded = true
    AND p.account_status = 'active'
    AND p.suspended = false
    AND p.banned = false
  ORDER BY c.starts_at DESC
  LIMIT 1
  ON CONFLICT (campaign_id, viewer_id) DO NOTHING
  RETURNING campaign_id INTO _campaign_id;

  IF _campaign_id IS NOT NULL THEN
    UPDATE public.spotlight_campaigns
    SET views_count = views_count + 1
    WHERE id = _campaign_id;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.record_spotlight_view(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_spotlight_view(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_active_spotlight_profiles()
RETURNS TABLE(profile_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT c.user_id
  FROM public.spotlight_campaigns c
  JOIN public.profiles p ON p.id = c.user_id
  WHERE c.starts_at <= now()
    AND c.ends_at > now()
    AND p.onboarded = true
    AND p.account_status = 'active'
    AND p.suspended = false
    AND p.banned = false
    AND c.user_id <> auth.uid();
$$;
REVOKE ALL ON FUNCTION public.get_active_spotlight_profiles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_active_spotlight_profiles() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.activate_spotlight_on_payment_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _duration integer;
  _price integer;
  _expected_amount text;
BEGIN
  IF NEW.feature <> 'spotlight' OR NEW.status <> 'approved'
     OR OLD.status = 'approved' THEN
    RETURN NEW;
  END IF;

  CASE NEW.plan
    WHEN 'spotlight_1d' THEN _duration := 1; _price := 149; _expected_amount := '₹149';
    WHEN 'spotlight_3d' THEN _duration := 3; _price := 299; _expected_amount := '₹299';
    WHEN 'spotlight_5d' THEN _duration := 5; _price := 499; _expected_amount := '₹499';
    ELSE RAISE EXCEPTION 'Invalid Spotlight plan';
  END CASE;

  IF NEW.amount_label IS DISTINCT FROM _expected_amount THEN
    RAISE EXCEPTION 'Spotlight payment amount does not match selected plan';
  END IF;

  INSERT INTO public.spotlight_campaigns (
    user_id, payment_submission_id, plan, duration_days, price_inr, starts_at, ends_at
  ) VALUES (
    NEW.user_id, NEW.id, NEW.plan, _duration, _price, now(), now() + make_interval(days => _duration)
  ) ON CONFLICT (payment_submission_id) DO NOTHING;

  INSERT INTO public.notifications (user_id, type, title, body, cta_text, cta_link, data)
  VALUES (
    NEW.user_id,
    'spotlight_active',
    'Your Spotlight is live',
    'Your profile is now being featured for ' || _duration || CASE WHEN _duration = 1 THEN ' day.' ELSE ' days.' END,
    'View dashboard',
    '/dashboard',
    jsonb_build_object('payment_id', NEW.id, 'plan', NEW.plan, 'duration_days', _duration)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER activate_spotlight_after_payment_approval
  BEFORE UPDATE OF status ON public.payment_submissions
  FOR EACH ROW
  WHEN (NEW.feature = 'spotlight' AND NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved')
  EXECUTE FUNCTION public.activate_spotlight_on_payment_approval();