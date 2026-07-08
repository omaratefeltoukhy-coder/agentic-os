import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { overrideSchema } from "@/lib/validations/caregiver";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "No caregiver profile" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = overrideSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const override = await prisma.availabilityOverride.upsert({
    where: {
      caregiverProfileId_date: { caregiverProfileId: profile.id, date: new Date(parsed.data.date) },
    },
    create: {
      caregiverProfileId: profile.id,
      date: new Date(parsed.data.date),
      isDayOff: parsed.data.isDayOff,
    },
    update: { isDayOff: parsed.data.isDayOff },
  });

  return NextResponse.json({ ok: true, override });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "No caregiver profile" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  await prisma.availabilityOverride.deleteMany({
    where: { caregiverProfileId: profile.id, date: new Date(date) },
  });

  return NextResponse.json({ ok: true });
}
