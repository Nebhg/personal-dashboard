import { z } from "zod";

export const recurringBlockSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.enum(["GYM", "LEARNING", "SLEEP", "WORK", "COMMUTE", "PERSONAL"]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  daysOfWeek: z.array(z.number().int().min(0).max(6)),
  endsOn: z.date().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type RecurringBlockFormValues = z.infer<typeof recurringBlockSchema>;
