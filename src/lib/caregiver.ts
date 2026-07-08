import { prisma } from "@/lib/prisma";
import { computeProfileCompleteness } from "@/lib/caregiver-completeness";

export async function getCaregiverProfileByUserId(userId: string) {
  return prisma.caregiverProfile.findUnique({
    where: { userId },
    include: { availabilitySlots: true },
  });
}

export async function recomputeCompleteness(caregiverProfileId: string) {
  const profile = await prisma.caregiverProfile.findUniqueOrThrow({
    where: { id: caregiverProfileId },
    include: { availabilitySlots: { take: 1 }, user: { select: { image: true } } },
  });

  const score = computeProfileCompleteness({
    hasPhoto: !!profile.user.image,
    bio: profile.bio,
    yearsExperience: profile.yearsExperience,
    areas: profile.areas,
    languages: profile.languages,
    services: profile.services,
    certificationUrls: profile.certificationUrls,
    hasAvailability: profile.availabilitySlots.length > 0,
    verificationStatus: profile.verificationStatus,
    payoutIban: profile.payoutIban,
  });

  await prisma.caregiverProfile.update({
    where: { id: caregiverProfileId },
    data: { profileCompleteness: score },
  });

  return score;
}
