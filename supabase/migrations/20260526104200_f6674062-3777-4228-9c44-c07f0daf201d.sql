
-- 1) Lock down UPDATE on profiles to only safe self-editable columns.
-- Revoke broad table-level write privileges from anon/authenticated, then
-- re-grant precise column-level INSERT/UPDATE that owners legitimately need.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.profiles FROM anon, authenticated;

-- Owners may insert their own row (RLS still enforces id = auth.uid()).
GRANT INSERT (
  id, first_name, age, gender, city, profession, intent, story,
  voice_intro_path, looking_for, age_min, age_max, distance_km,
  interested_in, phone, onboarded, onboarding_step, last_active_at
) ON public.profiles TO authenticated;

-- Owners may update only these non-privileged columns.
GRANT UPDATE (
  first_name, age, gender, city, profession, intent, story,
  voice_intro_path, looking_for, age_min, age_max, distance_km,
  interested_in, phone, onboarded, onboarding_step, last_active_at,
  updated_at
) ON public.profiles TO authenticated;

-- 2) Ensure signup_leads & sheet_sync_log can NOT be written by anon/authenticated.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, SELECT ON public.signup_leads FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, SELECT ON public.sheet_sync_log FROM anon, authenticated;
-- Note: admins still read/update via service-role calls and explicit RLS policies
-- evaluated under SECURITY DEFINER paths; service_role retains full access.

-- 3) Revoke EXECUTE on SECURITY DEFINER helpers from anon where not needed.
REVOKE EXECUTE ON FUNCTION public.get_my_match_usage() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_resolve_audience(text, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_profile() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
