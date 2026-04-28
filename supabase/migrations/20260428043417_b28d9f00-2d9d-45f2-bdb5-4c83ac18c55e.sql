
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.assign_default_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.on_interest_accepted() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_match_on_mutual_like() FROM PUBLIC, anon, authenticated;
