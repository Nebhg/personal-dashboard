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

export const workoutPlanExerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().positive().optional().nullable(),
  reps: z.number().int().positive().optional().nullable(),
  weightKg: z.number().nonnegative().optional().nullable(),
  restSec: z.number().int().nonnegative().optional().nullable(),
  notes: z.string().optional().nullable(),
  order: z.number().int().nonnegative(),
});

export const workoutPlanSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  scheduledDays: z.array(z.number().int().min(0).max(6)),
  exercises: z.array(workoutPlanExerciseSchema),
});

export type WorkoutFormValues = z.infer<typeof workoutSchema>;
export type ExerciseSetFormValues = z.infer<typeof exerciseSetSchema>;
export type WorkoutPlanFormValues = z.infer<typeof workoutPlanSchema>;
export type WorkoutPlanExerciseFormValues = z.infer<typeof workoutPlanExerciseSchema>;
