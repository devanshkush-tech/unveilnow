import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  cta_text: string | null;
  cta_link: string | null;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export const useNotifications = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) { setItems([]); setLoading(false); return; }
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    setItems((data ?? []) as Notification[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!userId) return;
    const instanceId = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let closed = false;

    try {
      channel = supabase
        .channel(`notifications:${userId}:${instanceId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, () => {
          if (!closed) void refresh();
        });
      channel.subscribe((status) => {
        if (status === "CHANNEL_ERROR") console.warn("[notifications] Realtime channel error; manual refresh still works.");
      });
    } catch (error) {
      console.warn("[notifications] Realtime subscription skipped; manual refresh still works.", error);
    }

    return () => {
      closed = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
  };

  const markAllRead = async () => {
    if (!userId) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", userId).is("read_at", null);
    refresh();
  };

  const unreadCount = items.filter((n) => !n.read_at).length;
  return { items, loading, unreadCount, refresh, markRead, markAllRead };
};
