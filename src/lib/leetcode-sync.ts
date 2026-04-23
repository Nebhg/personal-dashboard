import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import os from "os";

const PROGRESS_MD_PATH = path.join(os.homedir(), "leetcode", "PROGRESS.md");

// Marker — everything above this line in the existing file is preserved as-is
const PRESERVE_MARKER = "<!-- DB_GENERATED_BELOW -->";

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function approachEmoji(approach: string | null): string {
  if (!approach) return "";
  if (approach === "Recalled") return " 🟢";
  if (approach === "Reasoned") return " 🟡";
  if (approach === "Needed hints") return " 🔴";
  return "";
}

/**
 * Regenerate ~/leetcode/PROGRESS.md from the LeetCodeProblem DB table.
 * Content above <!-- DB_GENERATED_BELOW --> is preserved verbatim.
 * On first run (no marker present), the entire existing file is preserved as
 * a "pre-DB era" header.
 */
export async function regenerateProgressMd(): Promise<void> {
  try {
    const problems = await prisma.leetCodeProblem.findMany({
      orderBy: { date: "asc" },
    });

    // Build preserved header
    let header = "";
    if (fs.existsSync(PROGRESS_MD_PATH)) {
      const existing = fs.readFileSync(PROGRESS_MD_PATH, "utf-8");
      const markerIdx = existing.indexOf(PRESERVE_MARKER);
      if (markerIdx !== -1) {
        header = existing.slice(0, markerIdx).trimEnd();
      } else {
        // First run — preserve everything as pre-DB era content
        header = existing.trimEnd();
      }
    }

    // Summary stats
    type Problem = (typeof problems)[number];
    const total = problems.length;
    const patterns = [...new Set(problems.map((p: Problem) => p.pattern).filter((x: string | null): x is string => !!x))];
    const withConf = problems.filter((p: Problem) => p.confidence != null);
    const avgConf =
      withConf.length > 0
        ? (withConf.reduce((s: number, p: Problem) => s + (p.confidence ?? 0), 0) / withConf.length).toFixed(1)
        : "—";
    const lastDate =
      problems.length > 0 ? fmtDate(problems[problems.length - 1].date) : "—";

    const today = new Date().toISOString().slice(0, 10);
    const generated: string[] = [
      "",
      PRESERVE_MARKER,
      "",
      `# Problems Log — Last updated: ${today}`,
      "",
      "## Summary",
      `- **Total problems logged:** ${total}`,
      `- **Patterns covered:** ${patterns.length > 0 ? patterns.join(", ") : "none yet"}`,
      `- **Average confidence:** ${avgConf}/10`,
      `- **Last session:** ${lastDate}`,
      "",
      "---",
      "",
    ];

    // Group problems by date
    const byDate = new Map<string, typeof problems>();
    for (const p of problems) {
      const key = fmtDate(p.date);
      if (!byDate.has(key)) byDate.set(key, []);
      byDate.get(key)!.push(p);
    }

    for (const [date, dayProblems] of byDate) {
      generated.push(`### ${date}`);
      for (const p of dayProblems) {
        const num = p.number ? ` (#${p.number})` : "";
        const diff = p.difficulty ? ` [${p.difficulty}]` : "";
        const pat = p.pattern ? ` — ${p.pattern}` : "";
        const conf = p.confidence ? ` — Confidence: ${p.confidence}/10` : "";
        const approach = p.approach
          ? `${approachEmoji(p.approach)} ${p.approach}`
          : null;
        const time = p.timeMins ? `${p.timeMins} min` : null;

        generated.push(`- [x] **${p.name}**${num}${diff}${pat}${conf}`);

        const meta = [approach, time ? `Time: ${time}` : null]
          .filter(Boolean)
          .join(" | ");
        if (meta) generated.push(`  - ${meta}`);
        if (p.notes) generated.push(`  - Notes: ${p.notes}`);
      }
      generated.push("");
    }

    if (problems.length === 0) {
      generated.push("_No problems logged yet._");
      generated.push("");
    }

    const content = (header ? header + "\n" : "") + generated.join("\n");
    fs.writeFileSync(PROGRESS_MD_PATH, content, "utf-8");
  } catch {
    // Never break the API response
  }
}
