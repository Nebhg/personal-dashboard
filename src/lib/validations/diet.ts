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
  recipeId: z.string().optional().nullable(),
});

export type MealFormValues = z.infer<typeof mealSchema>;

export const recipeIngredientSchema = z.object({
  name: z.string().min(1),
  amount: z.string().optional().nullable(),
  order: z.number().int().nonnegative(),
});

export const recipeStepSchema = z.object({
  stepNum: z.number().int().positive(),
  text: z.string().min(1),
});

export const recipeSchema = z.object({
  name: z.string().min(1).max(300),
  description: z.string().optional().nullable(),
  prepTimeMins: z.number().int().positive().optional().nullable(),
  cookTimeMins: z.number().int().positive().optional().nullable(),
  servings: z.number().int().positive().optional().nullable(),
  calories: z.number().int().positive().optional().nullable(),
  protein: z.number().int().nonnegative().optional().nullable(),
  carbs: z.number().int().nonnegative().optional().nullable(),
  fat: z.number().int().nonnegative().optional().nullable(),
  notes: z.string().optional().nullable(),
  ingredients: z.array(recipeIngredientSchema),
  steps: z.array(recipeStepSchema),
});

export type RecipeFormValues = z.infer<typeof recipeSchema>;
export type RecipeIngredientFormValues = z.infer<typeof recipeIngredientSchema>;
export type RecipeStepFormValues = z.infer<typeof recipeStepSchema>;

export const dietGoalSchema = z.object({
  targetCalories: z.number().int().positive().optional().nullable(),
  targetProtein: z.number().int().nonnegative().optional().nullable(),
  targetCarbs: z.number().int().nonnegative().optional().nullable(),
  targetFat: z.number().int().nonnegative().optional().nullable(),
});

export type DietGoalFormValues = z.infer<typeof dietGoalSchema>;
