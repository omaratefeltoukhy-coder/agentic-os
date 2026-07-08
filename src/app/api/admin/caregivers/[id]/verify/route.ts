import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { notify } from "@/lib/notifications/notify";

const schema = z.object({ status: z.enum(["APPROVED", "REJECTED"]) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const profile = await prisma.caregiverProfile.update({
    where: { id },
    data: { verificationStatus: parsed.data.status },
    include: { user: true },
  });

  await notify({
    userId: profile.userId,
    type: "VERIFICATION_UPDATE",
    title: parsed.data.status === "APPROVED" ? "You're verified!" : "Verification update",
    body:
      parsed.data.status === "APPROVED"
        ? "Your ID has been verified. You now show the Verified badge on your profile."
        : "We couldn't verify your ID document. Please upload a clearer copy from your dashboard.",
    toEmail: profile.user.email,
    emailHtml: `<p>${
      parsed.data.status === "APPROVED"
        ? "Your ID has been verified — you now show the Verified badge."
        : "We couldn't verify your ID document. Please upload a clearer copy."
    }</p>`,
  });

  return NextResponse.json({ ok: true });
}
