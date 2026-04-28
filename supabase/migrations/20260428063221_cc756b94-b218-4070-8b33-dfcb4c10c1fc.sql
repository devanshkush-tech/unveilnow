
REVOKE EXECUTE ON FUNCTION public.bump_last_active() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_default_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_match_on_mutual_like() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_interest_accepted() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
