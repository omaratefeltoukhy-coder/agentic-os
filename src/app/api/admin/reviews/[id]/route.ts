import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const review = await prisma.review.delete({ where: { id } }).catch(() => null);
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const agg = await prisma.review.aggregate({
    where: { subjectId: review.subjectId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.caregiverProfile.updateMany({
    where: { userId: review.subjectId },
    data: { ratingAverage: agg._avg.rating ?? 0, ratingCount: agg._count },
  });

  return NextResponse.json({ ok: true });
}
