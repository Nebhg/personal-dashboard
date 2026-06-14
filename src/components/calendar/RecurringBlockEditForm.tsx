"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recurringBlockSchema, type RecurringBlockFormValues } from "@/lib/validations/recurring-block";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SCHEDULE_CATEGORIES } from "@/types";

const DAYS = [
  { label: "Mon", value: 1 }, { label: "Tue", value: 2 }, { label: "Wed", value: 3 },
  { label: "Thu", value: 4 }, { label: "Fri", value: 5 }, { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

interface Props {
  blockId: string;
  initialValues: RecurringBlockFormValues;
  onSuccess: () => void;
}

export function RecurringBlockEditForm({ blockId, initialValues, onSuccess }: Props) {
  const [selectedDays, setSelectedDays] = useState<number[]>(initialValues.daysOfWeek);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<RecurringBlockFormValues>({
      resolver: zodResolver(recurringBlockSchema),
      defaultValues: initialValues,
    });

  function toggleDay(day: number) {
    setSelectedDays((prev) => {
      const next = prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day];
      setValue("daysOfWeek", next);
      return next;
    });
  }

  async function onSubmit(values: RecurringBlockFormValues) {
    const res = await fetch(`/api/schedule/recurring/${blockId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select
          defaultValue={initialValues.category}
          onValueChange={(v) => setValue("category", v as RecurringBlockFormValues["category"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SCHEDULE_CATEGORIES).map(([key, { label, color }]) => (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  {label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Start time</Label>
          <Input type="time" {...register("startTime")} />
          {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>End time</Label>
          <Input type="time" {...register("endTime")} />
          {errors.endTime && <p className="text-xs text-destructive">{errors.endTime.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Repeat on</Label>
        <div className="flex gap-1.5 flex-wrap">
          {DAYS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleDay(value)}
              className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                selectedDays.includes(value)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-accent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {errors.daysOfWeek && <p className="text-xs text-destructive">Select at least one day</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Ends on (optional)</Label>
        <Input
          type="date"
          defaultValue={initialValues.endsOn ? initialValues.endsOn.toISOString().slice(0, 10) : ""}
          onChange={(e) => setValue("endsOn", e.target.value ? new Date(e.target.value) : null)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Notes (optional)</Label>
        <Textarea {...register("notes")} rows={2} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
