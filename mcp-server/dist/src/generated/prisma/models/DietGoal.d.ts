import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model DietGoal
 *
 */
export type DietGoalModel = runtime.Types.Result.DefaultSelection<Prisma.$DietGoalPayload>;
export type AggregateDietGoal = {
    _count: DietGoalCountAggregateOutputType | null;
    _avg: DietGoalAvgAggregateOutputType | null;
    _sum: DietGoalSumAggregateOutputType | null;
    _min: DietGoalMinAggregateOutputType | null;
    _max: DietGoalMaxAggregateOutputType | null;
};
export type DietGoalAvgAggregateOutputType = {
    targetCalories: number | null;
    targetProtein: number | null;
    targetCarbs: number | null;
    targetFat: number | null;
};
export type DietGoalSumAggregateOutputType = {
    targetCalories: number | null;
    targetProtein: number | null;
    targetCarbs: number | null;
    targetFat: number | null;
};
export type DietGoalMinAggregateOutputType = {
    id: string | null;
    targetCalories: number | null;
    targetProtein: number | null;
    targetCarbs: number | null;
    targetFat: number | null;
    activeFrom: Date | null;
    createdAt: Date | null;
};
export type DietGoalMaxAggregateOutputType = {
    id: string | null;
    targetCalories: number | null;
    targetProtein: number | null;
    targetCarbs: number | null;
    targetFat: number | null;
    activeFrom: Date | null;
    createdAt: Date | null;
};
export type DietGoalCountAggregateOutputType = {
    id: number;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
    activeFrom: number;
    createdAt: number;
    _all: number;
};
export type DietGoalAvgAggregateInputType = {
    targetCalories?: true;
    targetProtein?: true;
    targetCarbs?: true;
    targetFat?: true;
};
export type DietGoalSumAggregateInputType = {
    targetCalories?: true;
    targetProtein?: true;
    targetCarbs?: true;
    targetFat?: true;
};
export type DietGoalMinAggregateInputType = {
    id?: true;
    targetCalories?: true;
    targetProtein?: true;
    targetCarbs?: true;
    targetFat?: true;
    activeFrom?: true;
    createdAt?: true;
};
export type DietGoalMaxAggregateInputType = {
    id?: true;
    targetCalories?: true;
    targetProtein?: true;
    targetCarbs?: true;
    targetFat?: true;
    activeFrom?: true;
    createdAt?: true;
};
export type DietGoalCountAggregateInputType = {
    id?: true;
    targetCalories?: true;
    targetProtein?: true;
    targetCarbs?: true;
    targetFat?: true;
    activeFrom?: true;
    createdAt?: true;
    _all?: true;
};
export type DietGoalAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which DietGoal to aggregate.
     */
    where?: Prisma.DietGoalWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DietGoals to fetch.
     */
    orderBy?: Prisma.DietGoalOrderByWithRelationInput | Prisma.DietGoalOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.DietGoalWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DietGoals from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DietGoals.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned DietGoals
    **/
    _count?: true | DietGoalCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: DietGoalAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: DietGoalSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: DietGoalMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: DietGoalMaxAggregateInputType;
};
export type GetDietGoalAggregateType<T extends DietGoalAggregateArgs> = {
    [P in keyof T & keyof AggregateDietGoal]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateDietGoal[P]> : Prisma.GetScalarType<T[P], AggregateDietGoal[P]>;
};
export type DietGoalGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DietGoalWhereInput;
    orderBy?: Prisma.DietGoalOrderByWithAggregationInput | Prisma.DietGoalOrderByWithAggregationInput[];
    by: Prisma.DietGoalScalarFieldEnum[] | Prisma.DietGoalScalarFieldEnum;
    having?: Prisma.DietGoalScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DietGoalCountAggregateInputType | true;
    _avg?: DietGoalAvgAggregateInputType;
    _sum?: DietGoalSumAggregateInputType;
    _min?: DietGoalMinAggregateInputType;
    _max?: DietGoalMaxAggregateInputType;
};
export type DietGoalGroupByOutputType = {
    id: string;
    targetCalories: number | null;
    targetProtein: number | null;
    targetCarbs: number | null;
    targetFat: number | null;
    activeFrom: Date;
    createdAt: Date;
    _count: DietGoalCountAggregateOutputType | null;
    _avg: DietGoalAvgAggregateOutputType | null;
    _sum: DietGoalSumAggregateOutputType | null;
    _min: DietGoalMinAggregateOutputType | null;
    _max: DietGoalMaxAggregateOutputType | null;
};
type GetDietGoalGroupByPayload<T extends DietGoalGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<DietGoalGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof DietGoalGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], DietGoalGroupByOutputType[P]> : Prisma.GetScalarType<T[P], DietGoalGroupByOutputType[P]>;
}>>;
export type DietGoalWhereInput = {
    AND?: Prisma.DietGoalWhereInput | Prisma.DietGoalWhereInput[];
    OR?: Prisma.DietGoalWhereInput[];
    NOT?: Prisma.DietGoalWhereInput | Prisma.DietGoalWhereInput[];
    id?: Prisma.StringFilter<"DietGoal"> | string;
    targetCalories?: Prisma.IntNullableFilter<"DietGoal"> | number | null;
    targetProtein?: Prisma.IntNullableFilter<"DietGoal"> | number | null;
    targetCarbs?: Prisma.IntNullableFilter<"DietGoal"> | number | null;
    targetFat?: Prisma.IntNullableFilter<"DietGoal"> | number | null;
    activeFrom?: Prisma.DateTimeFilter<"DietGoal"> | Date | string;
    createdAt?: Prisma.DateTimeFilter<"DietGoal"> | Date | string;
};
export type DietGoalOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    targetCalories?: Prisma.SortOrderInput | Prisma.SortOrder;
    targetProtein?: Prisma.SortOrderInput | Prisma.SortOrder;
    targetCarbs?: Prisma.SortOrderInput | Prisma.SortOrder;
    targetFat?: Prisma.SortOrderInput | Prisma.SortOrder;
    activeFrom?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DietGoalWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.DietGoalWhereInput | Prisma.DietGoalWhereInput[];
    OR?: Prisma.DietGoalWhereInput[];
    NOT?: Prisma.DietGoalWhereInput | Prisma.DietGoalWhereInput[];
    targetCalories?: Prisma.IntNullableFilter<"DietGoal"> | number | null;
    targetProtein?: Prisma.IntNullableFilter<"DietGoal"> | number | null;
    targetCarbs?: Prisma.IntNullableFilter<"DietGoal"> | number | null;
    targetFat?: Prisma.IntNullableFilter<"DietGoal"> | number | null;
    activeFrom?: Prisma.DateTimeFilter<"DietGoal"> | Date | string;
    createdAt?: Prisma.DateTimeFilter<"DietGoal"> | Date | string;
}, "id">;
export type DietGoalOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    targetCalories?: Prisma.SortOrderInput | Prisma.SortOrder;
    targetProtein?: Prisma.SortOrderInput | Prisma.SortOrder;
    targetCarbs?: Prisma.SortOrderInput | Prisma.SortOrder;
    targetFat?: Prisma.SortOrderInput | Prisma.SortOrder;
    activeFrom?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.DietGoalCountOrderByAggregateInput;
    _avg?: Prisma.DietGoalAvgOrderByAggregateInput;
    _max?: Prisma.DietGoalMaxOrderByAggregateInput;
    _min?: Prisma.DietGoalMinOrderByAggregateInput;
    _sum?: Prisma.DietGoalSumOrderByAggregateInput;
};
export type DietGoalScalarWhereWithAggregatesInput = {
    AND?: Prisma.DietGoalScalarWhereWithAggregatesInput | Prisma.DietGoalScalarWhereWithAggregatesInput[];
    OR?: Prisma.DietGoalScalarWhereWithAggregatesInput[];
    NOT?: Prisma.DietGoalScalarWhereWithAggregatesInput | Prisma.DietGoalScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"DietGoal"> | string;
    targetCalories?: Prisma.IntNullableWithAggregatesFilter<"DietGoal"> | number | null;
    targetProtein?: Prisma.IntNullableWithAggregatesFilter<"DietGoal"> | number | null;
    targetCarbs?: Prisma.IntNullableWithAggregatesFilter<"DietGoal"> | number | null;
    targetFat?: Prisma.IntNullableWithAggregatesFilter<"DietGoal"> | number | null;
    activeFrom?: Prisma.DateTimeWithAggregatesFilter<"DietGoal"> | Date | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"DietGoal"> | Date | string;
};
export type DietGoalCreateInput = {
    id?: string;
    targetCalories?: number | null;
    targetProtein?: number | null;
    targetCarbs?: number | null;
    targetFat?: number | null;
    activeFrom?: Date | string;
    createdAt?: Date | string;
};
export type DietGoalUncheckedCreateInput = {
    id?: string;
    targetCalories?: number | null;
    targetProtein?: number | null;
    targetCarbs?: number | null;
    targetFat?: number | null;
    activeFrom?: Date | string;
    createdAt?: Date | string;
};
export type DietGoalUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    targetCalories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetProtein?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetCarbs?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetFat?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    activeFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DietGoalUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    targetCalories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetProtein?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetCarbs?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetFat?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    activeFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DietGoalCreateManyInput = {
    id?: string;
    targetCalories?: number | null;
    targetProtein?: number | null;
    targetCarbs?: number | null;
    targetFat?: number | null;
    activeFrom?: Date | string;
    createdAt?: Date | string;
};
export type DietGoalUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    targetCalories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetProtein?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetCarbs?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetFat?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    activeFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DietGoalUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    targetCalories?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetProtein?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetCarbs?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    targetFat?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    activeFrom?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DietGoalCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    targetCalories?: Prisma.SortOrder;
    targetProtein?: Prisma.SortOrder;
    targetCarbs?: Prisma.SortOrder;
    targetFat?: Prisma.SortOrder;
    activeFrom?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DietGoalAvgOrderByAggregateInput = {
    targetCalories?: Prisma.SortOrder;
    targetProtein?: Prisma.SortOrder;
    targetCarbs?: Prisma.SortOrder;
    targetFat?: Prisma.SortOrder;
};
export type DietGoalMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    targetCalories?: Prisma.SortOrder;
    targetProtein?: Prisma.SortOrder;
    targetCarbs?: Prisma.SortOrder;
    targetFat?: Prisma.SortOrder;
    activeFrom?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DietGoalMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    targetCalories?: Prisma.SortOrder;
    targetProtein?: Prisma.SortOrder;
    targetCarbs?: Prisma.SortOrder;
    targetFat?: Prisma.SortOrder;
    activeFrom?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DietGoalSumOrderByAggregateInput = {
    targetCalories?: Prisma.SortOrder;
    targetProtein?: Prisma.SortOrder;
    targetCarbs?: Prisma.SortOrder;
    targetFat?: Prisma.SortOrder;
};
export type DietGoalSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    targetCalories?: boolean;
    targetProtein?: boolean;
    targetCarbs?: boolean;
    targetFat?: boolean;
    activeFrom?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["dietGoal"]>;
export type DietGoalSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    targetCalories?: boolean;
    targetProtein?: boolean;
    targetCarbs?: boolean;
    targetFat?: boolean;
    activeFrom?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["dietGoal"]>;
export type DietGoalSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    targetCalories?: boolean;
    targetProtein?: boolean;
    targetCarbs?: boolean;
    targetFat?: boolean;
    activeFrom?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["dietGoal"]>;
export type DietGoalSelectScalar = {
    id?: boolean;
    targetCalories?: boolean;
    targetProtein?: boolean;
    targetCarbs?: boolean;
    targetFat?: boolean;
    activeFrom?: boolean;
    createdAt?: boolean;
};
export type DietGoalOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "targetCalories" | "targetProtein" | "targetCarbs" | "targetFat" | "activeFrom" | "createdAt", ExtArgs["result"]["dietGoal"]>;
export type $DietGoalPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "DietGoal";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        targetCalories: number | null;
        targetProtein: number | null;
        targetCarbs: number | null;
        targetFat: number | null;
        activeFrom: Date;
        createdAt: Date;
    }, ExtArgs["result"]["dietGoal"]>;
    composites: {};
};
export type DietGoalGetPayload<S extends boolean | null | undefined | DietGoalDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$DietGoalPayload, S>;
export type DietGoalCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<DietGoalFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: DietGoalCountAggregateInputType | true;
};
export interface DietGoalDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['DietGoal'];
        meta: {
            name: 'DietGoal';
        };
    };
    /**
     * Find zero or one DietGoal that matches the filter.
     * @param {DietGoalFindUniqueArgs} args - Arguments to find a DietGoal
     * @example
     * // Get one DietGoal
     * const dietGoal = await prisma.dietGoal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DietGoalFindUniqueArgs>(args: Prisma.SelectSubset<T, DietGoalFindUniqueArgs<ExtArgs>>): Prisma.Prisma__DietGoalClient<runtime.Types.Result.GetResult<Prisma.$DietGoalPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one DietGoal that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DietGoalFindUniqueOrThrowArgs} args - Arguments to find a DietGoal
     * @example
     * // Get one DietGoal
     * const dietGoal = await prisma.dietGoal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DietGoalFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, DietGoalFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__DietGoalClient<runtime.Types.Result.GetResult<Prisma.$DietGoalPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first DietGoal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DietGoalFindFirstArgs} args - Arguments to find a DietGoal
     * @example
     * // Get one DietGoal
     * const dietGoal = await prisma.dietGoal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DietGoalFindFirstArgs>(args?: Prisma.SelectSubset<T, DietGoalFindFirstArgs<ExtArgs>>): Prisma.Prisma__DietGoalClient<runtime.Types.Result.GetResult<Prisma.$DietGoalPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first DietGoal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DietGoalFindFirstOrThrowArgs} args - Arguments to find a DietGoal
     * @example
     * // Get one DietGoal
     * const dietGoal = await prisma.dietGoal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DietGoalFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, DietGoalFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__DietGoalClient<runtime.Types.Result.GetResult<Prisma.$DietGoalPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more DietGoals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DietGoalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DietGoals
     * const dietGoals = await prisma.dietGoal.findMany()
     *
     * // Get first 10 DietGoals
     * const dietGoals = await prisma.dietGoal.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const dietGoalWithIdOnly = await prisma.dietGoal.findMany({ select: { id: true } })
     *
     */
    findMany<T extends DietGoalFindManyArgs>(args?: Prisma.SelectSubset<T, DietGoalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DietGoalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a DietGoal.
     * @param {DietGoalCreateArgs} args - Arguments to create a DietGoal.
     * @example
     * // Create one DietGoal
     * const DietGoal = await prisma.dietGoal.create({
     *   data: {
     *     // ... data to create a DietGoal
     *   }
     * })
     *
     */
    create<T extends DietGoalCreateArgs>(args: Prisma.SelectSubset<T, DietGoalCreateArgs<ExtArgs>>): Prisma.Prisma__DietGoalClient<runtime.Types.Result.GetResult<Prisma.$DietGoalPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many DietGoals.
     * @param {DietGoalCreateManyArgs} args - Arguments to create many DietGoals.
     * @example
     * // Create many DietGoals
     * const dietGoal = await prisma.dietGoal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends DietGoalCreateManyArgs>(args?: Prisma.SelectSubset<T, DietGoalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many DietGoals and returns the data saved in the database.
     * @param {DietGoalCreateManyAndReturnArgs} args - Arguments to create many DietGoals.
     * @example
     * // Create many DietGoals
     * const dietGoal = await prisma.dietGoal.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many DietGoals and only return the `id`
     * const dietGoalWithIdOnly = await prisma.dietGoal.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends DietGoalCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, DietGoalCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DietGoalPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a DietGoal.
     * @param {DietGoalDeleteArgs} args - Arguments to delete one DietGoal.
     * @example
     * // Delete one DietGoal
     * const DietGoal = await prisma.dietGoal.delete({
     *   where: {
     *     // ... filter to delete one DietGoal
     *   }
     * })
     *
     */
    delete<T extends DietGoalDeleteArgs>(args: Prisma.SelectSubset<T, DietGoalDeleteArgs<ExtArgs>>): Prisma.Prisma__DietGoalClient<runtime.Types.Result.GetResult<Prisma.$DietGoalPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one DietGoal.
     * @param {DietGoalUpdateArgs} args - Arguments to update one DietGoal.
     * @example
     * // Update one DietGoal
     * const dietGoal = await prisma.dietGoal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends DietGoalUpdateArgs>(args: Prisma.SelectSubset<T, DietGoalUpdateArgs<ExtArgs>>): Prisma.Prisma__DietGoalClient<runtime.Types.Result.GetResult<Prisma.$DietGoalPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more DietGoals.
     * @param {DietGoalDeleteManyArgs} args - Arguments to filter DietGoals to delete.
     * @example
     * // Delete a few DietGoals
     * const { count } = await prisma.dietGoal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends DietGoalDeleteManyArgs>(args?: Prisma.SelectSubset<T, DietGoalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more DietGoals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DietGoalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DietGoals
     * const dietGoal = await prisma.dietGoal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends DietGoalUpdateManyArgs>(args: Prisma.SelectSubset<T, DietGoalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more DietGoals and returns the data updated in the database.
     * @param {DietGoalUpdateManyAndReturnArgs} args - Arguments to update many DietGoals.
     * @example
     * // Update many DietGoals
     * const dietGoal = await prisma.dietGoal.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more DietGoals and only return the `id`
     * const dietGoalWithIdOnly = await prisma.dietGoal.updateManyAndReturn({
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
    updateManyAndReturn<T extends DietGoalUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, DietGoalUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DietGoalPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one DietGoal.
     * @param {DietGoalUpsertArgs} args - Arguments to update or create a DietGoal.
     * @example
     * // Update or create a DietGoal
     * const dietGoal = await prisma.dietGoal.upsert({
     *   create: {
     *     // ... data to create a DietGoal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DietGoal we want to update
     *   }
     * })
     */
    upsert<T extends DietGoalUpsertArgs>(args: Prisma.SelectSubset<T, DietGoalUpsertArgs<ExtArgs>>): Prisma.Prisma__DietGoalClient<runtime.Types.Result.GetResult<Prisma.$DietGoalPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of DietGoals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DietGoalCountArgs} args - Arguments to filter DietGoals to count.
     * @example
     * // Count the number of DietGoals
     * const count = await prisma.dietGoal.count({
     *   where: {
     *     // ... the filter for the DietGoals we want to count
     *   }
     * })
    **/
    count<T extends DietGoalCountArgs>(args?: Prisma.Subset<T, DietGoalCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], DietGoalCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a DietGoal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DietGoalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DietGoalAggregateArgs>(args: Prisma.Subset<T, DietGoalAggregateArgs>): Prisma.PrismaPromise<GetDietGoalAggregateType<T>>;
    /**
     * Group by DietGoal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DietGoalGroupByArgs} args - Group by arguments.
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
    groupBy<T extends DietGoalGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: DietGoalGroupByArgs['orderBy'];
    } : {
        orderBy?: DietGoalGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, DietGoalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDietGoalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the DietGoal model
     */
    readonly fields: DietGoalFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for DietGoal.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__DietGoalClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
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
 * Fields of the DietGoal model
 */
export interface DietGoalFieldRefs {
    readonly id: Prisma.FieldRef<"DietGoal", 'String'>;
    readonly targetCalories: Prisma.FieldRef<"DietGoal", 'Int'>;
    readonly targetProtein: Prisma.FieldRef<"DietGoal", 'Int'>;
    readonly targetCarbs: Prisma.FieldRef<"DietGoal", 'Int'>;
    readonly targetFat: Prisma.FieldRef<"DietGoal", 'Int'>;
    readonly activeFrom: Prisma.FieldRef<"DietGoal", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"DietGoal", 'DateTime'>;
}
/**
 * DietGoal findUnique
 */
export type DietGoalFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DietGoal
     */
    select?: Prisma.DietGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DietGoal
     */
    omit?: Prisma.DietGoalOmit<ExtArgs> | null;
    /**
     * Filter, which DietGoal to fetch.
     */
    where: Prisma.DietGoalWhereUniqueInput;
};
/**
 * DietGoal findUniqueOrThrow
 */
export type DietGoalFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DietGoal
     */
    select?: Prisma.DietGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DietGoal
     */
    omit?: Prisma.DietGoalOmit<ExtArgs> | null;
    /**
     * Filter, which DietGoal to fetch.
     */
    where: Prisma.DietGoalWhereUniqueInput;
};
/**
 * DietGoal findFirst
 */
export type DietGoalFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DietGoal
     */
    select?: Prisma.DietGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DietGoal
     */
    omit?: Prisma.DietGoalOmit<ExtArgs> | null;
    /**
     * Filter, which DietGoal to fetch.
     */
    where?: Prisma.DietGoalWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DietGoals to fetch.
     */
    orderBy?: Prisma.DietGoalOrderByWithRelationInput | Prisma.DietGoalOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DietGoals.
     */
    cursor?: Prisma.DietGoalWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DietGoals from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DietGoals.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DietGoals.
     */
    distinct?: Prisma.DietGoalScalarFieldEnum | Prisma.DietGoalScalarFieldEnum[];
};
/**
 * DietGoal findFirstOrThrow
 */
export type DietGoalFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DietGoal
     */
    select?: Prisma.DietGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DietGoal
     */
    omit?: Prisma.DietGoalOmit<ExtArgs> | null;
    /**
     * Filter, which DietGoal to fetch.
     */
    where?: Prisma.DietGoalWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DietGoals to fetch.
     */
    orderBy?: Prisma.DietGoalOrderByWithRelationInput | Prisma.DietGoalOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DietGoals.
     */
    cursor?: Prisma.DietGoalWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DietGoals from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DietGoals.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DietGoals.
     */
    distinct?: Prisma.DietGoalScalarFieldEnum | Prisma.DietGoalScalarFieldEnum[];
};
/**
 * DietGoal findMany
 */
export type DietGoalFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DietGoal
     */
    select?: Prisma.DietGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DietGoal
     */
    omit?: Prisma.DietGoalOmit<ExtArgs> | null;
    /**
     * Filter, which DietGoals to fetch.
     */
    where?: Prisma.DietGoalWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DietGoals to fetch.
     */
    orderBy?: Prisma.DietGoalOrderByWithRelationInput | Prisma.DietGoalOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing DietGoals.
     */
    cursor?: Prisma.DietGoalWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DietGoals from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DietGoals.
     */
    skip?: number;
    distinct?: Prisma.DietGoalScalarFieldEnum | Prisma.DietGoalScalarFieldEnum[];
};
/**
 * DietGoal create
 */
export type DietGoalCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DietGoal
     */
    select?: Prisma.DietGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DietGoal
     */
    omit?: Prisma.DietGoalOmit<ExtArgs> | null;
    /**
     * The data needed to create a DietGoal.
     */
    data?: Prisma.XOR<Prisma.DietGoalCreateInput, Prisma.DietGoalUncheckedCreateInput>;
};
/**
 * DietGoal createMany
 */
export type DietGoalCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many DietGoals.
     */
    data: Prisma.DietGoalCreateManyInput | Prisma.DietGoalCreateManyInput[];
};
/**
 * DietGoal createManyAndReturn
 */
export type DietGoalCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DietGoal
     */
    select?: Prisma.DietGoalSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the DietGoal
     */
    omit?: Prisma.DietGoalOmit<ExtArgs> | null;
    /**
     * The data used to create many DietGoals.
     */
    data: Prisma.DietGoalCreateManyInput | Prisma.DietGoalCreateManyInput[];
};
/**
 * DietGoal update
 */
export type DietGoalUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DietGoal
     */
    select?: Prisma.DietGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DietGoal
     */
    omit?: Prisma.DietGoalOmit<ExtArgs> | null;
    /**
     * The data needed to update a DietGoal.
     */
    data: Prisma.XOR<Prisma.DietGoalUpdateInput, Prisma.DietGoalUncheckedUpdateInput>;
    /**
     * Choose, which DietGoal to update.
     */
    where: Prisma.DietGoalWhereUniqueInput;
};
/**
 * DietGoal updateMany
 */
export type DietGoalUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update DietGoals.
     */
    data: Prisma.XOR<Prisma.DietGoalUpdateManyMutationInput, Prisma.DietGoalUncheckedUpdateManyInput>;
    /**
     * Filter which DietGoals to update
     */
    where?: Prisma.DietGoalWhereInput;
    /**
     * Limit how many DietGoals to update.
     */
    limit?: number;
};
/**
 * DietGoal updateManyAndReturn
 */
export type DietGoalUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DietGoal
     */
    select?: Prisma.DietGoalSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the DietGoal
     */
    omit?: Prisma.DietGoalOmit<ExtArgs> | null;
    /**
     * The data used to update DietGoals.
     */
    data: Prisma.XOR<Prisma.DietGoalUpdateManyMutationInput, Prisma.DietGoalUncheckedUpdateManyInput>;
    /**
     * Filter which DietGoals to update
     */
    where?: Prisma.DietGoalWhereInput;
    /**
     * Limit how many DietGoals to update.
     */
    limit?: number;
};
/**
 * DietGoal upsert
 */
export type DietGoalUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DietGoal
     */
    select?: Prisma.DietGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DietGoal
     */
    omit?: Prisma.DietGoalOmit<ExtArgs> | null;
    /**
     * The filter to search for the DietGoal to update in case it exists.
     */
    where: Prisma.DietGoalWhereUniqueInput;
    /**
     * In case the DietGoal found by the `where` argument doesn't exist, create a new DietGoal with this data.
     */
    create: Prisma.XOR<Prisma.DietGoalCreateInput, Prisma.DietGoalUncheckedCreateInput>;
    /**
     * In case the DietGoal was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.DietGoalUpdateInput, Prisma.DietGoalUncheckedUpdateInput>;
};
/**
 * DietGoal delete
 */
export type DietGoalDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DietGoal
     */
    select?: Prisma.DietGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DietGoal
     */
    omit?: Prisma.DietGoalOmit<ExtArgs> | null;
    /**
     * Filter which DietGoal to delete.
     */
    where: Prisma.DietGoalWhereUniqueInput;
};
/**
 * DietGoal deleteMany
 */
export type DietGoalDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which DietGoals to delete
     */
    where?: Prisma.DietGoalWhereInput;
    /**
     * Limit how many DietGoals to delete.
     */
    limit?: number;
};
/**
 * DietGoal without action
 */
export type DietGoalDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DietGoal
     */
    select?: Prisma.DietGoalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DietGoal
     */
    omit?: Prisma.DietGoalOmit<ExtArgs> | null;
};
export {};
