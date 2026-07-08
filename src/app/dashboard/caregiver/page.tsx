import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { formatMoney, type CurrencyCode } from "@/lib/constants/gulf";
import { VacationToggle } from "@/components/caregiver/vacation-toggle";

export default async function CaregiverDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.roles.includes("CAREGIVER")) redirect("/onboarding/caregiver");

  const profile = await prisma.caregiverProfile.findUnique({
    where: { userId: session.user.id },
    include: { availabilitySlots: { take: 1 } },
  });

  if (!profile) redirect("/onboarding/caregiver/profile");

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [pendingRequests, upcomingBookings, weekEarnings, monthEarnings, allTimeEarnings, reviews] =
    await Promise.all([
      prisma.booking.findMany({
        where: { caregiverProfileId: profile.id, status: "REQUESTED" },
        include: { pet: true, owner: { select: { name: true } } },
        orderBy: { date: "asc" },
        take: 10,
      }),
      prisma.booking.count({
        where: {
          caregiverProfileId: profile.id,
          status: { in: ["ACCEPTED", "IN_PROGRESS"] },
        },
      }),
      prisma.booking.aggregate({
        where: {
          caregiverProfileId: profile.id,
          status: { in: ["COMPLETED", "REVIEWED"] },
          completedAt: { gte: startOfWeek },
        },
        _sum: { caregiverPayout: true },
      }),
      prisma.booking.aggregate({
        where: {
          caregiverProfileId: profile.id,
          status: { in: ["COMPLETED", "REVIEWED"] },
          completedAt: { gte: startOfMonth },
        },
        _sum: { caregiverPayout: true },
      }),
      prisma.booking.aggregate({
        where: { caregiverProfileId: profile.id, status: { in: ["COMPLETED", "REVIEWED"] } },
        _sum: { caregiverPayout: true },
      }),
      prisma.review.findMany({
        where: { subjectId: session.user.id },
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const currency = profile.currency as CurrencyCode;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-sand">
            Welcome, {session.user.name?.split(" ")[0] ?? "there"} 🐕
          </h1>
          <p className="mt-1 text-sand-dim">Your caregiver dashboard.</p>
        </div>
        <VacationToggle initial={profile.isVacationMode} />
      </div>

      {profile.profileCompleteness < 100 && (
        <Card className="mt-6 border-gold/30 bg-gold/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-semibold text-sand">
                Profile {profile.profileCompleteness}% complete
              </h2>
              <p className="text-xs text-sand-dim">
                Profiles with photos get 3× more bookings. Finish yours to get discovered.
              </p>
            </div>
            <LinkButton href="/dashboard/caregiver/profile" size="sm" variant="secondary">
              Complete profile
            </LinkButton>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-petrol-lighter">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${profile.profileCompleteness}%` }}
            />
          </div>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-sm text-sand-dim">Booking requests</div>
          <div className="mt-2 font-display text-3xl font-bold text-sand">
            {pendingRequests.length}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-sand-dim">Upcoming bookings</div>
          <div className="mt-2 font-display text-3xl font-bold text-sand">{upcomingBookings}</div>
        </Card>
        <Card>
          <div className="text-sm text-sand-dim">Rating</div>
          <div className="mt-2 font-display text-3xl font-bold text-sand">
            {profile.ratingCount > 0 ? Number(profile.ratingAverage).toFixed(1) : "—"}
          </div>
          {profile.ratingCount > 0 && (
            <div className="text-xs text-sand-dim">{profile.ratingCount} reviews</div>
          )}
        </Card>
      </div>

      {pendingRequests.length > 0 && (
        <Card className="mt-6">
          <h2 className="font-display text-lg font-semibold text-sand">Booking requests</h2>
          <p className="mt-1 text-sm text-sand-dim">Respond within 2 hours, or they auto-decline.</p>
          <div className="mt-3 space-y-2">
            {pendingRequests.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-lg border border-petrol-lighter bg-petrol-light px-3 py-2"
              >
                <div className="text-sm">
                  <div className="text-sand">{b.pet.name} — {b.owner.name}</div>
                  <div className="text-sand-dim">
                    {b.date.toISOString().slice(0, 10)} · {formatMoney(Number(b.total), currency)}
                  </div>
                </div>
                <LinkButton href={`/dashboard/caregiver/bookings/${b.id}`} size="sm">
                  Review
                </LinkButton>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-6">
        <h2 className="font-display text-lg font-semibold text-sand">Earnings</h2>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-sand-dim">This week</div>
            <div className="mt-1 font-display font-semibold text-sand">
              {formatMoney(Number(weekEarnings._sum.caregiverPayout ?? 0), currency)}
            </div>
          </div>
          <div>
            <div className="text-xs text-sand-dim">This month</div>
            <div className="mt-1 font-display font-semibold text-sand">
              {formatMoney(Number(monthEarnings._sum.caregiverPayout ?? 0), currency)}
            </div>
          </div>
          <div>
            <div className="text-xs text-sand-dim">All time</div>
            <div className="mt-1 font-display font-semibold text-sand">
              {formatMoney(Number(allTimeEarnings._sum.caregiverPayout ?? 0), currency)}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="font-display text-sm font-semibold text-sand">Your rate &amp; profile</h2>
          <p className="mt-1 text-sm text-sand-dim">
            {formatMoney(Number(profile.hourlyRate), currency)}/hr · {profile.city}
          </p>
          <LinkButton href="/dashboard/caregiver/profile" variant="secondary" size="sm" className="mt-3">
            Edit rate &amp; profile
          </LinkButton>
        </Card>
        <Card>
          <h2 className="font-display text-sm font-semibold text-sand">Availability</h2>
          <p className="mt-1 text-sm text-sand-dim">
            {profile.availabilitySlots.length > 0 ? "Set" : "Not set yet"} — edit your weekly free
            slots or block off dates.
          </p>
          <LinkButton
            href="/dashboard/caregiver/availability"
            variant="secondary"
            size="sm"
            className="mt-3"
          >
            Edit availability
          </LinkButton>
        </Card>
        <Card>
          <h2 className="font-display text-sm font-semibold text-sand">Payout settings</h2>
          <p className="mt-1 text-sm text-sand-dim">
            {profile.payoutIban ? "IBAN on file" : "Add your IBAN to receive payouts"}
          </p>
          <LinkButton href="/dashboard/caregiver/payouts" variant="secondary" size="sm" className="mt-3">
            Manage payouts
          </LinkButton>
        </Card>
        <Card>
          <h2 className="font-display text-sm font-semibold text-sand">All bookings</h2>
          <p className="mt-1 text-sm text-sand-dim">See your full booking history.</p>
          <LinkButton href="/dashboard/caregiver/bookings" variant="secondary" size="sm" className="mt-3">
            View bookings
          </LinkButton>
        </Card>
      </div>

      {reviews.length > 0 && (
        <Card className="mt-6">
          <h2 className="font-display text-lg font-semibold text-sand">Recent reviews</h2>
          <div className="mt-3 space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-petrol-lighter pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className="text-gold">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <span className="text-sm text-sand-dim">{r.author.name}</span>
                </div>
                {r.comment && <p className="mt-1 text-sm text-sand-dim">{r.comment}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
