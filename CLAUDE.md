# Personal Dashboard — Claude Code Guide

## Project Overview
A personal lifestyle dashboard for tracking diet, exercise, habits, learning, and scheduling.
Built with **Next.js (App Router) + Prisma 7 + SQLite + shadcn/ui + react-big-calendar**.
Also includes an **MCP server** (`mcp-server/`) for Claude Desktop integration.

## Development Commands
```bash
npm run dev           # Start Next.js dev server (http://localhost:3000)
npx prisma studio     # Open DB GUI
npx prisma migrate dev --name <name>  # Create + apply migration
npx prisma generate   # Regenerate client after schema change
npx tsc --noEmit      # TypeScript check (no compilation)

# MCP server (run in mcp-server/ dir)
npx tsx index.ts      # Run MCP server directly (used by Claude Desktop)
```

## Tech Stack
| Layer | Tech |
|---|---|
| Framework | Next.js App Router (React Server Components + Client Components) |
| Database | SQLite via `@libsql/client` + Prisma 7 |
| ORM | Prisma 7 with `@prisma/adapter-libsql` |
| UI | shadcn/ui + Tailwind CSS (dark mode, purple accent) |
| Calendar | react-big-calendar |
| Forms | React Hook Form + Zod |
| MCP | `@modelcontextprotocol/sdk` + raw SQL (no Prisma in MCP) |

## Critical Prisma v7 Notes
- Prisma v7 REQUIRES a driver adapter — never use bare `new PrismaClient()`
- Uses `@prisma/adapter-libsql` with `PrismaLibSql` (not `PrismaLibSQL`)
- Import client from `@/generated/prisma/client`
- Schema has **no `url` field** in datasource; URL is passed to the adapter constructor
- `DATABASE_URL="file:./prisma/dev.db"` in `.env`

## Key Files
| File | Purpose |
|---|---|
| `src/lib/prisma.ts` | Prisma singleton (uses PrismaLibSql adapter) |
| `prisma/schema.prisma` | All models |
| `src/types/index.ts` | `TrackingArea`, `AREA_COLORS`, `AREA_LABELS`, `SCHEDULE_CATEGORIES` |
| `src/lib/validations/` | Zod schemas per domain |
| `src/lib/utils/streaks.ts` | `calculateStreak()` utility |
| `src/lib/calendar-utils.ts` | `generateScheduleEvents()` — virtual workout/meal events |
| `mcp-server/index.ts` | MCP server (18 tools, raw SQL via `@libsql/client`) |

## Architecture Patterns

### CalendarEvent as unified projection
Every domain write (diet, exercise, learning, habits, schedule) also creates/updates a `CalendarEvent` row. The calendar page reads only `CalendarEvent` — one query for all events.

### Virtual calendar events
Workout plans and meal plan entries are *not* stored in `CalendarEvent`. Instead, `generateScheduleEvents()` in `src/lib/calendar-utils.ts` expands them into virtual events for a given date range. Called in both:
- `GET /api/calendar` — for client-side navigation
- `src/app/calendar/page.tsx` — for SSR initial load

### Zod + React Hook Form
- Use `z.date()` in schemas — **not** `z.coerce.date()` (causes input type mismatch with RHF)
- In API routes, coerce manually before parsing: `if (typeof body.date === "string") body.date = new Date(body.date)`
- Remove `.default()` from schema fields used with RHF; set defaults in `useForm({ defaultValues: ... })`

### MCP server uses raw SQL
The MCP server (`mcp-server/index.ts`) bypasses Prisma entirely and uses `@libsql/client` with raw SQL. This is because Prisma v7's generated client fails as an ESM named export in Node 25.

## API Routes
| Route | Methods | Purpose |
|---|---|---|
| `/api/calendar` | GET | All calendar events + virtual schedule events |
| `/api/diet` | GET, POST | Meal logs |
| `/api/diet/[id]` | DELETE | Delete meal log |
| `/api/diet/recipes` | GET, POST | Recipe library |
| `/api/diet/recipes/[id]` | GET, PUT, DELETE | Single recipe |
| `/api/diet/meal-plan` | GET, POST, DELETE | Weekly meal plan entries |
| `/api/exercise` | GET, POST | Workout sessions |
| `/api/exercise/[id]` | DELETE | Delete workout session |
| `/api/exercise/plans` | GET, POST | Workout plan templates |
| `/api/exercise/plans/[id]` | GET, PUT, DELETE | Single workout plan |
| `/api/habits` | GET, POST | All habits (returns last 90 days of logs) |
| `/api/habits/[id]` | GET, PATCH, DELETE | Single habit |
| `/api/habits/[id]/logs` | GET, POST | Habit logs (upsert today's log) |
| `/api/learning` | GET, POST | Learning sessions |
| `/api/learning/[id]` | DELETE | Delete learning session |
| `/api/schedule` | GET, POST | Schedule blocks |
| `/api/schedule/[id]` | PUT, DELETE | Single schedule block |

## MCP Tools (Claude Desktop)
The MCP server exposes 19 tools to Claude Desktop:

**Reading:** `get_dashboard_summary`, `get_habits`, `get_calendar_events`, `get_trends`, `get_recipes`, `get_workout_plans`, `get_weekly_schedule`, `get_upcoming_schedule`

**Logging:** `log_meal`, `log_workout`, `log_learning_session`, `check_habit`

**Creating:** `create_habit`, `create_workout_plan`, `create_recipe`, `create_schedule_block`, `set_meal_plan_entry`

**Managing habits:** `update_habit`, `delete_habit`

### Claude Desktop config
Located at `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "personal_dashboard": {
      "command": "/Users/haras-gummer/personal-dashboard/mcp-server/node_modules/.bin/tsx",
      "args": ["/Users/haras-gummer/personal-dashboard/mcp-server/index.ts"],
      "env": { "DATABASE_URL": "file:/Users/haras-gummer/personal-dashboard/prisma/dev.db" }
    }
  }
}
```
**Important:** config key must use underscores (`personal_dashboard`), not hyphens — Claude normalizes tool names as `key:tool_name`.

## Database Schema (summary)
| Model | Key fields |
|---|---|
| `MealLog` | date, mealType, calories, protein, carbs, fat, recipeId? |
| `Recipe` | name, calories, protein, carbs, fat, ingredients[], steps[] |
| `MealPlanEntry` | dayOfWeek (0–6), mealType, recipeId?, description? — `@@unique([dayOfWeek, mealType])` |
| `WorkoutSession` | date, name, type, durationMin, exercises[] |
| `WorkoutPlan` | name, scheduledDays (JSON array of 0–6), exercises[] |
| `LearningSession` | date, category, title, durationMin, resource? |
| `Habit` | name, type (BUILD/QUIT), startDate, targetDays? |
| `HabitLog` | habitId, date, kept — `@@unique([habitId, date])` |
| `ScheduleBlock` | title, category, start, end, allDay |
| `CalendarEvent` | Unified projection; FKs to all domain tables |

## UI Conventions
- Dark mode by default (`<html className="dark">`)
- Primary colour: purple (`oklch(0.72 0.22 292)`)
- Sidebar navigation with light/dark toggle
- shadcn/ui components throughout
- Tabs pattern used in: Exercise (Weekly Schedule / Workouts / Sessions), Diet (Log / Recipes), Habits (Grid / Streaks)

## Habit Gamification
Each `HabitCard` shows:
- **14-day dot timeline** — orange = kept, red = missed, gray = no log
- **Milestone badge** — trophy icon when streak reaches 3/7/14/21/30/60/100 days
- **Progress bar** toward the next milestone

The **Streaks tab** shows a 30-day contribution chart (GitHub-style) for all habits, sorted by current streak, with % kept and flame count.
