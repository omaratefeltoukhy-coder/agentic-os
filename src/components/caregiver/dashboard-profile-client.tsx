"use client";

import { useRouter } from "next/navigation";
import { CaregiverProfileForm } from "@/components/caregiver/profile-form";
import type { GulfCityCode } from "@/lib/constants/gulf";

export function DashboardProfileClient({
  initial,
}: {
  initial: {
    city: GulfCityCode | null;
    areas: string[];
    services: string[];
    hourlyRate: number | null;
    languages: string[];
    bio: string;
    yearsExperience: number | null;
    photoUrl: string | null;
    certificationUrls: string[];
  };
}) {
  const router = useRouter();

  return (
    <CaregiverProfileForm
      initial={initial}
      submitLabel="Save changes"
      onSaved={() => router.push("/dashboard/caregiver")}
    />
  );
}
