import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { availabilitySchema } from "@/lib/validations/caregiver";
import { recomputeCompleteness } from "@/lib/caregiver";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) {
    return NextResponse.json({ error: "Complete your profile first." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = availabilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid slots" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.availabilitySlot.deleteMany({ where: { caregiverProfileId: profile.id } }),
    prisma.availabilitySlot.createMany({
      data: parsed.data.slots.map((s) => ({
        caregiverProfileId: profile.id,
        dayOfWeek: s.dayOfWeek,
        startMinute: s.startMinute,
      })),
      skipDuplicates: true,
    }),
  ]);

  const completeness = await recomputeCompleteness(profile.id);

  return NextResponse.json({ ok: true, completeness });
}
