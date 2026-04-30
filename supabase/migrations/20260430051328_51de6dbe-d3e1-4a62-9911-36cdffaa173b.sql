-- 1. Profiles: new columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'locked',
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS selected_plan text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS is_admin_created boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS grandfathered boolean NOT NULL DEFAULT false;

-- Constrain values
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_account_status_chk,
  ADD CONSTRAINT profiles_account_status_chk CHECK (account_status IN ('locked','active'));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_payment_status_chk,
  ADD CONSTRAINT profiles_payment_status_chk CHECK (payment_status IN ('none','pending','approved','rejected'));

-- 2. Grandfather existing onboarded users
UPDATE public.profiles
   SET account_status = 'active',
       payment_status = 'approved',
       grandfathered  = true
 WHERE onboarded = true
   AND account_status = 'locked';

-- 3. Payment submissions table
CREATE TABLE IF NOT EXISTS public.payment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan text NOT NULL,
  amount_label text,
  phone text,
  upi_reference text,
  whatsapp_sent_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_submissions_status_chk CHECK (status IN ('pending','approved','rejected'))
);

CREATE INDEX IF NOT EXISTS idx_payment_submissions_user ON public.payment_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_submissions_status ON public.payment_submissions(status);

ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payment submissions"
  ON public.payment_submissions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own payment submissions"
  ON public.payment_submissions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage payment submissions"
  ON public.payment_submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete payment submissions"
  ON public.payment_submissions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER payment_submissions_set_updated_at
  BEFORE UPDATE ON public.payment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Tighten RLS so locked users are invisible in discover and can't act
-- Replace profiles SELECT policy: only show active profiles to others
DROP POLICY IF EXISTS "Authenticated can view onboarded profiles" ON public.profiles;
CREATE POLICY "Authenticated can view active profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR (onboarded = true AND account_status = 'active')
  );

-- Helper: is the current user active?
CREATE OR REPLACE FUNCTION public.is_account_active(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND account_status = 'active'
  );
$$;

-- Restrict messaging to active users
DROP POLICY IF EXISTS "Participants send messages" ON public.messages;
CREATE POLICY "Participants send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_account_active(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = messages.match_id
        AND (m.user_a = auth.uid() OR m.user_b = auth.uid())
    )
  );

-- Restrict likes/interests to active users
DROP POLICY IF EXISTS "Users create their own likes" ON public.likes;
CREATE POLICY "Users create their own likes"
  ON public.likes FOR INSERT TO authenticated
  WITH CHECK (liker_id = auth.uid() AND public.is_account_active(auth.uid()));

DROP POLICY IF EXISTS "Users send their own interests" ON public.interest_requests;
CREATE POLICY "Users send their own interests"
  ON public.interest_requests FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND sender_id <> receiver_id
    AND public.is_account_active(auth.uid())
  );