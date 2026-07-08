import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardProfileClient } from "@/components/caregiver/dashboard-profile-client";

export default async function CaregiverEditProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.roles.includes("CAREGIVER")) redirect("/onboarding/caregiver");

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/onboarding/caregiver/profile");

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="font-display text-2xl font-bold text-sand">Edit profile &amp; rate</h1>
      <p className="mt-1 text-sm text-sand-dim">
        Changes apply to future bookings only — bookings already requested keep the original rate.
      </p>
      <div className="mt-6">
        <DashboardProfileClient
          initial={{
            city: profile.city,
            areas: profile.areas,
            services: profile.services,
            hourlyRate: Number(profile.hourlyRate),
            languages: profile.languages,
            bio: profile.bio ?? "",
            yearsExperience: profile.yearsExperience,
            photoUrl: session.user.image ?? null,
            certificationUrls: profile.certificationUrls,
          }}
        />
      </div>
    </div>
  );
}
