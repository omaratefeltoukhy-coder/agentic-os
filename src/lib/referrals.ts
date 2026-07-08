import { prisma } from "@/lib/prisma";
import { REFERRAL_CREDIT, CITY_INFO, type CurrencyCode, type GulfCityCode } from "@/lib/constants/gulf";
import { notify } from "@/lib/notifications/notify";

/** Awards both sides referral credit the moment a referred user completes
 * their first booking (as owner). Idempotent — only fires once. */
export async function maybeAwardReferralCredit(ownerId: string) {
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { id: true, email: true, referredById: true },
  });
  if (!owner?.referredById) return;

  const priorCompletedCount = await prisma.booking.count({
    where: { ownerId, status: { in: ["COMPLETED", "REVIEWED"] } },
  });
  // The booking that just triggered this call is already COMPLETED, so a
  // count of exactly 1 means this is the first one.
  if (priorCompletedCount !== 1) return;

  // Idempotency guard: this tagged reason is unique per referral pair, so a
  // second completed-booking webhook retry or race can't double-award.
  const pairTag = `${owner.referredById}:${owner.id}`;
  const existing = await prisma.referralCredit.findFirst({
    where: { reason: `REFERRAL_SIGNUP_COMPLETED_BOOKING:${pairTag}` },
  });
  if (existing) return;

  const referrer = await prisma.user.findUnique({
    where: { id: owner.referredById },
    select: { id: true, email: true, city: true },
  });
  if (!referrer) return;

  const currency: CurrencyCode = referrer.city ? CITY_INFO[referrer.city as GulfCityCode].currency : "AED";
  const amount = REFERRAL_CREDIT[currency];

  await prisma.$transaction([
    prisma.referralCredit.create({
      data: {
        ownerId: referrer.id,
        amount,
        currency,
        reason: `REFERRAL_SIGNUP_COMPLETED_BOOKING:${pairTag}`,
      },
    }),
    prisma.referralCredit.create({
      data: {
        ownerId: owner.id,
        amount,
        currency,
        reason: `REFERRAL_SIGNUP_COMPLETED_BOOKING:${pairTag}`,
      },
    }),
  ]);

  await notify({
    userId: referrer.id,
    type: "REFERRAL_CREDIT",
    title: "You earned referral credit!",
    body: `A friend you invited completed their first booking. ${amount} ${currency} credit is in your account.`,
    toEmail: referrer.email,
    emailHtml: `<p>A friend you invited completed their first booking — ${amount} ${currency} credit is in your account.</p>`,
  });
}
