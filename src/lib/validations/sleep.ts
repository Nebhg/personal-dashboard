import { z } from "zod";

export const sleepSchema = z
  .object({
    date: z.date(),
    bedTime: z.date(),
    wakeTime: z.date(),
    quality: z.number().int().min(1).max(10).optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .refine((d) => d.wakeTime.getTime() > d.bedTime.getTime(), {
    message: "Wake time must be after bed time",
    path: ["wakeTime"],
  });

export type SleepFormValues = z.infer<typeof sleepSchema>;
