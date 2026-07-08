import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { BookingListItem } from "@/components/booking/booking-list-item";
import type { CurrencyCode } from "@/lib/constants/gulf";

export default async function OwnerBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { ownerId: session.user.id },
    include: { pet: true, caregiverProfile: { include: { user: { select: { name: true } } } } },
    orderBy: { date: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-sand">My bookings</h1>
        <LinkButton href="/browse" size="sm" variant="secondary">
          Book a caregiver
        </LinkButton>
      </div>

      {bookings.length === 0 ? (
        <Card className="mt-6 text-center">
          <p className="text-sand-dim">No bookings yet.</p>
        </Card>
      ) : (
        <div className="mt-6 space-y-2">
          {bookings.map((b) => (
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
      )}
    </div>
  );
}
