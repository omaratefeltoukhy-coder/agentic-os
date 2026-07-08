import { getStripe } from "@/lib/payments/stripe";
import { CURRENCY_DECIMALS, type CurrencyCode } from "@/lib/constants/gulf";

/**
 * Escrow-style checkout: authorize now (manual capture), capture only when
 * the booking is marked COMPLETED. Cancellations release or partially
 * capture depending on the cancellation policy.
 */
export async function createCheckoutSessionForBooking(input: {
  bookingId: string;
  amount: number;
  currency: CurrencyCode;
  description: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured in this environment.");

  const decimals = CURRENCY_DECIMALS[input.currency];
  const smallestUnitAmount = Math.round(input.amount * 10 ** decimals);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: smallestUnitAmount,
          product_data: { name: input.description },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: { capture_method: "manual", metadata: { bookingId: input.bookingId } },
    metadata: { bookingId: input.bookingId },
    customer_email: input.customerEmail,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });

  return session;
}
