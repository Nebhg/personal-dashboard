// Aggregate health/activity score across all tracked domains over a 7-day window.

export interface HealthInputs {
  /** Days in the last 7 with at least one meal logged */
  dietDaysLogged: number;
  /** Workouts logged this week */
  workoutsThisWeek: number;
  /** Fraction (0–1) of active-habit/day slots kept over the last 7 days */
  habitsKeptRatio: number;
  /** LeetCode problems solved in the last 7 days */
  leetcodeCount: number;
  /** Macro topics covered in the last 7 days */
  macroCount: number;
}

export interface DomainScore {
  name: string;
  /** 0–100 */
  score: number;
  color: string;
  detail: string;
}

export interface HealthScore {
  /** 0–100 weighted overall */
  overall: number;
  domains: DomainScore[];
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// Weekly targets used to normalise each domain to 0–100.
const WORKOUT_TARGET = 5;
const LEETCODE_TARGET = 5;
const MACRO_TARGET = 3;

// Domain weights (sum to 1).
const WEIGHTS = { diet: 0.2, exercise: 0.2, habits: 0.25, leetcode: 0.2, macro: 0.15 };

export function computeHealthScore(i: HealthInputs): HealthScore {
  const diet = clamp((i.dietDaysLogged / 7) * 100);
  const exercise = clamp((i.workoutsThisWeek / WORKOUT_TARGET) * 100);
  const habits = clamp(i.habitsKeptRatio * 100);
  const leetcode = clamp((i.leetcodeCount / LEETCODE_TARGET) * 100);
  const macro = clamp((i.macroCount / MACRO_TARGET) * 100);

  const domains: DomainScore[] = [
    { name: "Diet", score: diet, color: "var(--c-diet, oklch(0.80 0.14 145))", detail: `${i.dietDaysLogged}/7 days logged` },
    { name: "Exercise", score: exercise, color: "var(--c-exercise, oklch(0.78 0.13 165))", detail: `${i.workoutsThisWeek}/${WORKOUT_TARGET} workouts` },
    { name: "Habits", score: habits, color: "var(--c-habits, oklch(0.82 0.13 75))", detail: `${Math.round(i.habitsKeptRatio * 100)}% kept` },
    { name: "LeetCode", score: leetcode, color: "var(--c-learning, oklch(0.78 0.14 280))", detail: `${i.leetcodeCount}/${LEETCODE_TARGET} solved` },
    { name: "Macro", score: macro, color: "var(--c-work, oklch(0.78 0.15 285))", detail: `${i.macroCount}/${MACRO_TARGET} topics` },
  ];

  const overall = clamp(
    diet * WEIGHTS.diet +
      exercise * WEIGHTS.exercise +
      habits * WEIGHTS.habits +
      leetcode * WEIGHTS.leetcode +
      macro * WEIGHTS.macro
  );

  return { overall, domains };
}
