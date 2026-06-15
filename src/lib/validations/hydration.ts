import { z } from "zod";

export const hydrationSchema = z.object({
  date: z.date(),
  amountMl: z.number().int().positive(),
  notes: z.string().optional().nullable(),
});

export type HydrationFormValues = z.infer<typeof hydrationSchema>;
