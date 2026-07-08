import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { WizardProfileClient } from "@/components/caregiver/wizard-profile-client";

export default async function CaregiverWizardProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/onboarding/caregiver/profile");
  if (!session.user.roles.includes("CAREGIVER")) redirect("/onboarding/caregiver");

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: session.user.id } });

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-gold">Step 1 of 2</p>
          <h1 className="font-display text-2xl font-bold text-sand">Your profile &amp; rate</h1>
          <p className="mt-1 text-sm text-sand-dim">
            This is what pet owners will see when they search for a caregiver.
          </p>
        </div>
        <WizardProfileClient
          initial={{
            city: profile?.city ?? null,
            areas: profile?.areas ?? [],
            services: profile?.services ?? [],
            hourlyRate: profile?.hourlyRate ? Number(profile.hourlyRate) : null,
            languages: profile?.languages ?? [],
            bio: profile?.bio ?? "",
            yearsExperience: profile?.yearsExperience ?? null,
            photoUrl: session.user.image ?? null,
            certificationUrls: profile?.certificationUrls ?? [],
          }}
        />
      </main>
    </div>
  );
}
