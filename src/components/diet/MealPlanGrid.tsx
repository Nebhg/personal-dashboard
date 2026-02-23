"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MealLogForm } from "@/components/diet/MealLogForm";
import { Plus, X, UtensilsCrossed } from "lucide-react";

// Display Mon–Sun (index 0=Mon, ..., 6=Sun)
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DISPLAY_DOW = [1, 2, 3, 4, 5, 6, 0]; // maps display index → DB dayOfWeek
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack",
};

const MEAL_COLORS: Record<string, string> = {
  breakfast: "bg-yellow-900/30 text-yellow-300 border-yellow-800/40",
  lunch: "bg-green-900/30 text-green-300 border-green-800/40",
  dinner: "bg-blue-900/30 text-blue-300 border-blue-800/40",
  snack: "bg-purple-900/30 text-purple-300 border-purple-800/40",
};

interface Recipe {
  id: string;
  name: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

interface MealPlanEntry {
  id: string;
  dayOfWeek: number;
  mealType: string;
  description: string | null;
  recipe: Recipe | null;
}

interface EditTarget {
  dayOfWeek: number;
  mealType: string;
  current?: MealPlanEntry;
}

interface Props {
  entries: MealPlanEntry[];
  recipes: Recipe[];
  onUpdate: () => void;
  onLogMeal: (entry: { description: string; recipe: Recipe | null; mealType: string }) => void;
}

export function MealPlanGrid({ entries, recipes, onUpdate, onLogMeal }: Props) {
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [freeText, setFreeText] = useState("");
  const [saving, setSaving] = useState(false);

  // Build lookup: "dayOfWeek-mealType" → entry
  const lookup = new Map<string, MealPlanEntry>();
  for (const e of entries) lookup.set(`${e.dayOfWeek}-${e.mealType}`, e);

  function openEdit(displayIdx: number, mealType: string) {
    const dow = DISPLAY_DOW[displayIdx];
    const existing = lookup.get(`${dow}-${mealType}`);
    setSelectedRecipeId(existing?.recipe?.id ?? "");
    setFreeText(existing?.description ?? "");
    setEditTarget({ dayOfWeek: dow, mealType, current: existing });
  }

  async function saveEntry() {
    if (!editTarget) return;
    setSaving(true);
    const recipe = recipes.find((r) => r.id === selectedRecipeId);
    await fetch("/api/diet/meal-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayOfWeek: editTarget.dayOfWeek,
        mealType: editTarget.mealType,
        recipeId: recipe?.id ?? null,
        description: !recipe && freeText ? freeText : null,
      }),
    });
    setSaving(false);
    setEditTarget(null);
    onUpdate();
  }

  async function clearEntry(dayOfWeek: number, mealType: string) {
    await fetch("/api/diet/meal-plan", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayOfWeek, mealType }),
    });
    onUpdate();
  }

  const todayDow = new Date().getDay();
  const todayDisplayIdx = todayDow === 0 ? 6 : todayDow - 1;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Click any cell to set or change what you plan to eat. Click a meal badge to quickly log it.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left p-2 text-xs font-medium text-muted-foreground w-24">Meal</th>
              {DAYS.map((day, i) => (
                <th
                  key={day}
                  className={`p-2 text-xs font-medium text-center ${i === todayDisplayIdx ? "text-primary" : "text-muted-foreground"}`}
                >
                  {day}
                  {i === todayDisplayIdx && <span className="ml-1 text-primary">•</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEAL_TYPES.map((mealType) => (
              <tr key={mealType} className="border-t border-border">
                <td className="p-2 text-xs font-medium text-muted-foreground">
                  {MEAL_LABELS[mealType]}
                </td>
                {DAYS.map((_, displayIdx) => {
                  const dow = DISPLAY_DOW[displayIdx];
                  const entry = lookup.get(`${dow}-${mealType}`);
                  const label = entry?.recipe?.name ?? entry?.description;

                  return (
                    <td key={displayIdx} className="p-1 align-top">
                      {label ? (
                        <div className={`rounded-md border px-2 py-1.5 text-xs ${MEAL_COLORS[mealType]} group relative`}>
                          <button
                            className="w-full text-left font-medium truncate block"
                            onClick={() => onLogMeal({ description: label, recipe: entry?.recipe ?? null, mealType })}
                            title="Click to log this meal"
                          >
                            {label}
                            {entry?.recipe?.calories && (
                              <span className="block text-xs opacity-60 font-normal">{entry.recipe.calories} kcal</span>
                            )}
                          </button>
                          <div className="absolute top-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              className="p-0.5 hover:text-foreground"
                              onClick={() => openEdit(displayIdx, mealType)}
                              title="Edit"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <button
                              className="p-0.5 hover:text-destructive"
                              onClick={() => clearEntry(dow, mealType)}
                              title="Clear"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="w-full h-full min-h-[40px] rounded-md border border-dashed border-border/40 text-muted-foreground/30 hover:border-primary/40 hover:text-primary/50 transition-colors flex items-center justify-center"
                          onClick={() => openEdit(displayIdx, mealType)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Set {editTarget && MEAL_LABELS[editTarget.mealType]} — {editTarget && DAYS[DISPLAY_DOW.indexOf(editTarget.dayOfWeek)]}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {recipes.length > 0 && (
              <div className="space-y-1.5">
                <Label>From recipe library</Label>
                <Select
                  value={selectedRecipeId}
                  onValueChange={(v) => { setSelectedRecipeId(v); setFreeText(""); }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a recipe..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {recipes.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}{r.calories ? ` · ${r.calories} kcal` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {!selectedRecipeId || selectedRecipeId === "none" ? (
              <div className="space-y-1.5">
                <Label>Or type a description</Label>
                <Input
                  placeholder="e.g. Greek yoghurt with berries"
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                />
              </div>
            ) : null}
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={saveEntry}
                disabled={saving || (!selectedRecipeId && !freeText) || selectedRecipeId === "none" && !freeText}
              >
                {saving ? "Saving..." : "Set"}
              </Button>
              <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
