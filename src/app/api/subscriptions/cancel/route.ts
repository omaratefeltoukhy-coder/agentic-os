import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/payments/stripe";
import { applySubscriptionSideEffects } from "@/lib/subscriptions";

const schema = z.object({ plan: z.enum(["OWNER_PLUS", "CAREGIVER_PRO"]) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id, plan: parsed.data.plan, status: "ACTIVE" },
  });
  if (!subscription) return NextResponse.json({ error: "No active subscription found." }, { status: 400 });

  const stripe = getStripe();
  if (stripe && subscription.stripeSubscriptionId) {
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId).catch(() => null);
  }

  await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "CANCELLED" } });
  await applySubscriptionSideEffects(session.user.id, parsed.data.plan, false);

  return NextResponse.json({ ok: true });
}
