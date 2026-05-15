import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type MatchUsage = {
  plan: string;
  used: number;
  limit: number | null; // null = unlimited
  period_start: string;
  period_end: string | null;
};

export const useMatchUsage = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<MatchUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setUsage(null); setLoading(false); return; }
    const { data, error } = await supabase.rpc("get_my_match_usage");
    if (!error && data && data.length > 0) {
      const row: any = data[0];
      setUsage({
        plan: row.plan,
        used: row.used ?? 0,
        limit: row.limit === null || row.limit === undefined ? null : Number(row.limit),
        period_start: row.period_start,
        period_end: row.period_end ?? null,
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return { usage, loading, refresh };
};
