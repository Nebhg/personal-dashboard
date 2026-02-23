import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../models";
import { type PrismaClient } from "./class";
export type * from '../models';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
/**
 * Prisma Errors
 */
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
/**
 * Re-export of sql-template-tag
 */
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
/**
 * Decimal.js
 */
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
/**
* Extensions
*/
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
/**
 * Prisma Client JS version: 7.4.1
 * Query Engine version: 55ae170b1ced7fc6ed07a15f110549408c501bb3
 */
export declare const prismaVersion: PrismaVersion;
/**
 * Utility Types
 */
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: runtime.DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: runtime.JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
/**
 * Subset
 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
 */
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
/**
 * SelectSubset
 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
 * Additionally, it validates, if both select and include are present. If the case, it errors.
 */
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
/**
 * Subset + Intersection
 * @desc From `T` pick properties that exist in `U` and intersect `K`
 */
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
/**
 * XOR is needed to have a real mutually exclusive union type
 * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
 */
export type XOR<T, U> = T extends object ? U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U : T;
/**
 * Is T a Record?
 */
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
/**
 * If it's T[], return T
 */
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
/**
 * From ts-toolbelt
 */
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
/** Helper Types for "Merge" **/
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
/** End Helper Types for "Merge" **/
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
/**
 * Convert tuple to union
 */
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
/**
 * Like `Pick`, but additionally can also accept an array of keys
 */
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
/**
 * Exclude all keys with underscores
 */
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
export declare const ModelName: {
    readonly CalendarEvent: "CalendarEvent";
    readonly MealLog: "MealLog";
    readonly Recipe: "Recipe";
    readonly MealPlanEntry: "MealPlanEntry";
    readonly RecipeStep: "RecipeStep";
    readonly RecipeIngredient: "RecipeIngredient";
    readonly DietGoal: "DietGoal";
    readonly WorkoutPlan: "WorkoutPlan";
    readonly WorkoutPlanExercise: "WorkoutPlanExercise";
    readonly WorkoutSession: "WorkoutSession";
    readonly ExerciseSet: "ExerciseSet";
    readonly LearningSession: "LearningSession";
    readonly Book: "Book";
    readonly Habit: "Habit";
    readonly HabitLog: "HabitLog";
    readonly ScheduleBlock: "ScheduleBlock";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "calendarEvent" | "mealLog" | "recipe" | "mealPlanEntry" | "recipeStep" | "recipeIngredient" | "dietGoal" | "workoutPlan" | "workoutPlanExercise" | "workoutSession" | "exerciseSet" | "learningSession" | "book" | "habit" | "habitLog" | "scheduleBlock";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        CalendarEvent: {
            payload: Prisma.$CalendarEventPayload<ExtArgs>;
            fields: Prisma.CalendarEventFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CalendarEventFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CalendarEventPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CalendarEventFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CalendarEventPayload>;
                };
                findFirst: {
                    args: Prisma.CalendarEventFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CalendarEventPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CalendarEventFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CalendarEventPayload>;
                };
                findMany: {
                    args: Prisma.CalendarEventFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CalendarEventPayload>[];
                };
                create: {
                    args: Prisma.CalendarEventCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CalendarEventPayload>;
                };
                createMany: {
                    args: Prisma.CalendarEventCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.CalendarEventCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CalendarEventPayload>[];
                };
                delete: {
                    args: Prisma.CalendarEventDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CalendarEventPayload>;
                };
                update: {
                    args: Prisma.CalendarEventUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CalendarEventPayload>;
                };
                deleteMany: {
                    args: Prisma.CalendarEventDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CalendarEventUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.CalendarEventUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CalendarEventPayload>[];
                };
                upsert: {
                    args: Prisma.CalendarEventUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CalendarEventPayload>;
                };
                aggregate: {
                    args: Prisma.CalendarEventAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCalendarEvent>;
                };
                groupBy: {
                    args: Prisma.CalendarEventGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CalendarEventGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CalendarEventCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CalendarEventCountAggregateOutputType> | number;
                };
            };
        };
        MealLog: {
            payload: Prisma.$MealLogPayload<ExtArgs>;
            fields: Prisma.MealLogFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MealLogFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MealLogFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>;
                };
                findFirst: {
                    args: Prisma.MealLogFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MealLogFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>;
                };
                findMany: {
                    args: Prisma.MealLogFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>[];
                };
                create: {
                    args: Prisma.MealLogCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>;
                };
                createMany: {
                    args: Prisma.MealLogCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MealLogCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>[];
                };
                delete: {
                    args: Prisma.MealLogDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>;
                };
                update: {
                    args: Prisma.MealLogUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>;
                };
                deleteMany: {
                    args: Prisma.MealLogDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MealLogUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MealLogUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>[];
                };
                upsert: {
                    args: Prisma.MealLogUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealLogPayload>;
                };
                aggregate: {
                    args: Prisma.MealLogAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMealLog>;
                };
                groupBy: {
                    args: Prisma.MealLogGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MealLogGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MealLogCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MealLogCountAggregateOutputType> | number;
                };
            };
        };
        Recipe: {
            payload: Prisma.$RecipePayload<ExtArgs>;
            fields: Prisma.RecipeFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RecipeFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RecipeFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipePayload>;
                };
                findFirst: {
                    args: Prisma.RecipeFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RecipeFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipePayload>;
                };
                findMany: {
                    args: Prisma.RecipeFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipePayload>[];
                };
                create: {
                    args: Prisma.RecipeCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipePayload>;
                };
                createMany: {
                    args: Prisma.RecipeCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RecipeCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipePayload>[];
                };
                delete: {
                    args: Prisma.RecipeDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipePayload>;
                };
                update: {
                    args: Prisma.RecipeUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipePayload>;
                };
                deleteMany: {
                    args: Prisma.RecipeDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RecipeUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RecipeUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipePayload>[];
                };
                upsert: {
                    args: Prisma.RecipeUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipePayload>;
                };
                aggregate: {
                    args: Prisma.RecipeAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRecipe>;
                };
                groupBy: {
                    args: Prisma.RecipeGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RecipeGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RecipeCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RecipeCountAggregateOutputType> | number;
                };
            };
        };
        MealPlanEntry: {
            payload: Prisma.$MealPlanEntryPayload<ExtArgs>;
            fields: Prisma.MealPlanEntryFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MealPlanEntryFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealPlanEntryPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MealPlanEntryFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealPlanEntryPayload>;
                };
                findFirst: {
                    args: Prisma.MealPlanEntryFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealPlanEntryPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MealPlanEntryFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealPlanEntryPayload>;
                };
                findMany: {
                    args: Prisma.MealPlanEntryFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealPlanEntryPayload>[];
                };
                create: {
                    args: Prisma.MealPlanEntryCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealPlanEntryPayload>;
                };
                createMany: {
                    args: Prisma.MealPlanEntryCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MealPlanEntryCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealPlanEntryPayload>[];
                };
                delete: {
                    args: Prisma.MealPlanEntryDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealPlanEntryPayload>;
                };
                update: {
                    args: Prisma.MealPlanEntryUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealPlanEntryPayload>;
                };
                deleteMany: {
                    args: Prisma.MealPlanEntryDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MealPlanEntryUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MealPlanEntryUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealPlanEntryPayload>[];
                };
                upsert: {
                    args: Prisma.MealPlanEntryUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MealPlanEntryPayload>;
                };
                aggregate: {
                    args: Prisma.MealPlanEntryAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMealPlanEntry>;
                };
                groupBy: {
                    args: Prisma.MealPlanEntryGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MealPlanEntryGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MealPlanEntryCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MealPlanEntryCountAggregateOutputType> | number;
                };
            };
        };
        RecipeStep: {
            payload: Prisma.$RecipeStepPayload<ExtArgs>;
            fields: Prisma.RecipeStepFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RecipeStepFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeStepPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RecipeStepFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeStepPayload>;
                };
                findFirst: {
                    args: Prisma.RecipeStepFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeStepPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RecipeStepFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeStepPayload>;
                };
                findMany: {
                    args: Prisma.RecipeStepFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeStepPayload>[];
                };
                create: {
                    args: Prisma.RecipeStepCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeStepPayload>;
                };
                createMany: {
                    args: Prisma.RecipeStepCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RecipeStepCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeStepPayload>[];
                };
                delete: {
                    args: Prisma.RecipeStepDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeStepPayload>;
                };
                update: {
                    args: Prisma.RecipeStepUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeStepPayload>;
                };
                deleteMany: {
                    args: Prisma.RecipeStepDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RecipeStepUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RecipeStepUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeStepPayload>[];
                };
                upsert: {
                    args: Prisma.RecipeStepUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeStepPayload>;
                };
                aggregate: {
                    args: Prisma.RecipeStepAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRecipeStep>;
                };
                groupBy: {
                    args: Prisma.RecipeStepGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RecipeStepGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RecipeStepCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RecipeStepCountAggregateOutputType> | number;
                };
            };
        };
        RecipeIngredient: {
            payload: Prisma.$RecipeIngredientPayload<ExtArgs>;
            fields: Prisma.RecipeIngredientFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RecipeIngredientFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeIngredientPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RecipeIngredientFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeIngredientPayload>;
                };
                findFirst: {
                    args: Prisma.RecipeIngredientFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeIngredientPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RecipeIngredientFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeIngredientPayload>;
                };
                findMany: {
                    args: Prisma.RecipeIngredientFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeIngredientPayload>[];
                };
                create: {
                    args: Prisma.RecipeIngredientCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeIngredientPayload>;
                };
                createMany: {
                    args: Prisma.RecipeIngredientCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RecipeIngredientCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeIngredientPayload>[];
                };
                delete: {
                    args: Prisma.RecipeIngredientDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeIngredientPayload>;
                };
                update: {
                    args: Prisma.RecipeIngredientUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeIngredientPayload>;
                };
                deleteMany: {
                    args: Prisma.RecipeIngredientDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RecipeIngredientUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RecipeIngredientUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeIngredientPayload>[];
                };
                upsert: {
                    args: Prisma.RecipeIngredientUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RecipeIngredientPayload>;
                };
                aggregate: {
                    args: Prisma.RecipeIngredientAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRecipeIngredient>;
                };
                groupBy: {
                    args: Prisma.RecipeIngredientGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RecipeIngredientGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RecipeIngredientCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RecipeIngredientCountAggregateOutputType> | number;
                };
            };
        };
        DietGoal: {
            payload: Prisma.$DietGoalPayload<ExtArgs>;
            fields: Prisma.DietGoalFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DietGoalFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DietGoalPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DietGoalFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DietGoalPayload>;
                };
                findFirst: {
                    args: Prisma.DietGoalFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DietGoalPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DietGoalFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DietGoalPayload>;
                };
                findMany: {
                    args: Prisma.DietGoalFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DietGoalPayload>[];
                };
                create: {
                    args: Prisma.DietGoalCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DietGoalPayload>;
                };
                createMany: {
                    args: Prisma.DietGoalCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DietGoalCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DietGoalPayload>[];
                };
                delete: {
                    args: Prisma.DietGoalDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DietGoalPayload>;
                };
                update: {
                    args: Prisma.DietGoalUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DietGoalPayload>;
                };
                deleteMany: {
                    args: Prisma.DietGoalDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DietGoalUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DietGoalUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DietGoalPayload>[];
                };
                upsert: {
                    args: Prisma.DietGoalUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DietGoalPayload>;
                };
                aggregate: {
                    args: Prisma.DietGoalAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDietGoal>;
                };
                groupBy: {
                    args: Prisma.DietGoalGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DietGoalGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DietGoalCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DietGoalCountAggregateOutputType> | number;
                };
            };
        };
        WorkoutPlan: {
            payload: Prisma.$WorkoutPlanPayload<ExtArgs>;
            fields: Prisma.WorkoutPlanFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.WorkoutPlanFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.WorkoutPlanFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanPayload>;
                };
                findFirst: {
                    args: Prisma.WorkoutPlanFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.WorkoutPlanFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanPayload>;
                };
                findMany: {
                    args: Prisma.WorkoutPlanFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanPayload>[];
                };
                create: {
                    args: Prisma.WorkoutPlanCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanPayload>;
                };
                createMany: {
                    args: Prisma.WorkoutPlanCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.WorkoutPlanCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanPayload>[];
                };
                delete: {
                    args: Prisma.WorkoutPlanDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanPayload>;
                };
                update: {
                    args: Prisma.WorkoutPlanUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanPayload>;
                };
                deleteMany: {
                    args: Prisma.WorkoutPlanDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.WorkoutPlanUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.WorkoutPlanUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanPayload>[];
                };
                upsert: {
                    args: Prisma.WorkoutPlanUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanPayload>;
                };
                aggregate: {
                    args: Prisma.WorkoutPlanAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateWorkoutPlan>;
                };
                groupBy: {
                    args: Prisma.WorkoutPlanGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WorkoutPlanGroupByOutputType>[];
                };
                count: {
                    args: Prisma.WorkoutPlanCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WorkoutPlanCountAggregateOutputType> | number;
                };
            };
        };
        WorkoutPlanExercise: {
            payload: Prisma.$WorkoutPlanExercisePayload<ExtArgs>;
            fields: Prisma.WorkoutPlanExerciseFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.WorkoutPlanExerciseFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanExercisePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.WorkoutPlanExerciseFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanExercisePayload>;
                };
                findFirst: {
                    args: Prisma.WorkoutPlanExerciseFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanExercisePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.WorkoutPlanExerciseFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanExercisePayload>;
                };
                findMany: {
                    args: Prisma.WorkoutPlanExerciseFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanExercisePayload>[];
                };
                create: {
                    args: Prisma.WorkoutPlanExerciseCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanExercisePayload>;
                };
                createMany: {
                    args: Prisma.WorkoutPlanExerciseCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.WorkoutPlanExerciseCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanExercisePayload>[];
                };
                delete: {
                    args: Prisma.WorkoutPlanExerciseDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanExercisePayload>;
                };
                update: {
                    args: Prisma.WorkoutPlanExerciseUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanExercisePayload>;
                };
                deleteMany: {
                    args: Prisma.WorkoutPlanExerciseDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.WorkoutPlanExerciseUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.WorkoutPlanExerciseUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanExercisePayload>[];
                };
                upsert: {
                    args: Prisma.WorkoutPlanExerciseUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutPlanExercisePayload>;
                };
                aggregate: {
                    args: Prisma.WorkoutPlanExerciseAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateWorkoutPlanExercise>;
                };
                groupBy: {
                    args: Prisma.WorkoutPlanExerciseGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WorkoutPlanExerciseGroupByOutputType>[];
                };
                count: {
                    args: Prisma.WorkoutPlanExerciseCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WorkoutPlanExerciseCountAggregateOutputType> | number;
                };
            };
        };
        WorkoutSession: {
            payload: Prisma.$WorkoutSessionPayload<ExtArgs>;
            fields: Prisma.WorkoutSessionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.WorkoutSessionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutSessionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.WorkoutSessionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>;
                };
                findFirst: {
                    args: Prisma.WorkoutSessionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutSessionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.WorkoutSessionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>;
                };
                findMany: {
                    args: Prisma.WorkoutSessionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>[];
                };
                create: {
                    args: Prisma.WorkoutSessionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>;
                };
                createMany: {
                    args: Prisma.WorkoutSessionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.WorkoutSessionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>[];
                };
                delete: {
                    args: Prisma.WorkoutSessionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>;
                };
                update: {
                    args: Prisma.WorkoutSessionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>;
                };
                deleteMany: {
                    args: Prisma.WorkoutSessionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.WorkoutSessionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.WorkoutSessionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>[];
                };
                upsert: {
                    args: Prisma.WorkoutSessionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkoutSessionPayload>;
                };
                aggregate: {
                    args: Prisma.WorkoutSessionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateWorkoutSession>;
                };
                groupBy: {
                    args: Prisma.WorkoutSessionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WorkoutSessionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.WorkoutSessionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WorkoutSessionCountAggregateOutputType> | number;
                };
            };
        };
        ExerciseSet: {
            payload: Prisma.$ExerciseSetPayload<ExtArgs>;
            fields: Prisma.ExerciseSetFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ExerciseSetFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExerciseSetPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ExerciseSetFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExerciseSetPayload>;
                };
                findFirst: {
                    args: Prisma.ExerciseSetFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExerciseSetPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ExerciseSetFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExerciseSetPayload>;
                };
                findMany: {
                    args: Prisma.ExerciseSetFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExerciseSetPayload>[];
                };
                create: {
                    args: Prisma.ExerciseSetCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExerciseSetPayload>;
                };
                createMany: {
                    args: Prisma.ExerciseSetCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ExerciseSetCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExerciseSetPayload>[];
                };
                delete: {
                    args: Prisma.ExerciseSetDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExerciseSetPayload>;
                };
                update: {
                    args: Prisma.ExerciseSetUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExerciseSetPayload>;
                };
                deleteMany: {
                    args: Prisma.ExerciseSetDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ExerciseSetUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ExerciseSetUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExerciseSetPayload>[];
                };
                upsert: {
                    args: Prisma.ExerciseSetUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExerciseSetPayload>;
                };
                aggregate: {
                    args: Prisma.ExerciseSetAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateExerciseSet>;
                };
                groupBy: {
                    args: Prisma.ExerciseSetGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ExerciseSetGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ExerciseSetCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ExerciseSetCountAggregateOutputType> | number;
                };
            };
        };
        LearningSession: {
            payload: Prisma.$LearningSessionPayload<ExtArgs>;
            fields: Prisma.LearningSessionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.LearningSessionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LearningSessionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.LearningSessionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LearningSessionPayload>;
                };
                findFirst: {
                    args: Prisma.LearningSessionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LearningSessionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.LearningSessionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LearningSessionPayload>;
                };
                findMany: {
                    args: Prisma.LearningSessionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LearningSessionPayload>[];
                };
                create: {
                    args: Prisma.LearningSessionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LearningSessionPayload>;
                };
                createMany: {
                    args: Prisma.LearningSessionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.LearningSessionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LearningSessionPayload>[];
                };
                delete: {
                    args: Prisma.LearningSessionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LearningSessionPayload>;
                };
                update: {
                    args: Prisma.LearningSessionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LearningSessionPayload>;
                };
                deleteMany: {
                    args: Prisma.LearningSessionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.LearningSessionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.LearningSessionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LearningSessionPayload>[];
                };
                upsert: {
                    args: Prisma.LearningSessionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LearningSessionPayload>;
                };
                aggregate: {
                    args: Prisma.LearningSessionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateLearningSession>;
                };
                groupBy: {
                    args: Prisma.LearningSessionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.LearningSessionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.LearningSessionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.LearningSessionCountAggregateOutputType> | number;
                };
            };
        };
        Book: {
            payload: Prisma.$BookPayload<ExtArgs>;
            fields: Prisma.BookFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.BookFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BookPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.BookFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BookPayload>;
                };
                findFirst: {
                    args: Prisma.BookFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BookPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.BookFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BookPayload>;
                };
                findMany: {
                    args: Prisma.BookFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BookPayload>[];
                };
                create: {
                    args: Prisma.BookCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BookPayload>;
                };
                createMany: {
                    args: Prisma.BookCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.BookCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BookPayload>[];
                };
                delete: {
                    args: Prisma.BookDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BookPayload>;
                };
                update: {
                    args: Prisma.BookUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BookPayload>;
                };
                deleteMany: {
                    args: Prisma.BookDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.BookUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.BookUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BookPayload>[];
                };
                upsert: {
                    args: Prisma.BookUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BookPayload>;
                };
                aggregate: {
                    args: Prisma.BookAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateBook>;
                };
                groupBy: {
                    args: Prisma.BookGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BookGroupByOutputType>[];
                };
                count: {
                    args: Prisma.BookCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BookCountAggregateOutputType> | number;
                };
            };
        };
        Habit: {
            payload: Prisma.$HabitPayload<ExtArgs>;
            fields: Prisma.HabitFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.HabitFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.HabitFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitPayload>;
                };
                findFirst: {
                    args: Prisma.HabitFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.HabitFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitPayload>;
                };
                findMany: {
                    args: Prisma.HabitFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitPayload>[];
                };
                create: {
                    args: Prisma.HabitCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitPayload>;
                };
                createMany: {
                    args: Prisma.HabitCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.HabitCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitPayload>[];
                };
                delete: {
                    args: Prisma.HabitDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitPayload>;
                };
                update: {
                    args: Prisma.HabitUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitPayload>;
                };
                deleteMany: {
                    args: Prisma.HabitDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.HabitUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.HabitUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitPayload>[];
                };
                upsert: {
                    args: Prisma.HabitUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitPayload>;
                };
                aggregate: {
                    args: Prisma.HabitAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateHabit>;
                };
                groupBy: {
                    args: Prisma.HabitGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.HabitGroupByOutputType>[];
                };
                count: {
                    args: Prisma.HabitCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.HabitCountAggregateOutputType> | number;
                };
            };
        };
        HabitLog: {
            payload: Prisma.$HabitLogPayload<ExtArgs>;
            fields: Prisma.HabitLogFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.HabitLogFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitLogPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.HabitLogFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitLogPayload>;
                };
                findFirst: {
                    args: Prisma.HabitLogFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitLogPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.HabitLogFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitLogPayload>;
                };
                findMany: {
                    args: Prisma.HabitLogFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitLogPayload>[];
                };
                create: {
                    args: Prisma.HabitLogCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitLogPayload>;
                };
                createMany: {
                    args: Prisma.HabitLogCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.HabitLogCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitLogPayload>[];
                };
                delete: {
                    args: Prisma.HabitLogDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitLogPayload>;
                };
                update: {
                    args: Prisma.HabitLogUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitLogPayload>;
                };
                deleteMany: {
                    args: Prisma.HabitLogDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.HabitLogUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.HabitLogUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitLogPayload>[];
                };
                upsert: {
                    args: Prisma.HabitLogUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$HabitLogPayload>;
                };
                aggregate: {
                    args: Prisma.HabitLogAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateHabitLog>;
                };
                groupBy: {
                    args: Prisma.HabitLogGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.HabitLogGroupByOutputType>[];
                };
                count: {
                    args: Prisma.HabitLogCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.HabitLogCountAggregateOutputType> | number;
                };
            };
        };
        ScheduleBlock: {
            payload: Prisma.$ScheduleBlockPayload<ExtArgs>;
            fields: Prisma.ScheduleBlockFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ScheduleBlockFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleBlockPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ScheduleBlockFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleBlockPayload>;
                };
                findFirst: {
                    args: Prisma.ScheduleBlockFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleBlockPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ScheduleBlockFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleBlockPayload>;
                };
                findMany: {
                    args: Prisma.ScheduleBlockFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleBlockPayload>[];
                };
                create: {
                    args: Prisma.ScheduleBlockCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleBlockPayload>;
                };
                createMany: {
                    args: Prisma.ScheduleBlockCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ScheduleBlockCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleBlockPayload>[];
                };
                delete: {
                    args: Prisma.ScheduleBlockDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleBlockPayload>;
                };
                update: {
                    args: Prisma.ScheduleBlockUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleBlockPayload>;
                };
                deleteMany: {
                    args: Prisma.ScheduleBlockDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ScheduleBlockUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ScheduleBlockUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleBlockPayload>[];
                };
                upsert: {
                    args: Prisma.ScheduleBlockUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduleBlockPayload>;
                };
                aggregate: {
                    args: Prisma.ScheduleBlockAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateScheduleBlock>;
                };
                groupBy: {
                    args: Prisma.ScheduleBlockGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ScheduleBlockGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ScheduleBlockCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ScheduleBlockCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
/**
 * Enums
 */
export declare const TransactionIsolationLevel: {
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const CalendarEventScalarFieldEnum: {
    readonly id: "id";
    readonly title: "title";
    readonly start: "start";
    readonly end: "end";
    readonly allDay: "allDay";
    readonly area: "area";
    readonly color: "color";
    readonly description: "description";
    readonly mealLogId: "mealLogId";
    readonly workoutSessionId: "workoutSessionId";
    readonly learningSessionId: "learningSessionId";
    readonly habitLogId: "habitLogId";
    readonly scheduleBlockId: "scheduleBlockId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type CalendarEventScalarFieldEnum = (typeof CalendarEventScalarFieldEnum)[keyof typeof CalendarEventScalarFieldEnum];
export declare const MealLogScalarFieldEnum: {
    readonly id: "id";
    readonly date: "date";
    readonly mealType: "mealType";
    readonly description: "description";
    readonly calories: "calories";
    readonly protein: "protein";
    readonly carbs: "carbs";
    readonly fat: "fat";
    readonly notes: "notes";
    readonly recipeId: "recipeId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type MealLogScalarFieldEnum = (typeof MealLogScalarFieldEnum)[keyof typeof MealLogScalarFieldEnum];
export declare const RecipeScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
    readonly prepTimeMins: "prepTimeMins";
    readonly cookTimeMins: "cookTimeMins";
    readonly servings: "servings";
    readonly calories: "calories";
    readonly protein: "protein";
    readonly carbs: "carbs";
    readonly fat: "fat";
    readonly notes: "notes";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type RecipeScalarFieldEnum = (typeof RecipeScalarFieldEnum)[keyof typeof RecipeScalarFieldEnum];
export declare const MealPlanEntryScalarFieldEnum: {
    readonly id: "id";
    readonly dayOfWeek: "dayOfWeek";
    readonly mealType: "mealType";
    readonly recipeId: "recipeId";
    readonly description: "description";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type MealPlanEntryScalarFieldEnum = (typeof MealPlanEntryScalarFieldEnum)[keyof typeof MealPlanEntryScalarFieldEnum];
export declare const RecipeStepScalarFieldEnum: {
    readonly id: "id";
    readonly recipeId: "recipeId";
    readonly stepNum: "stepNum";
    readonly text: "text";
};
export type RecipeStepScalarFieldEnum = (typeof RecipeStepScalarFieldEnum)[keyof typeof RecipeStepScalarFieldEnum];
export declare const RecipeIngredientScalarFieldEnum: {
    readonly id: "id";
    readonly recipeId: "recipeId";
    readonly name: "name";
    readonly amount: "amount";
    readonly order: "order";
};
export type RecipeIngredientScalarFieldEnum = (typeof RecipeIngredientScalarFieldEnum)[keyof typeof RecipeIngredientScalarFieldEnum];
export declare const DietGoalScalarFieldEnum: {
    readonly id: "id";
    readonly targetCalories: "targetCalories";
    readonly targetProtein: "targetProtein";
    readonly targetCarbs: "targetCarbs";
    readonly targetFat: "targetFat";
    readonly activeFrom: "activeFrom";
    readonly createdAt: "createdAt";
};
export type DietGoalScalarFieldEnum = (typeof DietGoalScalarFieldEnum)[keyof typeof DietGoalScalarFieldEnum];
export declare const WorkoutPlanScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
    readonly scheduledDays: "scheduledDays";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type WorkoutPlanScalarFieldEnum = (typeof WorkoutPlanScalarFieldEnum)[keyof typeof WorkoutPlanScalarFieldEnum];
export declare const WorkoutPlanExerciseScalarFieldEnum: {
    readonly id: "id";
    readonly planId: "planId";
    readonly name: "name";
    readonly sets: "sets";
    readonly reps: "reps";
    readonly weightKg: "weightKg";
    readonly restSec: "restSec";
    readonly notes: "notes";
    readonly order: "order";
};
export type WorkoutPlanExerciseScalarFieldEnum = (typeof WorkoutPlanExerciseScalarFieldEnum)[keyof typeof WorkoutPlanExerciseScalarFieldEnum];
export declare const WorkoutSessionScalarFieldEnum: {
    readonly id: "id";
    readonly date: "date";
    readonly name: "name";
    readonly type: "type";
    readonly durationMin: "durationMin";
    readonly notes: "notes";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type WorkoutSessionScalarFieldEnum = (typeof WorkoutSessionScalarFieldEnum)[keyof typeof WorkoutSessionScalarFieldEnum];
export declare const ExerciseSetScalarFieldEnum: {
    readonly id: "id";
    readonly sessionId: "sessionId";
    readonly name: "name";
    readonly sets: "sets";
    readonly reps: "reps";
    readonly weightKg: "weightKg";
    readonly distanceKm: "distanceKm";
    readonly order: "order";
};
export type ExerciseSetScalarFieldEnum = (typeof ExerciseSetScalarFieldEnum)[keyof typeof ExerciseSetScalarFieldEnum];
export declare const LearningSessionScalarFieldEnum: {
    readonly id: "id";
    readonly date: "date";
    readonly category: "category";
    readonly title: "title";
    readonly durationMin: "durationMin";
    readonly notes: "notes";
    readonly resource: "resource";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type LearningSessionScalarFieldEnum = (typeof LearningSessionScalarFieldEnum)[keyof typeof LearningSessionScalarFieldEnum];
export declare const BookScalarFieldEnum: {
    readonly id: "id";
    readonly title: "title";
    readonly author: "author";
    readonly totalPages: "totalPages";
    readonly currentPage: "currentPage";
    readonly status: "status";
    readonly startedAt: "startedAt";
    readonly finishedAt: "finishedAt";
    readonly notes: "notes";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type BookScalarFieldEnum = (typeof BookScalarFieldEnum)[keyof typeof BookScalarFieldEnum];
export declare const HabitScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly type: "type";
    readonly description: "description";
    readonly startDate: "startDate";
    readonly targetDays: "targetDays";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type HabitScalarFieldEnum = (typeof HabitScalarFieldEnum)[keyof typeof HabitScalarFieldEnum];
export declare const HabitLogScalarFieldEnum: {
    readonly id: "id";
    readonly habitId: "habitId";
    readonly date: "date";
    readonly kept: "kept";
    readonly notes: "notes";
    readonly createdAt: "createdAt";
};
export type HabitLogScalarFieldEnum = (typeof HabitLogScalarFieldEnum)[keyof typeof HabitLogScalarFieldEnum];
export declare const ScheduleBlockScalarFieldEnum: {
    readonly id: "id";
    readonly title: "title";
    readonly start: "start";
    readonly end: "end";
    readonly allDay: "allDay";
    readonly category: "category";
    readonly color: "color";
    readonly notes: "notes";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ScheduleBlockScalarFieldEnum = (typeof ScheduleBlockScalarFieldEnum)[keyof typeof ScheduleBlockScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
/**
 * Field references
 */
/**
 * Reference to a field of type 'String'
 */
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
/**
 * Reference to a field of type 'DateTime'
 */
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
/**
 * Reference to a field of type 'Boolean'
 */
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
/**
 * Reference to a field of type 'Int'
 */
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
/**
 * Reference to a field of type 'Float'
 */
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
/**
 * Batch Payload for updateMany & deleteMany & createMany
 */
export type BatchPayload = {
    count: number;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export type PrismaClientOptions = ({
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-pg`.
     */
    adapter: runtime.SqlDriverAdapterFactory;
    accelerateUrl?: never;
} | {
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl: string;
    adapter?: never;
}) & {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     *
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     *
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    /**
     * Global configuration for omitting model fields by default.
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: GlobalOmitConfig;
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[];
};
export type GlobalOmitConfig = {
    calendarEvent?: Prisma.CalendarEventOmit;
    mealLog?: Prisma.MealLogOmit;
    recipe?: Prisma.RecipeOmit;
    mealPlanEntry?: Prisma.MealPlanEntryOmit;
    recipeStep?: Prisma.RecipeStepOmit;
    recipeIngredient?: Prisma.RecipeIngredientOmit;
    dietGoal?: Prisma.DietGoalOmit;
    workoutPlan?: Prisma.WorkoutPlanOmit;
    workoutPlanExercise?: Prisma.WorkoutPlanExerciseOmit;
    workoutSession?: Prisma.WorkoutSessionOmit;
    exerciseSet?: Prisma.ExerciseSetOmit;
    learningSession?: Prisma.LearningSessionOmit;
    book?: Prisma.BookOmit;
    habit?: Prisma.HabitOmit;
    habitLog?: Prisma.HabitLogOmit;
    scheduleBlock?: Prisma.ScheduleBlockOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
/**
 * `PrismaClient` proxy available in interactive transactions.
 */
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
