import { prisma } from "@/lib/prisma";

export async function getActiveSubscription(userId: string, plan: "OWNER_PLUS" | "CAREGIVER_PRO") {
  return prisma.subscription.findFirst({ where: { userId, plan, status: "ACTIVE" } });
}

export async function applySubscriptionSideEffects(userId: string, plan: "OWNER_PLUS" | "CAREGIVER_PRO", active: boolean) {
  if (plan === "CAREGIVER_PRO") {
    await prisma.caregiverProfile.updateMany({ where: { userId }, data: { isProBadge: active } });
  }
}
