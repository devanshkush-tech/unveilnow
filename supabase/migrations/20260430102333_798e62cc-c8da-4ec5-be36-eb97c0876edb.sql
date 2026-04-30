REVOKE EXECUTE ON FUNCTION public.get_my_match_usage() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.refresh_match_period(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.match_limit_for_plan(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_match_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_limit_for_plan(text) TO authenticated;
