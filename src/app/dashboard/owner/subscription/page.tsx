import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubscriptionCard } from "@/components/subscriptions/subscription-card";
import { CITY_INFO, PLUS_MONTHLY_PRICE, formatMoney, type GulfCityCode } from "@/lib/constants/gulf";

export default async function OwnerSubscriptionPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const currency = user.city ? CITY_INFO[user.city as GulfCityCode].currency : "AED";
  const active = await prisma.subscription.findFirst({
    where: { userId: session.user.id, plan: "OWNER_PLUS", status: "ACTIVE" },
  });

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="font-display text-2xl font-bold text-sand">GulfPaws Plus</h1>
      <p className="mt-1 text-sm text-sand-dim">Save on every booking.</p>
      <div className="mt-6">
        <SubscriptionCard
          plan="OWNER_PLUS"
          title="GulfPaws Plus"
          price={`${formatMoney(PLUS_MONTHLY_PRICE[currency], currency)}/month`}
          benefits={[
            "Zero service fees on every booking",
            "5% off all bookings",
            "Free cancellation, anytime",
            "Priority support",
          ]}
          isActive={!!active}
        />
      </div>
    </div>
  );
}
