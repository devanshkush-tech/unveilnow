// Manual payment configuration shared across signup, payment page, and review.
export const UPI_ID = "devanshkush@okhdfcbank";
export const WHATSAPP_URL = "https://api.whatsapp.com/send?phone=917049706456&text=Hi%2C%20I%20have%20completed%20the%20payment.%20Here%20is%20my%20screenshot.";

export type PaymentPlanId = "starter" | "premium" | "elite";

export const PAYMENT_PLANS: { id: PaymentPlanId; name: string; price: string; tag: string; perks: string[] }[] = [
  {
    id: "starter",
    name: "Starter",
    price: "₹299",
    tag: "Get going",
    perks: ["5 thoughtful matches a day", "Unlimited prompts", "Voice intros"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹499",
    tag: "Most loved",
    perks: ["Unlimited likes", "Priority matching", "See who liked you"],
  },
  {
    id: "elite",
    name: "Elite Verified",
    price: "₹999",
    tag: "Hand-picked",
    perks: ["Verified Elite badge", "Concierge support", "Exclusive events"],
  },
];

export function planLabel(id?: string | null) {
  return PAYMENT_PLANS.find((p) => p.id === id)?.name ?? id ?? "—";
}
export function planPrice(id?: string | null) {
  return PAYMENT_PLANS.find((p) => p.id === id)?.price ?? "—";
}
