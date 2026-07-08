import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { caregiverProfile: true },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = booking.ownerId === session.user.id;
  const isCaregiver = booking.caregiverProfile.userId === session.user.id;
  if (!isOwner && !isCaregiver) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!["COMPLETED", "REVIEWED"].includes(booking.status)) {
    return NextResponse.json({ error: "This booking isn't completed yet." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid rating" }, { status: 400 });

  const existing = await prisma.review.findUnique({
    where: { bookingId_authorId: { bookingId: id, authorId: session.user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "You already reviewed this booking." }, { status: 400 });
  }

  const subjectId = isOwner ? booking.caregiverProfile.userId : booking.ownerId;

  await prisma.review.create({
    data: {
      bookingId: id,
      authorId: session.user.id,
      subjectId,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
  });

  if (booking.status === "COMPLETED") {
    await prisma.booking.update({ where: { id }, data: { status: "REVIEWED" } });
  }

  if (isOwner) {
    const agg = await prisma.review.aggregate({
      where: { subjectId },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.caregiverProfile.update({
      where: { userId: subjectId },
      data: {
        ratingAverage: agg._avg.rating ?? 0,
        ratingCount: agg._count,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
