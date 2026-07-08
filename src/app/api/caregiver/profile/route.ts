import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { caregiverProfileSchema } from "@/lib/validations/caregiver";
import { recomputeCompleteness } from "@/lib/caregiver";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const profile = await prisma.caregiverProfile.findUnique({
    where: { userId: session.user.id },
    include: { availabilitySlots: true, availabilityOverrides: true },
  });

  return NextResponse.json({ profile });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!session.user.roles.includes("CAREGIVER")) {
    return NextResponse.json({ error: "You don't hold the caregiver role yet." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = caregiverProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { photoUrl, ...data } = parsed.data;

  const profile = await prisma.caregiverProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      city: data.city,
      areas: data.areas,
      services: data.services,
      hourlyRate: data.hourlyRate,
      currency: data.currency,
      languages: data.languages,
      bio: data.bio || null,
      yearsExperience: data.yearsExperience ?? null,
      certificationUrls: data.certificationUrls ?? [],
    },
    update: {
      city: data.city,
      areas: data.areas,
      services: data.services,
      hourlyRate: data.hourlyRate,
      currency: data.currency,
      languages: data.languages,
      bio: data.bio || null,
      yearsExperience: data.yearsExperience ?? null,
      certificationUrls: data.certificationUrls ?? [],
    },
  });

  if (photoUrl !== undefined) {
    await prisma.user.update({ where: { id: session.user.id }, data: { image: photoUrl } });
  }

  const completeness = await recomputeCompleteness(profile.id);

  return NextResponse.json({ ok: true, profileId: profile.id, completeness });
}
