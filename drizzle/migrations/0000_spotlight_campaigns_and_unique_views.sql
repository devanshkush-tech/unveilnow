CREATE TABLE public.spotlight_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  payment_submission_id uuid NOT NULL UNIQUE REFERENCES public.payment_submissions(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('spotlight_1d', 'spotlight_3d', 'spotlight_5d')),
  duration_days integer NOT NULL CHECK (duration_days IN (1, 3, 5)),
  price_inr integer NOT NULL CHECK (price_inr IN (149, 299, 499)),
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  views_count integer NOT NULL DEFAULT 0 CHECK (views_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.spotlight_campaigns TO authenticated;
GRANT ALL ON public.spotlight_campaigns TO service_role;
ALTER TABLE public.spotlight_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read their own Spotlight campaigns"
  ON public.spotlight_campaigns FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX spotlight_campaigns_user_started_idx
  ON public.spotlight_campaigns (user_id, starts_at DESC);

CREATE TABLE public.spotlight_view_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.spotlight_campaigns(id) ON DELETE CASCADE,
  viewer_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, viewer_id)
);
GRANT ALL ON public.spotlight_view_events TO service_role;
ALTER TABLE public.spotlight_view_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.record_spotlight_view(_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _viewer_id uuid := auth.uid();
  _campaign_id uuid;
BEGIN
  IF _viewer_id IS NULL OR _profile_id IS NULL OR _profile_id = _viewer_id THEN
    RETURN;
  END IF;

  INSERT INTO public.spotlight_view_events (campaign_id, viewer_id)
  SELECT c.id, _viewer_id
  FROM public.spotlight_campaigns c
  WHERE c.user_id = _profile_id
    AND c.starts_at <= now()
    AND c.ends_at > now()
  ORDER BY c.starts_at DESC
  LIMIT 1
  ON CONFLICT (campaign_id, viewer_id) DO NOTHING
  RETURNING campaign_id INTO _campaign_id;

  IF _campaign_id IS NOT NULL THEN
    UPDATE public.spotlight_campaigns
    SET views_count = views_count + 1
    WHERE id = _campaign_id;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.record_spotlight_view(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_spotlight_view(uuid) TO authenticated, service_role;