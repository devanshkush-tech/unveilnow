-- Match-based pricing: track monthly match usage and enforce limits in trigger.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS matches_used_this_period integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS match_period_start timestamptz NOT NULL DEFAULT now();

-- Returns NULL when unlimited, otherwise the monthly cap.
CREATE OR REPLACE FUNCTION public.match_limit_for_plan(_plan text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN _plan = 'starter' THEN 5
    WHEN _plan = 'premium' THEN 10
    WHEN _plan = 'elite'   THEN NULL  -- unlimited
    ELSE 5                              -- default to starter cap if unknown
  END;
$$;

-- Reset period if the rolling 30-day window has elapsed.
CREATE OR REPLACE FUNCTION public.refresh_match_period(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
     SET matches_used_this_period = 0,
         match_period_start = now()
   WHERE id = _user_id
     AND match_period_start < (now() - interval '30 days');
END;
$$;

-- Returns usage info for the caller.
CREATE OR REPLACE FUNCTION public.get_my_match_usage()
RETURNS TABLE(plan text, used integer, "limit" integer, period_start timestamptz)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _plan text;
  _used int;
  _start timestamptz;
BEGIN
  IF _uid IS NULL THEN RETURN; END IF;
  SELECT selected_plan, matches_used_this_period, match_period_start
    INTO _plan, _used, _start
    FROM public.profiles WHERE id = _uid;
  -- Effective period: if expired, treat used as 0 for display
  IF _start < (now() - interval '30 days') THEN
    _used := 0;
    _start := now();
  END IF;
  plan := COALESCE(_plan, 'starter');
  used := COALESCE(_used, 0);
  "limit" := public.match_limit_for_plan(plan);
  period_start := _start;
  RETURN NEXT;
END;
$$;

-- Replace mutual-like trigger to enforce per-user monthly cap.
CREATE OR REPLACE FUNCTION public.create_match_on_mutual_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ua UUID; ub UUID; existing_like UUID;
  liker_plan text; liked_plan text;
  liker_used int; liked_used int;
  liker_start timestamptz; liked_start timestamptz;
  liker_limit int; liked_limit int;
BEGIN
  SELECT id INTO existing_like FROM public.likes
   WHERE liker_id = NEW.liked_id AND liked_id = NEW.liker_id;

  IF existing_like IS NULL THEN
    RETURN NEW;
  END IF;

  -- Roll over expired periods so the cap is monthly.
  PERFORM public.refresh_match_period(NEW.liker_id);
  PERFORM public.refresh_match_period(NEW.liked_id);

  SELECT COALESCE(selected_plan,'starter'), matches_used_this_period, match_period_start
    INTO liker_plan, liker_used, liker_start
    FROM public.profiles WHERE id = NEW.liker_id;
  SELECT COALESCE(selected_plan,'starter'), matches_used_this_period, match_period_start
    INTO liked_plan, liked_used, liked_start
    FROM public.profiles WHERE id = NEW.liked_id;

  liker_limit := public.match_limit_for_plan(liker_plan);
  liked_limit := public.match_limit_for_plan(liked_plan);

  -- If either user has reached their cap, do NOT form match.
  IF (liker_limit IS NOT NULL AND liker_used >= liker_limit)
     OR (liked_limit IS NOT NULL AND liked_used >= liked_limit) THEN
    RETURN NEW;
  END IF;

  ua := LEAST(NEW.liker_id, NEW.liked_id);
  ub := GREATEST(NEW.liker_id, NEW.liked_id);

  INSERT INTO public.matches (user_a, user_b) VALUES (ua, ub)
    ON CONFLICT (user_a, user_b) DO NOTHING;

  -- If a match was actually inserted, increment counters for both.
  IF FOUND THEN
    UPDATE public.profiles SET matches_used_this_period = matches_used_this_period + 1 WHERE id = NEW.liker_id;
    UPDATE public.profiles SET matches_used_this_period = matches_used_this_period + 1 WHERE id = NEW.liked_id;
  END IF;

  RETURN NEW;
END;
$$;
