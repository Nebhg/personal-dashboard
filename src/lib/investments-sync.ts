import * as fs from "fs";
import * as path from "path";
import { prisma } from "./prisma";

const PORTFOLIO_MD_PATH = path.join(
  process.env.HOME ?? "~",
  "investments",
  "portfolio.md"
);

export async function regeneratePortfolioMd(): Promise<void> {
  try {
    const accounts = await prisma.investmentAccount.findMany({
      include: { holdings: { orderBy: { valueGbp: "desc" } } },
      orderBy: { createdAt: "asc" },
    });

    const today = new Date().toISOString().split("T")[0];

    const lines: string[] = [
      `# Investment Portfolio — Last updated: ${today}`,
      "",
      "---",
      "",
    ];

    for (const acc of accounts) {
      const holdingsValue = acc.holdings.reduce((s, h) => s + (h.valueGbp ?? 0), 0);
      const holdingsCost = acc.holdings.reduce((s, h) => s + h.costGbp, 0);
      const totalValue = holdingsValue + acc.cashBalanceGbp;
      const plGbp = holdingsValue - holdingsCost;
      const plPct = holdingsCost > 0 ? ((plGbp / holdingsCost) * 100).toFixed(2) : "N/A";

      lines.push(`## ${acc.name} (${acc.broker})`);
      lines.push(`- **Type:** ${acc.accountType}`);
      lines.push(`- **Total value:** £${totalValue.toFixed(2)}`);
      if (acc.cashBalanceGbp > 0) {
        lines.push(`- **Cash (uninvested):** £${acc.cashBalanceGbp.toFixed(2)}${acc.interestRate ? ` @ ${acc.interestRate}% p.a.` : ""}`);
        if (acc.interestRate) {
          const annualInterest = (acc.cashBalanceGbp * acc.interestRate) / 100;
          lines.push(`- **Projected annual interest:** £${annualInterest.toFixed(2)}`);
        }
        if ((acc as { totalReturnGbp?: number | null }).totalReturnGbp != null) {
          lines.push(`- **Interest earned to date:** £${((acc as { totalReturnGbp: number }).totalReturnGbp).toFixed(2)}`);
        }
      }
      if (acc.isaAllowanceUsed !== null && acc.isaAllowanceUsed !== undefined) {
        lines.push(`- **ISA allowance used:** £${acc.isaAllowanceUsed.toFixed(2)} / £20,000`);
      }
      if (acc.holdings.length > 0) {
        lines.push(`- **Holdings P&L:** £${plGbp.toFixed(2)} (${plPct}%)`);
        lines.push("");
        lines.push("| Ticker | Name | Qty | Last Price | Value (£) | Cost (£) | P&L (£) | P&L (%) |");
        lines.push("|--------|------|-----|-----------|-----------|----------|---------|---------|");
        for (const h of acc.holdings) {
          const hPl = (h.valueGbp ?? 0) - h.costGbp;
          const hPlPct = h.costGbp > 0 ? ((hPl / h.costGbp) * 100).toFixed(1) : "N/A";
          const price = h.lastPrice ? `${h.lastPrice.toFixed(2)} ${h.priceCurrency}` : "—";
          lines.push(
            `| ${h.ticker ?? "—"} | ${h.name} | ${h.quantity} | ${price} | £${(h.valueGbp ?? 0).toFixed(2)} | £${h.costGbp.toFixed(2)} | £${hPl.toFixed(2)} | ${hPlPct}% |`
          );
        }
      }
      lines.push("");
      lines.push("---");
      lines.push("");
    }

    // Grand total
    const allHoldings = accounts.flatMap((a) => a.holdings);
    const totalHoldingsValue = allHoldings.reduce((s, h) => s + (h.valueGbp ?? 0), 0);
    const totalHoldingsCost = allHoldings.reduce((s, h) => s + h.costGbp, 0);
    const totalCash = accounts.reduce((s, a) => s + a.cashBalanceGbp, 0);
    const totalValue = totalHoldingsValue + totalCash;
    const totalPl = totalHoldingsValue - totalHoldingsCost;
    const totalPlPct = totalHoldingsCost > 0 ? ((totalPl / totalHoldingsCost) * 100).toFixed(2) : "N/A";

    lines.push("## TOTAL PORTFOLIO");
    lines.push(`- **Holdings value:** £${totalHoldingsValue.toFixed(2)}`);
    lines.push(`- **Cash:** £${totalCash.toFixed(2)}`);
    lines.push(`- **Total value:** £${totalValue.toFixed(2)}`);
    lines.push(`- **Total cost basis (holdings):** £${totalHoldingsCost.toFixed(2)}`);
    lines.push(`- **Holdings P&L:** £${totalPl.toFixed(2)} (${totalPlPct}%)`);

    const dir = path.dirname(PORTFOLIO_MD_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PORTFOLIO_MD_PATH, lines.join("\n") + "\n", "utf-8");
  } catch (err) {
    console.error("investments-sync: failed to regenerate portfolio.md", err);
  }
}
