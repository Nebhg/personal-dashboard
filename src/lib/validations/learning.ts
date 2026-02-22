import { z } from "zod";

export const learningSessionSchema = z.object({
  date: z.date(),
  category: z.enum(["CODING", "READING", "FINANCE", "OTHER"]),
  title: z.string().min(1).max(300),
  durationMin: z.number().int().positive(),
  notes: z.string().optional().nullable(),
  resource: z.string().optional().nullable(),
});

export type LearningSessionFormValues = z.infer<typeof learningSessionSchema>;

export const bookSchema = z.object({
  title: z.string().min(1).max(300),
  author: z.string().optional().nullable(),
  totalPages: z.number().int().positive().optional().nullable(),
  currentPage: z.number().int().nonnegative(),
  status: z.enum(["to-read", "reading", "finished"]),
  notes: z.string().optional().nullable(),
});

export type BookFormValues = z.infer<typeof bookSchema>;
