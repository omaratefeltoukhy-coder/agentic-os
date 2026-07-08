import { z } from "zod";
import { GULF_CITIES, LAUNCH_SERVICE_TYPES, LANGUAGES, CURRENCIES } from "@/lib/constants/gulf";

export const caregiverProfileSchema = z.object({
  city: z.enum(GULF_CITIES),
  areas: z.array(z.string()).min(1, "Pick at least one area").max(10),
  services: z.array(z.enum(LAUNCH_SERVICE_TYPES)).min(1, "Pick at least one service"),
  hourlyRate: z.coerce.number().min(10, "Rate looks too low").max(1000, "Rate looks too high"),
  currency: z.enum(CURRENCIES),
  languages: z.array(z.enum(LANGUAGES)).min(1, "Pick at least one language"),
  bio: z.string().trim().max(1000).optional().or(z.literal("")),
  yearsExperience: z.coerce.number().int().min(0).max(60).optional(),
  photoUrl: z.string().optional().nullable(),
  certificationUrls: z.array(z.string()).max(5).optional(),
});

export type CaregiverProfileInput = z.infer<typeof caregiverProfileSchema>;

const slotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startMinute: z.number().int().min(330).max(1260),
});

export const availabilitySchema = z.object({
  slots: z.array(slotSchema).max(300),
});

export const overrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isDayOff: z.boolean().default(true),
});

export const payoutSchema = z.object({
  payoutIban: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}[0-9A-Z]{10,30}$/, "Enter a valid IBAN")
    .optional()
    .or(z.literal("")),
  payoutBankName: z.string().trim().max(80).optional().or(z.literal("")),
});
