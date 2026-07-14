import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { useBdProfile } from "@/features/blind-date/hooks/useBdProfile";

/** Blind Date summary card shown at the top of Discover once BD is unlocked. */
export function BlindDateEntryCard() {
  const { profile, loading } = useBdProfile();
  if (loading || !profile?.paid) return null;
  const remaining = profile.chats_remaining ?? 0;
  const outOfChats = remaining <= 0;
  const to = outOfChats ? "/pricing" : "/blind-date/matching";

  return (
    <Link
      to={to}
      className="group block mb-6 rounded-3xl border border-white/10 overflow-hidden shadow-card"
      style={{
        background:
          "linear-gradient(135deg, rgba(192,132,252,0.18), rgba(244,114,182,0.14), rgba(15,15,32,0.9))",
      }}
    >
      <div className="p-5 md:p-6 flex items-center gap-4">
        <div
          className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg,#C084FC,#F472B6)" }}
        >
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-purple-300/90 mb-0.5">
            ✦ Blind Date {outOfChats ? "— chats used up" : "included in your plan"}
          </div>
          <div className="font-display text-lg md:text-xl truncate">
            {outOfChats ? "Upgrade to get more Blind Date chats" : "Skip the swiping — get instantly matched"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {outOfChats
              ? "You've used all your Blind Date chats. Tap to see upgrade options."
              : `${remaining >= 9999 ? "Unlimited" : `${remaining} chats`} remaining · 60-second chat · continue if you both choose`}
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-sm text-purple-300 group-hover:translate-x-0.5 transition-transform">
          {outOfChats ? "Upgrade" : "Enter"} <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
