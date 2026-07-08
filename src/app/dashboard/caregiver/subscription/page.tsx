import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubscriptionCard } from "@/components/subscriptions/subscription-card";
import { PRO_MONTHLY_PRICE, formatMoney, type CurrencyCode } from "@/lib/constants/gulf";

export default async function CaregiverSubscriptionPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.roles.includes("CAREGIVER")) redirect("/onboarding/caregiver");

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/onboarding/caregiver/profile");

  const currency = profile.currency as CurrencyCode;
  const active = await prisma.subscription.findFirst({
    where: { userId: session.user.id, plan: "CAREGIVER_PRO", status: "ACTIVE" },
  });

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="font-display text-2xl font-bold text-sand">Caregiver Pro</h1>
      <p className="mt-1 text-sm text-sand-dim">Get discovered faster, keep more of what you earn.</p>
      <div className="mt-6">
        <SubscriptionCard
          plan="CAREGIVER_PRO"
          title="Caregiver Pro"
          price={`${formatMoney(PRO_MONTHLY_PRICE[currency], currency)}/month`}
          benefits={[
            "Featured placement in search results",
            "Lower commission — 10% instead of 18%",
            "Instant payouts",
            '"Pro" badge on your profile',
          ]}
          isActive={!!active}
        />
      </div>
    </div>
  );
}
