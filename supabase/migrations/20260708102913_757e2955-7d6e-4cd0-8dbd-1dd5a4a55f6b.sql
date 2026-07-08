
-- Restore the auth.users trigger that was dropped earlier. handle_new_user()
-- and assign_default_role() already exist as SECURITY DEFINER functions.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- Backfill: create profile + default role rows for any auth users
-- who signed up while the trigger was missing.
INSERT INTO public.profiles (id, first_name, phone)
SELECT u.id,
       COALESCE(u.raw_user_meta_data ->> 'first_name', u.raw_user_meta_data ->> 'name'),
       NULLIF(u.raw_user_meta_data ->> 'phone', '')
  FROM auth.users u
 WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'::app_role
  FROM auth.users u
 WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id)
ON CONFLICT DO NOTHING;
