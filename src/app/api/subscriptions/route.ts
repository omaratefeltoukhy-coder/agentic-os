import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, stripeConfigured } from "@/lib/payments/stripe";
import { getActiveSubscription, applySubscriptionSideEffects } from "@/lib/subscriptions";
import {
  PLUS_MONTHLY_PRICE,
  PRO_MONTHLY_PRICE,
  CURRENCY_DECIMALS,
  CITY_INFO,
  type CurrencyCode,
  type GulfCityCode,
} from "@/lib/constants/gulf";

const schema = z.object({ plan: z.enum(["OWNER_PLUS", "CAREGIVER_PRO"]) });

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
  });
  return NextResponse.json({ subscriptions });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  const { plan } = parsed.data;

  const existing = await getActiveSubscription(session.user.id, plan);
  if (existing) return NextResponse.json({ error: "You already have this plan." }, { status: 400 });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const currency: CurrencyCode = user.city ? CITY_INFO[user.city as GulfCityCode].currency : "AED";
  const price = plan === "OWNER_PLUS" ? PLUS_MONTHLY_PRICE[currency] : PRO_MONTHLY_PRICE[currency];

  if (stripeConfigured()) {
    const stripe = getStripe()!;
    const origin = new URL(req.url).origin;
    const decimals = CURRENCY_DECIMALS[currency];
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(price * 10 ** decimals),
            recurring: { interval: "month" },
            product_data: { name: plan === "OWNER_PLUS" ? "GulfPaws Plus" : "Caregiver Pro" },
          },
          quantity: 1,
        },
      ],
      metadata: { userId: session.user.id, plan },
      customer_email: session.user.email ?? undefined,
      success_url: `${origin}/dashboard?subscribed=1`,
      cancel_url: `${origin}/dashboard`,
    });
    return NextResponse.json({ checkoutUrl: checkoutSession.url });
  }

  // Dev fallback so subscriptions are fully testable without live Stripe keys.
  await prisma.subscription.create({
    data: {
      userId: session.user.id,
      plan,
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  await applySubscriptionSideEffects(session.user.id, plan, true);

  return NextResponse.json({ ok: true });
}
