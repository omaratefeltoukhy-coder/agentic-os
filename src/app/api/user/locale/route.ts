import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ locale: z.enum(["en", "ar"]) });

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid locale" }, { status: 400 });

  await prisma.user.update({ where: { id: session.user.id }, data: { locale: parsed.data.locale } });

  return NextResponse.json({ ok: true });
}
