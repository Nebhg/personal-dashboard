import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import os from "os";

const PROGRESS_PATH = path.join(os.homedir(), "macro learning", "progress.md");

const TRACK_NAMES: Record<number, string> = {
  1: "Track 1 — Options Pricing Theory & Practice",
  2: "Track 2 — Futures Contracts",
  3: "Track 3 — Volatility Modelling",
  4: "Track 4 — Index-Based Quant Strategies",
  5: "Track 5 — Behavioural / Narrative",
};

const LEVEL_EMOJI: Record<string, string> = {
  recall:      "🔵",
  application: "🟢",
  shaky:       "🟠",
};

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Regenerate ~/macro learning/progress.md from the MacroTopic DB table.
 * This file is injected by context.py into every dispatcher request for the
 * macro learning project, so the tutor always sees the current coverage state.
 */
export async function regenerateMacroProgress(): Promise<void> {
  try {
    const topics = await prisma.macroTopic.findMany({
      orderBy: [{ track: "asc" }, { coveredAt: "asc" }],
    });

    const today = new Date().toISOString().slice(0, 10);
    const lines: string[] = [
      `# Macro Learning Progress — Last updated: ${today}`,
      "",
      "**Level key:** 🔵 Recall — 🟢 Application — 🟠 Shaky (needs revisiting)",
      "",
      "---",
      "",
    ];

    // Group by track
    const byTrack = new Map<number, typeof topics>();
    const noTrack: typeof topics = [];

    for (const t of topics) {
      if (t.track == null) {
        noTrack.push(t);
      } else {
        if (!byTrack.has(t.track)) byTrack.set(t.track, []);
        byTrack.get(t.track)!.push(t);
      }
    }

    for (const trackNum of [1, 2, 3, 4, 5]) {
      const trackTopics = byTrack.get(trackNum) ?? [];
      lines.push(`## ${TRACK_NAMES[trackNum] ?? `Track ${trackNum}`}`);
      lines.push("");
      if (trackTopics.length === 0) {
        lines.push("- *Not started*");
      } else {
        for (const t of trackTopics) {
          const emoji = LEVEL_EMOJI[t.level] ?? "🔵";
          const noteStr = t.notes ? ` — ${t.notes}` : "";
          lines.push(`- ${emoji} **${t.topic}** (${fmtDate(t.coveredAt)})${noteStr}`);
        }
      }
      lines.push("");
    }

    if (noTrack.length > 0) {
      lines.push("## Untracked");
      lines.push("");
      for (const t of noTrack) {
        const emoji = LEVEL_EMOJI[t.level] ?? "🔵";
        lines.push(`- ${emoji} **${t.topic}** (${fmtDate(t.coveredAt)})`);
      }
      lines.push("");
    }

    // Summary
    type T = (typeof topics)[number];
    const appCount   = topics.filter((t: T) => t.level === "application").length;
    const shakyCount = topics.filter((t: T) => t.level === "shaky").length;
    lines.push("---", "");
    lines.push(`**${topics.length} topics covered** — ${appCount} at application level, ${shakyCount} flagged shaky`);
    lines.push("");

    fs.writeFileSync(PROGRESS_PATH, lines.join("\n"), "utf-8");
  } catch {
    // Never break the API response
  }
}
