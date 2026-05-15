// Manual payment configuration shared across signup, payment page, and review.
// Plan definitions now live in src/lib/plans.ts (single source of truth).
import { PLANS, getPlan, planName, planPriceLabel, type PlanId } from "./plans";

export const UPI_ID = "devanshkush@okhdfcbank";
export const WHATSAPP_URL = "https://api.whatsapp.com/send?phone=917049706456&text=Hi%2C%20I%20have%20completed%20the%20payment.%20Here%20is%20my%20screenshot.";

export type PaymentPlanId = PlanId;

// Backward-compatible shape used by existing payment UI (id/name/price/tag/perks).
export const PAYMENT_PLANS = PLANS.map((p) => ({
  id: p.id,
  name: p.name,
  price: p.priceLabel,
  periodLabel: p.periodLabel,
  tag: p.badge,
  perks: p.features,
}));

export function planLabel(id?: string | null) {
  return planName(id);
}
export function planPrice(id?: string | null) {
  return planPriceLabel(id);
}
export { getPlan };
