import { prisma } from "@/lib/prisma";
import { hasAnyAvailability } from "@/lib/availability";
import type { Prisma } from "@prisma/client";

export type CaregiverSearchFilters = {
  city?: string;
  service?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  language?: string;
  verifiedOnly?: boolean;
  date?: string; // YYYY-MM-DD
  area?: string;
};

export type CaregiverCardData = {
  id: string;
  name: string | null;
  image: string | null;
  city: string;
  areas: string[];
  services: string[];
  hourlyRate: number;
  currency: string;
  languages: string[];
  bio: string | null;
  ratingAverage: number | null;
  ratingCount: number;
  verified: boolean;
  isPro: boolean;
  isFeatured: boolean;
};

export async function searchCaregivers(filters: CaregiverSearchFilters): Promise<CaregiverCardData[]> {
  const where: Prisma.CaregiverProfileWhereInput = { isVacationMode: false };

  if (filters.city) where.city = filters.city as never;
  if (filters.service) where.services = { has: filters.service as never };
  if (filters.language) where.languages = { has: filters.language as never };
  if (filters.area) where.areas = { has: filters.area };
  if (filters.verifiedOnly) where.verificationStatus = "APPROVED";
  if (filters.minPrice || filters.maxPrice) {
    where.hourlyRate = {};
    if (filters.minPrice) where.hourlyRate.gte = filters.minPrice;
    if (filters.maxPrice) where.hourlyRate.lte = filters.maxPrice;
  }
  if (filters.rating) where.ratingAverage = { gte: filters.rating };

  const profiles = await prisma.caregiverProfile.findMany({
    where,
    include: { user: { select: { name: true, image: true } } },
    orderBy: [{ isFeaturedUntil: "desc" }, { ratingAverage: "desc" }, { createdAt: "desc" }],
    take: 60,
  });

  let results = profiles;
  if (filters.date) {
    const dateObj = new Date(`${filters.date}T00:00:00.000Z`);
    const checks = await Promise.all(profiles.map((p) => hasAnyAvailability(p.id, dateObj)));
    results = profiles.filter((_, i) => checks[i]);
  }

  return results.map((p) => ({
    id: p.id,
    name: p.user.name,
    image: p.user.image,
    city: p.city,
    areas: p.areas,
    services: p.services,
    hourlyRate: Number(p.hourlyRate),
    currency: p.currency,
    languages: p.languages,
    bio: p.bio,
    ratingAverage: p.ratingAverage ? Number(p.ratingAverage) : null,
    ratingCount: p.ratingCount,
    verified: p.verificationStatus === "APPROVED",
    isPro: p.isProBadge,
    isFeatured: p.isFeaturedUntil ? p.isFeaturedUntil > new Date() : false,
  }));
}
