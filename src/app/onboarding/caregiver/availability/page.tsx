import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { WizardAvailabilityClient } from "@/components/caregiver/wizard-availability-client";
import { WEEKEND_DAYS } from "@/lib/constants/gulf";

export default async function CaregiverWizardAvailabilityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/onboarding/caregiver/availability");
  if (!session.user.roles.includes("CAREGIVER")) redirect("/onboarding/caregiver");

  const profile = await prisma.caregiverProfile.findUnique({
    where: { userId: session.user.id },
    include: { availabilitySlots: true },
  });
  if (!profile) redirect("/onboarding/caregiver/profile");

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-gold">Step 2 of 2</p>
          <h1 className="font-display text-2xl font-bold text-sand">When are you free?</h1>
          <p className="mt-1 text-sm text-sand-dim">
            Tap the 30-minute slots you&apos;re available. You can change this anytime.
          </p>
        </div>
        <WizardAvailabilityClient
          initialSlots={profile.availabilitySlots.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            startMinute: s.startMinute,
          }))}
          weekendDays={WEEKEND_DAYS[profile.city]}
        />
      </main>
    </div>
  );
}
