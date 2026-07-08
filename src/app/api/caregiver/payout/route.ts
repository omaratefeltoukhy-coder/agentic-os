import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { payoutSchema } from "@/lib/validations/caregiver";
import { recomputeCompleteness } from "@/lib/caregiver";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "No caregiver profile" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = payoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await prisma.caregiverProfile.update({
    where: { id: profile.id },
    data: {
      payoutIban: parsed.data.payoutIban || null,
      payoutBankName: parsed.data.payoutBankName || null,
    },
  });

  const completeness = await recomputeCompleteness(profile.id);

  return NextResponse.json({ ok: true, completeness });
}
