DO $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid
  FROM auth.users
  WHERE lower(email) = lower('devanshkush@gmail.com')
  LIMIT 1;

  IF uid IS NULL THEN
    RAISE NOTICE 'No auth.users row for devanshkush@gmail.com — sign up first, then re-run.';
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, 'admin'::public.app_role)
    ON CONFLICT DO NOTHING;
    RAISE NOTICE 'Granted admin to %', uid;
  END IF;
END $$;