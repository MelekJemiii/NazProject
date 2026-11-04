import Stripe from "stripe";

/** Stripe is optional: configured only when the secret key is present. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // No apiVersion pin — the SDK uses the version it was built against.
  return new Stripe(key);
}

export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
