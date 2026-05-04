-- Capture every signup attempt as a "lead" so admins can see incomplete/unverified users.
CREATE TABLE IF NOT EXISTS public.signup_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  phone text,
  first_name text,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  user_agent text,
  ip text,
  auth_user_id uuid,
  signup_attempted_at timestamptz NOT NULL DEFAULT now(),
  signup_completed_at timestamptz,
  email_verified_at timestamptz,
  last_error text,
  attempts integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enforce uniqueness on email and phone (case-insensitive for email) so we update existing records instead of creating duplicates.
CREATE UNIQUE INDEX IF NOT EXISTS signup_leads_email_unique ON public.signup_leads (lower(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS signup_leads_phone_unique ON public.signup_leads (phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS signup_leads_created_at_idx ON public.signup_leads (created_at DESC);

ALTER TABLE public.signup_leads ENABLE ROW LEVEL SECURITY;

-- Only admins can read leads (server reads are done via service role from edge function).
CREATE POLICY "Admins read leads"
  ON public.signup_leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update leads"
  ON public.signup_leads FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete leads"
  ON public.signup_leads FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- No client INSERT policy: leads are written exclusively by the capture-lead edge function (service role).

-- Trigger to keep updated_at fresh.
CREATE TRIGGER set_signup_leads_updated_at
  BEFORE UPDATE ON public.signup_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- When a profile is created (post-verification), mark the lead as completed/verified.
CREATE OR REPLACE FUNCTION public.mark_lead_completed_on_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
BEGIN
  SELECT email INTO _email FROM auth.users WHERE id = NEW.id;
  IF _email IS NOT NULL THEN
    UPDATE public.signup_leads
       SET auth_user_id = NEW.id,
           signup_completed_at = COALESCE(signup_completed_at, now()),
           email_verified_at = COALESCE(email_verified_at, now())
     WHERE lower(email) = lower(_email);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mark_lead_completed ON public.profiles;
CREATE TRIGGER trg_mark_lead_completed
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.mark_lead_completed_on_profile();