import { OWNER_SERVICE_FEE, type CurrencyCode } from "@/lib/constants/gulf";

export const DEFAULT_COMMISSION_RATE = 0.18; // 15-20% platform commission, admin-configurable
export const PRO_COMMISSION_RATE = 0.1; // Caregiver Pro subscribers (Step 5)

export function commissionRateFor(isProBadge: boolean) {
  return isProBadge ? PRO_COMMISSION_RATE : DEFAULT_COMMISSION_RATE;
}

export function serviceFeeFor(currency: CurrencyCode, ownerHasPlus: boolean) {
  if (ownerHasPlus) return 0; // GulfPaws Plus: zero service fees (Step 5)
  return OWNER_SERVICE_FEE[currency];
}

export function computeBookingPrice({
  hourlyRate,
  durationMinutes,
  currency,
  isProBadge,
  ownerHasPlus = false,
  discountAmount = 0,
}: {
  hourlyRate: number;
  durationMinutes: number;
  currency: CurrencyCode;
  isProBadge: boolean;
  ownerHasPlus?: boolean;
  discountAmount?: number;
}) {
  const subtotal = round(hourlyRate * (durationMinutes / 60), currency);
  const serviceFee = serviceFeeFor(currency, ownerHasPlus);
  const commissionRate = commissionRateFor(isProBadge);
  const commissionAmount = round(subtotal * commissionRate, currency);
  const caregiverPayout = round(subtotal - commissionAmount, currency);
  const total = Math.max(0, round(subtotal + serviceFee - discountAmount, currency));

  return { subtotal, serviceFee, commissionRate, commissionAmount, caregiverPayout, total };
}

function round(amount: number, currency: CurrencyCode) {
  const decimals = currency === "KWD" || currency === "BHD" || currency === "OMR" ? 3 : 2;
  const factor = 10 ** decimals;
  return Math.round(amount * factor) / factor;
}

/** Free cancellation up to 12h before start; later cancellations charge 50%. */
export function cancellationChargeRatio(bookingStart: Date, now: Date = new Date()) {
  const hoursUntilStart = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilStart >= 12 ? 0 : 0.5;
}
