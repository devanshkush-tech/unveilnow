
-- ============= Separate admin auth + extended profiles + chat reads + blocks =============

-- 1) admin_accounts: completely separate from auth.users
CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz,
  active boolean NOT NULL DEFAULT true
);

ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

-- No client access. Only edge functions with service role can touch this table.
CREATE POLICY "no client read" ON public.admin_accounts FOR SELECT TO authenticated USING (false);

-- 2) admin_sessions: opaque tokens managed by edge functions
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  token text PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES public.admin_accounts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  ip text,
  user_agent text
);

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no client read sessions" ON public.admin_sessions FOR SELECT TO authenticated USING (false);

-- 3) Extend profiles with editable identity fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS device text,
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz,
  ADD COLUMN IF NOT EXISTS interested_in text;

-- 4) message_reads: for "seen" status
CREATE TABLE IF NOT EXISTS public.message_reads (
  match_id uuid NOT NULL,
  user_id uuid NOT NULL,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (match_id, user_id)
);

ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage their own reads" ON public.message_reads
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "participants view reads" ON public.message_reads
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = message_reads.match_id AND (m.user_a = auth.uid() OR m.user_b = auth.uid())
    )
  );

-- 5) blocked_users
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner manages blocks" ON public.blocked_users
  FOR ALL TO authenticated
  USING (blocker_id = auth.uid())
  WITH CHECK (blocker_id = auth.uid());

-- 6) Realtime + replica identity
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.message_reads REPLICA IDENTITY FULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='message_reads'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reads';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.messages';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='matches'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.matches';
  END IF;
END $$;

-- 7) Trigger: bump profiles.last_active_at when user posts a message
CREATE OR REPLACE FUNCTION public.bump_last_active()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles SET last_active_at = now() WHERE id = NEW.sender_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bump_active_on_message ON public.messages;
CREATE TRIGGER bump_active_on_message AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_last_active();
