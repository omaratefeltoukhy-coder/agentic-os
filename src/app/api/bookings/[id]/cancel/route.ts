import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/payments/stripe";
import { cancellationChargeRatio } from "@/lib/pricing";
import { bookingStartDateTime } from "@/lib/bookings";
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

  const isOwner = booking.ownerId === session.user.id;
  const isCaregiver = booking.caregiverProfile.userId === session.user.id;
  if (!isOwner && !isCaregiver) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!["REQUESTED", "ACCEPTED"].includes(booking.status)) {
    return NextResponse.json({ error: "This booking can no longer be cancelled." }, { status: 400 });
  }

  const start = bookingStartDateTime(booking.date, booking.startMinute);
  const ownerHasPlus = isOwner
    ? !!(await prisma.subscription.findFirst({
        where: { userId: booking.ownerId, plan: "OWNER_PLUS", status: "ACTIVE" },
      }))
    : false;
  const chargeRatio = isOwner && !ownerHasPlus ? cancellationChargeRatio(start) : 0;

  let paymentStatus = booking.paymentStatus;
  const stripe = getStripe();
  if (stripe && booking.stripePaymentIntentId && booking.paymentMethod === "CARD") {
    if (chargeRatio > 0) {
      const amountToCapture = Math.round(Number(booking.total) * chargeRatio * 100);
      await stripe.paymentIntents.capture(booking.stripePaymentIntentId, {
        amount_to_capture: amountToCapture,
      }).catch(() => null);
      paymentStatus = "PARTIALLY_REFUNDED";
    } else {
      await stripe.paymentIntents.cancel(booking.stripePaymentIntentId).catch(() => null);
      paymentStatus = "REFUNDED";
    }
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: isOwner ? "CANCELLED_BY_OWNER" : "CANCELLED_BY_CAREGIVER",
      cancelledAt: new Date(),
      cancellationReason:
        chargeRatio > 0
          ? "Cancelled within 12 hours of start — 50% cancellation fee applies."
          : "Cancelled free of charge.",
      paymentStatus,
    },
  });

  const notifyUserId = isOwner ? booking.caregiverProfile.userId : booking.ownerId;
  const notifyEmail = isOwner ? undefined : booking.owner.email;

  await notify({
    userId: notifyUserId,
    type: "BOOKING_CANCELLED",
    title: "Booking cancelled",
    body: `The booking on ${booking.date.toISOString().slice(0, 10)} was cancelled.`,
    toEmail: notifyEmail,
    emailHtml: `<p>The booking on ${booking.date.toISOString().slice(0, 10)} was cancelled.</p>`,
  });

  return NextResponse.json({ booking: updated });
}
