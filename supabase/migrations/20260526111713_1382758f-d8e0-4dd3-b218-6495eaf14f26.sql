
CREATE TABLE IF NOT EXISTS public.internal_secrets (
  name text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.internal_secrets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.internal_secrets FROM PUBLIC, anon, authenticated;

INSERT INTO public.internal_secrets (name, value)
VALUES ('sheet_sync_token', encode(gen_random_bytes(32), 'hex'))
ON CONFLICT (name) DO NOTHING;

CREATE OR REPLACE FUNCTION public.enqueue_sheet_sync(_user_id uuid, _lead_id uuid, _source text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  _url TEXT := 'https://iwgbcneinoojcvcsixib.supabase.co/functions/v1/sync-user-to-sheets';
  _token TEXT;
  _log_id UUID;
  _req_id BIGINT;
BEGIN
  SELECT value INTO _token FROM public.internal_secrets WHERE name = 'sheet_sync_token';

  INSERT INTO public.sheet_sync_log (user_id, lead_id, source, status)
  VALUES (_user_id, _lead_id, _source, 'pending')
  RETURNING id INTO _log_id;

  SELECT net.http_post(
    url := _url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', COALESCE(_token, '')
    ),
    body := jsonb_build_object('user_id', _user_id, 'lead_id', _lead_id, 'log_id', _log_id, 'source', _source)
  ) INTO _req_id;

  UPDATE public.sheet_sync_log SET request_id = _req_id WHERE id = _log_id;
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$function$;
