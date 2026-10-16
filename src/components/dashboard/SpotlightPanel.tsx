import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Clock3, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getSpotlightOffer } from "@/lib/spotlight";

type Campaign = {
  id: string;
  plan: string;
  starts_at: string;
  ends_at: string;
  views_count: number;
};

const formatRemaining = (milliseconds: number) => {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return days > 0
    ? `${days}d ${hours}h ${minutes}m`
    : `${hours}h ${minutes}m ${remainder}s`;
};

export function SpotlightPanel({ showOffer = false }: { showOffer?: boolean }) {
  const { user } = useAuth();
  const [gender, setGender] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [resultOpen, setResultOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [{ data: profile }, { data: campaignRows }, { data: pendingRows }] = await Promise.all([
      supabase.from("profiles").select("gender").eq("id", user.id).maybeSingle(),
      supabase.from("spotlight_campaigns").select("id, plan, starts_at, ends_at, views_count")
        .eq("user_id", user.id).order("starts_at", { ascending: false }).limit(10),
      supabase.from("payment_submissions").select("id")
        .eq("user_id", user.id).eq("feature", "spotlight").eq("status", "pending").limit(1),
    ]);
    setGender(profile?.gender ?? null);
    setCampaigns((campaignRows ?? []) as Campaign[]);
    setPending((pendingRows ?? []).length > 0);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
    const poll = window.setInterval(() => void load(), 15000);
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(clock);
    };
  }, [load]);

  const active = useMemo(
    () => campaigns.find((campaign) => Date.parse(campaign.starts_at) <= now && Date.parse(campaign.ends_at) > now),
    [campaigns, now],
  );
  const expired = useMemo(
    () => campaigns.find((campaign) => Date.parse(campaign.ends_at) <= now),
    [campaigns, now],
  );

  useEffect(() => {
    if (!expired || active) return;
    const key = `spotlight-result-seen-${expired.id}`;
    try {
      if (window.localStorage.getItem(key) !== "1") setResultOpen(true);
    } catch {
      setResultOpen(true);
    }
  }, [expired, active]);

  const closeResult = (open: boolean) => {
    setResultOpen(open);
    if (!open && expired) {
      try {
        window.localStorage.setItem(`spotlight-result-seen-${expired.id}`, "1");
      } catch {
        // The result can still be dismissed when browser storage is unavailable.
      }
    }
  };

  if (loading || !user || gender === "Woman") return null;
  if (!active && !pending && !showOffer) return null;

  return (
    <>
      <section className="mb-6 border-y border-border/60 bg-secondary/30 px-4 py-4 md:px-5" aria-live="polite">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              {active ? <Clock3 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </span>
            <div>
              {active ? (
                <>
                  <p className="font-medium">Your profile is in Spotlight</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Time remaining: {formatRemaining(Date.parse(active.ends_at) - now)}</p>
                </>
              ) : pending ? (
                <>
                  <p className="font-medium">Spotlight payment under review</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Your Spotlight starts after approval.</p>
                </>
              ) : (
                <>
                  <p className="font-medium">Want more people to discover your story?</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Put your profile in front of more compatible members with Spotlight.</p>
                </>
              )}
            </div>
          </div>
          {!active && !pending && (
            <Button asChild variant="outline" className="shrink-0">
              <Link to="/spotlight"><Eye className="h-4 w-4" /> Explore Spotlight</Link>
            </Button>
          )}
        </div>
      </section>

      <Dialog open={resultOpen} onOpenChange={closeResult}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Your Spotlight has ended</DialogTitle>
            <DialogDescription>
              Your profile was viewed by {expired?.views_count ?? 0} unique {expired?.views_count === 1 ? "member" : "members"} during this Spotlight.
            </DialogDescription>
          </DialogHeader>
          {expired && getSpotlightOffer(expired.plan) && (
            <p className="text-sm text-muted-foreground">{getSpotlightOffer(expired.plan)?.durationDays}-day Spotlight · {getSpotlightOffer(expired.plan)?.priceLabel}</p>
          )}
          <Button onClick={() => closeResult(false)}>Done</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}