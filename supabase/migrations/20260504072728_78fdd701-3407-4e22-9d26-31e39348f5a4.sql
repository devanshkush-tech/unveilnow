
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_started_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamp with time zone;
