
-- Restrict blind_date_sessions decision update policy to authenticated role
DROP POLICY IF EXISTS "Participants update decision" ON public.blind_date_sessions;
CREATE POLICY "Participants update decision"
ON public.blind_date_sessions
FOR UPDATE
TO authenticated
USING ((user_a = auth.uid()) OR (user_b = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK ((user_a = auth.uid()) OR (user_b = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- Restrict subscriptions SELECT policy to authenticated role
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- profile_interests: restrict SELECT to active, non-suspended, non-banned profile owners (or self/admin)
DROP POLICY IF EXISTS "Authenticated can view interests" ON public.profile_interests;
CREATE POLICY "Authenticated can view interests"
ON public.profile_interests
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_interests.user_id
      AND p.account_status = 'active'
      AND COALESCE(p.suspended, false) = false
      AND COALESCE(p.banned, false) = false
  )
);

-- profile_prompts: same restriction
DROP POLICY IF EXISTS "Authenticated can view prompts" ON public.profile_prompts;
CREATE POLICY "Authenticated can view prompts"
ON public.profile_prompts
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_prompts.user_id
      AND p.account_status = 'active'
      AND COALESCE(p.suspended, false) = false
      AND COALESCE(p.banned, false) = false
  )
);
