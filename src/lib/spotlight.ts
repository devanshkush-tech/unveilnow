export type SpotlightOffer = {
  plan: "spotlight_1d" | "spotlight_3d" | "spotlight_5d";
  durationDays: 1 | 3 | 5;
  priceInr: 149 | 299 | 499;
  priceLabel: string;
};

export const SPOTLIGHT_OFFERS: SpotlightOffer[] = [
  { plan: "spotlight_1d", durationDays: 1, priceInr: 149, priceLabel: "₹149" },
  { plan: "spotlight_3d", durationDays: 3, priceInr: 299, priceLabel: "₹299" },
  { plan: "spotlight_5d", durationDays: 5, priceInr: 499, priceLabel: "₹499" },
];

export function getSpotlightOffer(plan: string | null | undefined): SpotlightOffer | undefined {
  return SPOTLIGHT_OFFERS.find((offer) => offer.plan === plan);
}