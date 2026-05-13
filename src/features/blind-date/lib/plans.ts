// Blind Date pricing — credit-based plans. One chat = one mutual match.
export type BlindDatePlanId = "starter" | "premium" | "elite";

export const BD_PLANS: {
  id: BlindDatePlanId;
  name: string;
  priceLabel: string;
  priceInr: number;
  chats: number;
  perks: string[];
  highlight?: boolean;
}[] = [
  {
    id: "starter",
    name: "Starter",
    priceLabel: "₹199",
    priceInr: 199,
    chats: 10,
    perks: ["10 mutual-match chats", "Compatibility-based matching", "Real users only"],
  },
  {
    id: "premium",
    name: "Premium",
    priceLabel: "₹299",
    priceInr: 299,
    chats: 30,
    perks: ["30 mutual-match chats", "Priority matchmaking", "Advanced compatibility"],
    highlight: true,
  },
  {
    id: "elite",
    name: "Elite",
    priceLabel: "₹499",
    priceInr: 499,
    chats: 100,
    perks: ["100 mutual-match chats", "Top priority queue", "Deepest compatibility insights"],
  },
];

export function bdPlan(id: BlindDatePlanId) {
  return BD_PLANS.find((p) => p.id === id)!;
}

// Map a `payment_submissions.plan` value (e.g. "bd_premium") to chat credits.
export function bdChatsForSubmissionPlan(plan: string | null | undefined): number {
  if (!plan) return 0;
  const id = plan.startsWith("bd_") ? plan.slice(3) : plan;
  return BD_PLANS.find((p) => p.id === id)?.chats ?? 0;
}
