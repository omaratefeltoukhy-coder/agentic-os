import { prisma } from "@/lib/prisma";
import { daySlots, coveredSlots } from "@/lib/time";

const ACTIVE_STATUSES = ["REQUESTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "REVIEWED"] as const;

/**
 * Valid booking start times (minutes since 00:00) for a caregiver on a given
 * UTC-midnight date, for a booking of durationMinutes. Accounts for the
 * caregiver's weekly recurring slots, date-specific day-off overrides,
 * vacation mode, and existing overlapping bookings.
 */
export async function getAvailableStartTimes(
  caregiverProfileId: string,
  date: Date,
  durationMinutes: number
): Promise<number[]> {
  const dayOfWeek = date.getUTCDay();

  const [profile, weeklySlots, override, existingBookings] = await Promise.all([
    prisma.caregiverProfile.findUnique({
      where: { id: caregiverProfileId },
      select: { isVacationMode: true },
    }),
    prisma.availabilitySlot.findMany({
      where: { caregiverProfileId, dayOfWeek },
      select: { startMinute: true },
    }),
    prisma.availabilityOverride.findFirst({
      where: { caregiverProfileId, date },
    }),
    prisma.booking.findMany({
      where: {
        caregiverProfileId,
        date,
        status: { in: [...ACTIVE_STATUSES] },
      },
      select: { startMinute: true, durationMinutes: true },
    }),
  ]);

  if (!profile || profile.isVacationMode) return [];
  if (override?.isDayOff) return [];

  const freeSet = new Set(weeklySlots.map((s) => s.startMinute));
  if (freeSet.size === 0) return [];

  const occupied = new Set<number>();
  for (const b of existingBookings) {
    for (const m of coveredSlots(b.startMinute, b.durationMinutes)) occupied.add(m);
  }

  return daySlots().filter((start) => {
    const covered = coveredSlots(start, durationMinutes);
    return covered.every((m) => freeSet.has(m) && !occupied.has(m));
  });
}

/** Coarse check used by search/date-picker: does this caregiver have any
 * free slot at all on this date (for the minimum 30-min booking)? */
export async function hasAnyAvailability(caregiverProfileId: string, date: Date) {
  const slots = await getAvailableStartTimes(caregiverProfileId, date, 30);
  return slots.length > 0;
}
