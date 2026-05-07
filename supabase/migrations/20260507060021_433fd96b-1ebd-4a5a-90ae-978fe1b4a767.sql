
REVOKE ALL ON FUNCTION public.enqueue_sheet_sync(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_profiles_sheet_sync() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_payments_sheet_sync() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_leads_sheet_sync() FROM PUBLIC, anon, authenticated;
