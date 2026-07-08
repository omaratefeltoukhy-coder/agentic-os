import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PayoutForm } from "@/components/caregiver/payout-form";

export default async function CaregiverPayoutsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.roles.includes("CAREGIVER")) redirect("/onboarding/caregiver");

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/onboarding/caregiver/profile");

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="font-display text-2xl font-bold text-sand">Payout settings</h1>
      <p className="mt-1 text-sm text-sand-dim">
        We pay out your net earnings (after commission) to this account.
      </p>
      <div className="mt-6">
        <PayoutForm initialIban={profile.payoutIban ?? ""} initialBankName={profile.payoutBankName ?? ""} />
      </div>
    </div>
  );
}
