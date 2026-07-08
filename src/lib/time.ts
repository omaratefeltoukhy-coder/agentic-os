export const DAY_START_MINUTE = 5 * 60 + 30; // 05:30
export const DAY_END_MINUTE = 21 * 60; // 21:00
export const SLOT_STEP = 30;

export const MIN_BOOKING_MINUTES = 30;
export const MAX_BOOKING_MINUTES = 180;

export const DURATION_OPTIONS = [30, 60, 90, 120, 150, 180] as const;

/** All valid slot start-minutes in a day, 05:30..21:00 step 30. */
export function daySlots(): number[] {
  const slots: number[] = [];
  for (let m = DAY_START_MINUTE; m <= DAY_END_MINUTE; m += SLOT_STEP) {
    slots.push(m);
  }
  return slots;
}

/** Cool-hours slots: early morning 05:30–07:00 and evening 18:30–21:00. */
export function coolHourSlots(): number[] {
  return daySlots().filter((m) => m < 7 * 60 || m >= 18 * 60 + 30);
}

export function isHotSlot(startMinute: number) {
  return startMinute >= 11 * 60 && startMinute < 16 * 60;
}

export function minutesToLabel(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function durationLabel(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${hours % 1 === 0 ? hours : hours.toFixed(1)} hr`;
}

/** Slots (by start minute) fully covered by [startMinute, startMinute+duration). */
export function coveredSlots(startMinute: number, durationMinutes: number) {
  const count = durationMinutes / SLOT_STEP;
  return Array.from({ length: count }, (_, i) => startMinute + i * SLOT_STEP);
}

export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Next N calendar days starting today, as UTC-midnight Date objects. */
export function nextNDays(n: number, from: Date = new Date()) {
  const days: Date[] = [];
  const base = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setUTCDate(base.getUTCDate() + i);
    days.push(d);
  }
  return days;
}

export function dayOfWeekUTC(date: Date) {
  return date.getUTCDay(); // 0=Sun..6=Sat, matches AvailabilitySlot.dayOfWeek
}
