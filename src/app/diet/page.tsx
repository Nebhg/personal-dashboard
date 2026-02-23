"use client";

import { useState, useEffect, useCallback } from "react";
import { MealLogForm } from "@/components/diet/MealLogForm";
import { RecipeCard } from "@/components/diet/RecipeCard";
import { RecipeForm } from "@/components/diet/RecipeForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MealPlanGrid } from "@/components/diet/MealPlanGrid";
import { Plus, Utensils, Trash2, BookOpen, CalendarDays } from "lucide-react";
import { format } from "date-fns";

interface MealPlanEntry {
  id: string;
  dayOfWeek: number;
  mealType: string;
  description: string | null;
  recipe: {
    id: string;
    name: string;
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  } | null;
}

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
  recipeId: string | null;
}

interface RecipeIngredient {
  id: string;
  name: string;
  amount: string | null;
  order: number;
}

interface RecipeStep {
  id: string;
  stepNum: number;
  text: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string | null;
  prepTimeMins: number | null;
  cookTimeMins: number | null;
  servings: number | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  notes: string | null;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

const MEAL_COLORS: Record<string, string> = {
  breakfast: "bg-yellow-900/50 text-yellow-300",
  lunch: "bg-green-900/50 text-green-300",
  dinner: "bg-blue-900/50 text-blue-300",
  snack: "bg-purple-900/50 text-purple-300",
};

export default function DietPage() {
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlanEntries, setMealPlanEntries] = useState<MealPlanEntry[]>([]);
  const [logOpen, setLogOpen] = useState(false);
  const [newRecipeOpen, setNewRecipeOpen] = useState(false);
  const [logFromRecipe, setLogFromRecipe] = useState<Recipe | null>(null);
  const [logFromPlan, setLogFromPlan] = useState<{ description: string; recipe: Recipe | null; mealType: string } | null>(null);

  const loadMeals = useCallback(async () => {
    const res = await fetch("/api/diet");
    setMeals(await res.json());
  }, []);

  const loadRecipes = useCallback(async () => {
    const res = await fetch("/api/diet/recipes");
    setRecipes(await res.json());
  }, []);

  const loadMealPlan = useCallback(async () => {
    const res = await fetch("/api/diet/meal-plan");
    setMealPlanEntries(await res.json());
  }, []);

  useEffect(() => {
    loadMeals();
    loadRecipes();
    loadMealPlan();
  }, [loadMeals, loadRecipes, loadMealPlan]);

  async function deleteMeal(id: string) {
    if (!confirm("Delete this meal?")) return;
    await fetch(`/api/diet/${id}`, { method: "DELETE" });
    loadMeals();
  }

  async function deleteRecipe(id: string) {
    if (!confirm("Delete this recipe?")) return;
    await fetch(`/api/diet/recipes/${id}`, { method: "DELETE" });
    loadRecipes();
  }

  const grouped = meals.reduce<Record<string, MealLog[]>>((acc, meal) => {
    const day = format(new Date(meal.date), "yyyy-MM-dd");
    if (!acc[day]) acc[day] = [];
    acc[day].push(meal);
    return acc;
  }, {});

  const totalToday = (() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return (grouped[today] ?? []).reduce((sum, m) => sum + (m.calories ?? 0), 0);
  })();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Utensils className="h-6 w-6 text-green-400" />
            Diet
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Today: <span className="font-medium text-foreground">{totalToday} kcal</span>
            {" · "}{recipes.length} recipes in library
          </p>
        </div>
      </div>

      <Tabs defaultValue="plan">
        <TabsList className="mb-4">
          <TabsTrigger value="plan" className="gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Meal Plan
          </TabsTrigger>
          <TabsTrigger value="log" className="gap-1.5">
            <Utensils className="h-3.5 w-3.5" />
            Meal Log
          </TabsTrigger>
          <TabsTrigger value="recipes" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Recipes
          </TabsTrigger>
        </TabsList>

        {/* ── MEAL PLAN TAB ─────────────────────────────── */}
        <TabsContent value="plan">
          <MealPlanGrid
            entries={mealPlanEntries}
            recipes={recipes}
            onUpdate={loadMealPlan}
            onLogMeal={(entry) => {
              const fullRecipe = entry.recipe
                ? recipes.find((r) => r.id === entry.recipe!.id) ?? null
                : null;
              setLogFromPlan({ ...entry, recipe: fullRecipe });
            }}
          />
        </TabsContent>

        {/* ── MEAL LOG TAB ─────────────────────────────── */}
        <TabsContent value="log">
          <div className="flex justify-end mb-3">
            <Dialog open={logOpen} onOpenChange={setLogOpen}>
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
                <MealLogForm
                  recipes={recipes}
                  onSuccess={() => { setLogOpen(false); loadMeals(); }}
                />
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
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${MEAL_COLORS[meal.mealType] ?? "bg-muted text-muted-foreground"}`}>
                                    {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                                  </span>
                                  <span className="text-sm font-medium truncate">{meal.description}</span>
                                </div>
                                {(meal.calories || meal.protein || meal.carbs || meal.fat) && (
                                  <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                                    {meal.calories && <span>{meal.calories} kcal</span>}
                                    {meal.protein && <span className="text-blue-400">P: {meal.protein}g</span>}
                                    {meal.carbs && <span className="text-yellow-400">C: {meal.carbs}g</span>}
                                    {meal.fat && <span className="text-orange-400">F: {meal.fat}g</span>}
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
        </TabsContent>

        {/* ── RECIPES TAB ─────────────────────────────── */}
        <TabsContent value="recipes">
          <div className="flex justify-end mb-3">
            <Dialog open={newRecipeOpen} onOpenChange={setNewRecipeOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  New Recipe
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Recipe</DialogTitle>
                </DialogHeader>
                <RecipeForm onSuccess={() => { setNewRecipeOpen(false); loadRecipes(); }} />
              </DialogContent>
            </Dialog>
          </div>

          {recipes.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No recipes yet</p>
              <p className="text-sm mt-1">Build your recipe library</p>
            </div>
          )}

          <div className="space-y-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onDelete={deleteRecipe}
                onLogMeal={(r) => setLogFromRecipe(r)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Log meal from meal plan dialog */}
      <Dialog open={!!logFromPlan} onOpenChange={(o) => !o && setLogFromPlan(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Meal: {logFromPlan?.description}</DialogTitle>
          </DialogHeader>
          {logFromPlan && (
            <MealLogForm
              recipes={recipes}
              initialRecipe={logFromPlan.recipe ?? undefined}
              initialMealType={logFromPlan.mealType}
              initialDescription={logFromPlan.recipe ? undefined : logFromPlan.description}
              onSuccess={() => { setLogFromPlan(null); loadMeals(); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Log meal from recipe dialog */}
      <Dialog open={!!logFromRecipe} onOpenChange={(o) => !o && setLogFromRecipe(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Meal: {logFromRecipe?.name}</DialogTitle>
          </DialogHeader>
          {logFromRecipe && (
            <MealLogForm
              recipes={recipes}
              initialRecipe={logFromRecipe}
              onSuccess={() => { setLogFromRecipe(null); loadMeals(); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
