import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { FeaturedPurchase } from "@/components/caregiver/featured-purchase";
import { FEATURED_LISTING_PRICE, formatMoney, type CurrencyCode } from "@/lib/constants/gulf";

export default async function CaregiverFeaturedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.roles.includes("CAREGIVER")) redirect("/onboarding/caregiver");

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/onboarding/caregiver/profile");

  const currency = profile.currency as CurrencyCode;
  const isFeatured = profile.isFeaturedUntil && profile.isFeaturedUntil > new Date();

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="font-display text-2xl font-bold text-sand">Featured listing</h1>
      <p className="mt-1 text-sm text-sand-dim">Jump to the top of search results in your city.</p>

      <Card className="mt-6">
        {isFeatured ? (
          <p className="text-sm text-success">
            You&apos;re featured until {profile.isFeaturedUntil!.toISOString().slice(0, 10)}.
          </p>
        ) : (
          <>
            <p className="font-display text-2xl font-bold text-gold">
              {formatMoney(FEATURED_LISTING_PRICE[currency], currency)}
            </p>
            <p className="mt-1 text-sm text-sand-dim">One-time boost, 7 days at the top of your city.</p>
            <div className="mt-4">
              <FeaturedPurchase />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
