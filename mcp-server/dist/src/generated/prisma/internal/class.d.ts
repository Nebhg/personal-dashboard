import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "./prismaNamespace";
export type LogOptions<ClientOptions extends Prisma.PrismaClientOptions> = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never;
export interface PrismaClientConstructor {
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
    new <Options extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions, LogOpts extends LogOptions<Options> = LogOptions<Options>, OmitOpts extends Prisma.PrismaClientOptions['omit'] = Options extends {
        omit: infer U;
    } ? U : Prisma.PrismaClientOptions['omit'], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs>(options: Prisma.Subset<Options, Prisma.PrismaClientOptions>): PrismaClient<LogOpts, OmitOpts, ExtArgs>;
}
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
export interface PrismaClient<in LogOpts extends Prisma.LogLevel = never, in out OmitOpts extends Prisma.PrismaClientOptions['omit'] = undefined, in out ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['other'];
    };
    $on<V extends LogOpts>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;
    /**
     * Connect with the database
     */
    $connect(): runtime.Types.Utils.JsPromise<void>;
    /**
     * Disconnect from the database
     */
    $disconnect(): runtime.Types.Utils.JsPromise<void>;
    /**
       * Executes a prepared raw query and returns the number of affected rows.
       * @example
       * ```
       * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
       * ```
       *
       * Read more in our [docs](https://pris.ly/d/raw-queries).
       */
    $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;
    /**
     * Executes a raw query and returns the number of affected rows.
     * Susceptible to SQL injections, see documentation.
     * @example
     * ```
     * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
     * ```
     *
     * Read more in our [docs](https://pris.ly/d/raw-queries).
     */
    $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;
    /**
     * Performs a prepared raw query and returns the `SELECT` data.
     * @example
     * ```
     * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
     * ```
     *
     * Read more in our [docs](https://pris.ly/d/raw-queries).
     */
    $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;
    /**
     * Performs a raw query and returns the `SELECT` data.
     * Susceptible to SQL injections, see documentation.
     * @example
     * ```
     * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
     * ```
     *
     * Read more in our [docs](https://pris.ly/d/raw-queries).
     */
    $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;
    /**
     * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
     * @example
     * ```
     * const [george, bob, alice] = await prisma.$transaction([
     *   prisma.user.create({ data: { name: 'George' } }),
     *   prisma.user.create({ data: { name: 'Bob' } }),
     *   prisma.user.create({ data: { name: 'Alice' } }),
     * ])
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
     */
    $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: {
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;
    $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => runtime.Types.Utils.JsPromise<R>, options?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<R>;
    $extends: runtime.Types.Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<OmitOpts>, ExtArgs, runtime.Types.Utils.Call<Prisma.TypeMapCb<OmitOpts>, {
        extArgs: ExtArgs;
    }>>;
    /**
 * `prisma.calendarEvent`: Exposes CRUD operations for the **CalendarEvent** model.
  * Example usage:
  * ```ts
  * // Fetch zero or more CalendarEvents
  * const calendarEvents = await prisma.calendarEvent.findMany()
  * ```
  */
    get calendarEvent(): Prisma.CalendarEventDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.mealLog`: Exposes CRUD operations for the **MealLog** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more MealLogs
      * const mealLogs = await prisma.mealLog.findMany()
      * ```
      */
    get mealLog(): Prisma.MealLogDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.recipe`: Exposes CRUD operations for the **Recipe** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Recipes
      * const recipes = await prisma.recipe.findMany()
      * ```
      */
    get recipe(): Prisma.RecipeDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.mealPlanEntry`: Exposes CRUD operations for the **MealPlanEntry** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more MealPlanEntries
      * const mealPlanEntries = await prisma.mealPlanEntry.findMany()
      * ```
      */
    get mealPlanEntry(): Prisma.MealPlanEntryDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.recipeStep`: Exposes CRUD operations for the **RecipeStep** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more RecipeSteps
      * const recipeSteps = await prisma.recipeStep.findMany()
      * ```
      */
    get recipeStep(): Prisma.RecipeStepDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.recipeIngredient`: Exposes CRUD operations for the **RecipeIngredient** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more RecipeIngredients
      * const recipeIngredients = await prisma.recipeIngredient.findMany()
      * ```
      */
    get recipeIngredient(): Prisma.RecipeIngredientDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.dietGoal`: Exposes CRUD operations for the **DietGoal** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more DietGoals
      * const dietGoals = await prisma.dietGoal.findMany()
      * ```
      */
    get dietGoal(): Prisma.DietGoalDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.workoutPlan`: Exposes CRUD operations for the **WorkoutPlan** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more WorkoutPlans
      * const workoutPlans = await prisma.workoutPlan.findMany()
      * ```
      */
    get workoutPlan(): Prisma.WorkoutPlanDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.workoutPlanExercise`: Exposes CRUD operations for the **WorkoutPlanExercise** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more WorkoutPlanExercises
      * const workoutPlanExercises = await prisma.workoutPlanExercise.findMany()
      * ```
      */
    get workoutPlanExercise(): Prisma.WorkoutPlanExerciseDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.workoutSession`: Exposes CRUD operations for the **WorkoutSession** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more WorkoutSessions
      * const workoutSessions = await prisma.workoutSession.findMany()
      * ```
      */
    get workoutSession(): Prisma.WorkoutSessionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.exerciseSet`: Exposes CRUD operations for the **ExerciseSet** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ExerciseSets
      * const exerciseSets = await prisma.exerciseSet.findMany()
      * ```
      */
    get exerciseSet(): Prisma.ExerciseSetDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.learningSession`: Exposes CRUD operations for the **LearningSession** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more LearningSessions
      * const learningSessions = await prisma.learningSession.findMany()
      * ```
      */
    get learningSession(): Prisma.LearningSessionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.book`: Exposes CRUD operations for the **Book** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Books
      * const books = await prisma.book.findMany()
      * ```
      */
    get book(): Prisma.BookDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.habit`: Exposes CRUD operations for the **Habit** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Habits
      * const habits = await prisma.habit.findMany()
      * ```
      */
    get habit(): Prisma.HabitDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.habitLog`: Exposes CRUD operations for the **HabitLog** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more HabitLogs
      * const habitLogs = await prisma.habitLog.findMany()
      * ```
      */
    get habitLog(): Prisma.HabitLogDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.scheduleBlock`: Exposes CRUD operations for the **ScheduleBlock** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ScheduleBlocks
      * const scheduleBlocks = await prisma.scheduleBlock.findMany()
      * ```
      */
    get scheduleBlock(): Prisma.ScheduleBlockDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
}
export declare function getPrismaClientClass(): PrismaClientConstructor;
