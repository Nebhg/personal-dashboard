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
      scheduledTime: null,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Top row: name + day picker side by side */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <Label htmlFor="name">Plan name</Label>
          <Input id="name" placeholder="e.g. Push Day A" className="h-10" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Schedule (days of week)</Label>
          <div className="flex gap-2 flex-wrap">
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
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea id="description" placeholder="Focus areas, notes..." {...register("description")} rows={2} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="scheduledTime">Workout time (for calendar)</Label>
          <Input
            id="scheduledTime"
            type="time"
            placeholder="07:00"
            {...register("scheduledTime")}
          />
          <p className="text-xs text-muted-foreground">Events appear at this time in the calendar</p>
        </div>
      </div>

      {/* Exercise table — uses a real <table> so columns stretch naturally */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Exercises</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => append({ name: "", sets: null, reps: null, weightKg: null, restSec: null, notes: null, order: fields.length })}
          >
            <Plus className="h-3.5 w-3.5" />
            Add row
          </Button>
        </div>

        <div className="rounded-md border overflow-hidden">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col style={{ width: "2rem" }} />
              <col style={{ width: "30%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "9%" }} />
              <col />
              <col style={{ width: "2.5rem" }} />
            </colgroup>
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="py-2 px-1" />
                <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground">Exercise</th>
                <th className="py-2 px-2 text-center text-xs font-medium text-muted-foreground">Sets</th>
                <th className="py-2 px-2 text-center text-xs font-medium text-muted-foreground">Reps</th>
                <th className="py-2 px-2 text-center text-xs font-medium text-muted-foreground">Weight (kg)</th>
                <th className="py-2 px-2 text-center text-xs font-medium text-muted-foreground">Rest (s)</th>
                <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground">Notes</th>
                <th className="py-2 px-1" />
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-2 px-1 text-center">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab mx-auto" />
                  </td>
                  <td className="py-1.5 px-2">
                    <Input
                      placeholder="e.g. Bench Press"
                      className="h-9 w-full"
                      {...register(`exercises.${index}.name`)}
                    />
                  </td>
                  <td className="py-1.5 px-2">
                    <Input
                      type="number"
                      placeholder="4"
                      className="h-9 text-center w-full"
                      {...register(`exercises.${index}.sets`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="py-1.5 px-2">
                    <Input
                      type="number"
                      placeholder="8"
                      className="h-9 text-center w-full"
                      {...register(`exercises.${index}.reps`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="py-1.5 px-2">
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="80"
                      className="h-9 text-center w-full"
                      {...register(`exercises.${index}.weightKg`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="py-1.5 px-2">
                    <Input
                      type="number"
                      placeholder="90"
                      className="h-9 text-center w-full"
                      {...register(`exercises.${index}.restSec`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="py-1.5 px-2">
                    <Input
                      placeholder="RPE 8, notes…"
                      className="h-9 w-full"
                      {...register(`exercises.${index}.notes`)}
                    />
                  </td>
                  <td className="py-1.5 px-1 text-center">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
              {fields.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-xs text-muted-foreground">
                    No exercises yet — click "Add row" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full h-10">
        {isSubmitting ? "Saving..." : planId ? "Update Plan" : "Create Plan"}
      </Button>
    </form>
  );
}
