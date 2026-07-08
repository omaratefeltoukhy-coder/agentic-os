import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, stripeConfigured } from "@/lib/payments/stripe";
import { FEATURED_LISTING_PRICE, CURRENCY_DECIMALS, type CurrencyCode } from "@/lib/constants/gulf";

const BOOST_DAYS = 7;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "No caregiver profile" }, { status: 400 });

  const currency = profile.currency as CurrencyCode;
  const price = FEATURED_LISTING_PRICE[currency];
  const endsAt = new Date(Date.now() + BOOST_DAYS * 24 * 60 * 60 * 1000);

  if (stripeConfigured()) {
    const stripe = getStripe()!;
    const origin = new URL(req.url).origin;
    const decimals = CURRENCY_DECIMALS[currency];
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(price * 10 ** decimals),
            product_data: { name: "GulfPaws featured listing (7 days)" },
          },
          quantity: 1,
        },
      ],
      metadata: { caregiverProfileId: profile.id, type: "featured_listing" },
      customer_email: session.user.email ?? undefined,
      success_url: `${origin}/dashboard/caregiver/featured?boosted=1`,
      cancel_url: `${origin}/dashboard/caregiver/featured`,
    });
    return NextResponse.json({ checkoutUrl: checkoutSession.url });
  }

  // Dev fallback so this is testable without live Stripe keys.
  await prisma.$transaction([
    prisma.featuredListing.create({
      data: { caregiverProfileId: profile.id, startsAt: new Date(), endsAt, amountPaid: price, currency },
    }),
    prisma.caregiverProfile.update({ where: { id: profile.id }, data: { isFeaturedUntil: endsAt } }),
  ]);

  return NextResponse.json({ ok: true });
}
