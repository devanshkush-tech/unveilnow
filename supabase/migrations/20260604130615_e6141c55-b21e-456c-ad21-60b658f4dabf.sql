
-- Blind Date questions
CREATE TABLE IF NOT EXISTS public.blind_date_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  prompt text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  position int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blind_date_questions TO authenticated;
GRANT ALL ON public.blind_date_questions TO service_role;

ALTER TABLE public.blind_date_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read active bd questions"
  ON public.blind_date_questions FOR SELECT TO authenticated
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage bd questions"
  ON public.blind_date_questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_bd_questions_updated
  BEFORE UPDATE ON public.blind_date_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Blind Date profile additions
ALTER TABLE public.blind_date_profiles
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS trial_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_trial boolean NOT NULL DEFAULT false;

-- Seed packages
INSERT INTO public.app_settings (key, value)
VALUES ('blind_date_packages', '[
  {"id":"starter","name":"Starter","price":199,"matches":10,"active":true},
  {"id":"premium","name":"Premium","price":299,"matches":30,"active":true},
  {"id":"elite","name":"Elite","price":499,"matches":100,"active":true}
]'::jsonb)
ON CONFLICT (key) DO NOTHING;
