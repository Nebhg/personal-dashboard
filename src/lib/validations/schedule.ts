import { z } from "zod";

export const scheduleBlockSchema = z.object({
  title: z.string().min(1).max(200),
  start: z.date(),
  end: z.date(),
  allDay: z.boolean(),
  category: z.enum(["GYM", "LEARNING", "SLEEP", "WORK", "COMMUTE", "PERSONAL"]),
  notes: z.string().optional().nullable(),
});

export type ScheduleBlockFormValues = z.infer<typeof scheduleBlockSchema>;
