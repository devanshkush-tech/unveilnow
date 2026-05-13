
-- Blind Date credits & paid columns
ALTER TABLE public.blind_date_profiles
  ADD COLUMN IF NOT EXISTS chats_remaining int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS extended_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS extended_completed boolean NOT NULL DEFAULT false;

-- Atomic decrement helper
CREATE OR REPLACE FUNCTION public.bd_consume_chat(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _ok boolean := false;
BEGIN
  UPDATE public.blind_date_profiles
     SET chats_remaining = chats_remaining - 1,
         sessions_used = sessions_used + 1,
         updated_at = now()
   WHERE user_id = _user_id
     AND chats_remaining > 0
   RETURNING true INTO _ok;
  RETURN COALESCE(_ok, false);
END;
$$;

-- Trigger: deduct one credit per user when both decisions become 'continue'
CREATE OR REPLACE FUNCTION public.bd_on_mutual_continue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.decision_a = 'continue' AND NEW.decision_b = 'continue'
     AND (OLD.decision_a IS DISTINCT FROM 'continue' OR OLD.decision_b IS DISTINCT FROM 'continue') THEN
    PERFORM public.bd_consume_chat(NEW.user_a);
    PERFORM public.bd_consume_chat(NEW.user_b);
    NEW.status := 'matched';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bd_mutual_continue ON public.blind_date_sessions;
CREATE TRIGGER trg_bd_mutual_continue
  BEFORE UPDATE ON public.blind_date_sessions
  FOR EACH ROW EXECUTE FUNCTION public.bd_on_mutual_continue();

-- Update get_my_bd_profile RPC to expose new fields
DROP FUNCTION IF EXISTS public.get_my_bd_profile();
CREATE OR REPLACE FUNCTION public.get_my_bd_profile()
RETURNS TABLE(
  user_id uuid,
  answers jsonb,
  extended_answers jsonb,
  plan text,
  chats_remaining int,
  paid boolean,
  sessions_used int,
  sessions_limit int,
  period_start timestamptz,
  completed boolean,
  extended_completed boolean
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT user_id, answers, extended_answers, plan, chats_remaining, paid,
         sessions_used, sessions_limit, period_start, completed, extended_completed
    FROM public.blind_date_profiles
   WHERE user_id = auth.uid();
$$;

-- Save extended (post-payment) answers
CREATE OR REPLACE FUNCTION public.save_my_bd_extended(_answers jsonb, _completed boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  INSERT INTO public.blind_date_profiles (user_id, extended_answers, extended_completed)
  VALUES (_uid, _answers, _completed)
  ON CONFLICT (user_id) DO UPDATE
    SET extended_answers = EXCLUDED.extended_answers,
        extended_completed = EXCLUDED.extended_completed OR public.blind_date_profiles.extended_completed,
        updated_at = now();
END;
$$;
