-- Blind Date Profiles
CREATE TABLE public.blind_date_profiles (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  compat_vector JSONB NOT NULL DEFAULT '{}'::jsonb,
  plan TEXT NOT NULL DEFAULT 'free',
  sessions_used INT NOT NULL DEFAULT 0,
  sessions_limit INT,
  period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blind_date_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own bd profile" ON public.blind_date_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users insert own bd profile" ON public.blind_date_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own bd profile" ON public.blind_date_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage bd profiles" ON public.blind_date_profiles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER bd_profiles_updated_at
  BEFORE UPDATE ON public.blind_date_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Blind Date Sessions
CREATE TABLE public.blind_date_sessions (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  compatibility INT,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '60 seconds'),
  decision_a TEXT,
  decision_b TEXT,
  revealed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bd_sessions_users ON public.blind_date_sessions(user_a, user_b);
CREATE INDEX idx_bd_sessions_status ON public.blind_date_sessions(status);

ALTER TABLE public.blind_date_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view bd sessions" ON public.blind_date_sessions
  FOR SELECT TO authenticated
  USING (user_a = auth.uid() OR user_b = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Participants update decision" ON public.blind_date_sessions
  FOR UPDATE TO authenticated
  USING (user_a = auth.uid() OR user_b = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (user_a = auth.uid() OR user_b = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins create bd sessions" ON public.blind_date_sessions
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER bd_sessions_updated_at
  BEFORE UPDATE ON public.blind_date_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Blind Date Messages
CREATE TABLE public.blind_date_messages (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.blind_date_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bd_messages_session ON public.blind_date_messages(session_id, created_at);

ALTER TABLE public.blind_date_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view bd messages" ON public.blind_date_messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.blind_date_sessions s
    WHERE s.id = blind_date_messages.session_id
      AND (s.user_a = auth.uid() OR s.user_b = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  ));

CREATE POLICY "Participants send bd messages" ON public.blind_date_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.blind_date_sessions s
      WHERE s.id = session_id
        AND (s.user_a = auth.uid() OR s.user_b = auth.uid())
    )
  );

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.blind_date_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blind_date_sessions;

-- Add feature column to payment_submissions
ALTER TABLE public.payment_submissions
  ADD COLUMN IF NOT EXISTS feature TEXT NOT NULL DEFAULT 'core';

CREATE INDEX IF NOT EXISTS idx_payment_subs_feature ON public.payment_submissions(feature);

-- RPC: get my blind date profile (without compat_vector)
CREATE OR REPLACE FUNCTION public.get_my_bd_profile()
RETURNS TABLE (
  user_id UUID,
  answers JSONB,
  plan TEXT,
  sessions_used INT,
  sessions_limit INT,
  period_start TIMESTAMPTZ,
  completed BOOLEAN
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT user_id, answers, plan, sessions_used, sessions_limit, period_start, completed
  FROM public.blind_date_profiles
  WHERE user_id = auth.uid();
$$;

-- RPC: upsert my answers (server computes compat_vector)
CREATE OR REPLACE FUNCTION public.save_my_bd_answers(_answers JSONB, _completed BOOLEAN DEFAULT false)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _uid UUID := auth.uid();
DECLARE _vec JSONB;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  -- Simple compat vector: numeric encoding of each answer key
  SELECT jsonb_object_agg(key, CASE
      WHEN jsonb_typeof(value) = 'number' THEN value
      WHEN jsonb_typeof(value) = 'string' THEN to_jsonb(length(value::text) % 7)
      WHEN jsonb_typeof(value) = 'array' THEN to_jsonb(jsonb_array_length(value))
      ELSE to_jsonb(0)
    END)
  INTO _vec
  FROM jsonb_each(_answers);

  INSERT INTO public.blind_date_profiles (user_id, answers, compat_vector, completed)
  VALUES (_uid, _answers, COALESCE(_vec, '{}'::jsonb), _completed)
  ON CONFLICT (user_id) DO UPDATE
    SET answers = EXCLUDED.answers,
        compat_vector = EXCLUDED.compat_vector,
        completed = EXCLUDED.completed OR public.blind_date_profiles.completed,
        updated_at = now();
END;
$$;