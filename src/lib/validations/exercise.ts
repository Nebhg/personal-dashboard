import { z } from "zod";

export const exerciseSetSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().positive().optional().nullable(),
  reps: z.number().int().positive().optional().nullable(),
  weightKg: z.number().nonnegative().optional().nullable(),
  distanceKm: z.number().nonnegative().optional().nullable(),
  order: z.number().int().nonnegative(),
});

export const workoutSchema = z.object({
  date: z.date(),
  name: z.string().min(1).max(200),
  type: z.enum(["strength", "cardio", "mobility", "sport"]),
  durationMin: z.number().int().positive(),
  notes: z.string().optional().nullable(),
  exercises: z.array(exerciseSetSchema),
});

export type WorkoutFormValues = z.infer<typeof workoutSchema>;
export type ExerciseSetFormValues = z.infer<typeof exerciseSetSchema>;
