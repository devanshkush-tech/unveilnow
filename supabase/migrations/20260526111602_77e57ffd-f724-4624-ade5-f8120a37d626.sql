
DROP POLICY IF EXISTS "Participants update reveal flags" ON public.matches;

CREATE POLICY "Participants update own reveal flag only"
ON public.matches
FOR UPDATE
TO authenticated
USING ((user_a = auth.uid()) OR (user_b = auth.uid()))
WITH CHECK (
  ((user_a = auth.uid()) OR (user_b = auth.uid()))
  -- Prevent forging the other user's reveal flag: the flag belonging
  -- to the OTHER participant must not change.
  AND (
    (user_a = auth.uid() AND reveal_b = (SELECT m.reveal_b FROM public.matches m WHERE m.id = matches.id))
    OR
    (user_b = auth.uid() AND reveal_a = (SELECT m.reveal_a FROM public.matches m WHERE m.id = matches.id))
  )
);

CREATE OR REPLACE FUNCTION public.set_my_reveal(_match_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  UPDATE public.matches
     SET reveal_a = CASE WHEN user_a = _uid THEN true ELSE reveal_a END,
         reveal_b = CASE WHEN user_b = _uid THEN true ELSE reveal_b END
   WHERE id = _match_id AND (user_a = _uid OR user_b = _uid);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_my_reveal(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_my_reveal(uuid) TO authenticated;
