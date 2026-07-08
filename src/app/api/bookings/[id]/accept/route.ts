import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications/notify";
import { minutesToLabel } from "@/lib/time";

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
    return NextResponse.json({ error: "This request can no longer be accepted." }, { status: 400 });
  }
  if (booking.respondByAt && booking.respondByAt < new Date()) {
    await prisma.booking.update({ where: { id }, data: { status: "AUTO_DECLINED" } });
    return NextResponse.json({ error: "The response window expired." }, { status: 400 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "ACCEPTED", acceptedAt: new Date() },
  });

  await prisma.conversation.upsert({
    where: { bookingId: id },
    create: { bookingId: id, ownerId: booking.ownerId, caregiverId: booking.caregiverProfile.userId },
    update: {},
  });

  await notify({
    userId: booking.ownerId,
    type: "BOOKING_ACCEPTED",
    title: "Booking accepted!",
    body: `Your booking on ${booking.date.toISOString().slice(0, 10)} at ${minutesToLabel(booking.startMinute)} was accepted.`,
    toEmail: booking.owner.email,
    emailHtml: `<p>Good news — your booking on ${booking.date.toISOString().slice(0, 10)} at ${minutesToLabel(booking.startMinute)} was accepted.</p>`,
  });

  return NextResponse.json({ booking: updated });
}
