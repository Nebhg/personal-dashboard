import { z } from "zod";

export const mealSchema = z.object({
  date: z.date(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  description: z.string().min(1).max(500),
  calories: z.number().int().positive().optional().nullable(),
  protein: z.number().int().nonnegative().optional().nullable(),
  carbs: z.number().int().nonnegative().optional().nullable(),
  fat: z.number().int().nonnegative().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type MealFormValues = z.infer<typeof mealSchema>;

export const dietGoalSchema = z.object({
  targetCalories: z.number().int().positive().optional().nullable(),
  targetProtein: z.number().int().nonnegative().optional().nullable(),
  targetCarbs: z.number().int().nonnegative().optional().nullable(),
  targetFat: z.number().int().nonnegative().optional().nullable(),
});

export type DietGoalFormValues = z.infer<typeof dietGoalSchema>;
