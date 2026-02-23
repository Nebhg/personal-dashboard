import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model ScheduleBlock
 *
 */
export type ScheduleBlockModel = runtime.Types.Result.DefaultSelection<Prisma.$ScheduleBlockPayload>;
export type AggregateScheduleBlock = {
    _count: ScheduleBlockCountAggregateOutputType | null;
    _min: ScheduleBlockMinAggregateOutputType | null;
    _max: ScheduleBlockMaxAggregateOutputType | null;
};
export type ScheduleBlockMinAggregateOutputType = {
    id: string | null;
    title: string | null;
    start: Date | null;
    end: Date | null;
    allDay: boolean | null;
    category: string | null;
    color: string | null;
    notes: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ScheduleBlockMaxAggregateOutputType = {
    id: string | null;
    title: string | null;
    start: Date | null;
    end: Date | null;
    allDay: boolean | null;
    category: string | null;
    color: string | null;
    notes: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ScheduleBlockCountAggregateOutputType = {
    id: number;
    title: number;
    start: number;
    end: number;
    allDay: number;
    category: number;
    color: number;
    notes: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ScheduleBlockMinAggregateInputType = {
    id?: true;
    title?: true;
    start?: true;
    end?: true;
    allDay?: true;
    category?: true;
    color?: true;
    notes?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ScheduleBlockMaxAggregateInputType = {
    id?: true;
    title?: true;
    start?: true;
    end?: true;
    allDay?: true;
    category?: true;
    color?: true;
    notes?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ScheduleBlockCountAggregateInputType = {
    id?: true;
    title?: true;
    start?: true;
    end?: true;
    allDay?: true;
    category?: true;
    color?: true;
    notes?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ScheduleBlockAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ScheduleBlock to aggregate.
     */
    where?: Prisma.ScheduleBlockWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ScheduleBlocks to fetch.
     */
    orderBy?: Prisma.ScheduleBlockOrderByWithRelationInput | Prisma.ScheduleBlockOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.ScheduleBlockWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ScheduleBlocks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ScheduleBlocks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ScheduleBlocks
    **/
    _count?: true | ScheduleBlockCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ScheduleBlockMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ScheduleBlockMaxAggregateInputType;
};
export type GetScheduleBlockAggregateType<T extends ScheduleBlockAggregateArgs> = {
    [P in keyof T & keyof AggregateScheduleBlock]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateScheduleBlock[P]> : Prisma.GetScalarType<T[P], AggregateScheduleBlock[P]>;
};
export type ScheduleBlockGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ScheduleBlockWhereInput;
    orderBy?: Prisma.ScheduleBlockOrderByWithAggregationInput | Prisma.ScheduleBlockOrderByWithAggregationInput[];
    by: Prisma.ScheduleBlockScalarFieldEnum[] | Prisma.ScheduleBlockScalarFieldEnum;
    having?: Prisma.ScheduleBlockScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ScheduleBlockCountAggregateInputType | true;
    _min?: ScheduleBlockMinAggregateInputType;
    _max?: ScheduleBlockMaxAggregateInputType;
};
export type ScheduleBlockGroupByOutputType = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    category: string;
    color: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: ScheduleBlockCountAggregateOutputType | null;
    _min: ScheduleBlockMinAggregateOutputType | null;
    _max: ScheduleBlockMaxAggregateOutputType | null;
};
type GetScheduleBlockGroupByPayload<T extends ScheduleBlockGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ScheduleBlockGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ScheduleBlockGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ScheduleBlockGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ScheduleBlockGroupByOutputType[P]>;
}>>;
export type ScheduleBlockWhereInput = {
    AND?: Prisma.ScheduleBlockWhereInput | Prisma.ScheduleBlockWhereInput[];
    OR?: Prisma.ScheduleBlockWhereInput[];
    NOT?: Prisma.ScheduleBlockWhereInput | Prisma.ScheduleBlockWhereInput[];
    id?: Prisma.StringFilter<"ScheduleBlock"> | string;
    title?: Prisma.StringFilter<"ScheduleBlock"> | string;
    start?: Prisma.DateTimeFilter<"ScheduleBlock"> | Date | string;
    end?: Prisma.DateTimeFilter<"ScheduleBlock"> | Date | string;
    allDay?: Prisma.BoolFilter<"ScheduleBlock"> | boolean;
    category?: Prisma.StringFilter<"ScheduleBlock"> | string;
    color?: Prisma.StringNullableFilter<"ScheduleBlock"> | string | null;
    notes?: Prisma.StringNullableFilter<"ScheduleBlock"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"ScheduleBlock"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ScheduleBlock"> | Date | string;
    calendarEvent?: Prisma.XOR<Prisma.CalendarEventNullableScalarRelationFilter, Prisma.CalendarEventWhereInput> | null;
};
export type ScheduleBlockOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    start?: Prisma.SortOrder;
    end?: Prisma.SortOrder;
    allDay?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    color?: Prisma.SortOrderInput | Prisma.SortOrder;
    notes?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    calendarEvent?: Prisma.CalendarEventOrderByWithRelationInput;
};
export type ScheduleBlockWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ScheduleBlockWhereInput | Prisma.ScheduleBlockWhereInput[];
    OR?: Prisma.ScheduleBlockWhereInput[];
    NOT?: Prisma.ScheduleBlockWhereInput | Prisma.ScheduleBlockWhereInput[];
    title?: Prisma.StringFilter<"ScheduleBlock"> | string;
    start?: Prisma.DateTimeFilter<"ScheduleBlock"> | Date | string;
    end?: Prisma.DateTimeFilter<"ScheduleBlock"> | Date | string;
    allDay?: Prisma.BoolFilter<"ScheduleBlock"> | boolean;
    category?: Prisma.StringFilter<"ScheduleBlock"> | string;
    color?: Prisma.StringNullableFilter<"ScheduleBlock"> | string | null;
    notes?: Prisma.StringNullableFilter<"ScheduleBlock"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"ScheduleBlock"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ScheduleBlock"> | Date | string;
    calendarEvent?: Prisma.XOR<Prisma.CalendarEventNullableScalarRelationFilter, Prisma.CalendarEventWhereInput> | null;
}, "id">;
export type ScheduleBlockOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    start?: Prisma.SortOrder;
    end?: Prisma.SortOrder;
    allDay?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    color?: Prisma.SortOrderInput | Prisma.SortOrder;
    notes?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ScheduleBlockCountOrderByAggregateInput;
    _max?: Prisma.ScheduleBlockMaxOrderByAggregateInput;
    _min?: Prisma.ScheduleBlockMinOrderByAggregateInput;
};
export type ScheduleBlockScalarWhereWithAggregatesInput = {
    AND?: Prisma.ScheduleBlockScalarWhereWithAggregatesInput | Prisma.ScheduleBlockScalarWhereWithAggregatesInput[];
    OR?: Prisma.ScheduleBlockScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ScheduleBlockScalarWhereWithAggregatesInput | Prisma.ScheduleBlockScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ScheduleBlock"> | string;
    title?: Prisma.StringWithAggregatesFilter<"ScheduleBlock"> | string;
    start?: Prisma.DateTimeWithAggregatesFilter<"ScheduleBlock"> | Date | string;
    end?: Prisma.DateTimeWithAggregatesFilter<"ScheduleBlock"> | Date | string;
    allDay?: Prisma.BoolWithAggregatesFilter<"ScheduleBlock"> | boolean;
    category?: Prisma.StringWithAggregatesFilter<"ScheduleBlock"> | string;
    color?: Prisma.StringNullableWithAggregatesFilter<"ScheduleBlock"> | string | null;
    notes?: Prisma.StringNullableWithAggregatesFilter<"ScheduleBlock"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ScheduleBlock"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ScheduleBlock"> | Date | string;
};
export type ScheduleBlockCreateInput = {
    id?: string;
    title: string;
    start: Date | string;
    end: Date | string;
    allDay?: boolean;
    category: string;
    color?: string | null;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    calendarEvent?: Prisma.CalendarEventCreateNestedOneWithoutScheduleBlockInput;
};
export type ScheduleBlockUncheckedCreateInput = {
    id?: string;
    title: string;
    start: Date | string;
    end: Date | string;
    allDay?: boolean;
    category: string;
    color?: string | null;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    calendarEvent?: Prisma.CalendarEventUncheckedCreateNestedOneWithoutScheduleBlockInput;
};
export type ScheduleBlockUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    start?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    end?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    allDay?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    category?: Prisma.StringFieldUpdateOperationsInput | string;
    color?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    calendarEvent?: Prisma.CalendarEventUpdateOneWithoutScheduleBlockNestedInput;
};
export type ScheduleBlockUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    start?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    end?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    allDay?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    category?: Prisma.StringFieldUpdateOperationsInput | string;
    color?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    calendarEvent?: Prisma.CalendarEventUncheckedUpdateOneWithoutScheduleBlockNestedInput;
};
export type ScheduleBlockCreateManyInput = {
    id?: string;
    title: string;
    start: Date | string;
    end: Date | string;
    allDay?: boolean;
    category: string;
    color?: string | null;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ScheduleBlockUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    start?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    end?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    allDay?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    category?: Prisma.StringFieldUpdateOperationsInput | string;
    color?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScheduleBlockUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    start?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    end?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    allDay?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    category?: Prisma.StringFieldUpdateOperationsInput | string;
    color?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScheduleBlockNullableScalarRelationFilter = {
    is?: Prisma.ScheduleBlockWhereInput | null;
    isNot?: Prisma.ScheduleBlockWhereInput | null;
};
export type ScheduleBlockCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    start?: Prisma.SortOrder;
    end?: Prisma.SortOrder;
    allDay?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    color?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ScheduleBlockMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    start?: Prisma.SortOrder;
    end?: Prisma.SortOrder;
    allDay?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    color?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ScheduleBlockMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    start?: Prisma.SortOrder;
    end?: Prisma.SortOrder;
    allDay?: Prisma.SortOrder;
    category?: Prisma.SortOrder;
    color?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ScheduleBlockCreateNestedOneWithoutCalendarEventInput = {
    create?: Prisma.XOR<Prisma.ScheduleBlockCreateWithoutCalendarEventInput, Prisma.ScheduleBlockUncheckedCreateWithoutCalendarEventInput>;
    connectOrCreate?: Prisma.ScheduleBlockCreateOrConnectWithoutCalendarEventInput;
    connect?: Prisma.ScheduleBlockWhereUniqueInput;
};
export type ScheduleBlockUpdateOneWithoutCalendarEventNestedInput = {
    create?: Prisma.XOR<Prisma.ScheduleBlockCreateWithoutCalendarEventInput, Prisma.ScheduleBlockUncheckedCreateWithoutCalendarEventInput>;
    connectOrCreate?: Prisma.ScheduleBlockCreateOrConnectWithoutCalendarEventInput;
    upsert?: Prisma.ScheduleBlockUpsertWithoutCalendarEventInput;
    disconnect?: Prisma.ScheduleBlockWhereInput | boolean;
    delete?: Prisma.ScheduleBlockWhereInput | boolean;
    connect?: Prisma.ScheduleBlockWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ScheduleBlockUpdateToOneWithWhereWithoutCalendarEventInput, Prisma.ScheduleBlockUpdateWithoutCalendarEventInput>, Prisma.ScheduleBlockUncheckedUpdateWithoutCalendarEventInput>;
};
export type ScheduleBlockCreateWithoutCalendarEventInput = {
    id?: string;
    title: string;
    start: Date | string;
    end: Date | string;
    allDay?: boolean;
    category: string;
    color?: string | null;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ScheduleBlockUncheckedCreateWithoutCalendarEventInput = {
    id?: string;
    title: string;
    start: Date | string;
    end: Date | string;
    allDay?: boolean;
    category: string;
    color?: string | null;
    notes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ScheduleBlockCreateOrConnectWithoutCalendarEventInput = {
    where: Prisma.ScheduleBlockWhereUniqueInput;
    create: Prisma.XOR<Prisma.ScheduleBlockCreateWithoutCalendarEventInput, Prisma.ScheduleBlockUncheckedCreateWithoutCalendarEventInput>;
};
export type ScheduleBlockUpsertWithoutCalendarEventInput = {
    update: Prisma.XOR<Prisma.ScheduleBlockUpdateWithoutCalendarEventInput, Prisma.ScheduleBlockUncheckedUpdateWithoutCalendarEventInput>;
    create: Prisma.XOR<Prisma.ScheduleBlockCreateWithoutCalendarEventInput, Prisma.ScheduleBlockUncheckedCreateWithoutCalendarEventInput>;
    where?: Prisma.ScheduleBlockWhereInput;
};
export type ScheduleBlockUpdateToOneWithWhereWithoutCalendarEventInput = {
    where?: Prisma.ScheduleBlockWhereInput;
    data: Prisma.XOR<Prisma.ScheduleBlockUpdateWithoutCalendarEventInput, Prisma.ScheduleBlockUncheckedUpdateWithoutCalendarEventInput>;
};
export type ScheduleBlockUpdateWithoutCalendarEventInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    start?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    end?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    allDay?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    category?: Prisma.StringFieldUpdateOperationsInput | string;
    color?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScheduleBlockUncheckedUpdateWithoutCalendarEventInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    start?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    end?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    allDay?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    category?: Prisma.StringFieldUpdateOperationsInput | string;
    color?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScheduleBlockSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    title?: boolean;
    start?: boolean;
    end?: boolean;
    allDay?: boolean;
    category?: boolean;
    color?: boolean;
    notes?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    calendarEvent?: boolean | Prisma.ScheduleBlock$calendarEventArgs<ExtArgs>;
}, ExtArgs["result"]["scheduleBlock"]>;
export type ScheduleBlockSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    title?: boolean;
    start?: boolean;
    end?: boolean;
    allDay?: boolean;
    category?: boolean;
    color?: boolean;
    notes?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["scheduleBlock"]>;
export type ScheduleBlockSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    title?: boolean;
    start?: boolean;
    end?: boolean;
    allDay?: boolean;
    category?: boolean;
    color?: boolean;
    notes?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["scheduleBlock"]>;
export type ScheduleBlockSelectScalar = {
    id?: boolean;
    title?: boolean;
    start?: boolean;
    end?: boolean;
    allDay?: boolean;
    category?: boolean;
    color?: boolean;
    notes?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ScheduleBlockOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "title" | "start" | "end" | "allDay" | "category" | "color" | "notes" | "createdAt" | "updatedAt", ExtArgs["result"]["scheduleBlock"]>;
export type ScheduleBlockInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    calendarEvent?: boolean | Prisma.ScheduleBlock$calendarEventArgs<ExtArgs>;
};
export type ScheduleBlockIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type ScheduleBlockIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $ScheduleBlockPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ScheduleBlock";
    objects: {
        calendarEvent: Prisma.$CalendarEventPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        title: string;
        start: Date;
        end: Date;
        allDay: boolean;
        category: string;
        color: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["scheduleBlock"]>;
    composites: {};
};
export type ScheduleBlockGetPayload<S extends boolean | null | undefined | ScheduleBlockDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ScheduleBlockPayload, S>;
export type ScheduleBlockCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ScheduleBlockFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ScheduleBlockCountAggregateInputType | true;
};
export interface ScheduleBlockDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ScheduleBlock'];
        meta: {
            name: 'ScheduleBlock';
        };
    };
    /**
     * Find zero or one ScheduleBlock that matches the filter.
     * @param {ScheduleBlockFindUniqueArgs} args - Arguments to find a ScheduleBlock
     * @example
     * // Get one ScheduleBlock
     * const scheduleBlock = await prisma.scheduleBlock.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ScheduleBlockFindUniqueArgs>(args: Prisma.SelectSubset<T, ScheduleBlockFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ScheduleBlockClient<runtime.Types.Result.GetResult<Prisma.$ScheduleBlockPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one ScheduleBlock that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ScheduleBlockFindUniqueOrThrowArgs} args - Arguments to find a ScheduleBlock
     * @example
     * // Get one ScheduleBlock
     * const scheduleBlock = await prisma.scheduleBlock.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ScheduleBlockFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ScheduleBlockFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ScheduleBlockClient<runtime.Types.Result.GetResult<Prisma.$ScheduleBlockPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ScheduleBlock that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleBlockFindFirstArgs} args - Arguments to find a ScheduleBlock
     * @example
     * // Get one ScheduleBlock
     * const scheduleBlock = await prisma.scheduleBlock.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ScheduleBlockFindFirstArgs>(args?: Prisma.SelectSubset<T, ScheduleBlockFindFirstArgs<ExtArgs>>): Prisma.Prisma__ScheduleBlockClient<runtime.Types.Result.GetResult<Prisma.$ScheduleBlockPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ScheduleBlock that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleBlockFindFirstOrThrowArgs} args - Arguments to find a ScheduleBlock
     * @example
     * // Get one ScheduleBlock
     * const scheduleBlock = await prisma.scheduleBlock.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ScheduleBlockFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ScheduleBlockFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ScheduleBlockClient<runtime.Types.Result.GetResult<Prisma.$ScheduleBlockPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more ScheduleBlocks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleBlockFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ScheduleBlocks
     * const scheduleBlocks = await prisma.scheduleBlock.findMany()
     *
     * // Get first 10 ScheduleBlocks
     * const scheduleBlocks = await prisma.scheduleBlock.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const scheduleBlockWithIdOnly = await prisma.scheduleBlock.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ScheduleBlockFindManyArgs>(args?: Prisma.SelectSubset<T, ScheduleBlockFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScheduleBlockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a ScheduleBlock.
     * @param {ScheduleBlockCreateArgs} args - Arguments to create a ScheduleBlock.
     * @example
     * // Create one ScheduleBlock
     * const ScheduleBlock = await prisma.scheduleBlock.create({
     *   data: {
     *     // ... data to create a ScheduleBlock
     *   }
     * })
     *
     */
    create<T extends ScheduleBlockCreateArgs>(args: Prisma.SelectSubset<T, ScheduleBlockCreateArgs<ExtArgs>>): Prisma.Prisma__ScheduleBlockClient<runtime.Types.Result.GetResult<Prisma.$ScheduleBlockPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many ScheduleBlocks.
     * @param {ScheduleBlockCreateManyArgs} args - Arguments to create many ScheduleBlocks.
     * @example
     * // Create many ScheduleBlocks
     * const scheduleBlock = await prisma.scheduleBlock.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ScheduleBlockCreateManyArgs>(args?: Prisma.SelectSubset<T, ScheduleBlockCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many ScheduleBlocks and returns the data saved in the database.
     * @param {ScheduleBlockCreateManyAndReturnArgs} args - Arguments to create many ScheduleBlocks.
     * @example
     * // Create many ScheduleBlocks
     * const scheduleBlock = await prisma.scheduleBlock.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ScheduleBlocks and only return the `id`
     * const scheduleBlockWithIdOnly = await prisma.scheduleBlock.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ScheduleBlockCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ScheduleBlockCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScheduleBlockPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a ScheduleBlock.
     * @param {ScheduleBlockDeleteArgs} args - Arguments to delete one ScheduleBlock.
     * @example
     * // Delete one ScheduleBlock
     * const ScheduleBlock = await prisma.scheduleBlock.delete({
     *   where: {
     *     // ... filter to delete one ScheduleBlock
     *   }
     * })
     *
     */
    delete<T extends ScheduleBlockDeleteArgs>(args: Prisma.SelectSubset<T, ScheduleBlockDeleteArgs<ExtArgs>>): Prisma.Prisma__ScheduleBlockClient<runtime.Types.Result.GetResult<Prisma.$ScheduleBlockPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one ScheduleBlock.
     * @param {ScheduleBlockUpdateArgs} args - Arguments to update one ScheduleBlock.
     * @example
     * // Update one ScheduleBlock
     * const scheduleBlock = await prisma.scheduleBlock.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ScheduleBlockUpdateArgs>(args: Prisma.SelectSubset<T, ScheduleBlockUpdateArgs<ExtArgs>>): Prisma.Prisma__ScheduleBlockClient<runtime.Types.Result.GetResult<Prisma.$ScheduleBlockPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more ScheduleBlocks.
     * @param {ScheduleBlockDeleteManyArgs} args - Arguments to filter ScheduleBlocks to delete.
     * @example
     * // Delete a few ScheduleBlocks
     * const { count } = await prisma.scheduleBlock.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ScheduleBlockDeleteManyArgs>(args?: Prisma.SelectSubset<T, ScheduleBlockDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ScheduleBlocks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleBlockUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ScheduleBlocks
     * const scheduleBlock = await prisma.scheduleBlock.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ScheduleBlockUpdateManyArgs>(args: Prisma.SelectSubset<T, ScheduleBlockUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ScheduleBlocks and returns the data updated in the database.
     * @param {ScheduleBlockUpdateManyAndReturnArgs} args - Arguments to update many ScheduleBlocks.
     * @example
     * // Update many ScheduleBlocks
     * const scheduleBlock = await prisma.scheduleBlock.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ScheduleBlocks and only return the `id`
     * const scheduleBlockWithIdOnly = await prisma.scheduleBlock.updateManyAndReturn({
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
    updateManyAndReturn<T extends ScheduleBlockUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ScheduleBlockUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScheduleBlockPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one ScheduleBlock.
     * @param {ScheduleBlockUpsertArgs} args - Arguments to update or create a ScheduleBlock.
     * @example
     * // Update or create a ScheduleBlock
     * const scheduleBlock = await prisma.scheduleBlock.upsert({
     *   create: {
     *     // ... data to create a ScheduleBlock
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ScheduleBlock we want to update
     *   }
     * })
     */
    upsert<T extends ScheduleBlockUpsertArgs>(args: Prisma.SelectSubset<T, ScheduleBlockUpsertArgs<ExtArgs>>): Prisma.Prisma__ScheduleBlockClient<runtime.Types.Result.GetResult<Prisma.$ScheduleBlockPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of ScheduleBlocks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleBlockCountArgs} args - Arguments to filter ScheduleBlocks to count.
     * @example
     * // Count the number of ScheduleBlocks
     * const count = await prisma.scheduleBlock.count({
     *   where: {
     *     // ... the filter for the ScheduleBlocks we want to count
     *   }
     * })
    **/
    count<T extends ScheduleBlockCountArgs>(args?: Prisma.Subset<T, ScheduleBlockCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ScheduleBlockCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a ScheduleBlock.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleBlockAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ScheduleBlockAggregateArgs>(args: Prisma.Subset<T, ScheduleBlockAggregateArgs>): Prisma.PrismaPromise<GetScheduleBlockAggregateType<T>>;
    /**
     * Group by ScheduleBlock.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduleBlockGroupByArgs} args - Group by arguments.
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
    groupBy<T extends ScheduleBlockGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ScheduleBlockGroupByArgs['orderBy'];
    } : {
        orderBy?: ScheduleBlockGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ScheduleBlockGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetScheduleBlockGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ScheduleBlock model
     */
    readonly fields: ScheduleBlockFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for ScheduleBlock.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__ScheduleBlockClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    calendarEvent<T extends Prisma.ScheduleBlock$calendarEventArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ScheduleBlock$calendarEventArgs<ExtArgs>>): Prisma.Prisma__CalendarEventClient<runtime.Types.Result.GetResult<Prisma.$CalendarEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the ScheduleBlock model
 */
export interface ScheduleBlockFieldRefs {
    readonly id: Prisma.FieldRef<"ScheduleBlock", 'String'>;
    readonly title: Prisma.FieldRef<"ScheduleBlock", 'String'>;
    readonly start: Prisma.FieldRef<"ScheduleBlock", 'DateTime'>;
    readonly end: Prisma.FieldRef<"ScheduleBlock", 'DateTime'>;
    readonly allDay: Prisma.FieldRef<"ScheduleBlock", 'Boolean'>;
    readonly category: Prisma.FieldRef<"ScheduleBlock", 'String'>;
    readonly color: Prisma.FieldRef<"ScheduleBlock", 'String'>;
    readonly notes: Prisma.FieldRef<"ScheduleBlock", 'String'>;
    readonly createdAt: Prisma.FieldRef<"ScheduleBlock", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ScheduleBlock", 'DateTime'>;
}
/**
 * ScheduleBlock findUnique
 */
export type ScheduleBlockFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleBlock
     */
    select?: Prisma.ScheduleBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduleBlock
     */
    omit?: Prisma.ScheduleBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduleBlockInclude<ExtArgs> | null;
    /**
     * Filter, which ScheduleBlock to fetch.
     */
    where: Prisma.ScheduleBlockWhereUniqueInput;
};
/**
 * ScheduleBlock findUniqueOrThrow
 */
export type ScheduleBlockFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleBlock
     */
    select?: Prisma.ScheduleBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduleBlock
     */
    omit?: Prisma.ScheduleBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduleBlockInclude<ExtArgs> | null;
    /**
     * Filter, which ScheduleBlock to fetch.
     */
    where: Prisma.ScheduleBlockWhereUniqueInput;
};
/**
 * ScheduleBlock findFirst
 */
export type ScheduleBlockFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleBlock
     */
    select?: Prisma.ScheduleBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduleBlock
     */
    omit?: Prisma.ScheduleBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduleBlockInclude<ExtArgs> | null;
    /**
     * Filter, which ScheduleBlock to fetch.
     */
    where?: Prisma.ScheduleBlockWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ScheduleBlocks to fetch.
     */
    orderBy?: Prisma.ScheduleBlockOrderByWithRelationInput | Prisma.ScheduleBlockOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ScheduleBlocks.
     */
    cursor?: Prisma.ScheduleBlockWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ScheduleBlocks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ScheduleBlocks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ScheduleBlocks.
     */
    distinct?: Prisma.ScheduleBlockScalarFieldEnum | Prisma.ScheduleBlockScalarFieldEnum[];
};
/**
 * ScheduleBlock findFirstOrThrow
 */
export type ScheduleBlockFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleBlock
     */
    select?: Prisma.ScheduleBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduleBlock
     */
    omit?: Prisma.ScheduleBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduleBlockInclude<ExtArgs> | null;
    /**
     * Filter, which ScheduleBlock to fetch.
     */
    where?: Prisma.ScheduleBlockWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ScheduleBlocks to fetch.
     */
    orderBy?: Prisma.ScheduleBlockOrderByWithRelationInput | Prisma.ScheduleBlockOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ScheduleBlocks.
     */
    cursor?: Prisma.ScheduleBlockWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ScheduleBlocks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ScheduleBlocks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ScheduleBlocks.
     */
    distinct?: Prisma.ScheduleBlockScalarFieldEnum | Prisma.ScheduleBlockScalarFieldEnum[];
};
/**
 * ScheduleBlock findMany
 */
export type ScheduleBlockFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleBlock
     */
    select?: Prisma.ScheduleBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduleBlock
     */
    omit?: Prisma.ScheduleBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduleBlockInclude<ExtArgs> | null;
    /**
     * Filter, which ScheduleBlocks to fetch.
     */
    where?: Prisma.ScheduleBlockWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ScheduleBlocks to fetch.
     */
    orderBy?: Prisma.ScheduleBlockOrderByWithRelationInput | Prisma.ScheduleBlockOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ScheduleBlocks.
     */
    cursor?: Prisma.ScheduleBlockWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ScheduleBlocks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ScheduleBlocks.
     */
    skip?: number;
    distinct?: Prisma.ScheduleBlockScalarFieldEnum | Prisma.ScheduleBlockScalarFieldEnum[];
};
/**
 * ScheduleBlock create
 */
export type ScheduleBlockCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleBlock
     */
    select?: Prisma.ScheduleBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduleBlock
     */
    omit?: Prisma.ScheduleBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduleBlockInclude<ExtArgs> | null;
    /**
     * The data needed to create a ScheduleBlock.
     */
    data: Prisma.XOR<Prisma.ScheduleBlockCreateInput, Prisma.ScheduleBlockUncheckedCreateInput>;
};
/**
 * ScheduleBlock createMany
 */
export type ScheduleBlockCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many ScheduleBlocks.
     */
    data: Prisma.ScheduleBlockCreateManyInput | Prisma.ScheduleBlockCreateManyInput[];
};
/**
 * ScheduleBlock createManyAndReturn
 */
export type ScheduleBlockCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleBlock
     */
    select?: Prisma.ScheduleBlockSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduleBlock
     */
    omit?: Prisma.ScheduleBlockOmit<ExtArgs> | null;
    /**
     * The data used to create many ScheduleBlocks.
     */
    data: Prisma.ScheduleBlockCreateManyInput | Prisma.ScheduleBlockCreateManyInput[];
};
/**
 * ScheduleBlock update
 */
export type ScheduleBlockUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleBlock
     */
    select?: Prisma.ScheduleBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduleBlock
     */
    omit?: Prisma.ScheduleBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduleBlockInclude<ExtArgs> | null;
    /**
     * The data needed to update a ScheduleBlock.
     */
    data: Prisma.XOR<Prisma.ScheduleBlockUpdateInput, Prisma.ScheduleBlockUncheckedUpdateInput>;
    /**
     * Choose, which ScheduleBlock to update.
     */
    where: Prisma.ScheduleBlockWhereUniqueInput;
};
/**
 * ScheduleBlock updateMany
 */
export type ScheduleBlockUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update ScheduleBlocks.
     */
    data: Prisma.XOR<Prisma.ScheduleBlockUpdateManyMutationInput, Prisma.ScheduleBlockUncheckedUpdateManyInput>;
    /**
     * Filter which ScheduleBlocks to update
     */
    where?: Prisma.ScheduleBlockWhereInput;
    /**
     * Limit how many ScheduleBlocks to update.
     */
    limit?: number;
};
/**
 * ScheduleBlock updateManyAndReturn
 */
export type ScheduleBlockUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleBlock
     */
    select?: Prisma.ScheduleBlockSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduleBlock
     */
    omit?: Prisma.ScheduleBlockOmit<ExtArgs> | null;
    /**
     * The data used to update ScheduleBlocks.
     */
    data: Prisma.XOR<Prisma.ScheduleBlockUpdateManyMutationInput, Prisma.ScheduleBlockUncheckedUpdateManyInput>;
    /**
     * Filter which ScheduleBlocks to update
     */
    where?: Prisma.ScheduleBlockWhereInput;
    /**
     * Limit how many ScheduleBlocks to update.
     */
    limit?: number;
};
/**
 * ScheduleBlock upsert
 */
export type ScheduleBlockUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleBlock
     */
    select?: Prisma.ScheduleBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduleBlock
     */
    omit?: Prisma.ScheduleBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduleBlockInclude<ExtArgs> | null;
    /**
     * The filter to search for the ScheduleBlock to update in case it exists.
     */
    where: Prisma.ScheduleBlockWhereUniqueInput;
    /**
     * In case the ScheduleBlock found by the `where` argument doesn't exist, create a new ScheduleBlock with this data.
     */
    create: Prisma.XOR<Prisma.ScheduleBlockCreateInput, Prisma.ScheduleBlockUncheckedCreateInput>;
    /**
     * In case the ScheduleBlock was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.ScheduleBlockUpdateInput, Prisma.ScheduleBlockUncheckedUpdateInput>;
};
/**
 * ScheduleBlock delete
 */
export type ScheduleBlockDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleBlock
     */
    select?: Prisma.ScheduleBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduleBlock
     */
    omit?: Prisma.ScheduleBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduleBlockInclude<ExtArgs> | null;
    /**
     * Filter which ScheduleBlock to delete.
     */
    where: Prisma.ScheduleBlockWhereUniqueInput;
};
/**
 * ScheduleBlock deleteMany
 */
export type ScheduleBlockDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ScheduleBlocks to delete
     */
    where?: Prisma.ScheduleBlockWhereInput;
    /**
     * Limit how many ScheduleBlocks to delete.
     */
    limit?: number;
};
/**
 * ScheduleBlock.calendarEvent
 */
export type ScheduleBlock$calendarEventArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
 * ScheduleBlock without action
 */
export type ScheduleBlockDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduleBlock
     */
    select?: Prisma.ScheduleBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduleBlock
     */
    omit?: Prisma.ScheduleBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduleBlockInclude<ExtArgs> | null;
};
export {};
