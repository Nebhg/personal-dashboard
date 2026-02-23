"use client";

interface PlanExercise {
  id: string;
  name: string;
  sets: number | null;
  reps: number | null;
  weightKg: number | null;
  restSec: number | null;
  notes: string | null;
  order: number;
}

interface Props {
  exercises: PlanExercise[];
}

export function WorkoutPlanTable({ exercises }: Props) {
  if (exercises.length === 0) {
    return <p className="text-xs text-muted-foreground italic py-2">No exercises defined.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th className="text-left py-1.5 pr-3 font-medium">Exercise</th>
            <th className="text-center py-1.5 px-2 font-medium">Sets</th>
            <th className="text-center py-1.5 px-2 font-medium">Reps</th>
            <th className="text-center py-1.5 px-2 font-medium">Weight</th>
            <th className="text-center py-1.5 px-2 font-medium">Rest</th>
            <th className="text-left py-1.5 pl-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {exercises.sort((a, b) => a.order - b.order).map((ex) => (
            <tr key={ex.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
              <td className="py-2 pr-3 font-medium">{ex.name}</td>
              <td className="py-2 px-2 text-center text-muted-foreground">{ex.sets ?? "—"}</td>
              <td className="py-2 px-2 text-center text-muted-foreground">{ex.reps ?? "—"}</td>
              <td className="py-2 px-2 text-center text-muted-foreground">
                {ex.weightKg != null ? `${ex.weightKg} kg` : "—"}
              </td>
              <td className="py-2 px-2 text-center text-muted-foreground">
                {ex.restSec != null ? `${ex.restSec}s` : "—"}
              </td>
              <td className="py-2 pl-2 text-muted-foreground text-xs">{ex.notes ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
