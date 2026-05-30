GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interest_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_prompts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_interests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_photos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_users TO authenticated;
GRANT SELECT ON public.app_settings TO authenticated;
GRANT SELECT ON public.prompts_library TO authenticated;

GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.payment_submissions TO service_role;
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.interest_requests TO service_role;
GRANT ALL ON public.matches TO service_role;
GRANT ALL ON public.messages TO service_role;
GRANT ALL ON public.profile_prompts TO service_role;
GRANT ALL ON public.profile_interests TO service_role;
GRANT ALL ON public.profile_photos TO service_role;
GRANT ALL ON public.blocked_users TO service_role;
GRANT ALL ON public.app_settings TO service_role;
GRANT ALL ON public.prompts_library TO service_role;

GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_match_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_account_active(uuid) TO authenticated;