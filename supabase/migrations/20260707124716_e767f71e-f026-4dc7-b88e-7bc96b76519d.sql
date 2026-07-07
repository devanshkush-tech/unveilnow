CREATE OR REPLACE FUNCTION public.grant_free_access_for_women()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.gender = 'Woman' THEN
    NEW.account_status := 'active';
    NEW.payment_status := 'approved';
    NEW.selected_plan := COALESCE(NEW.selected_plan, 'elite');
    NEW.plan := 'elite';
    NEW.plan_started_at := COALESCE(NEW.plan_started_at, now());
    NEW.plan_period_end := now() + interval '100 years';
    NEW.plan_expires_at := now() + interval '100 years';
    IF NEW.match_period_start IS NULL THEN
      NEW.match_period_start := now();
    END IF;

    BEGIN
      INSERT INTO public.blind_date_profiles (user_id, plan, paid, chats_remaining)
      VALUES (NEW.id, 'elite', true, 9999)
      ON CONFLICT (user_id) DO UPDATE
        SET paid = true,
            plan = 'elite',
            chats_remaining = GREATEST(public.blind_date_profiles.chats_remaining, 9999),
            updated_at = now();
    EXCEPTION WHEN foreign_key_violation THEN
      NULL;
    END;
  END IF;
  RETURN NEW;
END;
$$;