import Link from "next/link";
import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { SERVICE_LABELS, formatMoney, type CurrencyCode } from "@/lib/constants/gulf";
import { minutesToLabel } from "@/lib/time";

export function BookingListItem({
  href,
  petName,
  serviceType,
  counterpartName,
  date,
  startMinute,
  total,
  currency,
  status,
}: {
  href: string;
  petName: string;
  serviceType: string;
  counterpartName: string;
  date: Date;
  startMinute: number;
  total: number;
  currency: CurrencyCode;
  status: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-petrol-lighter bg-petrol-light/60 px-4 py-3 transition-colors hover:border-gold/50"
    >
      <div>
        <div className="font-medium text-sand">
          {SERVICE_LABELS[serviceType as keyof typeof SERVICE_LABELS]} for {petName}
        </div>
        <div className="text-sm text-sand-dim">
          {counterpartName} · {date.toISOString().slice(0, 10)} at {minutesToLabel(startMinute)}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <BookingStatusBadge status={status} />
        <span className="text-sm text-sand-dim">{formatMoney(total, currency)}</span>
      </div>
    </Link>
  );
}
