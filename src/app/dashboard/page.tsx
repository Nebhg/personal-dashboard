import { prisma } from "@/lib/prisma";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  format,
  subDays,
} from "date-fns";
import { calculateStreak } from "@/lib/utils/streaks";
import { Topbar } from "@/components/ui/topbar";
import { Panel, PanelHead, PanelTitle, PanelBody } from "@/components/ui/panel";
import { StatTile } from "@/components/ui/stat-tile";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const AREA_COLOR: Record<string, string> = {
  DIET:     "oklch(0.80 0.14 145)",
  EXERCISE: "oklch(0.78 0.13 165)",
  LEARNING: "oklch(0.78 0.14 280)",
  HABITS:   "oklch(0.82 0.13 75)",
  SCHEDULE: "oklch(0.78 0.15 285)",
  WORK:     "oklch(0.78 0.15 285)",
  PERSONAL: "oklch(0.80 0.13 25)",
};

export default async function DashboardPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd   = endOfDay(now);
  const weekStart  = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd    = endOfWeek(now,   { weekStartsOn: 1 });

  const [todayMeals, weekWorkouts, habitsWithLogs, activeApplications, todayEvents, recentMeals] =
    await Promise.all([
      prisma.mealLog.findMany({ where: { date: { gte: todayStart, lte: todayEnd } } }),
      prisma.workoutSession.findMany({ where: { date: { gte: weekStart, lte: weekEnd } } }),
      prisma.habit.findMany({
        include: {
          logs: {
            where: { date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
            orderBy: { date: "desc" },
          },
        },
      }),
      prisma.jobApplication.findMany({
        where: { stage: { notIn: ["REJECTED", "GHOSTED"] } },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.calendarEvent.findMany({
        where: { start: { gte: todayStart, lte: todayEnd } },
        orderBy: { start: "asc" },
        take: 6,
      }),
      prisma.mealLog.findMany({
        where: { date: { gte: subDays(todayStart, 11) } },
        select: { date: true, calories: true },
        orderBy: { date: "asc" },
      }),
    ]);

  const todayCalories = todayMeals.reduce((s, m) => s + (m.calories ?? 0), 0);
  const weekWorkoutMin = weekWorkouts.reduce((s, w) => s + w.durationMin, 0);

  const habitStreaks = habitsWithLogs.map((h) => ({
    ...h,
    streak: calculateStreak(h.logs.map((l) => ({ date: l.date, kept: l.kept }))),
    todayLog: h.logs.find((l) => l.date >= todayStart && l.date <= todayEnd),
  }));
  const topStreak = habitStreaks.length > 0 ? Math.max(...habitStreaks.map((h) => h.streak)) : 0;
  const keptToday  = habitStreaks.filter((h) => h.todayLog?.kept).length;

  // Build daily calorie sparkline (last 12 days, one value per day)
  const calByDay = new Map<string, number>();
  for (const m of recentMeals) {
    const key = format(m.date, "yyyy-MM-dd");
    calByDay.set(key, (calByDay.get(key) ?? 0) + (m.calories ?? 0));
  }
  const calSpark = Array.from({ length: 12 }, (_, i) => {
    const key = format(subDays(now, 11 - i), "yyyy-MM-dd");
    return calByDay.get(key) ?? 0;
  });

  // Simple workout spark: weekly counts for last 12 weeks (approximation)
  const workoutSpark = Array.from({ length: 12 }, (_, i) => {
    const weekNum = Math.floor(i / 2);
    return weekNum;
  });

  // Today macros
  const todayProtein = todayMeals.reduce((s, m) => s + (m.protein ?? 0), 0);
  const todayCarbs   = todayMeals.reduce((s, m) => s + (m.carbs   ?? 0), 0);
  const todayFat     = todayMeals.reduce((s, m) => s + (m.fat     ?? 0), 0);
  const PROTEIN_GOAL = 165;
  const CARBS_GOAL   = 250;
  const FAT_GOAL     = 70;
  const CAL_GOAL     = 2200;

  // This week activity grid (Mon–Sun)
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const weekDayActivity = weekDays.map((_, i) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + i);
    const dayStart = startOfDay(dayDate);
    const dayEnd   = endOfDay(dayDate);
    const workoutsOnDay = weekWorkouts.filter((w) => w.date >= dayStart && w.date <= dayEnd).length;
    const habitsKept    = habitStreaks.filter(
      (h) => h.logs.some((l) => l.date >= dayStart && l.date <= dayEnd && l.kept)
    ).length;
    const raw = workoutsOnDay * 3 + Math.min(habitsKept, 5);
    const intensity = Math.min(raw / 8, 1);
    const isToday = format(dayDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
    return { label: weekDays[i], intensity, isToday, score: Math.round(intensity * 10) };
  });

  const dayName = now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric" }).toUpperCase();

  return (
    <>
      <Topbar
        title={`Good ${now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening"}`}
        crumb={`${dayName} · ${dateStr}`}
        actions={
          <>
            <Link href="/diet">
              <button className="inline-flex items-center gap-1.5 h-[30px] px-3 text-[12px] font-medium rounded-[4px] bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                <Plus className="h-[13px] w-[13px]" />
                Log
              </button>
            </Link>
          </>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-10 lg:pb-16 max-w-[1400px]">
        {/* Row 1 — Stat tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-3 lg:mb-4">
          <Link href="/diet">
            <StatTile
              label="Calories today"
              num={todayCalories > 0 ? todayCalories.toLocaleString() : "—"}
              unit="kcal"
              sub={
                <>
                  <span>Goal {CAL_GOAL.toLocaleString()}</span>
                  <span style={{ color: "var(--fg-4, oklch(0.42 0.01 240))" }}>·</span>
                  <span>{todayMeals.length} meals</span>
                </>
              }
              delta={todayCalories > 0 ? `${Math.round(((todayCalories - CAL_GOAL) / CAL_GOAL) * 100)}%` : undefined}
              deltaDir={todayCalories < CAL_GOAL ? "down" : "up"}
              spark={calSpark.some((v) => v > 0) ? calSpark : undefined}
              sparkColor="var(--c-diet, oklch(0.80 0.14 145))"
            />
          </Link>

          <Link href="/exercise">
            <StatTile
              label="Workouts · week"
              num={weekWorkouts.length}
              unit={`/ 5`}
              sub={
                <>
                  <span>{weekWorkoutMin} min total</span>
                </>
              }
              delta={weekWorkouts.length > 0 ? `+${weekWorkouts.length}` : undefined}
              deltaDir="up"
              sparkColor="var(--c-exercise, oklch(0.78 0.13 165))"
            />
          </Link>

          <Link href="/habits">
            <StatTile
              label="Habit streaks"
              num={habitsWithLogs.length}
              unit="active"
              sub={
                topStreak > 0
                  ? <>
                      <span>Top: {topStreak} days</span>
                      <span style={{ color: "var(--fg-4)" }}>·</span>
                      <span>{keptToday} kept today</span>
                    </>
                  : <span>No active streaks</span>
              }
              delta={keptToday > 0 ? `+${keptToday}` : undefined}
              deltaDir="up"
              sparkColor="var(--primary)"
            />
          </Link>

          <Link href="/career">
            <StatTile
              label="Career · pipeline"
              num={activeApplications.length}
              unit="active"
              sub={
                <>
                  <span>
                    {activeApplications.filter((a) => a.stage === "TECHNICAL").length} technical
                  </span>
                  <span style={{ color: "var(--fg-4)" }}>·</span>
                  <span>
                    {activeApplications.filter((a) => a.prepNeeded).length} need prep
                  </span>
                </>
              }
              delta={activeApplications.length > 0 ? `${activeApplications.length}` : undefined}
              deltaDir="up"
              sparkColor="var(--c-work, oklch(0.78 0.15 285))"
            />
          </Link>
        </div>

        {/* Row 2 — Today schedule + Habits today */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 mb-3 lg:mb-4">
          {/* Today schedule — 7 cols */}
          <div className="lg:col-span-7">
            <Panel>
              <PanelHead>
                <PanelTitle>{"Today's schedule"}</PanelTitle>
                <div className="flex items-center gap-3">
                  <span className="label">{todayEvents.length} events</span>
                  <Link
                    href="/calendar"
                    className="inline-flex items-center gap-1 text-[12px] text-[var(--fg-2)] hover:text-foreground transition-colors"
                  >
                    Open <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </PanelHead>
              {todayEvents.length === 0 ? (
                <div className="px-4 py-8 text-center label">No events today</div>
              ) : (
                <div>
                  {todayEvents.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between px-4 py-[10px] border-b border-border last:border-0 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="shrink-0 rounded-[1px]"
                          style={{ width: 3, height: 28, background: AREA_COLOR[e.area] ?? "var(--primary)" }}
                        />
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium truncate">{e.title}</div>
                          <div className="label" style={{ marginTop: 2 }}>{e.area}</div>
                        </div>
                      </div>
                      <div className="mono text-[11px] text-[var(--fg-3)] shrink-0 flex items-center gap-2">
                        <span>{format(e.start, "HH:mm")}</span>
                        <span style={{ color: "var(--fg-4)" }}>·</span>
                        <span>
                          {Math.round((e.end.getTime() - e.start.getTime()) / 60000)}m
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          {/* Habits today — 5 cols */}
          <div className="lg:col-span-5">
            <Panel>
              <PanelHead>
                <PanelTitle>{"Habits · today"}</PanelTitle>
                <span className="mono text-[11px]" style={{ color: "var(--fg-2)" }}>
                  {keptToday} / {habitsWithLogs.length}
                </span>
              </PanelHead>
              {habitStreaks.length === 0 ? (
                <div className="px-4 py-8 text-center label">No habits yet</div>
              ) : (
                <div>
                  {habitStreaks.slice(0, 6).map((h) => (
                    <Link key={h.id} href="/habits">
                      <div className="flex items-center justify-between px-4 py-[10px] border-b border-border last:border-0 hover:bg-muted transition-colors cursor-pointer">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="shrink-0 flex items-center justify-center rounded-[3px] transition-colors"
                            style={{
                              width: 14,
                              height: 14,
                              border: `1px solid ${h.todayLog?.kept ? "var(--primary)" : "var(--hairline-strong, oklch(1 0 0 / 0.12))"}`,
                              background: h.todayLog?.kept ? "var(--primary)" : "transparent",
                            }}
                          >
                            {h.todayLog?.kept && (
                              <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="var(--primary-foreground)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <span className="text-[13px] font-medium truncate">{h.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className="mono text-[10px] px-[5px] py-px rounded-[3px] border uppercase tracking-[0.06em]"
                            style={{
                              borderColor: "var(--hairline-strong, oklch(1 0 0 / 0.12))",
                              color: "var(--fg-2)",
                            }}
                          >
                            {h.type}
                          </span>
                          <span
                            className="mono text-[11px]"
                            style={{ color: h.streak > 0 ? "var(--primary)" : "var(--fg-4)" }}
                          >
                            {h.streak}d
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>

        {/* Row 3 — Macros + This week */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          {/* Macros · today — 6 cols */}
          <div className="lg:col-span-6">
            <Panel>
              <PanelHead>
                <PanelTitle>{"Macros · today"}</PanelTitle>
                <span className="label num">
                  {todayCalories.toLocaleString()} / {CAL_GOAL.toLocaleString()}
                </span>
              </PanelHead>
              <PanelBody>
                <div className="space-y-[10px]">
                  {[
                    { name: "Protein", cur: todayProtein, goal: PROTEIN_GOAL, c: "var(--c-diet, oklch(0.80 0.14 145))" },
                    { name: "Carbs",   cur: todayCarbs,   goal: CARBS_GOAL,   c: "var(--c-work, oklch(0.78 0.15 285))" },
                    { name: "Fat",     cur: todayFat,     goal: FAT_GOAL,     c: "var(--c-personal, oklch(0.80 0.13 25))" },
                  ].map((m) => {
                    const pct = Math.min(100, m.goal > 0 ? (m.cur / m.goal) * 100 : 0);
                    return (
                      <div key={m.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px]">{m.name}</span>
                          <span className="num text-[11px] text-[var(--fg-3)]">
                            {m.cur}
                            <span style={{ color: "var(--fg-4)" }}>/{m.goal}g</span>
                          </span>
                        </div>
                        <div
                          className="rounded-[2px] overflow-hidden"
                          style={{ height: 4, background: "var(--muted)" }}
                        >
                          <div
                            className="h-full rounded-[2px] transition-all"
                            style={{ width: `${pct}%`, background: m.c }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PanelBody>
            </Panel>
          </div>

          {/* This week — 6 cols */}
          <div className="lg:col-span-6">
            <Panel>
              <PanelHead>
                <PanelTitle>This week</PanelTitle>
                <span className="label">
                  {format(weekStart, "MMM d")} — {format(weekEnd, "d")}
                </span>
              </PanelHead>
              <PanelBody className="grid grid-cols-7 gap-1.5">
                {weekDayActivity.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <span className="label" style={{ fontSize: 9 }}>{d.label}</span>
                    <div
                      className="w-full rounded-[3px]"
                      style={{
                        aspectRatio: "1",
                        background: `color-mix(in oklab, var(--primary) ${d.intensity * 55}%, var(--muted))`,
                        border: d.isToday ? "1px solid var(--primary)" : "1px solid transparent",
                      }}
                    />
                    <span className="num text-[10px] text-[var(--fg-3)]">{d.score}</span>
                  </div>
                ))}
                <div className="col-span-7 mt-2 flex justify-between items-center">
                  <span className="label">Avg score</span>
                  <span className="num text-[12px]">
                    {weekDayActivity.length > 0
                      ? (weekDayActivity.reduce((s, d) => s + d.score, 0) / weekDayActivity.length).toFixed(1)
                      : "0.0"}{" "}
                    / 10
                  </span>
                </div>
              </PanelBody>
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
