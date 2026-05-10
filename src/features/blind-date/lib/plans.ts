// Blind Date pricing & feature constants. Mirrors src/lib/payment.ts patterns.
export type BlindDatePlanId = "expert" | "unlimited";

export const BD_PLANS: {
  id: BlindDatePlanId;
  name: string;
  priceLabel: string;
  memberPriceLabel: string;
  priceInr: number;
  memberPriceInr: number;
  sessions: number | null; // null = unlimited
  perks: string[];
  highlight?: boolean;
}[] = [
  {
    id: "expert",
    name: "Blind Date Expert",
    priceLabel: "₹499/mo",
    memberPriceLabel: "₹399/mo",
    priceInr: 499,
    memberPriceInr: 399,
    sessions: 50,
    perks: [
      "50 Blind Date sessions",
      "Priority matchmaking",
      "Advanced compatibility matching",
      "Compatibility insights",
    ],
    highlight: true,
  },
  {
    id: "unlimited",
    name: "Blind Date Unlimited",
    priceLabel: "₹999/mo",
    memberPriceLabel: "₹399/mo",
    priceInr: 999,
    memberPriceInr: 399,
    sessions: null,
    perks: [
      "Unlimited Blind Date sessions",
      "Priority matchmaking",
      "Advanced compatibility matching",
      "Compatibility insights",
    ],
  },
];

export const BD_MEMBER_DISCOUNT_INR = 100;

export function bdPriceForUser(planId: BlindDatePlanId, isMember: boolean) {
  const p = BD_PLANS.find((x) => x.id === planId)!;
  return isMember ? p.memberPriceInr : p.priceInr;
}
export function bdPriceLabelForUser(planId: BlindDatePlanId, isMember: boolean) {
  const p = BD_PLANS.find((x) => x.id === planId)!;
  return isMember ? p.memberPriceLabel : p.priceLabel;
}
