import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { CURRENCIES } from "@/lib/constants/gulf";

const schema = z
  .object({
    code: z.string().trim().min(3).max(20),
    description: z.string().trim().max(200).optional(),
    percentOff: z.coerce.number().int().min(1).max(100).optional(),
    fixedAmountOff: z.coerce.number().min(0).optional(),
    currency: z.enum(CURRENCIES).optional(),
    maxRedemptions: z.coerce.number().int().min(1).optional(),
    firstBookingOnly: z.boolean().default(false),
    expiresAt: z.string().optional(),
  })
  .refine((d) => d.percentOff || d.fixedAmountOff, "Set a percent or fixed discount");

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ promos });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;

  const promo = await prisma.promoCode.create({
    data: {
      code: d.code.toUpperCase(),
      description: d.description || null,
      percentOff: d.percentOff ?? null,
      fixedAmountOff: d.fixedAmountOff ?? null,
      currency: d.currency ?? null,
      maxRedemptions: d.maxRedemptions ?? null,
      firstBookingOnly: d.firstBookingOnly,
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
    },
  });

  return NextResponse.json({ promo });
}
