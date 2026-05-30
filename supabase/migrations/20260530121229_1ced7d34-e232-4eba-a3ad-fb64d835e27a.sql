DROP TRIGGER IF EXISTS trg_sync_core_payment_approval ON public.payment_submissions;

CREATE TRIGGER trg_sync_core_payment_approval
AFTER UPDATE OF status ON public.payment_submissions
FOR EACH ROW
EXECUTE FUNCTION public.sync_core_payment_approval();

WITH latest_approved AS (
  SELECT DISTINCT ON (user_id)
    user_id,
    plan,
    COALESCE(reviewed_at, updated_at, created_at, now()) AS approved_at
  FROM public.payment_submissions
  WHERE feature = 'core'
    AND status = 'approved'
  ORDER BY user_id, COALESCE(reviewed_at, updated_at, created_at, now()) DESC
)
UPDATE public.profiles p
SET selected_plan = la.plan,
    plan = la.plan,
    plan_started_at = la.approved_at,
    plan_period_end = la.approved_at + public.plan_period_interval(la.plan),
    plan_expires_at = la.approved_at + public.plan_period_interval(la.plan),
    match_period_start = la.approved_at,
    matches_used_this_period = COALESCE(p.matches_used_this_period, 0),
    payment_status = 'approved',
    account_status = 'active',
    updated_at = now()
FROM latest_approved la
WHERE p.id = la.user_id
  AND (p.account_status IS DISTINCT FROM 'active'
       OR p.payment_status IS DISTINCT FROM 'approved'
       OR p.selected_plan IS DISTINCT FROM la.plan);