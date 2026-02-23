"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Clock, Flame, Trash2 } from "lucide-react";

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

interface Props {
  recipe: Recipe;
  onDelete: (id: string) => void;
  onLogMeal?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onDelete, onLogMeal }: Props) {
  const [expanded, setExpanded] = useState(false);
  const totalTime = (recipe.prepTimeMins ?? 0) + (recipe.cookTimeMins ?? 0);

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">{recipe.name}</h3>
            {recipe.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{recipe.description}</p>
            )}

            {/* Quick stats */}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
              {totalTime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {totalTime}min
                </span>
              )}
              {recipe.calories && (
                <span className="flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  {recipe.calories} kcal
                </span>
              )}
              {recipe.servings && <span>{recipe.servings} servings</span>}
            </div>

            {(recipe.protein || recipe.carbs || recipe.fat) && (
              <div className="flex gap-3 mt-1 text-xs">
                {recipe.protein != null && <span className="text-blue-400">P: {recipe.protein}g</span>}
                {recipe.carbs != null && <span className="text-yellow-400">C: {recipe.carbs}g</span>}
                {recipe.fat != null && <span className="text-orange-400">F: {recipe.fat}g</span>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onLogMeal && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onLogMeal(recipe)}>
                Log meal
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(recipe.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-4 border-t pt-4">
            {recipe.ingredients.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ingredients</h4>
                <ul className="space-y-1">
                  {recipe.ingredients.sort((a, b) => a.order - b.order).map((ing) => (
                    <li key={ing.id} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {ing.amount && <span className="text-muted-foreground text-xs w-14 shrink-0">{ing.amount}</span>}
                      <span>{ing.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recipe.steps.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Instructions</h4>
                <ol className="space-y-2">
                  {recipe.steps.sort((a, b) => a.stepNum - b.stepNum).map((step) => (
                    <li key={step.id} className="flex gap-3 text-sm">
                      <span className="text-primary font-semibold shrink-0 w-5">{step.stepNum}.</span>
                      <span>{step.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {recipe.notes && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</h4>
                <p className="text-sm text-muted-foreground italic">{recipe.notes}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
