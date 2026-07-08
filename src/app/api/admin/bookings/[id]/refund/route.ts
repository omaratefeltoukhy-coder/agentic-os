import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { getStripe } from "@/lib/payments/stripe";
import { notify } from "@/lib/notifications/notify";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id }, include: { owner: true } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const stripe = getStripe();
  if (stripe && booking.stripePaymentIntentId) {
    if (booking.paymentStatus === "CAPTURED") {
      await stripe.refunds.create({ payment_intent: booking.stripePaymentIntentId }).catch(() => null);
    } else {
      await stripe.paymentIntents.cancel(booking.stripePaymentIntentId).catch(() => null);
    }
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: "CANCELLED_BY_OWNER",
      paymentStatus: "REFUNDED",
      cancelledAt: new Date(),
      cancellationReason: "Refunded by GulfPaws support.",
    },
  });

  await notify({
    userId: booking.ownerId,
    type: "BOOKING_REFUNDED",
    title: "Your booking was refunded",
    body: "GulfPaws support processed a refund for your booking.",
    toEmail: booking.owner.email,
    emailHtml: `<p>GulfPaws support processed a refund for your booking on ${booking.date.toISOString().slice(0, 10)}.</p>`,
  });

  return NextResponse.json({ booking: updated });
}
