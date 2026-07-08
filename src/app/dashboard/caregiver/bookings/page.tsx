import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expireOverdueRequests } from "@/lib/bookings";
import { Card } from "@/components/ui/card";
import { BookingListItem } from "@/components/booking/booking-list-item";
import type { CurrencyCode } from "@/lib/constants/gulf";

export default async function CaregiverBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await prisma.caregiverProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/onboarding/caregiver");

  await expireOverdueRequests(profile.id);

  const bookings = await prisma.booking.findMany({
    where: { caregiverProfileId: profile.id },
    include: { pet: true, owner: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-sand">Bookings</h1>

      {bookings.length === 0 ? (
        <Card className="mt-6 text-center">
          <p className="text-sand-dim">No bookings yet.</p>
        </Card>
      ) : (
        <div className="mt-6 space-y-2">
          {bookings.map((b) => (
            <BookingListItem
              key={b.id}
              href={`/dashboard/caregiver/bookings/${b.id}`}
              petName={b.pet.name}
              serviceType={b.serviceType}
              counterpartName={b.owner.name ?? "Owner"}
              date={b.date}
              startMinute={b.startMinute}
              total={Number(b.total)}
              currency={b.currency as CurrencyCode}
              status={b.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}
