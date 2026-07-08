import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { CaregiverCard } from "@/components/marketplace/caregiver-card";
import { HeatBanner } from "@/components/marketplace/heat-banner";
import { LinkButton } from "@/components/ui/button";
import { searchCaregivers } from "@/lib/marketplace";
import { CITY_INFO, NEIGHBORHOODS } from "@/lib/constants/gulf";
import { allSeoParams, citySlug, cityFromSlug, serviceFromSlug } from "@/lib/seo";

export const revalidate = 3600;

export function generateStaticParams() {
  return allSeoParams();
}

type Params = { service: string; city: string };

function resolve(params: Params) {
  const city = cityFromSlug(params.city);
  const service = serviceFromSlug(params.service);
  if (!city || !service) return null;
  return { city, service };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const resolved = resolve(await params);
  if (!resolved) return {};
  const { city, service } = resolved;
  const cityLabel = CITY_INFO[city].label;

  const title = `${service.label} in ${cityLabel} — Book Trusted Caregivers | GulfPaws`;
  const description = `Find and book verified ${service.label.toLowerCase()} in ${cityLabel}. Transparent hourly rates, real reviews, heat-safe scheduling. Book in minutes on GulfPaws.`;

  return {
    title,
    description,
    alternates: { canonical: `/find/${service.slug}/${citySlug(city)}` },
  };
}

export default async function SeoLandingPage({ params }: { params: Promise<Params> }) {
  const rawParams = await params;
  const resolved = resolve(rawParams);
  if (!resolved) notFound();
  const { city, service } = resolved;
  const cityInfo = CITY_INFO[city];

  const caregivers = await searchCaregivers({ city, service: service.value });

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="font-display text-3xl font-bold text-sand">
          {service.label} in {cityInfo.label}
        </h1>
        <p className="mt-2 max-w-2xl text-sand-dim">
          Book verified {service.label.toLowerCase()} caregivers across {cityInfo.label},{" "}
          {cityInfo.country} — including {NEIGHBORHOODS[city].slice(0, 4).join(", ")} and more.
          Transparent hourly rates in {cityInfo.currency}, real reviews, and heat-aware scheduling
          for {cityInfo.label}&apos;s summers.
        </p>

        <div className="mt-6">
          <HeatBanner />
        </div>

        {caregivers.length === 0 ? (
          <Card className="mt-6 text-center">
            <p className="text-sand-dim">
              No {service.label.toLowerCase()} caregivers in {cityInfo.label} yet — check back soon,
              or browse all cities.
            </p>
            <LinkButton href="/browse" className="mt-4">
              Browse all caregivers
            </LinkButton>
          </Card>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {caregivers.map((c) => (
              <CaregiverCard key={c.id} caregiver={c} />
            ))}
          </div>
        )}

        <Card className="mt-8">
          <h2 className="font-display text-lg font-semibold text-sand">
            Why book {service.label.toLowerCase()} on GulfPaws?
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-sand-dim">
            <li>• Verified, background-checked caregivers</li>
            <li>• Book in 30-minute increments, up to 3 hours</li>
            <li>• Heat-aware scheduling — cool early-morning &amp; evening slots highlighted</li>
            <li>• Secure payments held until the visit is complete</li>
            <li>• Real reviews from {cityInfo.label} pet owners</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
