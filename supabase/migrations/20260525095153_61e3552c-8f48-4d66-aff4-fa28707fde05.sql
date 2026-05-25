
-- Restore browsing access at the row level; column grants will restrict sensitive fields
DROP POLICY IF EXISTS "Owner or admin reads full profile" ON public.profiles;
CREATE POLICY "Authenticated can view active profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR (onboarded = true AND account_status = 'active')
);

-- Replace prior definer view with a safe invoker view
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT
  id, first_name, age, gender, city, profession, intent, story,
  voice_intro_path, looking_for, onboarded, account_status, created_at
FROM public.profiles
WHERE onboarded = true AND account_status = 'active';

GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Column-level restriction: revoke sensitive columns from public API roles
REVOKE SELECT ON public.profiles FROM authenticated, anon;
GRANT SELECT (
  id, first_name, age, gender, city, profession, intent, story,
  voice_intro_path, looking_for, onboarded, account_status, created_at, updated_at
) ON public.profiles TO authenticated;
-- Owners need to UPDATE/INSERT their full row; preserve those grants
GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- Owner full-profile RPC (returns the caller's own complete row)
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;
