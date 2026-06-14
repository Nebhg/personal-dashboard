import { prisma } from "@/lib/prisma";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  format,
  subDays,
} from "date-fns";
import { Topbar } from "@/components/ui/topbar";
import { Panel, PanelHead, PanelTitle } from "@/components/ui/panel";
import { StatTile } from "@/components/ui/stat-tile";
import { InvestmentsPanel } from "@/components/dashboard/InvestmentsPanel";
import { listEvents, type GCalEvent } from "@/lib/google-calendar";
import { getPortfolioHistory } from "@/lib/investments-history";
import { computeHealthScore } from "@/lib/health-score";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;

export default async function DashboardPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd   = endOfDay(now);
  const weekStart  = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd    = endOfWeek(now,   { weekStartsOn: 1 });
  const last7Start = startOfDay(subDays(now, 6));

  const SERIES_DAYS = 21;

  const [
    todayMeals,
    weekWorkouts,
    habitsWithLogs,
    activeApplications,
    allApplications,
    recentMeals,
    recentWorkouts,
    recentLeetcode,
    recentMacro,
    portfolioHistory,
  ] = await Promise.all([
    prisma.mealLog.findMany({ where: { date: { gte: todayStart, lte: todayEnd } } }),
    prisma.workoutSession.findMany({ where: { date: { gte: weekStart, lte: weekEnd } } }),
    prisma.habit.findMany({
      include: {
        logs: {
          where: { date: { gte: subDays(todayStart, 90) } },
          orderBy: { date: "desc" },
        },
      },
    }),
    prisma.jobApplication.findMany({
      where: { stage: { notIn: ["REJECTED", "GHOSTED"] } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.jobApplication.findMany({ select: { appliedDate: true } }),
    prisma.mealLog.findMany({
      where: { date: { gte: subDays(todayStart, SERIES_DAYS - 1) } },
      select: { date: true, calories: true },
      orderBy: { date: "asc" },
    }),
    prisma.workoutSession.findMany({
      where: { date: { gte: subDays(todayStart, SERIES_DAYS - 1) } },
      select: { date: true },
    }),
    prisma.leetCodeProblem.findMany({ where: { date: { gte: last7Start } }, select: { id: true } }),
    prisma.macroTopic.findMany({ where: { coveredAt: { gte: last7Start } }, select: { id: true } }),
    getPortfolioHistory(30),
  ]);

  // Live Google Calendar — fail soft so the page still renders without GCal auth
  let todayEvents: GCalEvent[] = [];
  let gcalError = false;
  try {
    todayEvents = await listEvents(todayStart, todayEnd);
  } catch {
    gcalError = true;
  }

  const todayCalories = todayMeals.reduce((s, m) => s + (m.calories ?? 0), 0);
  const weekWorkoutMin = weekWorkouts.reduce((s, w) => s + w.durationMin, 0);

  // ── Day-by-day series for the top tiles (last 21 days) ──────────────────────
  const dayKeys = Array.from({ length: SERIES_DAYS }, (_, i) =>
    format(subDays(now, SERIES_DAYS - 1 - i), "yyyy-MM-dd")
  );

  const calByDay = new Map<string, number>();
  for (const m of recentMeals) {
    const key = format(m.date, "yyyy-MM-dd");
    calByDay.set(key, (calByDay.get(key) ?? 0) + (m.calories ?? 0));
  }
  const calSeries = dayKeys.map((k) => ({ date: k, value: calByDay.get(k) ?? 0 }));

  const woByDay = new Map<string, number>();
  for (const w of recentWorkouts) {
    const key = format(w.date, "yyyy-MM-dd");
    woByDay.set(key, (woByDay.get(key) ?? 0) + 1);
  }
  const workoutSeries = dayKeys.map((k) => ({ date: k, value: woByDay.get(k) ?? 0 }));

  const appliedKeys = allApplications
    .filter((a) => a.appliedDate)
    .map((a) => format(a.appliedDate!, "yyyy-MM-dd"));
  const careerSeries = dayKeys.map((k) => ({
    date: k,
    value: appliedKeys.filter((d) => d <= k).length,
  }));

  const investSeries = portfolioHistory.series;
  const portfolioValue = investSeries.length ? investSeries[investSeries.length - 1].value : 0;
  const portfolioFirst = investSeries.length ? investSeries[0].value : 0;
  const portfolioPct =
    portfolioFirst > 0 ? ((portfolioValue - portfolioFirst) / portfolioFirst) * 100 : 0;

  // ── Health score (last 7 days) ──────────────────────────────────────────────
  const dietDays = new Set(
    recentMeals
      .filter((m) => m.date >= last7Start && (m.calories ?? 0) > 0)
      .map((m) => format(m.date, "yyyy-MM-dd"))
  );
  const habitKeptLast7 = habitsWithLogs.reduce(
    (s, h) => s + h.logs.filter((l) => l.date >= last7Start && l.kept).length,
    0
  );
  const habitsKeptRatio =
    habitsWithLogs.length > 0 ? Math.min(1, habitKeptLast7 / (habitsWithLogs.length * 7)) : 0;

  const health = computeHealthScore({
    dietDaysLogged: dietDays.size,
    workoutsThisWeek: weekWorkouts.length,
    habitsKeptRatio,
    leetcodeCount: recentLeetcode.length,
    macroCount: recentMacro.length,
  });

  const dayName = now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric" }).toUpperCase();

  const CAL_GOAL = 2200;

  return (
    <>
      <Topbar
        title={`Good ${now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening"}`}
        crumb={`${dayName} · ${dateStr}`}
        actions={
          <Link href="/diet">
            <button className="inline-flex items-center gap-1.5 h-[30px] px-3 text-[12px] font-medium rounded-[4px] bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              <Plus className="h-[13px] w-[13px]" />
              Log
            </button>
          </Link>
        }
      />

      <div
        className="px-4 sm:px-6 lg:px-8 pt-2 pb-4 max-w-[1400px] flex flex-col"
        style={{ minHeight: "calc(100vh - 38px)" }}
      >
        {/* Row 1 — Interactive stat tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-2 lg:mb-3 shrink-0">
          <Link href="/diet" className="flex">
            <StatTile
              className="flex-1"
              label="Calories today"
              num={todayCalories > 0 ? todayCalories.toLocaleString() : "—"}
              unit="kcal"
              sub={<span>Goal {CAL_GOAL.toLocaleString()} · {todayMeals.length} meals</span>}
              delta={todayCalories > 0 ? `${Math.round(((todayCalories - CAL_GOAL) / CAL_GOAL) * 100)}%` : undefined}
              deltaDir={todayCalories < CAL_GOAL ? "down" : "up"}
              series={calSeries}
              valueSuffix=" kcal"
              sparkColor="var(--c-diet, oklch(0.80 0.14 145))"
            />
          </Link>

          <Link href="/exercise" className="flex">
            <StatTile
              className="flex-1"
              label="Workouts · week"
              num={weekWorkouts.length}
              unit="/ 5"
              sub={<span>{weekWorkoutMin} min total</span>}
              delta={weekWorkouts.length > 0 ? `+${weekWorkouts.length}` : undefined}
              deltaDir="up"
              series={workoutSeries}
              valueSuffix=" workouts"
              sparkColor="var(--c-exercise, oklch(0.78 0.13 165))"
            />
          </Link>

          <Link href="/investments" className="flex">
            <StatTile
              className="flex-1"
              label="Portfolio"
              num={portfolioValue > 0 ? gbp(portfolioValue) : "—"}
              sub={<span>30-day trend</span>}
              delta={investSeries.length ? `${portfolioPct >= 0 ? "+" : ""}${portfolioPct.toFixed(1)}%` : undefined}
              deltaDir={portfolioPct >= 0 ? "up" : "down"}
              series={investSeries}
              valuePrefix="£"
              sparkColor="var(--primary)"
            />
          </Link>

          <Link href="/career" className="flex">
            <StatTile
              className="flex-1"
              label="Career · pipeline"
              num={activeApplications.length}
              unit="active"
              sub={<span>{activeApplications.filter((a) => a.stage === "TECHNICAL").length} technical · {activeApplications.filter((a) => a.prepNeeded).length} need prep</span>}
              delta={activeApplications.length > 0 ? `${activeApplications.length}` : undefined}
              deltaDir="up"
              series={careerSeries}
              valueSuffix=" applied"
              sparkColor="var(--c-work, oklch(0.78 0.15 285))"
            />
          </Link>
        </div>

        {/* Row 2 — Investments (left 7) + right column: schedule + health score stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-3 flex-1 min-h-0">
          {/* Investments — 7 cols */}
          <div className="lg:col-span-7 flex flex-col min-h-0">
            <InvestmentsPanel initialSeries={investSeries} />
          </div>

          {/* Right column: schedule (top) + health score (bottom) stacked */}
          <div className="lg:col-span-5 flex flex-col gap-2 lg:gap-3 min-h-0">
            {/* Today's schedule — live Google Calendar */}
            <Panel className="flex flex-col min-h-0 flex-1">
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
              {gcalError ? (
                <div className="px-4 py-6 text-center label flex-1 flex items-center justify-center">
                  Calendar unavailable
                </div>
              ) : todayEvents.length === 0 ? (
                <div className="px-4 py-6 text-center label flex-1 flex items-center justify-center">
                  No events today
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto min-h-0">
                  {todayEvents.map((e) => {
                    const start = new Date(e.start);
                    const end = new Date(e.end);
                    return (
                      <Link
                        key={e.id}
                        href="/calendar"
                        className="flex items-center justify-between px-4 py-[8px] border-b border-border last:border-0 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="shrink-0 rounded-[1px]"
                            style={{ width: 3, height: 24, background: e.color ?? "var(--primary)" }}
                          />
                          <div className="min-w-0">
                            <div className="text-[12px] font-medium truncate">{e.title}</div>
                            {e.location && (
                              <div className="label" style={{ marginTop: 1 }}>{e.location}</div>
                            )}
                          </div>
                        </div>
                        <div className="mono text-[11px] text-[var(--fg-3)] shrink-0">
                          {e.allDay ? "All day" : format(start, "HH:mm")}
                          {!e.allDay && (
                            <>
                              <span style={{ color: "var(--fg-4)" }}> · </span>
                              {Math.round((end.getTime() - start.getTime()) / 60000)}m
                            </>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Panel>

            {/* Health score — compact inline layout */}
            <Panel className="shrink-0">
              <PanelHead className="py-[11px]">
                <PanelTitle>Health score · 7-day</PanelTitle>
                <span className="mono text-[18px] font-[500] tracking-[-0.02em] tabular-nums">
                  {health.overall}
                  <span className="label text-[10px] font-normal ml-1">/ 100</span>
                </span>
              </PanelHead>
              <div className="px-4 py-3 space-y-[9px]">
                {health.domains.map((d) => (
                  <div key={d.name}>
                    <div className="flex items-center justify-between mb-[3px]">
                      <span className="text-[11px]">{d.name}</span>
                      <span className="num text-[10px] text-[var(--fg-3)]">
                        {d.detail}
                      </span>
                    </div>
                    <div className="rounded-[2px] overflow-hidden" style={{ height: 4, background: "var(--muted)" }}>
                      <div
                        className="h-full rounded-[2px] transition-all"
                        style={{ width: `${d.score}%`, background: d.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
