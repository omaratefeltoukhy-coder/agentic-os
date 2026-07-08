import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id }, include: { caregiverProfile: true } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.caregiverProfile.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (booking.status !== "ACCEPTED") {
    return NextResponse.json({ error: "This booking isn't ready to start." }, { status: 400 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "IN_PROGRESS", startedAt: new Date() },
  });

  return NextResponse.json({ booking: updated });
}
