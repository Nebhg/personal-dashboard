"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recipeSchema, type RecipeFormValues } from "@/lib/validations/diet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  onSuccess: () => void;
  recipeId?: string;
  initialValues?: RecipeFormValues;
}

export function RecipeForm({ onSuccess, recipeId, initialValues }: Props) {
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: initialValues ?? {
      name: "",
      description: "",
      prepTimeMins: null,
      cookTimeMins: null,
      servings: null,
      calories: null,
      protein: null,
      carbs: null,
      fat: null,
      notes: "",
      ingredients: [{ name: "", amount: "", order: 0 }],
      steps: [{ stepNum: 1, text: "" }],
    },
  });

  const ingredients = useFieldArray({ control, name: "ingredients" });
  const steps = useFieldArray({ control, name: "steps" });

  async function onSubmit(values: RecipeFormValues) {
    const payload = {
      ...values,
      ingredients: values.ingredients.map((ing, i) => ({ ...ing, order: i })),
      steps: values.steps.map((s, i) => ({ ...s, stepNum: i + 1 })),
    };

    const res = recipeId
      ? await fetch(`/api/diet/recipes/${recipeId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/diet/recipes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (res.ok) onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label>Recipe name</Label>
          <Input placeholder="e.g. Chicken & Rice Bowl" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Description (optional)</Label>
          <Textarea placeholder="A quick high-protein meal..." {...register("description")} rows={2} />
        </div>
        <div className="space-y-1.5">
          <Label>Prep time (min)</Label>
          <Input type="number" placeholder="10" {...register("prepTimeMins", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1.5">
          <Label>Cook time (min)</Label>
          <Input type="number" placeholder="20" {...register("cookTimeMins", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1.5">
          <Label>Servings</Label>
          <Input type="number" placeholder="2" {...register("servings", { valueAsNumber: true })} />
        </div>
      </div>

      {/* Macros */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Macros (per serving)</Label>
        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Calories</Label>
            <Input type="number" placeholder="450" {...register("calories", { valueAsNumber: true })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Protein (g)</Label>
            <Input type="number" placeholder="40" {...register("protein", { valueAsNumber: true })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Carbs (g)</Label>
            <Input type="number" placeholder="55" {...register("carbs", { valueAsNumber: true })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Fat (g)</Label>
            <Input type="number" placeholder="8" {...register("fat", { valueAsNumber: true })} />
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Ingredients</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => ingredients.append({ name: "", amount: "", order: ingredients.fields.length })}
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>
        <div className="space-y-1.5">
          {ingredients.fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1fr_6rem_1.5rem] gap-2 items-center">
              <Input placeholder="Chicken breast" className="h-8 text-sm" {...register(`ingredients.${index}.name`)} />
              <Input placeholder="200g" className="h-8 text-sm" {...register(`ingredients.${index}.amount`)} />
              <button type="button" onClick={() => ingredients.remove(index)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Steps</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => steps.append({ stepNum: steps.fields.length + 1, text: "" })}
          >
            <Plus className="h-3 w-3" />
            Add step
          </Button>
        </div>
        <div className="space-y-1.5">
          {steps.fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <span className="text-xs text-muted-foreground font-medium w-5 mt-2 shrink-0">{index + 1}.</span>
              <Textarea
                placeholder="Dice the chicken into cubes..."
                className="text-sm resize-none"
                rows={2}
                {...register(`steps.${index}.text`)}
              />
              <button type="button" onClick={() => steps.remove(index)} className="text-muted-foreground hover:text-destructive mt-2">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Notes (optional)</Label>
        <Textarea placeholder="Meal prep tips, substitutions..." {...register("notes")} rows={2} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : recipeId ? "Update Recipe" : "Create Recipe"}
      </Button>
    </form>
  );
}
