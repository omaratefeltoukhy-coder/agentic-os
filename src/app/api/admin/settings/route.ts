import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const schema = z.object({
  defaultCommissionRate: z.coerce.number().min(0).max(1),
  proCommissionRate: z.coerce.number().min(0).max(1),
});

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await prisma.$transaction([
    prisma.platformSetting.upsert({
      where: { key: "default_commission_rate" },
      create: { key: "default_commission_rate", value: String(parsed.data.defaultCommissionRate) },
      update: { value: String(parsed.data.defaultCommissionRate) },
    }),
    prisma.platformSetting.upsert({
      where: { key: "pro_commission_rate" },
      create: { key: "pro_commission_rate", value: String(parsed.data.proCommissionRate) },
      update: { value: String(parsed.data.proCommissionRate) },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
