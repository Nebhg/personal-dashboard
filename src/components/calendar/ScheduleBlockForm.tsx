"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduleBlockSchema, type ScheduleBlockFormValues } from "@/lib/validations/schedule";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SCHEDULE_CATEGORIES } from "@/types";
import { format } from "date-fns";

interface Props {
  initialStart?: Date;
  initialEnd?: Date;
  onSuccess: () => void;
}

function toDatetimeLocal(d: Date) {
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function ScheduleBlockForm({ initialStart, initialEnd, onSuccess }: Props) {
  const now = new Date();
  const defaultStart = initialStart ?? now;
  const defaultEnd = initialEnd ?? new Date(now.getTime() + 60 * 60 * 1000);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ScheduleBlockFormValues>({
    resolver: zodResolver(scheduleBlockSchema),
    defaultValues: {
      title: "",
      start: defaultStart,
      end: defaultEnd,
      allDay: false,
      category: "PERSONAL",
      notes: null,
    },
  });

  const allDay = watch("allDay");

  async function onSubmit(values: ScheduleBlockFormValues) {
    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input placeholder="e.g. Morning Run, Deep Work, Sleep" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select
          defaultValue="PERSONAL"
          onValueChange={(v) => setValue("category", v as ScheduleBlockFormValues["category"])}
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

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="allDay"
          className="h-4 w-4 rounded"
          {...register("allDay")}
        />
        <Label htmlFor="allDay" className="cursor-pointer">All day</Label>
      </div>

      {!allDay ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Start</Label>
            <Input
              type="datetime-local"
              defaultValue={toDatetimeLocal(defaultStart)}
              onChange={(e) => setValue("start", new Date(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>End</Label>
            <Input
              type="datetime-local"
              defaultValue={toDatetimeLocal(defaultEnd)}
              onChange={(e) => setValue("end", new Date(e.target.value))}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input
            type="date"
            defaultValue={format(defaultStart, "yyyy-MM-dd")}
            onChange={(e) => {
              const d = new Date(e.target.value);
              setValue("start", d);
              setValue("end", d);
            }}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Notes (optional)</Label>
        <Textarea placeholder="Any details..." {...register("notes")} rows={2} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : "Add to Calendar"}
      </Button>
    </form>
  );
}
