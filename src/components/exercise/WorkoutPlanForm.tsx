"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workoutPlanSchema, type WorkoutPlanFormValues } from "@/lib/validations/exercise";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical } from "lucide-react";

const DAYS = [
  { label: "Mon", dow: 1 }, { label: "Tue", dow: 2 }, { label: "Wed", dow: 3 },
  { label: "Thu", dow: 4 }, { label: "Fri", dow: 5 }, { label: "Sat", dow: 6 },
  { label: "Sun", dow: 0 },
];

interface Props {
  initialValues?: WorkoutPlanFormValues;
  onSuccess: () => void;
  planId?: string;
}

export function WorkoutPlanForm({ initialValues, onSuccess, planId }: Props) {
  const { register, control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<WorkoutPlanFormValues>({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: initialValues ?? {
      name: "",
      description: "",
      scheduledDays: [],
      exercises: [{ name: "", sets: null, reps: null, weightKg: null, restSec: null, notes: null, order: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "exercises" });
  const scheduledDays = useWatch({ control, name: "scheduledDays" }) ?? [];

  function toggleDay(dow: number) {
    const current = scheduledDays as number[];
    if (current.includes(dow)) {
      setValue("scheduledDays", current.filter((d) => d !== dow));
    } else {
      setValue("scheduledDays", [...current, dow].sort());
    }
  }

  async function onSubmit(values: WorkoutPlanFormValues) {
    const payload = {
      ...values,
      exercises: values.exercises.map((ex, i) => ({ ...ex, order: i })),
    };

    const res = planId
      ? await fetch(`/api/exercise/plans/${planId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/exercise/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (res.ok) onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
      <div className="space-y-1.5">
        <Label htmlFor="name">Plan name</Label>
        <Input id="name" placeholder="e.g. Push Day A" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" placeholder="Focus areas, notes..." {...register("description")} rows={2} />
      </div>

      {/* Day scheduler */}
      <div className="space-y-2">
        <Label>Schedule (days of week)</Label>
        <div className="flex gap-1.5 flex-wrap">
          {DAYS.map(({ label, dow }) => {
            const active = (scheduledDays as number[]).includes(dow);
            return (
              <button
                key={dow}
                type="button"
                onClick={() => toggleDay(dow)}
                className={`w-10 h-10 rounded-full text-xs font-semibold transition-all border ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {(scheduledDays as number[]).length > 0 && (
          <p className="text-xs text-muted-foreground">
            {(scheduledDays as number[]).length} session{(scheduledDays as number[]).length !== 1 ? "s" : ""} per week
          </p>
        )}
      </div>

      {/* Exercise table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Exercises</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => append({ name: "", sets: null, reps: null, weightKg: null, restSec: null, notes: null, order: fields.length })}
          >
            <Plus className="h-3 w-3" />
            Add row
          </Button>
        </div>

        <div className="grid grid-cols-[1.5rem_1fr_4rem_4rem_5rem_4.5rem_1fr_1.5rem] gap-1.5 text-xs font-medium text-muted-foreground px-1">
          <span /><span>Exercise</span><span>Sets</span><span>Reps</span>
          <span>Weight (kg)</span><span>Rest (s)</span><span>Notes</span><span />
        </div>

        <div className="space-y-1.5">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1.5rem_1fr_4rem_4rem_5rem_4.5rem_1fr_1.5rem] gap-1.5 items-center">
              <GripVertical className="h-4 w-4 text-muted-foreground/40" />
              <Input placeholder="Bench Press" className="h-8 text-sm" {...register(`exercises.${index}.name`)} />
              <Input type="number" placeholder="4" className="h-8 text-sm" {...register(`exercises.${index}.sets`, { valueAsNumber: true })} />
              <Input type="number" placeholder="8" className="h-8 text-sm" {...register(`exercises.${index}.reps`, { valueAsNumber: true })} />
              <Input type="number" step="0.5" placeholder="80" className="h-8 text-sm" {...register(`exercises.${index}.weightKg`, { valueAsNumber: true })} />
              <Input type="number" placeholder="90" className="h-8 text-sm" {...register(`exercises.${index}.restSec`, { valueAsNumber: true })} />
              <Input placeholder="RPE 8" className="h-8 text-sm" {...register(`exercises.${index}.notes`)} />
              <button type="button" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {fields.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">No exercises yet. Click "Add row" to start.</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : planId ? "Update Plan" : "Create Plan"}
      </Button>
    </form>
  );
}
