import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recomputeCompleteness } from "@/lib/caregiver";

const schema = z.object({ idDocumentUrl: z.string().min(1) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "No caregiver profile" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await prisma.caregiverProfile.update({
    where: { id: profile.id },
    data: { idDocumentUrl: parsed.data.idDocumentUrl, verificationStatus: "PENDING" },
  });

  await recomputeCompleteness(profile.id);

  return NextResponse.json({ ok: true });
}
