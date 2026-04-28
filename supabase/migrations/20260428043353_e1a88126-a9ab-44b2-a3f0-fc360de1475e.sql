
-- =========================================
-- 1. ROLES
-- =========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "Users view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-promote the very first user to admin so /admin is reachable
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
      ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- Backfill role rows for existing users (oldest = admin)
INSERT INTO public.user_roles (user_id, role)
SELECT id,
  CASE WHEN id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
       THEN 'admin'::public.app_role ELSE 'user'::public.app_role END
FROM auth.users
ON CONFLICT DO NOTHING;

-- =========================================
-- 2. PROFILES — extra columns
-- =========================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS story TEXT,
  ADD COLUMN IF NOT EXISTS looking_for TEXT,
  ADD COLUMN IF NOT EXISTS age_min INTEGER DEFAULT 24,
  ADD COLUMN IF NOT EXISTS age_max INTEGER DEFAULT 40,
  ADD COLUMN IF NOT EXISTS distance_km INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER NOT NULL DEFAULT 0;

-- =========================================
-- 3. PROMPTS LIBRARY
-- =========================================
CREATE TABLE public.prompts_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'about-me',
  position INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.prompts_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read active prompts"
  ON public.prompts_library FOR SELECT TO authenticated
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage prompts"
  ON public.prompts_library FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.prompts_library (text, category, position) VALUES
  ('My green flag is…', 'about-me', 1),
  ('Sunday with me looks like…', 'about-me', 2),
  ('I fall for people who…', 'values', 3),
  ('My biggest strength is…', 'about-me', 4),
  ('I''m secretly proud of…', 'about-me', 5),
  ('The way to win me over is…', 'connection', 6),
  ('I value most in relationships…', 'values', 7),
  ('A lesson life taught me…', 'reflection', 8),
  ('I know I found my person when…', 'connection', 9),
  ('My ideal first date is…', 'connection', 10),
  ('What I''m working on right now…', 'about-me', 11),
  ('A perfect evening for me…', 'about-me', 12),
  ('I get unreasonably excited about…', 'about-me', 13),
  ('My love language is…', 'values', 14),
  ('A non-negotiable for me is…', 'values', 15),
  ('Three things I can''t live without…', 'about-me', 16),
  ('The last thing that made me cry happy tears…', 'reflection', 17),
  ('A risk I''m glad I took…', 'reflection', 18)
ON CONFLICT (text) DO NOTHING;

-- =========================================
-- 4. INTEREST REQUESTS
-- =========================================
CREATE TYPE public.interest_status AS ENUM ('pending', 'accepted', 'declined');

CREATE TABLE public.interest_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT,
  status public.interest_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sender_id, receiver_id)
);
ALTER TABLE public.interest_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view interests involving them"
  ON public.interest_requests FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users send their own interests"
  ON public.interest_requests FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND sender_id <> receiver_id);

CREATE POLICY "Receivers update status"
  ON public.interest_requests FOR UPDATE TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

CREATE POLICY "Senders cancel their pending interests"
  ON public.interest_requests FOR DELETE TO authenticated
  USING (sender_id = auth.uid() AND status = 'pending');

CREATE TRIGGER trg_interest_requests_updated
  BEFORE UPDATE ON public.interest_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- When an interest is accepted, create matching likes (which triggers match)
CREATE OR REPLACE FUNCTION public.on_interest_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status <> 'accepted' THEN
    INSERT INTO public.likes (liker_id, liked_id) VALUES (NEW.sender_id, NEW.receiver_id)
      ON CONFLICT DO NOTHING;
    INSERT INTO public.likes (liker_id, liked_id) VALUES (NEW.receiver_id, NEW.sender_id)
      ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_interest_accepted
  AFTER UPDATE ON public.interest_requests
  FOR EACH ROW EXECUTE FUNCTION public.on_interest_accepted();

-- Make sure mutual-like trigger exists on likes
DROP TRIGGER IF EXISTS trg_likes_mutual_match ON public.likes;
CREATE TRIGGER trg_likes_mutual_match
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.create_match_on_mutual_like();

-- =========================================
-- 5. REPORTS
-- =========================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  reported_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users file reports"
  ON public.reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Reporter sees own reports"
  ON public.reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins update reports"
  ON public.reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- =========================================
-- 6. ANNOUNCEMENTS
-- =========================================
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read active announcements"
  ON public.announcements FOR SELECT TO authenticated
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage announcements"
  ON public.announcements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- 7. STORAGE — voice intros bucket
-- =========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-intros', 'voice-intros', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Owner reads own voice"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'voice-intros' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner uploads own voice"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'voice-intros' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner updates own voice"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'voice-intros' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owner deletes own voice"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'voice-intros' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Matched participants can read each other's voice intros
CREATE POLICY "Matched users read voice intro"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'voice-intros' AND EXISTS (
      SELECT 1 FROM public.matches m
      WHERE (
        (m.user_a = auth.uid() AND m.user_b::text = (storage.foldername(name))[1])
        OR (m.user_b = auth.uid() AND m.user_a::text = (storage.foldername(name))[1])
      )
    )
  );

-- Authenticated users can also read voice intros referenced by onboarded profiles
-- (intros are meant to be heard before reveal). They are stored in private bucket;
-- the client uses signed URLs.
CREATE POLICY "Authenticated read voice for onboarded profiles"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'voice-intros' AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id::text = (storage.foldername(name))[1] AND p.onboarded = true
    )
  );
