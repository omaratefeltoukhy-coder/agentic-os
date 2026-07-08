import { z } from "zod";

export const petSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
  type: z.enum(["DOG", "CAT"]),
  breed: z.string().trim().max(50).optional().or(z.literal("")),
  age: z.coerce.number().int().min(0).max(40).optional(),
  temperament: z.string().trim().max(500).optional().or(z.literal("")),
  photoUrl: z.string().optional().nullable(),
  vaccinationCardUrl: z.string().optional().nullable(),
});

export type PetInput = z.infer<typeof petSchema>;
