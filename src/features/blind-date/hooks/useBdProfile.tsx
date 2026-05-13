import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type BdProfile = {
  user_id: string;
  answers: Record<string, unknown>;
  extended_answers: Record<string, unknown>;
  plan: string;
  chats_remaining: number;
  paid: boolean;
  sessions_used: number;
  sessions_limit: number | null;
  completed: boolean;
  extended_completed: boolean;
};

export function useBdProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<BdProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setProfile(null); setLoading(false); return; }
    const { data } = await supabase.rpc("get_my_bd_profile");
    if (data && data.length) {
      const r: any = data[0];
      setProfile({
        user_id: r.user_id,
        answers: r.answers ?? {},
        extended_answers: r.extended_answers ?? {},
        plan: r.plan ?? "free",
        chats_remaining: r.chats_remaining ?? 0,
        paid: !!r.paid,
        sessions_used: r.sessions_used ?? 0,
        sessions_limit: r.sessions_limit ?? null,
        completed: !!r.completed,
        extended_completed: !!r.extended_completed,
      });
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  return { profile, loading: authLoading || loading, refresh };
}
