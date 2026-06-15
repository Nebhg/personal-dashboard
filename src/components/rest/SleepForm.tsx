"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sleepSchema, type SleepFormValues } from "@/lib/validations/sleep";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface Props {
  onSuccess: () => void;
}

// Sensible defaults: last night 23:00 → this morning 07:00.
function defaultBed(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(23, 0, 0, 0);
  return d;
}
function defaultWake(): Date {
  const d = new Date();
  d.setHours(7, 0, 0, 0);
  return d;
}

const toLocalInput = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm");

export function SleepForm({ onSuccess }: Props) {
  const form = useForm<SleepFormValues>({
    resolver: zodResolver(sleepSchema),
    defaultValues: {
      date: defaultWake(),
      bedTime: defaultBed(),
      wakeTime: defaultWake(),
      quality: null,
      notes: "",
    },
  });

  const bedTime = form.watch("bedTime");
  const wakeTime = form.watch("wakeTime");
  const durationMin =
    bedTime && wakeTime ? Math.round((wakeTime.getTime() - bedTime.getTime()) / 60000) : 0;
  const durationLabel =
    durationMin > 0 ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m` : "—";

  async function onSubmit(values: SleepFormValues) {
    const res = await fetch("/api/rest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        // The night belongs to the day you woke up.
        date: format(values.wakeTime, "yyyy-MM-dd"),
        bedTime: values.bedTime.toISOString(),
        wakeTime: values.wakeTime.toISOString(),
      }),
    });
    if (res.ok) {
      form.reset({
        date: defaultWake(),
        bedTime: defaultBed(),
        wakeTime: defaultWake(),
        quality: null,
        notes: "",
      });
      onSuccess();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="bedTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedtime</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.value ? toLocalInput(field.value) : ""}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="wakeTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wake time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={field.value ? toLocalInput(field.value) : ""}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
          <span className="text-muted-foreground">Duration</span>
          <span className="mono font-medium">{durationLabel}</span>
        </div>

        <FormField
          control={form.control}
          name="quality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quality (optional)</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(v ? Number(v) : null)}
                value={field.value ? String(field.value) : undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Rate 1–10" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} / 10
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Woke up twice, caffeine late, etc."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Log Sleep"}
        </Button>
      </form>
    </Form>
  );
}
