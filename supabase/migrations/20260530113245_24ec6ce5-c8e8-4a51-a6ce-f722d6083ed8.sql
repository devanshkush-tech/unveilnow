CREATE OR REPLACE FUNCTION public.sync_core_payment_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _start timestamptz := COALESCE(NEW.reviewed_at, now());
  _end timestamptz;
BEGIN
  IF NEW.feature = 'core' AND NEW.status = 'approved' AND COALESCE(OLD.status, '') <> 'approved' THEN
    _end := _start + public.plan_period_interval(NEW.plan);

    UPDATE public.profiles
       SET selected_plan = NEW.plan,
           plan = NEW.plan,
           plan_started_at = _start,
           plan_period_end = _end,
           plan_expires_at = _end,
           match_period_start = _start,
           matches_used_this_period = 0,
           payment_status = 'approved',
           account_status = 'active',
           updated_at = now()
     WHERE id = NEW.user_id;
  ELSIF NEW.feature = 'core' AND NEW.status = 'rejected' AND COALESCE(OLD.status, '') <> 'rejected' THEN
    UPDATE public.profiles
       SET payment_status = 'rejected',
           account_status = 'locked',
           updated_at = now()
     WHERE id = NEW.user_id
       AND account_status <> 'active';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_core_payment_approval ON public.payment_submissions;
CREATE TRIGGER trg_sync_core_payment_approval
AFTER UPDATE OF status ON public.payment_submissions
FOR EACH ROW
EXECUTE FUNCTION public.sync_core_payment_approval();

WITH latest_approved AS (
  SELECT DISTINCT ON (user_id)
         user_id,
         plan,
         COALESCE(reviewed_at, created_at, now()) AS approved_at
    FROM public.payment_submissions
   WHERE feature = 'core'
     AND status = 'approved'
   ORDER BY user_id, reviewed_at DESC NULLS LAST, created_at DESC
)
UPDATE public.profiles p
   SET selected_plan = la.plan,
       plan = la.plan,
       plan_started_at = la.approved_at,
       plan_period_end = la.approved_at + public.plan_period_interval(la.plan),
       plan_expires_at = la.approved_at + public.plan_period_interval(la.plan),
       match_period_start = la.approved_at,
       matches_used_this_period = 0,
       payment_status = 'approved',
       account_status = 'active',
       updated_at = now()
  FROM latest_approved la
 WHERE p.id = la.user_id
   AND (p.payment_status IS DISTINCT FROM 'approved'
        OR p.account_status IS DISTINCT FROM 'active'
        OR p.selected_plan IS DISTINCT FROM la.plan);