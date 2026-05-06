-- Add utm_content & utm_term to profiles and signup_leads for full UTM tracking
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS utm_term text;

ALTER TABLE public.signup_leads
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS utm_term text;

-- Update handle_new_user to copy utm_* from raw_user_meta_data into profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, first_name, phone, utm_source, utm_medium, utm_campaign, utm_content, utm_term)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'name'),
    NULLIF(NEW.raw_user_meta_data ->> 'phone', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'utm_source', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'utm_medium', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'utm_campaign', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'utm_content', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'utm_term', '')
  );
  RETURN NEW;
END;
$function$;

-- Index to make filtering fast
CREATE INDEX IF NOT EXISTS idx_profiles_utm_source ON public.profiles (utm_source);
CREATE INDEX IF NOT EXISTS idx_profiles_utm_campaign ON public.profiles (utm_campaign);