type CompletenessInput = {
  hasPhoto: boolean;
  bio: string | null;
  yearsExperience: number | null;
  areas: string[];
  languages: string[];
  services: string[];
  certificationUrls: string[];
  hasAvailability: boolean;
  verificationStatus: string;
  payoutIban: string | null;
};

const WEIGHTS = {
  photo: 20,
  bio: 15,
  experience: 10,
  areas: 10,
  languages: 10,
  services: 10,
  availability: 15,
  verification: 5,
  payout: 5,
};

export function computeProfileCompleteness(input: CompletenessInput): number {
  let score = 0;
  if (input.hasPhoto) score += WEIGHTS.photo;
  if (input.bio && input.bio.trim().length >= 20) score += WEIGHTS.bio;
  if (input.yearsExperience !== null) score += WEIGHTS.experience;
  if (input.areas.length > 0) score += WEIGHTS.areas;
  if (input.languages.length > 0) score += WEIGHTS.languages;
  if (input.services.length > 0) score += WEIGHTS.services;
  if (input.hasAvailability) score += WEIGHTS.availability;
  if (input.verificationStatus === "APPROVED") score += WEIGHTS.verification;
  if (input.payoutIban) score += WEIGHTS.payout;
  return Math.min(100, score);
}
