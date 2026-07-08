import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/payments/stripe";
import { notify } from "@/lib/notifications/notify";
import { maybeAwardReferralCredit } from "@/lib/referrals";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { caregiverProfile: true, owner: true },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.caregiverProfile.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (booking.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "This booking isn't in progress." }, { status: 400 });
  }

  let paymentStatus = booking.paymentStatus;
  const stripe = getStripe();
  if (stripe && booking.stripePaymentIntentId && booking.paymentMethod === "CARD") {
    await stripe.paymentIntents.capture(booking.stripePaymentIntentId).catch(() => null);
    paymentStatus = "CAPTURED";
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "COMPLETED", completedAt: new Date(), paymentStatus },
  });

  await maybeAwardReferralCredit(booking.ownerId).catch(() => null);

  await notify({
    userId: booking.ownerId,
    type: "REVIEW_PROMPT",
    title: "How was the visit?",
    body: `${booking.date.toISOString().slice(0, 10)}'s booking is complete. Leave a review for your caregiver.`,
    toEmail: booking.owner.email,
    emailHtml: `<p>Your booking is complete! Let other owners know how it went — <a href="/dashboard/owner/bookings/${booking.id}">leave a review</a>.</p>`,
  });

  return NextResponse.json({ booking: updated });
}
