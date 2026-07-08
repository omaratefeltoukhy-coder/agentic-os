import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { CurrencyCode } from "@/lib/constants/gulf";

type Db = Prisma.TransactionClient | typeof prisma;

export class PromoError extends Error {}

export async function resolvePromoDiscount(
  code: string,
  userId: string,
  subtotal: number,
  currency: CurrencyCode,
  db: Db = prisma
) {
  const promo = await db.promoCode.findUnique({ where: { code: code.toUpperCase() } });
  if (!promo || !promo.isActive) throw new PromoError("That promo code isn't valid.");
  if (promo.startsAt && promo.startsAt > new Date()) throw new PromoError("That promo code isn't active yet.");
  if (promo.expiresAt && promo.expiresAt < new Date()) throw new PromoError("That promo code has expired.");
  if (promo.maxRedemptions && promo.redemptionCount >= promo.maxRedemptions) {
    throw new PromoError("That promo code has been fully redeemed.");
  }
  if (promo.currency && promo.currency !== currency) {
    throw new PromoError("That promo code isn't valid in your currency.");
  }

  if (promo.firstBookingOnly) {
    const priorBookings = await db.booking.count({
      where: {
        ownerId: userId,
        status: {
          notIn: ["DECLINED", "AUTO_DECLINED", "CANCELLED_BY_OWNER", "CANCELLED_BY_CAREGIVER"],
        },
      },
    });
    if (priorBookings > 0) throw new PromoError("That code is only valid on your first booking.");
  }

  let discount = 0;
  if (promo.percentOff) discount += subtotal * (promo.percentOff / 100);
  if (promo.fixedAmountOff) discount += Number(promo.fixedAmountOff);
  discount = Math.min(discount, subtotal);

  return { promoId: promo.id, discount };
}

export async function recordPromoRedemption(
  promoId: string,
  userId: string,
  discount: number,
  currency: CurrencyCode,
  db: Db = prisma
) {
  const redemption = await db.promoRedemption.create({
    data: { promoCodeId: promoId, userId, discountAmount: discount, currency },
  });
  await db.promoCode.update({ where: { id: promoId }, data: { redemptionCount: { increment: 1 } } });
  return redemption;
}
