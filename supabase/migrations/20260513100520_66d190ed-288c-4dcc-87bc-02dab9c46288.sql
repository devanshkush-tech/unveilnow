
REVOKE EXECUTE ON FUNCTION public.bd_consume_chat(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.bd_on_mutual_continue() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.save_my_bd_extended(jsonb, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_bd_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_my_bd_extended(jsonb, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_bd_profile() TO authenticated;
