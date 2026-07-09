// Single source of truth for Unveil core subscription plans.
// Blind Date plans are separate and live in src/features/blind-date/lib/plans.ts.

export type PlanId = "starter" | "premium" | "elite";
export type BillingPeriod = "week" | "month";

export type Plan = {
  id: PlanId;
  name: string;
  badge: string;
  priceLabel: string; // e.g. "₹149"
  priceInr: number;
  period: BillingPeriod;
  periodLabel: string; // e.g. "/week"
  matchLimit: number | null; // null = unlimited
  matchLimitLabel: string;
  highlighted?: boolean;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    badge: "Get going",
    priceLabel: "₹149",
    priceInr: 149,
    period: "week",
    periodLabel: "/week",
    matchLimit: 5,
    matchLimitLabel: "5 mutual matches / week",
    features: [
      "Up to 5 mutual matches per week",
      "Unlimited likes & requests",
      "Standard profile visibility",
      "Voice intros & prompts",
      "✦ 10 Blind Date chats included",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    badge: "Most loved",
    priceLabel: "₹299",
    priceInr: 299,
    period: "month",
    periodLabel: "/month",
    matchLimit: 10,
    matchLimitLabel: "10 mutual matches / month",
    highlighted: true,
    features: [
      "Up to 10 mutual matches per month",
      "Unlimited likes & requests",
      "2× profile visibility",
      "Priority matching",
      "See who liked you",
      "✦ 30 Blind Date chats included",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    badge: "Hand-picked",
    priceLabel: "₹399",
    priceInr: 399,
    period: "month",
    periodLabel: "/month",
    matchLimit: null,
    matchLimitLabel: "Unlimited mutual matches",
    features: [
      "Unlimited mutual matches",
      "Unlimited likes & requests",
      "4× profile visibility",
      "Concierge support",
      "✦ Unlimited Blind Date chats",
    ],
  },
];

export function getPlan(id?: string | null): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function planName(id?: string | null): string {
  return getPlan(id)?.name ?? id ?? "—";
}

export function planPriceLabel(id?: string | null): string {
  return getPlan(id)?.priceLabel ?? "—";
}

// ₹99 Unlock Interest add-on (separate from subscription plans)
export const UNLOCK_INTEREST_PRICE_INR = 99;
export const UNLOCK_INTEREST_PRICE_LABEL = "₹99";
