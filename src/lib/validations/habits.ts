import { z } from "zod";

export const habitSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(["QUIT", "BUILD"]),
  description: z.string().optional().nullable(),
  startDate: z.date(),
  targetDays: z.number().int().positive().optional().nullable(),
});

export type HabitFormValues = z.infer<typeof habitSchema>;

export const habitLogSchema = z.object({
  kept: z.boolean(),
  date: z.string().optional(),  // ISO date string for retroactive logging
  notes: z.string().optional().nullable(),
});

export type HabitLogFormValues = z.infer<typeof habitLogSchema>;
