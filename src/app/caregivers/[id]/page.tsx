import { notFound } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { HeatBanner } from "@/components/marketplace/heat-banner";
import { BookingWizard } from "@/components/booking/booking-wizard";
import {
  CITY_INFO,
  SERVICE_LABELS,
  LANGUAGE_LABELS,
  formatMoney,
  type CurrencyCode,
} from "@/lib/constants/gulf";

export default async function CaregiverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const profile = await prisma.caregiverProfile.findUnique({
    where: { id },
    include: { user: { select: { name: true, image: true } } },
  });
  if (!profile || profile.isVacationMode) notFound();

  const [reviews, pets] = await Promise.all([
    prisma.review.findMany({
      where: { subjectId: profile.userId },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    session?.user
      ? prisma.pet.findMany({ where: { ownerId: session.user.id }, orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
  ]);

  const currency = profile.currency as CurrencyCode;
  const canBook = session?.user && session.user.roles.includes("OWNER");

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <Card>
          <div className="flex gap-4">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-petrol-lighter">
              {profile.user.image && (
                <Image
                  src={profile.user.image}
                  alt={profile.user.name ?? ""}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-sand">{profile.user.name}</h1>
                {profile.verificationStatus === "APPROVED" && (
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                    ✓ Verified
                  </span>
                )}
                {profile.isProBadge && (
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold">
                    Pro
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-sand-dim">
                {CITY_INFO[profile.city].label} · {profile.areas.join(", ")}
              </p>
              <p className="mt-1 text-sm text-sand-dim">
                {profile.ratingCount > 0
                  ? `★ ${Number(profile.ratingAverage).toFixed(1)} (${profile.ratingCount} reviews)`
                  : "No reviews yet"}
                {profile.yearsExperience !== null && ` · ${profile.yearsExperience} yrs experience`}
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-gold">
                {formatMoney(Number(profile.hourlyRate), currency)}/hr
              </p>
            </div>
          </div>

          {profile.bio && <p className="mt-4 text-sm text-sand-dim">{profile.bio}</p>}

          <div className="mt-4 flex flex-wrap gap-1.5">
            {profile.services.map((s) => (
              <span key={s} className="rounded-full bg-petrol-lighter px-2.5 py-1 text-xs text-sand-dim">
                {SERVICE_LABELS[s]}
              </span>
            ))}
            {profile.languages.map((l) => (
              <span key={l} className="rounded-full bg-petrol-lighter px-2.5 py-1 text-xs text-sand-dim">
                {LANGUAGE_LABELS[l]}
              </span>
            ))}
          </div>
        </Card>

        <div className="mt-6">
          <HeatBanner />
        </div>

        <div className="mt-6">
          {!session?.user ? (
            <Card className="text-center">
              <p className="text-sand-dim">Sign up to book {profile.user.name?.split(" ")[0]}.</p>
              <LinkButton href="/signup?role=owner" className="mt-3">
                Sign up to book
              </LinkButton>
            </Card>
          ) : !canBook ? (
            <Card className="text-center">
              <p className="text-sand-dim">Switch to owner mode from your profile to book a caregiver.</p>
            </Card>
          ) : (
            <BookingWizard
              caregiverProfileId={profile.id}
              caregiverName={profile.user.name ?? "this caregiver"}
              services={profile.services}
              hourlyRate={Number(profile.hourlyRate)}
              currency={currency}
              isProBadge={profile.isProBadge}
              pets={pets.map((p) => ({ id: p.id, name: p.name, type: p.type }))}
            />
          )}
        </div>

        {reviews.length > 0 && (
          <Card className="mt-6">
            <h2 className="font-display text-lg font-semibold text-sand">Reviews</h2>
            <div className="mt-3 space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-petrol-lighter pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gold">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </span>
                    <span className="text-sm text-sand-dim">{r.author.name}</span>
                  </div>
                  {r.comment && <p className="mt-1 text-sm text-sand-dim">{r.comment}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
