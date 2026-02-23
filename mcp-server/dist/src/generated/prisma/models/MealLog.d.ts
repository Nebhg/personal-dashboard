import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model MealLog
 *
 */
export type MealLogModel = runtime.Types.Result.DefaultSelection<Prisma.$MealLogPayload>;
export type AggregateMealLog = {
    _count: MealLogCountAggregateOutputType | null;
    _avg: MealLogAvgAggregateOutputType | null;
    _sum: MealLogSumAggregateOutputType | null;
    _min: MealLogMinAggregateOutputType | null;
    _max: MealLogMaxAggregateOutputType | null;
};
export type MealLogAvgAggregateOutputType = {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
};
export type MealLogSumAggregateOutputType = {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
};
export type MealLogMinAggregateOutputType = {
    id: string | null;
    date: Date | null;
    mealType: string | null;
    description: string | null;
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    notes: string | null;
    recipeId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type MealLogMaxAggregateOutputType = {
    id: string | null;
    date: Date | null;
    mealType: string | null;
    description: string | null;
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    notes: string | null;
    recipeId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type MealLogCountAggregateOutputType = {
    id: number;
    date: number;
    mealType: number;
    description: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    notes: number;
    recipeId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type MealLogAvgAggregateInputType = {
    calories?: true;
    protein?: true;
    carbs?: true;
    fat?: true;
};
export type MealLogSumAggregateInputType = {
    calories?: true;
    protein?: true;
    carbs?: true;
    fat?: true;
};
export type MealLogMinAggregateInputType = {
    id?: true;
    date?: true;
    mealType?: true;
    description?: true;
    calories?: true;
    protein?: true;
    carbs?: true;
    fat?: true;
    notes?: true;
    recipeId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type MealLogMaxAggregateInputType = {
    id?: true;
    date?: true;
    mealType?: true;
    description?: true;
    calories?: true;
    protein?: true;
    carbs?: true;
    fat?: true;
    notes?: true;
    recipeId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type MealLogCountAggregateInputType = {
    id?: true;
    date?: true;
    mealType?: true;
    description?: true;
    calories?: true;
    protein?: true;
    carbs?: true;
    fat?: true;
    notes?: true;
    recipeId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type MealLogAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which MealLog to aggregate.
     */
    where?: Prisma.MealLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MealLogs to fetch.
     */
    orderBy?: Prisma.MealLogOrderByWithRelationInput | Prisma.MealLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.MealLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MealLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MealLogs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned MealLogs
    **/
    _count?: true | MealLogCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: MealLogAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: MealLogSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: MealLogMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: MealLogMaxAggregateInputType;
};
export type GetMealLogAggregateType<T extends MealLogAggregateArgs> = {
    [P in keyof T & keyof AggregateMealLog]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMealLog[P]> : Prisma.GetScalarType<T[P], AggregateMealLog[P]>;
};
export type MealLogGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MealLogWhereInput;
    orderBy?: Prisma.MealLogOrderByWithAggregationInput | Prisma.MealLogOrderByWithAggregationInput[];
    by: Prisma.MealLogScalarFieldEnum[] | Prisma.MealLogScalarFieldEnum;
    having?: Prisma.MealLogScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MealLogCountAggregateInputType | true;
    _avg?: MealLogAvgAggregateInputType;
    _sum?: MealLogSumAggregateInputType;
    _min?: MealLogMinAggregateInputType;
    _max?: MealLogMaxAggregateInputType;
};
export type MealLogGroupByOutputType = {
    id: string;
    date: Date;
    mealType: string;
    description: string;
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    notes: string | null;
    recipeId: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: MealLogCountAggregateOutputType | null;
    _avg: MealLogAvgAggregateOutputType | null;
    _sum: MealLogSumAggregateOutputType | null;
    _min: MealLogMinAggregateOutputType | null;
    _max: MealLogMaxAggregateOutputType | null;
};
type GetMealLogGroupByPayload<T extends MealLogGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MealLogGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MealLogGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MealLogGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MealLogGroupByOutputType[P]>;
}>>;
export type MealLogWhereInput = {
    AND?: Prisma.MealLogWhereInput | Prisma.MealLogWhereInput[];
    OR?: Prisma.MealLogWhereInput[];
    NOT?: Prisma.MealLogWhereInput | Prisma.MealLogWhereInput[];
    id?: Prisma.StringFilter<"MealLog"> | string;
    date?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
    mealType?: Prisma.StringFilter<"MealLog"> | string;
    description?: Prisma.StringFilter<"MealLog"> | string;
    calories?: Prisma.IntNullableFilter<"MealLog"> | number | null;
    protein?: Prisma.IntNullableFilter<"MealLog"> | number | null;
    carbs?: Prisma.IntNullableFilter<"MealLog"> | number | null;
    fat?: Prisma.IntNullableFilter<"MealLog"> | number | null;
    notes?: Prisma.StringNullableFilter<"MealLog"> | string | null;
    recipeId?: Prisma.StringNullableFilter<"MealLog"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
    recipe?: Prisma.XOR<Prisma.RecipeNullableScalarRelationFilter, Prisma.RecipeWhereInput> | null;
    calendarEvent?: Prisma.XOR<Prisma.CalendarEventNullableScalarRelationFilter, Prisma.CalendarEventWhereInput> | null;
};
export type MealLogOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    mealType?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    calories?: Prisma.SortOrderInput | Prisma.SortOrder;
    protein?: Prisma.SortOrderInput | Prisma.SortOrder;
    carbs?: Prisma.SortOrderInput | Prisma.SortOrder;
    fat?: Prisma.SortOrderInput | Prisma.SortOrder;
    notes?: Prisma.SortOrderInput | Prisma.SortOrder;
    recipeId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    recipe?: Prisma.RecipeOrderByWithRelationInput;
    calendarEvent?: Prisma.CalendarEventOrderByWithRelationInput;
};
export type MealLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.MealLogWhereInput | Prisma.MealLogWhereInput[];
    OR?: Prisma.MealLogWhereInput[];
    NOT?: Prisma.MealLogWhereInput | Prisma.MealLogWhereInput[];
    date?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
    mealType?: Prisma.StringFilter<"MealLog"> | string;
    description?: Prisma.StringFilter<"MealLog"> | string;
    calories?: Prisma.IntNullableFilter<"MealLog"> | number | null;
    protein?: Prisma.IntNullableFilter<"MealLog"> | number | null;
    carbs?: Prisma.IntNullableFilter<"MealLog"> | number | null;
    fat?: Prisma.IntNullableFilter<"MealLog"> | number | null;
    notes?: Prisma.StringNullableFilter<"MealLog"> | string | null;
    recipeId?: Prisma.StringNullableFilter<"MealLog"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
    recipe?: Prisma.XOR<Prisma.RecipeNullableScalarRelationFilter, Prisma.RecipeWhereInput> | null;
    calendarEvent?: Prisma.XOR<Prisma.CalendarEventNullableScalarRelationFilter, Prisma.CalendarEventWhereInput> | null;
}, "id">;
export type MealLogOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    mealType?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    calories?: Prisma.SortOrderInput | Prisma.SortOrder;
    protein?: Prisma.SortOrderInput | Prisma.SortOrder;
    carbs?: Prisma.SortOrderInput | Prisma.SortOrder;
    fat?: Prisma.SortOrderInput | Prisma.SortOrder;
    notes?: Prisma.SortOrderInput | Prisma.SortOrder;
    recipeId?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.MealLogCountOrderByAggregateInput;
    _avg?: Prisma.MealLogAvgOrderByAggregateInput;
    _max?: Prisma.MealLogMaxOrderByAggregateInput;
    _min?: Prisma.MealLogMinOrderByAggregateInput;
    _sum?: Prisma.MealLogSumOrderByAggregateInput;
};
export type MealLogScalarWhereWithAggregatesInput = {
    AND?: Prisma.MealLogScalarWhereWithAggregatesInput | Prisma.MealLogScalarWhereWithAggregatesInput[];
    OR?: Prisma.MealLogScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MealLogScalarWhereWithAggregatesInput | Prisma.MealLogScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"MealLog"> | string;
    date?: Prisma.DateTimeWithAggregatesFilter<"MealLog"> | Date | string;
    mealType?: Prisma.StringWithAggregatesFilter<"MealLog"> | string;
    description?: Prisma.StringWithAggregatesFilter<"MealLog"> | string;
    calories?: Prisma.IntNullableWithAggregatesFilter<"MealLog"> | number | null;
    protein?: Prisma.IntNullableWithAggregatesFilter<"MealLog"> | number | null;
    carbs?: Prisma.IntNullableWithAggregatesFilter<"MealLog"> | number | null;
    fat?: Prisma.IntNullableWithAggregatesFilter<"MealLog"> | number | null;
    notes?: Prisma.StringNullableWithAggregatesFilter<"MealLog"> | string | null;
    recipeId?: Prisma.StringNullableWithAggregatesFilter<"MealLog"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"MealLog"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"MealLog"> | Date | string;
};
export type MealLogCreateInput = {
    id?: string;
    date: Date | string;
    mealType: string;
    description: string;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    recipe?: Prisma.RecipeCreateNestedOneWithoutMealLogsInput;
    calendarEvent?: Prisma.CalendarEventCreateNestedOneWithoutMealLogInput;
};
export type MealLogUncheckedCreateInput = {
    id?: string;
    date: Date | string;
    mealType: string;
    description: string;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    notes?: string | null;
    recipeId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    calendarEvent?: Prisma.CalendarEventUncheckedCreateNestedOneWithoutMealLogInput;
};
export type MealLogUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mealType?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    calories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    protein?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    carbs?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    fat?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    recipe?: Prisma.RecipeUpdateOneWithoutMealLogsNestedInput;
    calendarEvent?: Prisma.CalendarEventUpdateOneWithoutMealLogNestedInput;
};
export type MealLogUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mealType?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    calories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    protein?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    carbs?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    fat?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    recipeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    calendarEvent?: Prisma.CalendarEventUncheckedUpdateOneWithoutMealLogNestedInput;
};
export type MealLogCreateManyInput = {
    id?: string;
    date: Date | string;
    mealType: string;
    description: string;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    notes?: string | null;
    recipeId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MealLogUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mealType?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    calories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    protein?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    carbs?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    fat?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MealLogUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mealType?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    calories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    protein?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    carbs?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    fat?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    recipeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MealLogNullableScalarRelationFilter = {
    is?: Prisma.MealLogWhereInput | null;
    isNot?: Prisma.MealLogWhereInput | null;
};
export type MealLogCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    mealType?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    calories?: Prisma.SortOrder;
    protein?: Prisma.SortOrder;
    carbs?: Prisma.SortOrder;
    fat?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
    recipeId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MealLogAvgOrderByAggregateInput = {
    calories?: Prisma.SortOrder;
    protein?: Prisma.SortOrder;
    carbs?: Prisma.SortOrder;
    fat?: Prisma.SortOrder;
};
export type MealLogMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    mealType?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    calories?: Prisma.SortOrder;
    protein?: Prisma.SortOrder;
    carbs?: Prisma.SortOrder;
    fat?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
    recipeId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MealLogMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    mealType?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    calories?: Prisma.SortOrder;
    protein?: Prisma.SortOrder;
    carbs?: Prisma.SortOrder;
    fat?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
    recipeId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MealLogSumOrderByAggregateInput = {
    calories?: Prisma.SortOrder;
    protein?: Prisma.SortOrder;
    carbs?: Prisma.SortOrder;
    fat?: Prisma.SortOrder;
};
export type MealLogListRelationFilter = {
    every?: Prisma.MealLogWhereInput;
    some?: Prisma.MealLogWhereInput;
    none?: Prisma.MealLogWhereInput;
};
export type MealLogOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type MealLogCreateNestedOneWithoutCalendarEventInput = {
    create?: Prisma.XOR<Prisma.MealLogCreateWithoutCalendarEventInput, Prisma.MealLogUncheckedCreateWithoutCalendarEventInput>;
    connectOrCreate?: Prisma.MealLogCreateOrConnectWithoutCalendarEventInput;
    connect?: Prisma.MealLogWhereUniqueInput;
};
export type MealLogUpdateOneWithoutCalendarEventNestedInput = {
    create?: Prisma.XOR<Prisma.MealLogCreateWithoutCalendarEventInput, Prisma.MealLogUncheckedCreateWithoutCalendarEventInput>;
    connectOrCreate?: Prisma.MealLogCreateOrConnectWithoutCalendarEventInput;
    upsert?: Prisma.MealLogUpsertWithoutCalendarEventInput;
    disconnect?: Prisma.MealLogWhereInput | boolean;
    delete?: Prisma.MealLogWhereInput | boolean;
    connect?: Prisma.MealLogWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.MealLogUpdateToOneWithWhereWithoutCalendarEventInput, Prisma.MealLogUpdateWithoutCalendarEventInput>, Prisma.MealLogUncheckedUpdateWithoutCalendarEventInput>;
};
export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type MealLogCreateNestedManyWithoutRecipeInput = {
    create?: Prisma.XOR<Prisma.MealLogCreateWithoutRecipeInput, Prisma.MealLogUncheckedCreateWithoutRecipeInput> | Prisma.MealLogCreateWithoutRecipeInput[] | Prisma.MealLogUncheckedCreateWithoutRecipeInput[];
    connectOrCreate?: Prisma.MealLogCreateOrConnectWithoutRecipeInput | Prisma.MealLogCreateOrConnectWithoutRecipeInput[];
    createMany?: Prisma.MealLogCreateManyRecipeInputEnvelope;
    connect?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
};
export type MealLogUncheckedCreateNestedManyWithoutRecipeInput = {
    create?: Prisma.XOR<Prisma.MealLogCreateWithoutRecipeInput, Prisma.MealLogUncheckedCreateWithoutRecipeInput> | Prisma.MealLogCreateWithoutRecipeInput[] | Prisma.MealLogUncheckedCreateWithoutRecipeInput[];
    connectOrCreate?: Prisma.MealLogCreateOrConnectWithoutRecipeInput | Prisma.MealLogCreateOrConnectWithoutRecipeInput[];
    createMany?: Prisma.MealLogCreateManyRecipeInputEnvelope;
    connect?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
};
export type MealLogUpdateManyWithoutRecipeNestedInput = {
    create?: Prisma.XOR<Prisma.MealLogCreateWithoutRecipeInput, Prisma.MealLogUncheckedCreateWithoutRecipeInput> | Prisma.MealLogCreateWithoutRecipeInput[] | Prisma.MealLogUncheckedCreateWithoutRecipeInput[];
    connectOrCreate?: Prisma.MealLogCreateOrConnectWithoutRecipeInput | Prisma.MealLogCreateOrConnectWithoutRecipeInput[];
    upsert?: Prisma.MealLogUpsertWithWhereUniqueWithoutRecipeInput | Prisma.MealLogUpsertWithWhereUniqueWithoutRecipeInput[];
    createMany?: Prisma.MealLogCreateManyRecipeInputEnvelope;
    set?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
    disconnect?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
    delete?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
    connect?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
    update?: Prisma.MealLogUpdateWithWhereUniqueWithoutRecipeInput | Prisma.MealLogUpdateWithWhereUniqueWithoutRecipeInput[];
    updateMany?: Prisma.MealLogUpdateManyWithWhereWithoutRecipeInput | Prisma.MealLogUpdateManyWithWhereWithoutRecipeInput[];
    deleteMany?: Prisma.MealLogScalarWhereInput | Prisma.MealLogScalarWhereInput[];
};
export type MealLogUncheckedUpdateManyWithoutRecipeNestedInput = {
    create?: Prisma.XOR<Prisma.MealLogCreateWithoutRecipeInput, Prisma.MealLogUncheckedCreateWithoutRecipeInput> | Prisma.MealLogCreateWithoutRecipeInput[] | Prisma.MealLogUncheckedCreateWithoutRecipeInput[];
    connectOrCreate?: Prisma.MealLogCreateOrConnectWithoutRecipeInput | Prisma.MealLogCreateOrConnectWithoutRecipeInput[];
    upsert?: Prisma.MealLogUpsertWithWhereUniqueWithoutRecipeInput | Prisma.MealLogUpsertWithWhereUniqueWithoutRecipeInput[];
    createMany?: Prisma.MealLogCreateManyRecipeInputEnvelope;
    set?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
    disconnect?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
    delete?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
    connect?: Prisma.MealLogWhereUniqueInput | Prisma.MealLogWhereUniqueInput[];
    update?: Prisma.MealLogUpdateWithWhereUniqueWithoutRecipeInput | Prisma.MealLogUpdateWithWhereUniqueWithoutRecipeInput[];
    updateMany?: Prisma.MealLogUpdateManyWithWhereWithoutRecipeInput | Prisma.MealLogUpdateManyWithWhereWithoutRecipeInput[];
    deleteMany?: Prisma.MealLogScalarWhereInput | Prisma.MealLogScalarWhereInput[];
};
export type MealLogCreateWithoutCalendarEventInput = {
    id?: string;
    date: Date | string;
    mealType: string;
    description: string;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    recipe?: Prisma.RecipeCreateNestedOneWithoutMealLogsInput;
};
export type MealLogUncheckedCreateWithoutCalendarEventInput = {
    id?: string;
    date: Date | string;
    mealType: string;
    description: string;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    notes?: string | null;
    recipeId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MealLogCreateOrConnectWithoutCalendarEventInput = {
    where: Prisma.MealLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.MealLogCreateWithoutCalendarEventInput, Prisma.MealLogUncheckedCreateWithoutCalendarEventInput>;
};
export type MealLogUpsertWithoutCalendarEventInput = {
    update: Prisma.XOR<Prisma.MealLogUpdateWithoutCalendarEventInput, Prisma.MealLogUncheckedUpdateWithoutCalendarEventInput>;
    create: Prisma.XOR<Prisma.MealLogCreateWithoutCalendarEventInput, Prisma.MealLogUncheckedCreateWithoutCalendarEventInput>;
    where?: Prisma.MealLogWhereInput;
};
export type MealLogUpdateToOneWithWhereWithoutCalendarEventInput = {
    where?: Prisma.MealLogWhereInput;
    data: Prisma.XOR<Prisma.MealLogUpdateWithoutCalendarEventInput, Prisma.MealLogUncheckedUpdateWithoutCalendarEventInput>;
};
export type MealLogUpdateWithoutCalendarEventInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mealType?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    calories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    protein?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    carbs?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    fat?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    recipe?: Prisma.RecipeUpdateOneWithoutMealLogsNestedInput;
};
export type MealLogUncheckedUpdateWithoutCalendarEventInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mealType?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    calories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    protein?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    carbs?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    fat?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    recipeId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MealLogCreateWithoutRecipeInput = {
    id?: string;
    date: Date | string;
    mealType: string;
    description: string;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    calendarEvent?: Prisma.CalendarEventCreateNestedOneWithoutMealLogInput;
};
export type MealLogUncheckedCreateWithoutRecipeInput = {
    id?: string;
    date: Date | string;
    mealType: string;
    description: string;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    calendarEvent?: Prisma.CalendarEventUncheckedCreateNestedOneWithoutMealLogInput;
};
export type MealLogCreateOrConnectWithoutRecipeInput = {
    where: Prisma.MealLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.MealLogCreateWithoutRecipeInput, Prisma.MealLogUncheckedCreateWithoutRecipeInput>;
};
export type MealLogCreateManyRecipeInputEnvelope = {
    data: Prisma.MealLogCreateManyRecipeInput | Prisma.MealLogCreateManyRecipeInput[];
};
export type MealLogUpsertWithWhereUniqueWithoutRecipeInput = {
    where: Prisma.MealLogWhereUniqueInput;
    update: Prisma.XOR<Prisma.MealLogUpdateWithoutRecipeInput, Prisma.MealLogUncheckedUpdateWithoutRecipeInput>;
    create: Prisma.XOR<Prisma.MealLogCreateWithoutRecipeInput, Prisma.MealLogUncheckedCreateWithoutRecipeInput>;
};
export type MealLogUpdateWithWhereUniqueWithoutRecipeInput = {
    where: Prisma.MealLogWhereUniqueInput;
    data: Prisma.XOR<Prisma.MealLogUpdateWithoutRecipeInput, Prisma.MealLogUncheckedUpdateWithoutRecipeInput>;
};
export type MealLogUpdateManyWithWhereWithoutRecipeInput = {
    where: Prisma.MealLogScalarWhereInput;
    data: Prisma.XOR<Prisma.MealLogUpdateManyMutationInput, Prisma.MealLogUncheckedUpdateManyWithoutRecipeInput>;
};
export type MealLogScalarWhereInput = {
    AND?: Prisma.MealLogScalarWhereInput | Prisma.MealLogScalarWhereInput[];
    OR?: Prisma.MealLogScalarWhereInput[];
    NOT?: Prisma.MealLogScalarWhereInput | Prisma.MealLogScalarWhereInput[];
    id?: Prisma.StringFilter<"MealLog"> | string;
    date?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
    mealType?: Prisma.StringFilter<"MealLog"> | string;
    description?: Prisma.StringFilter<"MealLog"> | string;
    calories?: Prisma.IntNullableFilter<"MealLog"> | number | null;
    protein?: Prisma.IntNullableFilter<"MealLog"> | number | null;
    carbs?: Prisma.IntNullableFilter<"MealLog"> | number | null;
    fat?: Prisma.IntNullableFilter<"MealLog"> | number | null;
    notes?: Prisma.StringNullableFilter<"MealLog"> | string | null;
    recipeId?: Prisma.StringNullableFilter<"MealLog"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"MealLog"> | Date | string;
};
export type MealLogCreateManyRecipeInput = {
    id?: string;
    date: Date | string;
    mealType: string;
    description: string;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MealLogUpdateWithoutRecipeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mealType?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    calories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    protein?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    carbs?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    fat?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    calendarEvent?: Prisma.CalendarEventUpdateOneWithoutMealLogNestedInput;
};
export type MealLogUncheckedUpdateWithoutRecipeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mealType?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    calories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    protein?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    carbs?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    fat?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    calendarEvent?: Prisma.CalendarEventUncheckedUpdateOneWithoutMealLogNestedInput;
};
export type MealLogUncheckedUpdateManyWithoutRecipeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    mealType?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    calories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    protein?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    carbs?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    fat?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MealLogSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    date?: boolean;
    mealType?: boolean;
    description?: boolean;
    calories?: boolean;
    protein?: boolean;
    carbs?: boolean;
    fat?: boolean;
    notes?: boolean;
    recipeId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    recipe?: boolean | Prisma.MealLog$recipeArgs<ExtArgs>;
    calendarEvent?: boolean | Prisma.MealLog$calendarEventArgs<ExtArgs>;
}, ExtArgs["result"]["mealLog"]>;
export type MealLogSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    date?: boolean;
    mealType?: boolean;
    description?: boolean;
    calories?: boolean;
    protein?: boolean;
    carbs?: boolean;
    fat?: boolean;
    notes?: boolean;
    recipeId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    recipe?: boolean | Prisma.MealLog$recipeArgs<ExtArgs>;
}, ExtArgs["result"]["mealLog"]>;
export type MealLogSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    date?: boolean;
    mealType?: boolean;
    description?: boolean;
    calories?: boolean;
    protein?: boolean;
    carbs?: boolean;
    fat?: boolean;
    notes?: boolean;
    recipeId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    recipe?: boolean | Prisma.MealLog$recipeArgs<ExtArgs>;
}, ExtArgs["result"]["mealLog"]>;
export type MealLogSelectScalar = {
    id?: boolean;
    date?: boolean;
    mealType?: boolean;
    description?: boolean;
    calories?: boolean;
    protein?: boolean;
    carbs?: boolean;
    fat?: boolean;
    notes?: boolean;
    recipeId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type MealLogOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "date" | "mealType" | "description" | "calories" | "protein" | "carbs" | "fat" | "notes" | "recipeId" | "createdAt" | "updatedAt", ExtArgs["result"]["mealLog"]>;
export type MealLogInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    recipe?: boolean | Prisma.MealLog$recipeArgs<ExtArgs>;
    calendarEvent?: boolean | Prisma.MealLog$calendarEventArgs<ExtArgs>;
};
export type MealLogIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    recipe?: boolean | Prisma.MealLog$recipeArgs<ExtArgs>;
};
export type MealLogIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    recipe?: boolean | Prisma.MealLog$recipeArgs<ExtArgs>;
};
export type $MealLogPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "MealLog";
    objects: {
        recipe: Prisma.$RecipePayload<ExtArgs> | null;
        calendarEvent: Prisma.$CalendarEventPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        date: Date;
        mealType: string;
        description: string;
        calories: number | null;
        protein: number | null;
        carbs: number | null;
        fat: number | null;
        notes: string | null;
        recipeId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["mealLog"]>;
    composites: {};
};
export type MealLogGetPayload<S extends boolean | null | undefined | MealLogDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MealLogPayload, S>;
export type MealLogCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MealLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MealLogCountAggregateInputType | true;
};
export interface MealLogDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['MealLog'];
        meta: {
            name: 'MealLog';
        };
    };
    /**
     * Find zero or one MealLog that matches the filter.
     * @param {MealLogFindUniqueArgs} args - Arguments to find a MealLog
     * @example
     * // Get one MealLog
     * const mealLog = await prisma.mealLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MealLogFindUniqueArgs>(args: Prisma.SelectSubset<T, MealLogFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MealLogClient<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one MealLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MealLogFindUniqueOrThrowArgs} args - Arguments to find a MealLog
     * @example
     * // Get one MealLog
     * const mealLog = await prisma.mealLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MealLogFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MealLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MealLogClient<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first MealLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealLogFindFirstArgs} args - Arguments to find a MealLog
     * @example
     * // Get one MealLog
     * const mealLog = await prisma.mealLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MealLogFindFirstArgs>(args?: Prisma.SelectSubset<T, MealLogFindFirstArgs<ExtArgs>>): Prisma.Prisma__MealLogClient<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first MealLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealLogFindFirstOrThrowArgs} args - Arguments to find a MealLog
     * @example
     * // Get one MealLog
     * const mealLog = await prisma.mealLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MealLogFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MealLogFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MealLogClient<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more MealLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MealLogs
     * const mealLogs = await prisma.mealLog.findMany()
     *
     * // Get first 10 MealLogs
     * const mealLogs = await prisma.mealLog.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const mealLogWithIdOnly = await prisma.mealLog.findMany({ select: { id: true } })
     *
     */
    findMany<T extends MealLogFindManyArgs>(args?: Prisma.SelectSubset<T, MealLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a MealLog.
     * @param {MealLogCreateArgs} args - Arguments to create a MealLog.
     * @example
     * // Create one MealLog
     * const MealLog = await prisma.mealLog.create({
     *   data: {
     *     // ... data to create a MealLog
     *   }
     * })
     *
     */
    create<T extends MealLogCreateArgs>(args: Prisma.SelectSubset<T, MealLogCreateArgs<ExtArgs>>): Prisma.Prisma__MealLogClient<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many MealLogs.
     * @param {MealLogCreateManyArgs} args - Arguments to create many MealLogs.
     * @example
     * // Create many MealLogs
     * const mealLog = await prisma.mealLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends MealLogCreateManyArgs>(args?: Prisma.SelectSubset<T, MealLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many MealLogs and returns the data saved in the database.
     * @param {MealLogCreateManyAndReturnArgs} args - Arguments to create many MealLogs.
     * @example
     * // Create many MealLogs
     * const mealLog = await prisma.mealLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many MealLogs and only return the `id`
     * const mealLogWithIdOnly = await prisma.mealLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends MealLogCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MealLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a MealLog.
     * @param {MealLogDeleteArgs} args - Arguments to delete one MealLog.
     * @example
     * // Delete one MealLog
     * const MealLog = await prisma.mealLog.delete({
     *   where: {
     *     // ... filter to delete one MealLog
     *   }
     * })
     *
     */
    delete<T extends MealLogDeleteArgs>(args: Prisma.SelectSubset<T, MealLogDeleteArgs<ExtArgs>>): Prisma.Prisma__MealLogClient<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one MealLog.
     * @param {MealLogUpdateArgs} args - Arguments to update one MealLog.
     * @example
     * // Update one MealLog
     * const mealLog = await prisma.mealLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends MealLogUpdateArgs>(args: Prisma.SelectSubset<T, MealLogUpdateArgs<ExtArgs>>): Prisma.Prisma__MealLogClient<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more MealLogs.
     * @param {MealLogDeleteManyArgs} args - Arguments to filter MealLogs to delete.
     * @example
     * // Delete a few MealLogs
     * const { count } = await prisma.mealLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends MealLogDeleteManyArgs>(args?: Prisma.SelectSubset<T, MealLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more MealLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MealLogs
     * const mealLog = await prisma.mealLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends MealLogUpdateManyArgs>(args: Prisma.SelectSubset<T, MealLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more MealLogs and returns the data updated in the database.
     * @param {MealLogUpdateManyAndReturnArgs} args - Arguments to update many MealLogs.
     * @example
     * // Update many MealLogs
     * const mealLog = await prisma.mealLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more MealLogs and only return the `id`
     * const mealLogWithIdOnly = await prisma.mealLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends MealLogUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MealLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one MealLog.
     * @param {MealLogUpsertArgs} args - Arguments to update or create a MealLog.
     * @example
     * // Update or create a MealLog
     * const mealLog = await prisma.mealLog.upsert({
     *   create: {
     *     // ... data to create a MealLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MealLog we want to update
     *   }
     * })
     */
    upsert<T extends MealLogUpsertArgs>(args: Prisma.SelectSubset<T, MealLogUpsertArgs<ExtArgs>>): Prisma.Prisma__MealLogClient<runtime.Types.Result.GetResult<Prisma.$MealLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of MealLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealLogCountArgs} args - Arguments to filter MealLogs to count.
     * @example
     * // Count the number of MealLogs
     * const count = await prisma.mealLog.count({
     *   where: {
     *     // ... the filter for the MealLogs we want to count
     *   }
     * })
    **/
    count<T extends MealLogCountArgs>(args?: Prisma.Subset<T, MealLogCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MealLogCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a MealLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MealLogAggregateArgs>(args: Prisma.Subset<T, MealLogAggregateArgs>): Prisma.PrismaPromise<GetMealLogAggregateType<T>>;
    /**
     * Group by MealLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MealLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends MealLogGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MealLogGroupByArgs['orderBy'];
    } : {
        orderBy?: MealLogGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MealLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMealLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the MealLog model
     */
    readonly fields: MealLogFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for MealLog.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__MealLogClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    recipe<T extends Prisma.MealLog$recipeArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MealLog$recipeArgs<ExtArgs>>): Prisma.Prisma__RecipeClient<runtime.Types.Result.GetResult<Prisma.$RecipePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    calendarEvent<T extends Prisma.MealLog$calendarEventArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MealLog$calendarEventArgs<ExtArgs>>): Prisma.Prisma__CalendarEventClient<runtime.Types.Result.GetResult<Prisma.$CalendarEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the MealLog model
 */
export interface MealLogFieldRefs {
    readonly id: Prisma.FieldRef<"MealLog", 'String'>;
    readonly date: Prisma.FieldRef<"MealLog", 'DateTime'>;
    readonly mealType: Prisma.FieldRef<"MealLog", 'String'>;
    readonly description: Prisma.FieldRef<"MealLog", 'String'>;
    readonly calories: Prisma.FieldRef<"MealLog", 'Int'>;
    readonly protein: Prisma.FieldRef<"MealLog", 'Int'>;
    readonly carbs: Prisma.FieldRef<"MealLog", 'Int'>;
    readonly fat: Prisma.FieldRef<"MealLog", 'Int'>;
    readonly notes: Prisma.FieldRef<"MealLog", 'String'>;
    readonly recipeId: Prisma.FieldRef<"MealLog", 'String'>;
    readonly createdAt: Prisma.FieldRef<"MealLog", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"MealLog", 'DateTime'>;
}
/**
 * MealLog findUnique
 */
export type MealLogFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MealLog
     */
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MealLogInclude<ExtArgs> | null;
    /**
     * Filter, which MealLog to fetch.
     */
    where: Prisma.MealLogWhereUniqueInput;
};
/**
 * MealLog findUniqueOrThrow
 */
export type MealLogFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MealLog
     */
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MealLogInclude<ExtArgs> | null;
    /**
     * Filter, which MealLog to fetch.
     */
    where: Prisma.MealLogWhereUniqueInput;
};
/**
 * MealLog findFirst
 */
export type MealLogFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MealLog
     */
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MealLogInclude<ExtArgs> | null;
    /**
     * Filter, which MealLog to fetch.
     */
    where?: Prisma.MealLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MealLogs to fetch.
     */
    orderBy?: Prisma.MealLogOrderByWithRelationInput | Prisma.MealLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for MealLogs.
     */
    cursor?: Prisma.MealLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MealLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MealLogs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MealLogs.
     */
    distinct?: Prisma.MealLogScalarFieldEnum | Prisma.MealLogScalarFieldEnum[];
};
/**
 * MealLog findFirstOrThrow
 */
export type MealLogFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MealLog
     */
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MealLogInclude<ExtArgs> | null;
    /**
     * Filter, which MealLog to fetch.
     */
    where?: Prisma.MealLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MealLogs to fetch.
     */
    orderBy?: Prisma.MealLogOrderByWithRelationInput | Prisma.MealLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for MealLogs.
     */
    cursor?: Prisma.MealLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MealLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MealLogs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MealLogs.
     */
    distinct?: Prisma.MealLogScalarFieldEnum | Prisma.MealLogScalarFieldEnum[];
};
/**
 * MealLog findMany
 */
export type MealLogFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MealLog
     */
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MealLogInclude<ExtArgs> | null;
    /**
     * Filter, which MealLogs to fetch.
     */
    where?: Prisma.MealLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MealLogs to fetch.
     */
    orderBy?: Prisma.MealLogOrderByWithRelationInput | Prisma.MealLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing MealLogs.
     */
    cursor?: Prisma.MealLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MealLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MealLogs.
     */
    skip?: number;
    distinct?: Prisma.MealLogScalarFieldEnum | Prisma.MealLogScalarFieldEnum[];
};
/**
 * MealLog create
 */
export type MealLogCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MealLog
     */
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MealLogInclude<ExtArgs> | null;
    /**
     * The data needed to create a MealLog.
     */
    data: Prisma.XOR<Prisma.MealLogCreateInput, Prisma.MealLogUncheckedCreateInput>;
};
/**
 * MealLog createMany
 */
export type MealLogCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many MealLogs.
     */
    data: Prisma.MealLogCreateManyInput | Prisma.MealLogCreateManyInput[];
};
/**
 * MealLog createManyAndReturn
 */
export type MealLogCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: Prisma.MealLogSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the MealLog
     */
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    /**
     * The data used to create many MealLogs.
     */
    data: Prisma.MealLogCreateManyInput | Prisma.MealLogCreateManyInput[];
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MealLogIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * MealLog update
 */
export type MealLogUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MealLog
     */
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MealLogInclude<ExtArgs> | null;
    /**
     * The data needed to update a MealLog.
     */
    data: Prisma.XOR<Prisma.MealLogUpdateInput, Prisma.MealLogUncheckedUpdateInput>;
    /**
     * Choose, which MealLog to update.
     */
    where: Prisma.MealLogWhereUniqueInput;
};
/**
 * MealLog updateMany
 */
export type MealLogUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update MealLogs.
     */
    data: Prisma.XOR<Prisma.MealLogUpdateManyMutationInput, Prisma.MealLogUncheckedUpdateManyInput>;
    /**
     * Filter which MealLogs to update
     */
    where?: Prisma.MealLogWhereInput;
    /**
     * Limit how many MealLogs to update.
     */
    limit?: number;
};
/**
 * MealLog updateManyAndReturn
 */
export type MealLogUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: Prisma.MealLogSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the MealLog
     */
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    /**
     * The data used to update MealLogs.
     */
    data: Prisma.XOR<Prisma.MealLogUpdateManyMutationInput, Prisma.MealLogUncheckedUpdateManyInput>;
    /**
     * Filter which MealLogs to update
     */
    where?: Prisma.MealLogWhereInput;
    /**
     * Limit how many MealLogs to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MealLogIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * MealLog upsert
 */
export type MealLogUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MealLog
     */
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MealLogInclude<ExtArgs> | null;
    /**
     * The filter to search for the MealLog to update in case it exists.
     */
    where: Prisma.MealLogWhereUniqueInput;
    /**
     * In case the MealLog found by the `where` argument doesn't exist, create a new MealLog with this data.
     */
    create: Prisma.XOR<Prisma.MealLogCreateInput, Prisma.MealLogUncheckedCreateInput>;
    /**
     * In case the MealLog was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.MealLogUpdateInput, Prisma.MealLogUncheckedUpdateInput>;
};
/**
 * MealLog delete
 */
export type MealLogDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MealLog
     */
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MealLogInclude<ExtArgs> | null;
    /**
     * Filter which MealLog to delete.
     */
    where: Prisma.MealLogWhereUniqueInput;
};
/**
 * MealLog deleteMany
 */
export type MealLogDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which MealLogs to delete
     */
    where?: Prisma.MealLogWhereInput;
    /**
     * Limit how many MealLogs to delete.
     */
    limit?: number;
};
/**
 * MealLog.recipe
 */
export type MealLog$recipeArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe
     */
    select?: Prisma.RecipeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Recipe
     */
    omit?: Prisma.RecipeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RecipeInclude<ExtArgs> | null;
    where?: Prisma.RecipeWhereInput;
};
/**
 * MealLog.calendarEvent
 */
export type MealLog$calendarEventArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CalendarEvent
     */
    select?: Prisma.CalendarEventSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CalendarEvent
     */
    omit?: Prisma.CalendarEventOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CalendarEventInclude<ExtArgs> | null;
    where?: Prisma.CalendarEventWhereInput;
};
/**
 * MealLog without action
 */
export type MealLogDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MealLog
     */
    select?: Prisma.MealLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MealLog
     */
    omit?: Prisma.MealLogOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MealLogInclude<ExtArgs> | null;
};
export {};
