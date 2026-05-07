
-- Enable pg_net for HTTP from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Sync log
CREATE TABLE IF NOT EXISTS public.sheet_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  lead_id UUID,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  request_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sheet_sync_log_status ON public.sheet_sync_log(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sheet_sync_log_user ON public.sheet_sync_log(user_id);

ALTER TABLE public.sheet_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read sheet sync log"
  ON public.sheet_sync_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update sheet sync log"
  ON public.sheet_sync_log FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Settings holder for the edge URL + service key (read by trigger function)
-- We rely on edge function URL constructed from project ref.

-- Helper: enqueue a sync
CREATE OR REPLACE FUNCTION public.enqueue_sheet_sync(_user_id UUID, _lead_id UUID, _source TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _url TEXT := 'https://iwgbcneinoojcvcsixib.supabase.co/functions/v1/sync-user-to-sheets';
  _anon TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Z2JjbmVpbm9vamN2Y3NpeGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNTcxMjksImV4cCI6MjA5MjgzMzEyOX0.DgyWCZ9E78EsNy5pa1hI0-cC9-W4jfoX3w4foA2PDLA';
  _log_id UUID;
  _req_id BIGINT;
BEGIN
  INSERT INTO public.sheet_sync_log (user_id, lead_id, source, status)
  VALUES (_user_id, _lead_id, _source, 'pending')
  RETURNING id INTO _log_id;

  SELECT net.http_post(
    url := _url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || _anon),
    body := jsonb_build_object('user_id', _user_id, 'lead_id', _lead_id, 'log_id', _log_id, 'source', _source)
  ) INTO _req_id;

  UPDATE public.sheet_sync_log SET request_id = _req_id WHERE id = _log_id;
EXCEPTION WHEN OTHERS THEN
  -- never block writes
  NULL;
END;
$$;

-- Trigger fns
CREATE OR REPLACE FUNCTION public.trg_profiles_sheet_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.enqueue_sheet_sync(NEW.id, NULL, 'profiles.insert');
    RETURN NEW;
  END IF;

  -- Detect meaningful changes
  IF (OLD.first_name IS DISTINCT FROM NEW.first_name)
     OR (OLD.phone IS DISTINCT FROM NEW.phone)
     OR (OLD.gender IS DISTINCT FROM NEW.gender)
     OR (OLD.age IS DISTINCT FROM NEW.age)
     OR (OLD.city IS DISTINCT FROM NEW.city)
     OR (OLD.story IS DISTINCT FROM NEW.story)
     OR (OLD.selected_plan IS DISTINCT FROM NEW.selected_plan)
     OR (OLD.payment_status IS DISTINCT FROM NEW.payment_status)
     OR (OLD.account_status IS DISTINCT FROM NEW.account_status)
     OR (OLD.onboarded IS DISTINCT FROM NEW.onboarded)
     OR (OLD.onboarding_step IS DISTINCT FROM NEW.onboarding_step)
     OR (OLD.plan IS DISTINCT FROM NEW.plan)
     OR (OLD.intent IS DISTINCT FROM NEW.intent)
     OR (OLD.profession IS DISTINCT FROM NEW.profession)
     OR (OLD.suspended IS DISTINCT FROM NEW.suspended)
     OR (OLD.banned IS DISTINCT FROM NEW.banned)
     OR (
       OLD.last_active_at IS DISTINCT FROM NEW.last_active_at
       AND (OLD.last_active_at IS NULL OR NEW.last_active_at - OLD.last_active_at > interval '5 minutes')
     )
  THEN
    PERFORM public.enqueue_sheet_sync(NEW.id, NULL, 'profiles.update');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sheet_sync ON public.profiles;
CREATE TRIGGER profiles_sheet_sync
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.trg_profiles_sheet_sync();

CREATE OR REPLACE FUNCTION public.trg_payments_sheet_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (OLD.status IS DISTINCT FROM NEW.status) THEN
    PERFORM public.enqueue_sheet_sync(NEW.user_id, NULL, 'payment_submissions.' || lower(TG_OP));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payments_sheet_sync ON public.payment_submissions;
CREATE TRIGGER payments_sheet_sync
AFTER INSERT OR UPDATE ON public.payment_submissions
FOR EACH ROW EXECUTE FUNCTION public.trg_payments_sheet_sync();

CREATE OR REPLACE FUNCTION public.trg_leads_sheet_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT'
     OR (OLD.email IS DISTINCT FROM NEW.email)
     OR (OLD.phone IS DISTINCT FROM NEW.phone)
     OR (OLD.first_name IS DISTINCT FROM NEW.first_name)
     OR (OLD.email_verified_at IS DISTINCT FROM NEW.email_verified_at)
     OR (OLD.signup_completed_at IS DISTINCT FROM NEW.signup_completed_at)
     OR (OLD.auth_user_id IS DISTINCT FROM NEW.auth_user_id)
  THEN
    PERFORM public.enqueue_sheet_sync(NEW.auth_user_id, NEW.id, 'signup_leads.' || lower(TG_OP));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS leads_sheet_sync ON public.signup_leads;
CREATE TRIGGER leads_sheet_sync
AFTER INSERT OR UPDATE ON public.signup_leads
FOR EACH ROW EXECUTE FUNCTION public.trg_leads_sheet_sync();
