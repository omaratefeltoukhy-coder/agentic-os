import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { FilterBar } from "@/components/marketplace/filter-bar";
import { CaregiverCard } from "@/components/marketplace/caregiver-card";
import { HeatBanner } from "@/components/marketplace/heat-banner";
import { searchCaregivers } from "@/lib/marketplace";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  const params = await searchParams;

  const caregivers = await searchCaregivers({
    city: params.city,
    service: params.service,
    language: params.language,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    verifiedOnly: params.verified === "1",
    date: params.date,
  });

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="font-display text-2xl font-bold text-sand">Find a caregiver</h1>
        <p className="mt-1 text-sand-dim">
          {session?.user ? "Book a dog walker or cat sitter near you." : "Browsing as a guest — create an account to book."}
        </p>

        <div className="mt-6">
          <HeatBanner />
        </div>

        <div className="mt-4">
          <Suspense>
            <FilterBar />
          </Suspense>
        </div>

        {caregivers.length === 0 ? (
          <Card className="mt-6 text-center">
            <p className="text-sand-dim">No caregivers match those filters yet.</p>
          </Card>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {caregivers.map((c) => (
              <CaregiverCard key={c.id} caregiver={c} />
            ))}
          </div>
        )}

        {!session?.user && (
          <Card className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-sand">Ready to book?</h2>
              <p className="text-sm text-sand-dim">Create a free account to request a booking.</p>
            </div>
            <LinkButton href="/signup?role=owner">Sign up</LinkButton>
          </Card>
        )}
      </main>
    </div>
  );
}
