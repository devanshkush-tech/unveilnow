CREATE OR REPLACE FUNCTION public.notify_on_payment_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _bd_plan text;
  _bd_chats int;
BEGIN
  IF NEW.status = 'approved' AND COALESCE(OLD.status,'') <> 'approved' THEN
    INSERT INTO public.notifications(user_id, type, title, body, cta_text, cta_link, data)
    VALUES (NEW.user_id, 'payment_success', 'Payment approved',
            'Your payment has been approved. Welcome aboard!', 'Open dashboard', '/dashboard',
            jsonb_build_object('payment_id', NEW.id, 'plan', NEW.plan));

    IF NEW.feature = 'unlock_interest' AND NEW.target_user_id IS NOT NULL THEN
      INSERT INTO public.interest_unlocks(user_id, target_user_id, payment_id)
      VALUES (NEW.user_id, NEW.target_user_id, NEW.id)
      ON CONFLICT DO NOTHING;
    END IF;

    IF NEW.feature = 'core' THEN
      UPDATE public.profiles
         SET selected_plan = NEW.plan,
             plan_started_at = now(),
             plan_period_end = now() + public.plan_period_interval(NEW.plan),
             match_period_start = now(),
             matches_used_this_period = 0,
             payment_status = 'approved',
             account_status = 'active'
       WHERE id = NEW.user_id;
    END IF;

    IF NEW.feature = 'blind_date' THEN
      -- plan stored as "bd_starter" | "bd_premium" | "bd_elite"
      _bd_plan := CASE WHEN NEW.plan LIKE 'bd_%' THEN substring(NEW.plan from 4) ELSE NEW.plan END;
      _bd_chats := CASE _bd_plan
        WHEN 'starter' THEN 10
        WHEN 'premium' THEN 30
        WHEN 'elite' THEN 100
        ELSE 0 END;

      INSERT INTO public.blind_date_profiles (user_id, plan, paid, chats_remaining)
      VALUES (NEW.user_id, _bd_plan, true, _bd_chats)
      ON CONFLICT (user_id) DO UPDATE
        SET paid = true,
            plan = EXCLUDED.plan,
            chats_remaining = public.blind_date_profiles.chats_remaining + _bd_chats,
            updated_at = now();
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;