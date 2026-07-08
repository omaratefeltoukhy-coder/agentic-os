import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expireOverdueRequests } from "@/lib/bookings";
import { Card } from "@/components/ui/card";
import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { BookingActions } from "@/components/booking/booking-actions";
import { ReviewForm } from "@/components/booking/review-form";
import { BookingChat } from "@/components/booking/booking-chat";
import { PhotoUpdates } from "@/components/booking/photo-updates";
import { SERVICE_LABELS, formatMoney, type CurrencyCode } from "@/lib/constants/gulf";
import { minutesToLabel, durationLabel } from "@/lib/time";

export default async function OwnerBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const stub = await prisma.booking.findUnique({ where: { id }, select: { caregiverProfileId: true, ownerId: true } });
  if (!stub || stub.ownerId !== session.user.id) notFound();

  await expireOverdueRequests(stub.caregiverProfileId);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      pet: true,
      caregiverProfile: { include: { user: { select: { name: true, image: true } } } },
      reviews: true,
    },
  });
  if (!booking) notFound();

  const currency = booking.currency as CurrencyCode;
  const myReview = booking.reviews.find((r) => r.authorId === session.user.id);
  const canReview = ["COMPLETED", "REVIEWED"].includes(booking.status) && !myReview;

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-sand">Booking details</h1>
        <BookingStatusBadge status={booking.status} />
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display font-semibold text-sand">
              {SERVICE_LABELS[booking.serviceType]} for {booking.pet.name}
            </div>
            <div className="text-sm text-sand-dim">with {booking.caregiverProfile.user.name}</div>
          </div>
        </div>
        <div className="mt-3 space-y-1 text-sm text-sand-dim">
          <div>{booking.date.toISOString().slice(0, 10)} at {minutesToLabel(booking.startMinute)}</div>
          <div>{durationLabel(booking.durationMinutes)}</div>
          <div>Payment: {booking.paymentMethod === "CARD" ? "Card" : "Cash on service"}</div>
        </div>

        {booking.ownerNote && (
          <p className="mt-3 rounded-lg bg-petrol-lighter px-3 py-2 text-sm text-sand-dim">
            Note: {booking.ownerNote}
          </p>
        )}

        <div className="mt-4 border-t border-petrol-lighter pt-3 text-sm">
          <div className="flex justify-between text-sand-dim">
            <span>Subtotal</span>
            <span>{formatMoney(Number(booking.subtotal), currency)}</span>
          </div>
          <div className="flex justify-between text-sand-dim">
            <span>Service fee</span>
            <span>{formatMoney(Number(booking.serviceFee), currency)}</span>
          </div>
          <div className="mt-1 flex justify-between font-semibold text-sand">
            <span>Total</span>
            <span>{formatMoney(Number(booking.total), currency)}</span>
          </div>
        </div>

        {booking.cancellationReason && (
          <p className="mt-3 text-xs text-sand-dim">{booking.cancellationReason}</p>
        )}

        <div className="mt-4">
          <BookingActions bookingId={booking.id} status={booking.status} viewerRole="OWNER" />
        </div>
      </Card>

      {["ACCEPTED", "IN_PROGRESS", "COMPLETED", "REVIEWED"].includes(booking.status) && (
        <div className="mt-4">
          <PhotoUpdates bookingId={booking.id} canPost={false} />
        </div>
      )}

      {["ACCEPTED", "IN_PROGRESS", "COMPLETED", "REVIEWED"].includes(booking.status) && (
        <div className="mt-4">
          <BookingChat bookingId={booking.id} currentUserId={session.user.id} />
        </div>
      )}

      {canReview && (
        <div className="mt-4">
          <ReviewForm bookingId={booking.id} subjectLabel={booking.caregiverProfile.user.name ?? "your caregiver"} />
        </div>
      )}
    </div>
  );
}
