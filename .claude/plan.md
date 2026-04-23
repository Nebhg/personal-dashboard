# Life of Ben — Implementation Plan
*Last updated: 2026-04-23*

This document tracks the full build-out of Ben's personal OS: a personal dashboard (Next.js + Prisma + SQLite), a CLI dispatcher (FastAPI + Claude Code subprocess), and Cowork skills — all linked through a single SQLite DB as the source of truth.

---

## ✅ COMPLETED

### Infrastructure
- FastAPI dispatcher (`~/claude-dispatcher/`) with Claude Code subprocess, SSE streaming, history-aware conversations, NTFY push notifications, iOS PWA UI
- Personal dashboard (`~/personal-dashboard/`) — Next.js App Router + Prisma 7 + SQLite + shadcn/ui
- MCP server (`~/personal-dashboard/mcp-server/`) — 22 tools exposed to Claude Desktop/Cowork

### DB as single source of truth — all project domains wired

#### Career pipeline
- `JobApplication` Prisma model with full pipeline fields
- Dashboard UI at `/career` — add, edit, stage-update, prep flag
- `src/lib/career-sync.ts` — `regenerateTrackerMd()` regenerates `~/career_tracker/tracker.md` on every write
- API routes: `GET/POST /api/career`, `PATCH/DELETE /api/career/[id]`
- MCP tools: `get_applications`, `add_application`, `update_application`
- Live career pipeline injected into every dispatcher request via `context.py`
- Dashboard card on `/dashboard` showing active count + prep flags

#### LeetCode
- `LeetCodeProblem` Prisma model (name, number, pattern, difficulty, timeMins, approach, confidence, notes, date)
- Dashboard UI at `/leetcode` — log problems, stats summary, patterns covered
- `src/lib/leetcode-sync.ts` — `regenerateProgressMd()` regenerates `~/leetcode/PROGRESS.md` on every write (preserves pre-DB era content above `<!-- DB_GENERATED_BELOW -->` marker)
- API routes: `GET/POST /api/leetcode`, `PATCH/DELETE /api/leetcode/[id]`
- MCP tools: `log_leetcode_problem`, `get_leetcode_problems`
- LeetCode activity (last 14 days + patterns) injected into every dispatcher request

#### Macro learning
- `MacroTopic` Prisma model (topic, track 1–5, level: recall/application/shaky, coveredAt, notes)
- Dashboard UI at `/macro` — log topics by curriculum track, level badges
- `src/lib/macro-sync.ts` — `regenerateMacroProgress()` regenerates `~/macro learning/progress.md` on every write
- API routes: `GET/POST /api/macro`, `PATCH/DELETE /api/macro/[id]`
- MCP tools: `log_macro_topic`, `get_macro_topics`, `update_macro_topic`
- Macro coverage (all topics by track + shaky flags) injected into every dispatcher request
- `context.py` now checks `progress.md` first when reading supplemental context for a project

#### Health domains (pre-existing, already wired)
- Habits, diet, workouts, learning sessions — all in DB, all injected into dispatcher context

### cv-ben Cowork skill
- `~/career_tracker/CVs/base_content.json` — canonical CV source of truth
- Skill generates `Ben_Haras-Gummer_<Company>.docx` + `.pdf` into `~/career_tracker/CVs/`
- Tailors summary, technologies order, and CA-CIB bullets to match JD language
- Existing tailored CVs: ManAHL, Winton

---

## 🔴 TOP PRIORITY — CV Integration Gaps

### 1. Consolidate duplicate CV folders
**Problem:** Two folders exist — `~/career_tracker/CVs/` (capital V, what the skill uses) and `~/career_tracker/cvs/` (lowercase, appears to be a stale duplicate). Both contain the same files.

**Fix:**
- Verify both folders have identical contents
- Delete `~/career_tracker/cvs/` (lowercase)
- Confirm skill's `generate_cv.js` and `soffice_wrapper.py` both write to `~/career_tracker/CVs/` (capital V)

---

### 2. Add `cvPath` field to `JobApplication`
**Problem:** When a tailored CV is generated for a company, nothing links it back to the `JobApplication` DB record. The dashboard, dispatcher context, and tracker.md have no visibility into CV status per application.

**Fix — Prisma schema** (`prisma/schema.prisma`):
```prisma
model JobApplication {
  // ... existing fields ...
  cvPath String? // relative path to tailored CV e.g. "CVs/Ben_Haras-Gummer_GSS.pdf"
}
```

**Fix — migration:**
```bash
cd ~/personal-dashboard
npx prisma migrate dev --name add_cv_path_to_job_application
```

**Fix — career-sync.ts:** Include `cvPath` in the generated tracker.md output:
```typescript
if (a.cvPath) lines.push(`- **CV used:** ${a.cvPath}`);
```

**Fix — context.py:** Include `cvPath` in the career pipeline snapshot:
```python
cv_str = f" [CV: {a['cvPath']}]" if a["cvPath"] else " [no CV]"
lines.append(f"- **{a['firm']}{role_str}** [{a['stage']}]{prep_str}{cv_str}")
```

**Fix — cv-ben skill:** After generating a CV, PATCH the matching `JobApplication` via the API:
```bash
# After generating Ben_Haras-Gummer_GSS.pdf, find the GSS application and update it
APP_ID=$(curl -s http://localhost:3001/api/career | python3 -c "
import sys, json
apps = json.load(sys.stdin)
match = next((a for a in apps if '<FIRM>' in a['firm'].lower()), None)
print(match['id'] if match else '')
")
if [ -n "$APP_ID" ]; then
  curl -s -X PATCH "http://localhost:3001/api/career/$APP_ID" \
    -H "Content-Type: application/json" \
    -d "{\"cvPath\": \"CVs/Ben_Haras-Gummer_<Company>.pdf\"}"
fi
```
Add this to the cv-ben skill's SKILL.md after the PDF conversion step.

---

### 3. Resolve duplicate application notes (DB vs markdown files)
**Problem:** `~/career_tracker/applications/` contains per-company markdown files (`B2C2_notes.md`, `B2C2_cover_letter.md` etc.) that duplicate/diverge from the `notes` field in `JobApplication`. Two sources of truth will drift.

**Decision needed — pick one:**

**Option A (recommended):** Keep markdown files for rich content (cover letters, long notes), add a `coverLetterPath` field to `JobApplication` pointing to the file. DB `notes` field = short operational notes only. Dispatcher context shows DB notes; full file is accessible via path.

**Option B:** Merge everything into DB. Move cover letter text into a new `coverLetter` text field on `JobApplication`. Delete the markdown files. Simpler but loses file-based editing.

**Implementation for Option A:**
```prisma
model JobApplication {
  // ... existing fields ...
  cvPath          String? // "CVs/Ben_Haras-Gummer_GSS.pdf"
  coverLetterPath String? // "applications/GSS_cover_letter.md"
}
```
Migration: `npx prisma migrate dev --name add_cv_and_cover_letter_paths`

Update `career-sync.ts` and `context.py` to include these paths where present.

Seed existing paths via the API:
```bash
# Example — do for each company that has files
curl -X PATCH http://localhost:3001/api/career/<ID> \
  -H "Content-Type: application/json" \
  -d '{"coverLetterPath": "applications/B2C2_cover_letter.md"}'
```

---

## 🟡 NEXT — Complete the Read/Write Loop

### Step 3 — Wire AI Coach page to dispatcher backend
**Location:** `~/personal-dashboard/src/app/ai/page.tsx` (currently a stub)

**What to build:**
- POST user messages to `http://<TAILSCALE_IP>:8765/converse` with `project_path` set to the life-of-ben folder
- Stream or poll response (dispatcher already supports both — use polling for reliability, matching iOS behaviour)
- Show conversation history via `GET /all-conversations` or `/conversations?project=...`
- This makes the dashboard a proper web frontend for the same backend the iOS app uses — same context, same history

**Key files:**
- `~/claude-dispatcher/server.py` — `/converse` and `/conversations` endpoints already exist
- `~/personal-dashboard/src/app/api/ai/route.ts` — create as a proxy to avoid CORS issues (Next.js API proxies to the dispatcher)

---

### Step 4 — Add personal dashboard MCP to dispatcher subprocesses
**Problem:** The dispatcher can *read* all DB data via context injection but cannot *write* back mid-conversation. The agent can tell you your GSS application needs prep but can't flag it in the DB itself.

**Fix — add MCP config to `~/.claude.json`:**
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
This is the same config as Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`) — just copy it to `~/.claude.json` so Claude Code subprocesses spawned by the dispatcher also have it.

**Result:** During a dispatcher session, the agent can call `update_application`, `log_leetcode_problem`, `log_macro_topic` etc. directly — DB writes happen mid-conversation.

---

## 🟢 POLISH — Skills & Automation

### Step 5 — Morning check-in skill
A Cowork skill (`~/.claude/skills/morning-checkin/`) that:
1. Calls `get_dashboard_summary` MCP tool for today's snapshot
2. Calls `get_applications(activeOnly: true)` for pipeline
3. Reads `~/leetcode/PROGRESS.md` last section for recent activity
4. Reads `~/macro learning/progress.md` for shaky topics
5. Produces a structured daily briefing: what needs action today (career next actions, habits not yet logged, prep flags), what's been neglected this week (no workouts, no learning sessions), shaky macro topics to revisit

### Step 6 — Weekly review skill
End-of-week rollup skill that:
1. Queries DB for week's activity across all domains
2. Produces: problems solved (LeetCode), topics covered (macro), applications progressed (career), habits kept %
3. Auto-updates the `## CURRENT FOCUS AREAS` section in the master `CLAUDE.md`

### Step 7 — New project onboarding (future)
A guided Cowork flow for adding a new project domain:
1. Collect: project name, what data to track, what file to auto-generate
2. Generate: Prisma model, migration, API routes, sync module, dashboard page, MCP tools, sidebar entry
3. All from a template — no manual scaffolding

---

## File map (key paths)

| What | Path |
|---|---|
| Master orchestrator | `~/Documents/Claude/Projects/Life of Ben/CLAUDE.md` |
| Implementation plan (this file) | `~/Documents/Claude/Projects/Life of Ben/IMPLEMENTATION_PLAN.md` |
| Personal dashboard | `~/personal-dashboard/` |
| Prisma schema | `~/personal-dashboard/prisma/schema.prisma` |
| Career sync | `~/personal-dashboard/src/lib/career-sync.ts` |
| LeetCode sync | `~/personal-dashboard/src/lib/leetcode-sync.ts` |
| Macro sync | `~/personal-dashboard/src/lib/macro-sync.ts` |
| MCP server | `~/personal-dashboard/mcp-server/index.ts` |
| Dispatcher | `~/claude-dispatcher/` |
| Dispatcher context | `~/claude-dispatcher/context.py` (deploy from `dispatcher-update/context.py`) |
| Career tracker | `~/career_tracker/tracker.md` (auto-generated) |
| CV source of truth | `~/career_tracker/CVs/base_content.json` |
| Tailored CVs | `~/career_tracker/CVs/Ben_Haras-Gummer_<Company>.docx/.pdf` |
| Application notes | `~/career_tracker/applications/<Company>_notes.md` |
| LeetCode progress | `~/leetcode/PROGRESS.md` (auto-generated below marker) |
| Macro progress | `~/macro learning/progress.md` (auto-generated) |
| cv-ben skill | `/var/folders/.../skills/cv-ben/SKILL.md` |

---

## Pending terminal commands

```bash
# 1. Run combined migration (LeetCode + Macro — if not done yet)
cd ~/personal-dashboard && npx prisma migrate dev --name add_leetcode_and_macro

# 2. Deploy updated context.py to dispatcher
cp ~/Documents/Claude/Projects/Life\ of\ Ben/dispatcher-update/context.py ~/claude-dispatcher/context.py

# 3. Seed LeetCode problems from PROGRESS.md
bash ~/Documents/Claude/Projects/Life\ of\ Ben/seed_leetcode.sh

# 4. Seed macro topics from CLAUDE.md
bash ~/Documents/Claude/Projects/Life\ of\ Ben/seed_macro.sh

# 5. After CV path field is added — run migration
cd ~/personal-dashboard && npx prisma migrate dev --name add_cv_and_cover_letter_paths
```