import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { BookingListItem } from "@/components/booking/booking-list-item";
import type { CurrencyCode } from "@/lib/constants/gulf";

export default async function OwnerDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.roles.includes("OWNER")) redirect("/dashboard");

  const [upcomingCount, petsCount, recentBookings] = await Promise.all([
    prisma.booking.count({
      where: { ownerId: session.user.id, status: { in: ["REQUESTED", "ACCEPTED", "IN_PROGRESS"] } },
    }),
    prisma.pet.count({ where: { ownerId: session.user.id } }),
    prisma.booking.findMany({
      where: { ownerId: session.user.id },
      include: { pet: true, caregiverProfile: { include: { user: { select: { name: true } } } } },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="font-display text-2xl font-bold text-sand">
        Welcome back, {session.user.name?.split(" ")[0] ?? "there"} 👋
      </h1>
      <p className="mt-1 text-sand-dim">Here&apos;s your GulfPaws overview.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-sm text-sand-dim">Upcoming bookings</div>
          <div className="mt-2 font-display text-3xl font-bold text-sand">{upcomingCount}</div>
        </Card>
        <Card>
          <div className="text-sm text-sand-dim">My pets</div>
          <div className="mt-2 font-display text-3xl font-bold text-sand">{petsCount}</div>
        </Card>
        <Card>
          <div className="text-sm text-sand-dim">Referral credit</div>
          <div className="mt-2 font-display text-3xl font-bold text-sand">0 AED</div>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-display text-lg font-semibold text-sand">Find a caregiver</h2>
        <p className="mt-1 text-sm text-sand-dim">
          Search, filter, and book dog walkers or cat sitters near you.
        </p>
        <LinkButton href="/browse" className="mt-4">
          Browse caregivers
        </LinkButton>
      </Card>

      {recentBookings.length > 0 && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-sand">Recent bookings</h2>
            <LinkButton href="/dashboard/owner/bookings" size="sm" variant="ghost">
              View all
            </LinkButton>
          </div>
          <div className="mt-3 space-y-2">
            {recentBookings.map((b) => (
              <BookingListItem
                key={b.id}
                href={`/dashboard/owner/bookings/${b.id}`}
                petName={b.pet.name}
                serviceType={b.serviceType}
                counterpartName={b.caregiverProfile.user.name ?? "Caregiver"}
                date={b.date}
                startMinute={b.startMinute}
                total={Number(b.total)}
                currency={b.currency as CurrencyCode}
                status={b.status}
              />
            ))}
          </div>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="font-display text-sm font-semibold text-sand">My pets</h2>
          <p className="mt-1 text-sm text-sand-dim">Manage pet profiles for booking.</p>
          <LinkButton href="/dashboard/owner/pets" variant="secondary" size="sm" className="mt-3">
            Manage pets
          </LinkButton>
        </Card>
        <Card>
          <h2 className="font-display text-sm font-semibold text-sand">Want to earn too?</h2>
          <p className="mt-1 text-sm text-sand-dim">
            Offer dog walking or cat sitting and set your own rate.
          </p>
          <LinkButton href="/onboarding/caregiver" variant="outline" size="sm" className="mt-3">
            Become a caregiver
          </LinkButton>
        </Card>
      </div>
    </div>
  );
}
