import Stripe from "stripe";

let client: Stripe | null = null;

/** Null when STRIPE_SECRET_KEY isn't set — callers fall back to cash. This
 * keeps the module swappable for a regional gateway (Telr/PayTabs/Tap)
 * later: only this file and the webhook route would need to change. */
export function getStripe(): Stripe | null {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client = new Stripe(key);
  return client;
}

export function stripeConfigured() {
  return !!process.env.STRIPE_SECRET_KEY;
}
