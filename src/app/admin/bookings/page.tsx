import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { RefundButton } from "@/components/admin/refund-button";
import { SERVICE_LABELS, formatMoney, type CurrencyCode } from "@/lib/constants/gulf";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      pet: true,
      owner: { select: { name: true } },
      caregiverProfile: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-sand">Bookings</h1>
      <p className="mt-1 text-sm text-sand-dim">{bookings.length} most recent bookings.</p>

      <div className="mt-6 space-y-2">
        {bookings.map((b) => {
          const refundable = ["REQUESTED", "ACCEPTED", "IN_PROGRESS"].includes(b.status);
          return (
            <Card key={b.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-sand">
                  {SERVICE_LABELS[b.serviceType]} for {b.pet.name}
                </div>
                <div className="text-xs text-sand-dim">
                  {b.owner.name} → {b.caregiverProfile.user.name} · {b.date.toISOString().slice(0, 10)} ·{" "}
                  {formatMoney(Number(b.total), b.currency as CurrencyCode)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookingStatusBadge status={b.status} />
                {refundable && <RefundButton bookingId={b.id} />}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
