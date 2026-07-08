import { prisma } from "@/lib/prisma";
import type { CurrencyCode } from "@/lib/constants/gulf";

export async function getReferralBalance(userId: string) {
  const credits = await prisma.referralCredit.findMany({
    where: { ownerId: userId, isRedeemed: false },
  });

  const byCurrency = new Map<CurrencyCode, number>();
  for (const c of credits) {
    const currency = c.currency as CurrencyCode;
    byCurrency.set(currency, (byCurrency.get(currency) ?? 0) + Number(c.amount));
  }

  return byCurrency;
}
