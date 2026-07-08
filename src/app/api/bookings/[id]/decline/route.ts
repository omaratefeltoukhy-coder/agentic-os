import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/payments/stripe";
import { notify } from "@/lib/notifications/notify";

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
  if (booking.status !== "REQUESTED") {
    return NextResponse.json({ error: "This request can no longer be declined." }, { status: 400 });
  }

  const stripe = getStripe();
  if (stripe && booking.stripePaymentIntentId) {
    await stripe.paymentIntents.cancel(booking.stripePaymentIntentId).catch(() => null);
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "DECLINED", paymentStatus: booking.paymentMethod === "CARD" ? "REFUNDED" : "PENDING" },
  });

  await notify({
    userId: booking.ownerId,
    type: "BOOKING_DECLINED",
    title: "Booking declined",
    body: `Your booking on ${booking.date.toISOString().slice(0, 10)} was declined. No charge was made.`,
    toEmail: booking.owner.email,
    emailHtml: `<p>Your booking on ${booking.date.toISOString().slice(0, 10)} was declined. No charge was made — try another caregiver.</p>`,
  });

  return NextResponse.json({ booking: updated });
}
