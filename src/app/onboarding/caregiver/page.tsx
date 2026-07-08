import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { BecomeCaregiverButton } from "@/components/auth/become-caregiver";

export default async function CaregiverOnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/onboarding/caregiver");

  const isCaregiver = session.user.roles.includes("CAREGIVER");

  if (isCaregiver) {
    const profile = await prisma.caregiverProfile.findUnique({
      where: { userId: session.user.id },
      include: { availabilitySlots: { take: 1 } },
    });
    if (!profile) redirect("/onboarding/caregiver/profile");
    if (profile.availabilitySlots.length === 0) redirect("/onboarding/caregiver/availability");
    redirect("/dashboard/caregiver");
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-10">
        <Card>
          <div className="text-3xl">🐕</div>
          <h1 className="mt-2 font-display text-2xl font-bold text-sand">
            Become a GulfPaws caregiver
          </h1>
          <p className="mt-2 text-sm text-sand-dim">
            Set your own hourly rate, choose the areas you cover, and pick the times you&apos;re
            free. Takes about two minutes.
          </p>
          <BecomeCaregiverButton />
        </Card>
      </main>
    </div>
  );
}
