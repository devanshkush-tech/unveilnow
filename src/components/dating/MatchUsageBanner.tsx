import { Link } from "react-router-dom";
import { Heart, Sparkles, AlertCircle, Infinity as InfinityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMatchUsage } from "@/hooks/useMatchUsage";

export const MatchUsageBanner = ({ compact = false }: { compact?: boolean }) => {
  const { usage, loading } = useMatchUsage();
  if (loading || !usage) return null;

  const unlimited = usage.limit === null;
  const used = usage.used;
  const limit = usage.limit ?? 0;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  const reached = !unlimited && used >= limit;
  const near = !unlimited && !reached && pct >= 80;

  const tone = reached
    ? "bg-destructive/10 border-destructive/30"
    : near
    ? "bg-accent/20 border-accent/40"
    : "bg-card border-border/60";

  return (
    <div className={`rounded-2xl border p-4 md:p-5 ${tone} ${compact ? "" : "shadow-card"}`}>
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-full bg-gradient-romance flex items-center justify-center shrink-0">
          {unlimited ? (
            <InfinityIcon className="h-4 w-4 text-primary-foreground" />
          ) : reached ? (
            <AlertCircle className="h-4 w-4 text-primary-foreground" />
          ) : (
            <Heart className="h-4 w-4 text-primary-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="font-display text-base md:text-lg leading-tight">
              {unlimited ? (
                <>Unlimited matches this month</>
              ) : (
                <>{used}/{limit} matches used</>
              )}
            </p>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {usage.plan} plan
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {reached
              ? `You've reached your match limit. Likes are still unlimited — upgrade or wait until ${usage.period_end ? new Date(usage.period_end).toLocaleDateString() : "your next cycle"} to unlock new matches.`
              : near
              ? "You're close to your match limit for this cycle."
              : "Likes are unlimited. Matches happen when interest is mutual."}
          </p>

          {!unlimited && (
            <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full transition-all ${reached ? "bg-destructive" : near ? "bg-accent" : "bg-gradient-romance"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          )}

          {(reached || near) && (
            <div className="mt-3">
              <Button asChild size="sm" variant={reached ? "hero" : "soft"} className="rounded-full">
                <Link to="/payment">
                  <Sparkles className="h-3.5 w-3.5" /> {reached ? "Upgrade plan" : "See upgrade options"}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
