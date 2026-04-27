import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

export const plans = [
  {
    name: "Starter",
    price: "₹299",
    period: "/month",
    tag: "Get going",
    features: ["5 thoughtful matches a day", "Unlimited prompts", "Voice intros", "Basic filters"],
  },
  {
    name: "Premium",
    price: "₹499",
    period: "/month",
    tag: "Most loved",
    highlighted: true,
    features: ["Unlimited likes", "Better filters", "Priority matching", "Read receipts", "See who liked you"],
  },
  {
    name: "Elite Verified",
    price: "₹999",
    period: "/month",
    tag: "Hand-picked",
    features: ["Everything in Premium", "Verified Elite badge", "Concierge support", "Exclusive events", "Profile review"],
  },
];

export const Pricing = ({ compact = false }: { compact?: boolean }) => {
  return (
    <section className={compact ? "py-16" : "py-24 md:py-32"}>
      <div className="container max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-4">Pricing</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight">
            Pay for the people, not the swipes.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative p-8 rounded-3xl border transition-all duration-500 ${
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
              <div className="text-xs uppercase tracking-widest opacity-70 mb-2">{p.tag}</div>
              <h3 className="font-display text-3xl mb-3">{p.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-5xl">{p.price}</span>
                <span className={p.highlighted ? "opacity-80" : "text-muted-foreground"}>{p.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${p.highlighted ? "text-primary-foreground" : "text-accent"}`} />
                    <span className={p.highlighted ? "" : "text-muted-foreground"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={p.highlighted ? "soft" : "default"}
                className="w-full rounded-full"
                asChild
              >
                <Link to="/signup">Choose {p.name}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
