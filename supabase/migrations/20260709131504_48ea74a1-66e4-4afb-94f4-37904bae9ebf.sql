
CREATE OR REPLACE FUNCTION public.bd_chats_for_core_plan(_plan text)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE WHEN _plan='starter' THEN 10 WHEN _plan='premium' THEN 30 WHEN _plan='elite' THEN 9999 ELSE 0 END;
$$;

CREATE OR REPLACE FUNCTION public.sync_core_payment_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _start timestamptz := COALESCE(NEW.reviewed_at, now()); _end timestamptz; _bd_chats int;
BEGIN
  IF NEW.feature='core' AND NEW.status='approved' AND COALESCE(OLD.status,'')<>'approved' THEN
    _end := _start + public.plan_period_interval(NEW.plan);
    UPDATE public.profiles
       SET selected_plan=NEW.plan, plan=NEW.plan, plan_started_at=_start,
           plan_period_end=_end, plan_expires_at=_end,
           match_period_start=_start, matches_used_this_period=0,
           payment_status='approved', account_status='active', updated_at=now()
     WHERE id=NEW.user_id;
    _bd_chats := public.bd_chats_for_core_plan(NEW.plan);
    IF _bd_chats > 0 THEN
      BEGIN
        INSERT INTO public.blind_date_profiles (user_id, plan, paid, chats_remaining)
        VALUES (NEW.user_id, NEW.plan, true, _bd_chats)
        ON CONFLICT (user_id) DO UPDATE
          SET paid=true, plan=EXCLUDED.plan,
              chats_remaining = public.blind_date_profiles.chats_remaining + _bd_chats,
              updated_at=now();
      EXCEPTION WHEN foreign_key_violation THEN NULL; END;
    END IF;
  ELSIF NEW.feature='core' AND NEW.status='rejected' AND COALESCE(OLD.status,'')<>'rejected' THEN
    UPDATE public.profiles SET payment_status='rejected', account_status='locked', updated_at=now()
     WHERE id=NEW.user_id AND account_status<>'active';
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_grant_bd_chats(_user_id uuid, _chats int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  INSERT INTO public.blind_date_profiles (user_id, plan, paid, chats_remaining)
  VALUES (_user_id, 'premium', true, GREATEST(_chats, 0))
  ON CONFLICT (user_id) DO UPDATE
    SET paid=true, chats_remaining = public.blind_date_profiles.chats_remaining + GREATEST(_chats, 0), updated_at=now();
END; $$;

REVOKE ALL ON FUNCTION public.admin_grant_bd_chats(uuid, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_grant_bd_chats(uuid, int) TO authenticated, service_role;

INSERT INTO public.blind_date_profiles (user_id, plan, paid, chats_remaining)
SELECT p.id, COALESCE(p.selected_plan,'starter'), true,
       public.bd_chats_for_core_plan(COALESCE(p.selected_plan,'starter'))
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
 WHERE p.account_status='active'
   AND public.bd_chats_for_core_plan(COALESCE(p.selected_plan,'starter')) > 0
ON CONFLICT (user_id) DO UPDATE
  SET paid=true,
      chats_remaining = GREATEST(public.blind_date_profiles.chats_remaining,
                                 public.bd_chats_for_core_plan(EXCLUDED.plan)),
      updated_at=now();
