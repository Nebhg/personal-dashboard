"use client";

import { useState, useEffect, useCallback } from "react";
import { MealLogForm } from "@/components/diet/MealLogForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Utensils, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface MealLog {
  id: string;
  date: string;
  mealType: string;
  description: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  notes: string | null;
}

const MEAL_COLORS: Record<string, string> = {
  breakfast: "bg-yellow-100 text-yellow-700",
  lunch: "bg-green-100 text-green-700",
  dinner: "bg-blue-100 text-blue-700",
  snack: "bg-purple-100 text-purple-700",
};

export default function DietPage() {
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/diet");
    setMeals(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function deleteMeal(id: string) {
    if (!confirm("Delete this meal?")) return;
    await fetch(`/api/diet/${id}`, { method: "DELETE" });
    load();
  }

  const grouped = meals.reduce<Record<string, MealLog[]>>((acc, meal) => {
    const day = format(new Date(meal.date), "yyyy-MM-dd");
    if (!acc[day]) acc[day] = [];
    acc[day].push(meal);
    return acc;
  }, {});

  const totalToday = (() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayMeals = grouped[today] ?? [];
    return todayMeals.reduce((sum, m) => sum + (m.calories ?? 0), 0);
  })();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Utensils className="h-6 w-6 text-green-500" />
            Diet
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Today: <span className="font-medium text-foreground">{totalToday} kcal</span>
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Log Meal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Log a Meal</DialogTitle>
            </DialogHeader>
            <MealLogForm onSuccess={() => { setOpen(false); load(); }} />
          </DialogContent>
        </Dialog>
      </div>

      {meals.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Utensils className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No meals logged yet</p>
          <p className="text-sm mt-1">Start tracking your diet</p>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(grouped)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([day, dayMeals]) => {
            const dayTotal = dayMeals.reduce((s, m) => s + (m.calories ?? 0), 0);
            return (
              <div key={day}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    {format(new Date(day), "EEEE, MMM d")}
                  </h2>
                  {dayTotal > 0 && (
                    <span className="text-xs text-muted-foreground">{dayTotal} kcal total</span>
                  )}
                </div>
                <div className="space-y-2">
                  {dayMeals.map((meal) => (
                    <Card key={meal.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${MEAL_COLORS[meal.mealType] ?? "bg-gray-100 text-gray-700"}`}>
                                {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                              </span>
                              <span className="text-sm font-medium truncate">{meal.description}</span>
                            </div>
                            {(meal.calories || meal.protein || meal.carbs || meal.fat) && (
                              <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                                {meal.calories && <span>{meal.calories} kcal</span>}
                                {meal.protein && <span>P: {meal.protein}g</span>}
                                {meal.carbs && <span>C: {meal.carbs}g</span>}
                                {meal.fat && <span>F: {meal.fat}g</span>}
                              </div>
                            )}
                            {meal.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">{meal.notes}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => deleteMeal(meal.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
