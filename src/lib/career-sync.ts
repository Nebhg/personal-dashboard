import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import os from "os";

const TRACKER_MD_PATH = path.join(os.homedir(), "career_tracker", "tracker.md");

const STAGE_ORDER: Record<string, number> = {
  FINAL:     1,
  TECHNICAL: 2,
  SCREEN:    3,
  OFFER:     4,
  APPLIED:   5,
  REJECTED:  6,
  GHOSTED:   7,
};

const STAGE_LABELS: Record<string, string> = {
  APPLIED:   "Applied",
  SCREEN:    "Talent Screen",
  TECHNICAL: "Technical Assessment",
  FINAL:     "Final Stage",
  OFFER:     "Offer",
  REJECTED:  "Rejected",
  GHOSTED:   "Ghosted",
};

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "Unknown";
  return d.toISOString().slice(0, 10);
}

/**
 * Regenerate ~/career_tracker/tracker.md from the JobApplication DB.
 * The LOG section is preserved — existing entries are kept, not overwritten.
 * Safe to call fire-and-forget: never throws.
 */
export async function regenerateTrackerMd(): Promise<void> {
  try {
    const applications = await prisma.jobApplication.findMany({
      orderBy: { updatedAt: "desc" },
    });

    // Preserve the existing LOG section
    let existingLog = "";
    if (fs.existsSync(TRACKER_MD_PATH)) {
      const existing = fs.readFileSync(TRACKER_MD_PATH, "utf-8");
      const logMatch = existing.match(/^## LOG\n([\s\S]*)$/m);
      if (logMatch) {
        existingLog = logMatch[1].trimEnd();
      }
    }

    const active = applications
      .filter((a) => !["REJECTED", "GHOSTED"].includes(a.stage))
      .sort((a, b) => (STAGE_ORDER[a.stage] ?? 9) - (STAGE_ORDER[b.stage] ?? 9));

    const closed = applications.filter((a) =>
      ["REJECTED", "GHOSTED"].includes(a.stage)
    );

    const today = new Date().toISOString().slice(0, 10);
    const lines: string[] = [
      `# Career Tracker — Last updated: ${today}`,
      "",
      "---",
      "",
      "## ACTIVE PIPELINE",
      "",
    ];

    for (const a of active) {
      const roleStr = a.role ? ` — ${a.role}` : " — [Role TBC]";
      lines.push(`### ${a.firm}${roleStr}`);
      lines.push(`- **Stage:** ${STAGE_LABELS[a.stage] ?? a.stage}`);
      lines.push(`- **Applied:** ${fmtDate(a.appliedDate)}`);
      lines.push(`- **Last action:** ${a.lastAction ?? "—"}`);
      lines.push(`- **Next action:** ${a.nextAction ?? "—"}`);
      lines.push(`- **Prep needed:** ${a.prepNeeded ? "YES" : "NO"}`);
      if (a.prepNotes) {
        lines.push(`- **Prep notes:** ${a.prepNotes}`);
      }
      if (a.notes) {
        lines.push(`- **Notes:** ${a.notes}`);
      }
      lines.push("");
      lines.push("---");
      lines.push("");
    }

    if (active.length === 0) {
      lines.push("No active applications.");
      lines.push("");
      lines.push("---");
      lines.push("");
    }

    // Closed section
    lines.push("## CLOSED / INACTIVE");
    lines.push("");
    if (closed.length > 0) {
      for (const a of closed) {
        const roleStr = a.role ? ` — ${a.role}` : "";
        const reason = a.stage === "GHOSTED" ? "Ghosted" : "Rejected";
        const dateStr = a.appliedDate
        ? ` — ${fmtDate(a.appliedDate)}`
        : a.lastAction
        ? ""  // lastAction already contains the date narrative
        : "";
        const noteStr = a.notes ? ` (${a.notes})` : "";
        lines.push(`- ${a.firm}${roleStr} (${reason}${dateStr}${noteStr})`);
      }
    } else {
      lines.push("None.");
    }
    lines.push("");
    lines.push("---");
    lines.push("");

    // LOG section — preserve existing entries
    lines.push("## LOG");
    lines.push("");
    if (existingLog) {
      lines.push(existingLog.replace(/^\n+/, ""));  // strip leading blank lines
    }
    lines.push("");

    const content = lines.join("\n");
    fs.writeFileSync(TRACKER_MD_PATH, content, "utf-8");
  } catch {
    // Never let this break the API response
  }
}
