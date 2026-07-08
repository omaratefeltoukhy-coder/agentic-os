import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createBookingSchema } from "@/lib/validations/booking";
import { createBooking, BookingConflictError } from "@/lib/bookings";
import { stripeConfigured } from "@/lib/payments/stripe";
import { createCheckoutSessionForBooking } from "@/lib/payments/checkout";
import { notify } from "@/lib/notifications/notify";
import type { CurrencyCode } from "@/lib/constants/gulf";
import { formatMoney } from "@/lib/constants/gulf";
import { minutesToLabel } from "@/lib/time";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const as = searchParams.get("as") ?? "owner";
  const status = searchParams.get("status");

  if (as === "caregiver") {
    const profile = await prisma.caregiverProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return NextResponse.json({ bookings: [] });

    const bookings = await prisma.booking.findMany({
      where: { caregiverProfileId: profile.id, ...(status ? { status: status as never } : {}) },
      include: { pet: true, owner: { select: { name: true } } },
      orderBy: { date: "desc" },
      take: 50,
    });
    return NextResponse.json({ bookings });
  }

  const bookings = await prisma.booking.findMany({
    where: { ownerId: session.user.id, ...(status ? { status: status as never } : {}) },
    include: { pet: true, caregiverProfile: { include: { user: { select: { name: true } } } } },
    orderBy: { date: "desc" },
    take: 50,
  });
  return NextResponse.json({ bookings });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  const pet = await prisma.pet.findUnique({ where: { id: data.petId } });
  if (!pet || pet.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  if (data.paymentMethod === "CARD" && !stripeConfigured()) {
    return NextResponse.json(
      { error: "Card payments aren't configured in this environment yet. Choose Cash instead." },
      { status: 400 }
    );
  }

  try {
    const booking = await createBooking({
      ownerId: session.user.id,
      caregiverProfileId: data.caregiverProfileId,
      petId: data.petId,
      serviceType: data.serviceType,
      date: new Date(`${data.date}T00:00:00.000Z`),
      startMinute: data.startMinute,
      durationMinutes: data.durationMinutes,
      ownerNote: data.ownerNote,
      paymentMethod: data.paymentMethod,
    });

    const caregiverProfile = await prisma.caregiverProfile.findUniqueOrThrow({
      where: { id: booking.caregiverProfileId },
      include: { user: true },
    });

    let checkoutUrl: string | null = null;

    if (data.paymentMethod === "CARD") {
      const origin = new URL(req.url).origin;
      const checkoutSession = await createCheckoutSessionForBooking({
        bookingId: booking.id,
        amount: Number(booking.total),
        currency: booking.currency as CurrencyCode,
        description: `GulfPaws booking with ${caregiverProfile.user.name}`,
        successUrl: `${origin}/dashboard/owner/bookings/${booking.id}?paid=1`,
        cancelUrl: `${origin}/dashboard/owner/bookings/${booking.id}`,
        customerEmail: session.user.email ?? undefined,
      });
      await prisma.booking.update({
        where: { id: booking.id },
        data: { stripePaymentIntentId: (checkoutSession.payment_intent as string) ?? null },
      });
      checkoutUrl = checkoutSession.url;
    }

    const priceLabel = formatMoney(Number(booking.total), booking.currency as CurrencyCode);
    const timeLabel = minutesToLabel(booking.startMinute);

    await notify({
      userId: session.user.id,
      type: "BOOKING_REQUESTED",
      title: "Booking request sent",
      body: `Your request for ${data.date} at ${timeLabel} (${priceLabel}) was sent.`,
      toEmail: session.user.email ?? undefined,
      emailHtml: `<p>Your booking request for ${data.date} at ${timeLabel} (${priceLabel}) has been sent to ${caregiverProfile.user.name}. They have 2 hours to respond.</p>`,
    });

    await notify({
      userId: caregiverProfile.userId,
      type: "BOOKING_REQUESTED",
      title: "New booking request",
      body: `New request for ${data.date} at ${timeLabel} (${priceLabel}). Respond within 2 hours.`,
      toEmail: caregiverProfile.user.email,
      emailHtml: `<p>You have a new booking request for ${data.date} at ${timeLabel} (${priceLabel}). Respond within 2 hours or it will auto-decline.</p>`,
    });

    return NextResponse.json({ booking, checkoutUrl });
  } catch (err) {
    if (err instanceof BookingConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
