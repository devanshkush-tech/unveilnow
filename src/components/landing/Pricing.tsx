import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PLANS } from "@/lib/plans";
import { useIsFreeAccess } from "@/hooks/useIsFreeAccess";

export const Pricing = ({ compact = false }: { compact?: boolean }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isFree } = useIsFreeAccess();

  const handleChoose = (planId: string) => {
    if (!user) {
      navigate(`/signup?plan=${planId}`);
      return;
    }
    if (isFree) {
      navigate("/dashboard");
      return;
    }
    navigate(`/payment?plan=${planId}`);
  };

  return (
    <section className={compact ? "py-16" : "py-20 md:py-28"}>
      <div className="container max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-14">
          <p className="text-xs uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-4">Pricing</p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight">
            Pay for the people, not the swipes.
          </h2>
          <p className="text-muted-foreground mt-4 text-sm md:text-base">
            Cancel anytime. No hidden fees. Made for serious daters in India.
          </p>
          {isFree && (
            <p className="mt-4 inline-block rounded-full bg-accent/15 text-accent-foreground px-4 py-2 text-sm font-medium">
              ✨ Unveil is free for women — you have full access.
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`relative p-6 md:p-8 rounded-3xl border transition-all duration-500 flex flex-col ${
                p.highlighted
                  ? "bg-gradient-romance text-primary-foreground border-transparent shadow-elegant md:scale-105"
                  : "bg-card border-border/60 shadow-card"
              }`}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium bg-background text-foreground border border-border shadow-soft">
                  {p.badge}
                </span>
              )}
              <div className="text-[11px] uppercase tracking-widest opacity-70 mb-2">{p.badge}</div>
              <h3 className="font-display text-2xl md:text-3xl mb-3">{p.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-4xl md:text-5xl">{p.priceLabel}</span>
                <span className={p.highlighted ? "opacity-80" : "text-muted-foreground"}>{p.periodLabel}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${p.highlighted ? "text-primary-foreground" : "text-accent"}`} />
                    <span className={p.highlighted ? "" : "text-muted-foreground"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={p.highlighted ? "soft" : "default"}
                className="w-full rounded-full h-11"
                onClick={() => handleChoose(p.id)}
              >
                Choose {p.name}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Re-export for any legacy importers
export { PLANS as plans } from "@/lib/plans";
