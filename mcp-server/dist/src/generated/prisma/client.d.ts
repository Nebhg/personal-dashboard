import * as runtime from "@prisma/client/runtime/client";
import * as $Class from "./internal/class";
import * as Prisma from "./internal/prismaNamespace";
export * as $Enums from './enums';
export * from "./enums";
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more CalendarEvents
 * const calendarEvents = await prisma.calendarEvent.findMany()
 * ```
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export declare const PrismaClient: $Class.PrismaClientConstructor;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
/**
 * Model CalendarEvent
 *
 */
export type CalendarEvent = Prisma.CalendarEventModel;
/**
 * Model MealLog
 *
 */
export type MealLog = Prisma.MealLogModel;
/**
 * Model Recipe
 *
 */
export type Recipe = Prisma.RecipeModel;
/**
 * Model MealPlanEntry
 *
 */
export type MealPlanEntry = Prisma.MealPlanEntryModel;
/**
 * Model RecipeStep
 *
 */
export type RecipeStep = Prisma.RecipeStepModel;
/**
 * Model RecipeIngredient
 *
 */
export type RecipeIngredient = Prisma.RecipeIngredientModel;
/**
 * Model DietGoal
 *
 */
export type DietGoal = Prisma.DietGoalModel;
/**
 * Model WorkoutPlan
 *
 */
export type WorkoutPlan = Prisma.WorkoutPlanModel;
/**
 * Model WorkoutPlanExercise
 *
 */
export type WorkoutPlanExercise = Prisma.WorkoutPlanExerciseModel;
/**
 * Model WorkoutSession
 *
 */
export type WorkoutSession = Prisma.WorkoutSessionModel;
/**
 * Model ExerciseSet
 *
 */
export type ExerciseSet = Prisma.ExerciseSetModel;
/**
 * Model LearningSession
 *
 */
export type LearningSession = Prisma.LearningSessionModel;
/**
 * Model Book
 *
 */
export type Book = Prisma.BookModel;
/**
 * Model Habit
 *
 */
export type Habit = Prisma.HabitModel;
/**
 * Model HabitLog
 *
 */
export type HabitLog = Prisma.HabitLogModel;
/**
 * Model ScheduleBlock
 *
 */
export type ScheduleBlock = Prisma.ScheduleBlockModel;
