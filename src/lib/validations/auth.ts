import { z } from "zod";
import { GULF_PHONE_CODES } from "@/lib/constants/gulf";

const phoneCodes = GULF_PHONE_CODES.map((c) => c.code) as [string, ...string[]];

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.email("Enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Add an uppercase letter")
    .regex(/[0-9]/, "Add a number"),
  phoneCountryCode: z.enum(phoneCodes).optional(),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{6,12}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  whatsappOptIn: z.boolean().default(false),
  role: z.enum(["OWNER", "CAREGIVER"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const verifyOtpSchema = z.object({
  email: z.email(),
  code: z.string().regex(/^[0-9]{6}$/, "Enter the 6-digit code"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email"),
});

export const resetPasswordSchema = z.object({
  email: z.email(),
  code: z.string().regex(/^[0-9]{6}$/, "Enter the 6-digit code"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Add an uppercase letter")
    .regex(/[0-9]/, "Add a number"),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phoneCountryCode: z.enum(phoneCodes).optional(),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{6,12}$/)
    .optional()
    .or(z.literal("")),
  whatsappOptIn: z.boolean().default(false),
  city: z
    .enum([
      "DUBAI",
      "ABU_DHABI",
      "RIYADH",
      "JEDDAH",
      "DOHA",
      "KUWAIT_CITY",
      "MANAMA",
      "MUSCAT",
    ])
    .optional(),
  locale: z.enum(["en", "ar"]).default("en"),
});
