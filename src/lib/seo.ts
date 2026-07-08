import { GULF_CITIES, type GulfCityCode } from "@/lib/constants/gulf";

export const SEO_SERVICES = [
  { slug: "dog-walking", value: "DOG_WALKING", label: "Dog Walking", labelAr: "تمشية الكلاب" },
  { slug: "cat-sitting", value: "CAT_SITTING", label: "Cat Sitting", labelAr: "رعاية القطط" },
] as const;

export type SeoServiceSlug = (typeof SEO_SERVICES)[number]["slug"];

const CITY_SLUGS: Record<GulfCityCode, string> = {
  DUBAI: "dubai",
  ABU_DHABI: "abu-dhabi",
  RIYADH: "riyadh",
  JEDDAH: "jeddah",
  DOHA: "doha",
  KUWAIT_CITY: "kuwait-city",
  MANAMA: "manama",
  MUSCAT: "muscat",
};

export function citySlug(city: GulfCityCode) {
  return CITY_SLUGS[city];
}

export function cityFromSlug(slug: string): GulfCityCode | null {
  const entry = Object.entries(CITY_SLUGS).find(([, s]) => s === slug);
  return entry ? (entry[0] as GulfCityCode) : null;
}

export function serviceFromSlug(slug: string) {
  return SEO_SERVICES.find((s) => s.slug === slug) ?? null;
}

export function allSeoParams() {
  return SEO_SERVICES.flatMap((service) =>
    GULF_CITIES.map((city) => ({ service: service.slug, city: citySlug(city) }))
  );
}
