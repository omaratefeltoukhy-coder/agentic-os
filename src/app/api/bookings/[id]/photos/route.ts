import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications/notify";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const updates = await prisma.bookingPhotoUpdate.findMany({
    where: { bookingId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ updates });
}

const schema = z.object({ mediaUrl: z.string().min(1), caption: z.string().trim().max(200).optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { caregiverProfile: true, owner: true, pet: true },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.caregiverProfile.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!["ACCEPTED", "IN_PROGRESS"].includes(booking.status)) {
    return NextResponse.json({ error: "Updates can only be sent during an active booking." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const update = await prisma.bookingPhotoUpdate.create({
    data: { bookingId: id, mediaUrl: parsed.data.mediaUrl, caption: parsed.data.caption || null },
  });

  await notify({
    userId: booking.ownerId,
    type: "PHOTO_UPDATE",
    title: `${booking.pet.name ?? "Your pet"} has a new update!`,
    body: parsed.data.caption || "New photo from your caregiver.",
    toEmail: booking.owner.email,
    emailHtml: `<p>Your caregiver sent a new update for your booking.</p>`,
  }).catch(() => null);

  return NextResponse.json({ update });
}
