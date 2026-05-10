CREATE OR REPLACE FUNCTION public.get_my_bd_profile()
RETURNS TABLE (
  user_id UUID,
  answers JSONB,
  plan TEXT,
  sessions_used INT,
  sessions_limit INT,
  period_start TIMESTAMPTZ,
  completed BOOLEAN
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT user_id, answers, plan, sessions_used, sessions_limit, period_start, completed
  FROM public.blind_date_profiles
  WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.save_my_bd_answers(_answers JSONB, _completed BOOLEAN DEFAULT false)
RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public
AS $$
DECLARE _uid UUID := auth.uid();
DECLARE _vec JSONB;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT jsonb_object_agg(key, CASE
      WHEN jsonb_typeof(value) = 'number' THEN value
      WHEN jsonb_typeof(value) = 'string' THEN to_jsonb(length(value::text) % 7)
      WHEN jsonb_typeof(value) = 'array' THEN to_jsonb(jsonb_array_length(value))
      ELSE to_jsonb(0)
    END)
  INTO _vec
  FROM jsonb_each(_answers);

  INSERT INTO public.blind_date_profiles (user_id, answers, compat_vector, completed)
  VALUES (_uid, _answers, COALESCE(_vec, '{}'::jsonb), _completed)
  ON CONFLICT (user_id) DO UPDATE
    SET answers = EXCLUDED.answers,
        compat_vector = EXCLUDED.compat_vector,
        completed = EXCLUDED.completed OR public.blind_date_profiles.completed,
        updated_at = now();
END;
$$;