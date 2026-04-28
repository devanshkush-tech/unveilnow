import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useAuth } from "@/hooks/useAuth";
import { isPaymentsConfigured } from "@/lib/stripe";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type Plan = {
  name: string;
  price: string;
  period: string;
  tag: string;
  highlighted?: boolean;
  priceId: string;
  features: string[];
};

export const plans: Plan[] = [
  {
    name: "Starter",
    price: "₹299",
    period: "/month",
    tag: "Get going",
    priceId: "starter_monthly",
    features: ["5 thoughtful matches a day", "Unlimited prompts", "Voice intros", "Basic filters"],
  },
  {
    name: "Premium",
    price: "₹499",
    period: "/month",
    tag: "Most loved",
    highlighted: true,
    priceId: "premium_monthly",
    features: [
      "Unlimited likes",
      "Better filters",
      "Priority matching",
      "Read receipts",
      "See who liked you",
    ],
  },
  {
    name: "Elite Verified",
    price: "₹999",
    period: "/month",
    tag: "Hand-picked",
    priceId: "elite_monthly",
    features: [
      "Everything in Premium",
      "Verified Elite badge",
      "Concierge support",
      "Exclusive events",
      "Profile review",
    ],
  },
];

export const Pricing = ({ compact = false }: { compact?: boolean }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openCheckout, closeCheckout, isOpen, checkoutElement } = useStripeCheckout();

  const handleChoose = (plan: Plan) => {
    if (!user) {
      navigate(`/signup?plan=${plan.priceId}`);
      return;
    }
    if (!isPaymentsConfigured()) {
      toast.info("Payments coming online shortly. We'll notify you when this plan goes live.");
      return;
    }
    openCheckout({
      priceId: plan.priceId,
      customerEmail: user.email ?? undefined,
      userId: user.id,
      returnUrl: `${window.location.origin}/dashboard/profile?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    });
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
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative p-6 md:p-8 rounded-3xl border transition-all duration-500 flex flex-col ${
                p.highlighted
                  ? "bg-gradient-romance text-primary-foreground border-transparent shadow-elegant md:scale-105"
                  : "bg-card border-border/60 shadow-card"
              }`}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium bg-background text-foreground border border-border shadow-soft">
                  {p.tag}
                </span>
              )}
              <div className="text-[11px] uppercase tracking-widest opacity-70 mb-2">{p.tag}</div>
              <h3 className="font-display text-2xl md:text-3xl mb-3">{p.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-4xl md:text-5xl">{p.price}</span>
                <span className={p.highlighted ? "opacity-80" : "text-muted-foreground"}>{p.period}</span>
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
                onClick={() => handleChoose(p)}
              >
                Choose {p.name}
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={(v) => !v && closeCheckout()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="font-display text-2xl">Complete your subscription</DialogTitle>
          </DialogHeader>
          <div className="px-2 pb-4">{checkoutElement}</div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
