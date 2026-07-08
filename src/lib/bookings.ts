import { Prisma, type BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { coveredSlots } from "@/lib/time";
import { computeBookingPrice } from "@/lib/pricing";
import { resolvePromoDiscount, recordPromoRedemption, PromoError } from "@/lib/promo";
import { getCommissionRates } from "@/lib/platform-settings";
import type { CurrencyCode } from "@/lib/constants/gulf";

const ACTIVE_STATUSES: BookingStatus[] = [
  "REQUESTED",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "REVIEWED",
];

const RESPOND_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours to accept/decline

export class BookingConflictError extends Error {
  constructor() {
    super("That time is no longer available. Pick another slot.");
  }
}

export { PromoError };

type CreateBookingInput = {
  ownerId: string;
  caregiverProfileId: string;
  petId: string;
  serviceType: string;
  date: Date;
  startMinute: number;
  durationMinutes: number;
  ownerNote?: string;
  paymentMethod: "CASH" | "CARD";
  recurrenceGroupId?: string;
  promoCode?: string;
};

export async function createBooking(input: CreateBookingInput) {
  return prisma.$transaction(
    async (tx) => {
      const profile = await tx.caregiverProfile.findUniqueOrThrow({
        where: { id: input.caregiverProfileId },
      });

      if (profile.isVacationMode) throw new BookingConflictError();

      const existing = await tx.booking.findMany({
        where: {
          caregiverProfileId: input.caregiverProfileId,
          date: input.date,
          status: { in: ACTIVE_STATUSES },
        },
        select: { startMinute: true, durationMinutes: true },
      });

      const occupied = new Set<number>();
      for (const b of existing) {
        for (const m of coveredSlots(b.startMinute, b.durationMinutes)) occupied.add(m);
      }
      const wanted = coveredSlots(input.startMinute, input.durationMinutes);
      if (wanted.some((m) => occupied.has(m))) throw new BookingConflictError();

      const weeklySlots = await tx.availabilitySlot.findMany({
        where: { caregiverProfileId: input.caregiverProfileId, dayOfWeek: input.date.getUTCDay() },
        select: { startMinute: true },
      });
      const freeSet = new Set(weeklySlots.map((s) => s.startMinute));
      if (!wanted.every((m) => freeSet.has(m))) throw new BookingConflictError();

      const currency = profile.currency as CurrencyCode;
      const baseSubtotal = Number(profile.hourlyRate) * (input.durationMinutes / 60);

      const [ownerPlusSub, referralCredits] = await Promise.all([
        tx.subscription.findFirst({
          where: { userId: input.ownerId, plan: "OWNER_PLUS", status: "ACTIVE" },
        }),
        tx.referralCredit.findMany({
          where: { ownerId: input.ownerId, isRedeemed: false, currency },
        }),
      ]);
      const ownerHasPlus = !!ownerPlusSub;

      let discount = ownerHasPlus ? baseSubtotal * 0.05 : 0;

      let promoId: string | null = null;
      if (input.promoCode) {
        const resolved = await resolvePromoDiscount(
          input.promoCode,
          input.ownerId,
          baseSubtotal,
          currency,
          tx
        );
        promoId = resolved.promoId;
        discount += resolved.discount;
      }

      const referralBalance = referralCredits.reduce((sum, c) => sum + Number(c.amount), 0);
      const referralApplied = Math.min(referralBalance, Math.max(0, baseSubtotal - discount));
      discount += referralApplied;

      const { defaultRate, proRate } = await getCommissionRates();

      const price = computeBookingPrice({
        hourlyRate: Number(profile.hourlyRate),
        durationMinutes: input.durationMinutes,
        currency,
        isProBadge: profile.isProBadge,
        ownerHasPlus,
        discountAmount: discount,
        commissionRateOverride: profile.isProBadge ? proRate : defaultRate,
      });

      try {
        const booking = await tx.booking.create({
          data: {
            ownerId: input.ownerId,
            caregiverProfileId: input.caregiverProfileId,
            petId: input.petId,
            serviceType: input.serviceType as never,
            date: input.date,
            startMinute: input.startMinute,
            durationMinutes: input.durationMinutes,
            hourlyRateSnapshot: profile.hourlyRate,
            currency: profile.currency,
            subtotal: price.subtotal,
            serviceFee: price.serviceFee,
            commissionRate: price.commissionRate,
            commissionAmount: price.commissionAmount,
            caregiverPayout: price.caregiverPayout,
            total: price.total,
            ownerNote: input.ownerNote || null,
            paymentMethod: input.paymentMethod,
            paymentStatus: "PENDING",
            respondByAt: new Date(Date.now() + RESPOND_WINDOW_MS),
            isRecurring: !!input.recurrenceGroupId,
            recurrenceGroupId: input.recurrenceGroupId ?? null,
          },
        });

        if (promoId) {
          const promoDiscountOnly = discount - referralApplied - (ownerHasPlus ? baseSubtotal * 0.05 : 0);
          const redemption = await recordPromoRedemption(
            promoId,
            input.ownerId,
            Math.max(0, promoDiscountOnly),
            currency,
            tx
          );
          await tx.booking.update({ where: { id: booking.id }, data: { promoRedemptionId: redemption.id } });
        }

        if (referralApplied > 0) {
          let remaining = referralApplied;
          for (const credit of referralCredits) {
            if (remaining <= 0) break;
            const amount = Number(credit.amount);
            await tx.referralCredit.update({ where: { id: credit.id }, data: { isRedeemed: true } });
            remaining -= amount;
          }
        }

        return booking;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
          throw new BookingConflictError();
        }
        throw err;
      }
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
}

/** Lazily flip REQUESTED bookings past their 2h response window to AUTO_DECLINED. */
export async function expireOverdueRequests(caregiverProfileId: string) {
  await prisma.booking.updateMany({
    where: {
      caregiverProfileId,
      status: "REQUESTED",
      respondByAt: { lt: new Date() },
    },
    data: { status: "AUTO_DECLINED" },
  });
}

export function bookingStartDateTime(date: Date, startMinute: number) {
  const d = new Date(date);
  d.setUTCHours(0, Math.floor(startMinute), 0, 0);
  return d;
}
