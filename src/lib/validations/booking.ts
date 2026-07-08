import { z } from "zod";
import { LAUNCH_SERVICE_TYPES } from "@/lib/constants/gulf";
import { DURATION_OPTIONS } from "@/lib/time";

export const createBookingSchema = z.object({
  caregiverProfileId: z.string(),
  petId: z.string(),
  serviceType: z.enum(LAUNCH_SERVICE_TYPES),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startMinute: z.coerce.number().int().min(330).max(1260),
  durationMinutes: z.coerce.number().refine((n) => (DURATION_OPTIONS as readonly number[]).includes(n)),
  ownerNote: z.string().trim().max(500).optional().or(z.literal("")),
  paymentMethod: z.enum(["CASH", "CARD"]),
  promoCode: z.string().trim().optional().or(z.literal("")),
  recurring: z.boolean().optional(),
  recurringWeeks: z.number().int().min(1).max(8).optional(),
});
