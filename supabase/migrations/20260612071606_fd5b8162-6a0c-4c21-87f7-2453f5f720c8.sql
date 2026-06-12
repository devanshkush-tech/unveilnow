-- Auto-reply trigger for blind date chats with admin-created (dummy) profiles.
-- When a real user sends a message and the other participant is an admin-created
-- profile, automatically insert a canned reply from the dummy account so the
-- conversation feels alive.

CREATE OR REPLACE FUNCTION public.bd_auto_reply_from_dummy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _session record;
  _other uuid;
  _is_dummy boolean;
  _sender_is_dummy boolean;
  _templates text[] := ARRAY[
    'heyy 👋 how are you?',
    'omg same energy haha',
    'tell me something interesting about you ✨',
    'love that. what do you do for fun?',
    'okayyy you got my attention 👀',
    'haha you''re funny — go on',
    'that''s such a vibe',
    'what''s your idea of a perfect date?',
    'coffee or chai? choose wisely ☕',
    'biggest red flag in dating for you?',
    'mood. what city are you in btw?',
    'tell me a secret 🤫',
    'i love how you put that',
    'okay we''d def get along irl',
    'beach or mountains?',
    'fav song rn?',
    'what made you join this?',
    'you seem genuine, i like that',
    'haha okay tell me more',
    'last show you binged?'
  ];
  _reply text;
BEGIN
  SELECT * INTO _session FROM public.blind_date_sessions WHERE id = NEW.session_id;
  IF _session IS NULL THEN RETURN NEW; END IF;

  -- Identify the other participant
  IF NEW.sender_id = _session.user_a THEN
    _other := _session.user_b;
  ELSIF NEW.sender_id = _session.user_b THEN
    _other := _session.user_a;
  ELSE
    RETURN NEW;
  END IF;

  -- Don't auto-reply to a dummy's own messages (avoids loops)
  SELECT COALESCE(is_admin_created, false) INTO _sender_is_dummy
    FROM public.profiles WHERE id = NEW.sender_id;
  IF _sender_is_dummy THEN RETURN NEW; END IF;

  -- Only reply if the OTHER participant is an admin-created (dummy) account
  SELECT COALESCE(is_admin_created, false) INTO _is_dummy
    FROM public.profiles WHERE id = _other;
  IF NOT COALESCE(_is_dummy, false) THEN RETURN NEW; END IF;

  -- Only while the session is active
  IF _session.status IS DISTINCT FROM 'active' THEN RETURN NEW; END IF;

  _reply := _templates[1 + floor(random() * array_length(_templates, 1))::int];

  INSERT INTO public.blind_date_messages (session_id, sender_id, body)
  VALUES (NEW.session_id, _other, _reply);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bd_auto_reply_from_dummy ON public.blind_date_messages;
CREATE TRIGGER trg_bd_auto_reply_from_dummy
AFTER INSERT ON public.blind_date_messages
FOR EACH ROW
EXECUTE FUNCTION public.bd_auto_reply_from_dummy();