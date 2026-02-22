import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from "date-fns";
import { calculateStreak } from "@/lib/utils/streaks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Utensils,
  Dumbbell,
  BookOpen,
  Target,
  Flame,
  TrendingUp,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const [todayMeals, weekWorkouts, weekSessions, habitsWithLogs] = await Promise.all([
    prisma.mealLog.findMany({
      where: { date: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.workoutSession.findMany({
      where: { date: { gte: weekStart, lte: weekEnd } },
    }),
    prisma.learningSession.findMany({
      where: { date: { gte: weekStart, lte: weekEnd } },
    }),
    prisma.habit.findMany({
      include: {
        logs: {
          where: { date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
          orderBy: { date: "desc" },
        },
      },
    }),
  ]);

  const todayCalories = todayMeals.reduce((s, m) => s + (m.calories ?? 0), 0);
  const weekWorkoutMin = weekWorkouts.reduce((s, w) => s + w.durationMin, 0);
  const weekLearnMin = weekSessions.reduce((s, s2) => s + s2.durationMin, 0);

  const habitStreaks = habitsWithLogs.map((h) => ({
    ...h,
    streak: calculateStreak(h.logs.map((l) => ({ date: l.date, kept: l.kept }))),
    todayLog: h.logs.find(
      (l) => l.date >= todayStart && l.date <= todayEnd
    ),
  }));

  const topStreaks = habitStreaks
    .filter((h) => h.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 4);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {format(now, "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Today's summary */}
      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        <Link href="/diet">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Diet Today</span>
              </div>
              <p className="text-2xl font-bold">{todayCalories}</p>
              <p className="text-xs text-muted-foreground">
                {todayCalories > 0 ? "kcal logged" : "No meals logged"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{todayMeals.length} meals</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/exercise">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Exercise</span>
              </div>
              <p className="text-2xl font-bold">{weekWorkouts.length}</p>
              <p className="text-xs text-muted-foreground">workouts this week</p>
              <p className="text-xs text-muted-foreground mt-0.5">{weekWorkoutMin} min total</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/learning">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Learning</span>
              </div>
              <p className="text-2xl font-bold">{Math.floor(weekLearnMin / 60)}h {weekLearnMin % 60}m</p>
              <p className="text-xs text-muted-foreground">studied this week</p>
              <p className="text-xs text-muted-foreground mt-0.5">{weekSessions.length} sessions</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/habits">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Habits</span>
              </div>
              <p className="text-2xl font-bold">{habitsWithLogs.length}</p>
              <p className="text-xs text-muted-foreground">active habits</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {habitStreaks.filter((h) => h.todayLog?.kept).length} kept today
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Habit Streaks */}
        {topStreaks.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                Top Streaks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topStreaks.map((h) => (
                <div key={h.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant={h.type === "QUIT" ? "destructive" : "secondary"} className="text-xs shrink-0">
                      {h.type === "QUIT" ? "Quit" : "Build"}
                    </Badge>
                    <span className="text-sm truncate">{h.name}</span>
                  </div>
                  <span className="flex items-center gap-1 text-orange-500 font-semibold text-sm shrink-0">
                    <Flame className="h-3.5 w-3.5" />
                    {h.streak} days
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Today's Check-in */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-500" />
              Today's Habits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {habitsWithLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No habits yet.{" "}
                <Link href="/habits" className="text-primary hover:underline">
                  Add your first habit
                </Link>
              </p>
            ) : (
              <div className="space-y-1.5">
                {habitsWithLogs.map((h) => {
                  const todayLog = h.logs.find(
                    (l) => l.date >= todayStart && l.date <= todayEnd
                  );
                  return (
                    <div key={h.id} className="flex items-center justify-between">
                      <span className="text-sm truncate">{h.name}</span>
                      <span
                        className={`text-xs font-medium ${
                          todayLog == null
                            ? "text-muted-foreground"
                            : todayLog.kept
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {todayLog == null ? "—" : todayLog.kept ? "✓ Kept" : "✗ Missed"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Quick Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Link href="/calendar">
                <Badge variant="outline" className="cursor-pointer hover:bg-accent py-1.5 px-3">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  View Calendar
                </Badge>
              </Link>
              <Link href="/diet">
                <Badge variant="outline" className="cursor-pointer hover:bg-accent py-1.5 px-3">
                  <Utensils className="h-3.5 w-3.5 mr-1.5" />
                  Log Meal
                </Badge>
              </Link>
              <Link href="/exercise">
                <Badge variant="outline" className="cursor-pointer hover:bg-accent py-1.5 px-3">
                  <Dumbbell className="h-3.5 w-3.5 mr-1.5" />
                  Log Workout
                </Badge>
              </Link>
              <Link href="/learning">
                <Badge variant="outline" className="cursor-pointer hover:bg-accent py-1.5 px-3">
                  <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                  Log Learning
                </Badge>
              </Link>
              <Link href="/habits">
                <Badge variant="outline" className="cursor-pointer hover:bg-accent py-1.5 px-3">
                  <Target className="h-3.5 w-3.5 mr-1.5" />
                  Check Habits
                </Badge>
              </Link>
              <Link href="/ai">
                <Badge variant="outline" className="cursor-pointer hover:bg-accent py-1.5 px-3">
                  AI Coach
                </Badge>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
