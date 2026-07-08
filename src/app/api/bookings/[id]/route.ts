import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expireOverdueRequests } from "@/lib/bookings";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      pet: true,
      owner: { select: { id: true, name: true, image: true, phoneCountryCode: true, phoneNumber: true } },
      caregiverProfile: { include: { user: { select: { id: true, name: true, image: true, phoneCountryCode: true, phoneNumber: true } } } },
      reviews: true,
    },
  });

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = booking.ownerId === session.user.id;
  const isCaregiver = booking.caregiverProfile.userId === session.user.id;
  if (!isOwner && !isCaregiver) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await expireOverdueRequests(booking.caregiverProfileId);
  const fresh = await prisma.booking.findUnique({
    where: { id },
    include: {
      pet: true,
      owner: { select: { id: true, name: true, image: true, phoneCountryCode: true, phoneNumber: true } },
      caregiverProfile: { include: { user: { select: { id: true, name: true, image: true, phoneCountryCode: true, phoneNumber: true } } } },
      reviews: true,
    },
  });

  return NextResponse.json({ booking: fresh, viewerRole: isOwner ? "OWNER" : "CAREGIVER" });
}
