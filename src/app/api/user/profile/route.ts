import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validations/auth";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, phoneCountryCode, phoneNumber, whatsappOptIn, city, locale } = parsed.data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phoneCountryCode: phoneCountryCode || null,
      phoneNumber: phoneNumber || null,
      whatsappOptIn,
      city: city || null,
      locale,
    },
  });

  return NextResponse.json({ ok: true });
}
