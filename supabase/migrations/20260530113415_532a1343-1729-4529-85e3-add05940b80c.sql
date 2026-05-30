REVOKE ALL ON FUNCTION public.sync_core_payment_approval() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_core_payment_approval() FROM anon;
REVOKE ALL ON FUNCTION public.sync_core_payment_approval() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.sync_core_payment_approval() TO service_role;