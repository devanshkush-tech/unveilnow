
CREATE OR REPLACE FUNCTION public.admin_resolve_audience(_type text, _value text)
RETURNS TABLE(id uuid)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF _type = 'plan' AND _value IS NOT NULL THEN
    RETURN QUERY SELECT p.id FROM public.profiles p WHERE p.selected_plan = _value;
  ELSIF _type = 'city' AND _value IS NOT NULL THEN
    RETURN QUERY SELECT p.id FROM public.profiles p WHERE p.city ILIKE '%' || _value || '%';
  ELSIF _type = 'gender' AND _value IS NOT NULL THEN
    RETURN QUERY SELECT p.id FROM public.profiles p WHERE p.gender = _value;
  ELSIF _type = 'user' AND _value IS NOT NULL THEN
    RETURN QUERY SELECT p.id FROM public.profiles p WHERE p.id = _value::uuid;
  ELSE
    RETURN QUERY SELECT p.id FROM public.profiles p;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_resolve_audience(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_resolve_audience(text, text) TO authenticated;
