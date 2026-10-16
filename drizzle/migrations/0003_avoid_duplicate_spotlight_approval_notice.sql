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

  RETURN NEW;
END;
$$;