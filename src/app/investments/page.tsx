"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Save, Plus, Pencil, Trash2, ChevronDown, ChevronRight, Wallet, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Topbar, AtlasBtn } from "@/components/ui/topbar";
import { StatTile } from "@/components/ui/stat-tile";

// ─── Types ────────────────────────────────────────────────────────────────────

type LivePrice = {
  holdingId: string;
  ticker: string;
  price: number;
  priceCurrency: string;
  valueGbp: number;
  changePercent: number | null;
  quantity: number;
  costGbp: number;
};

type LivePriceState = {
  prices: Record<string, LivePrice>;
  gbpUsd: number | null;
  fetchedAt: string;
};

type Holding = {
  id: string;
  accountId: string;
  ticker: string | null;
  name: string;
  quantity: number;
  priceCurrency: string;
  lastPrice: number | null;
  valueGbp: number | null;
  costGbp: number;
  notes: string | null;
  updatedAt: string;
};

type Account = {
  id: string;
  name: string;
  broker: string;
  accountType: string;
  cashBalanceGbp: number;
  interestRate: number | null;
  isaAllowanceUsed: number | null;
  totalReturnGbp: number | null;
  notes: string | null;
  holdings: Holding[];
  updatedAt: string;
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  ISA_STOCKS: "Stocks & Shares ISA",
  ISA_CASH: "Cash ISA",
  INVEST: "Invest",
  SIPP: "SIPP",
  OTHER: "Other",
};

const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  ISA_STOCKS: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  ISA_CASH:   "bg-teal-500/15 text-teal-400 border-teal-500/30",
  INVEST:     "bg-blue-500/15 text-blue-400 border-blue-500/30",
  SIPP:       "bg-purple-500/15 text-purple-400 border-purple-500/30",
  OTHER:      "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function plColor(pl: number) {
  if (pl > 0) return "text-emerald-400";
  if (pl < 0) return "text-red-400";
  return "text-muted-foreground";
}

function calcHoldingsPl(holdings: Holding[], live?: Record<string, LivePrice>) {
  const value = holdings.reduce((s, h) => s + (live?.[h.id]?.valueGbp ?? h.valueGbp ?? 0), 0);
  const cost  = holdings.reduce((s, h) => s + h.costGbp, 0);
  return { value, cost, pl: value - cost, pct: cost > 0 ? ((value - cost) / cost) * 100 : 0 };
}

// ─── Add Holding Dialog ───────────────────────────────────────────────────────

function AddHoldingDialog({
  accountId,
  onAdd,
}: {
  accountId: string;
  onAdd: (h: Holding) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    ticker: "",
    name: "",
    quantity: "",
    priceCurrency: "USD",
    lastPrice: "",
    valueGbp: "",
    costGbp: "",
    notes: "",
  });

  async function submit() {
    if (!form.name || !form.quantity || !form.costGbp) return;
    const res = await fetch("/api/investments/holdings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId,
        ticker:        form.ticker       || null,
        name:          form.name,
        quantity:      parseFloat(form.quantity),
        priceCurrency: form.priceCurrency,
        lastPrice:     form.lastPrice  ? parseFloat(form.lastPrice)  : null,
        valueGbp:      form.valueGbp   ? parseFloat(form.valueGbp)   : null,
        costGbp:       parseFloat(form.costGbp),
        notes:         form.notes      || null,
      }),
    });
    const h = await res.json();
    onAdd(h);
    setOpen(false);
    setForm({ ticker: "", name: "", quantity: "", priceCurrency: "USD", lastPrice: "", valueGbp: "", costGbp: "", notes: "" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" />Add holding
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Holding</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="flex gap-2">
            <Input
              value={form.ticker}
              onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
              placeholder="Ticker (e.g. NVDA)"
              className="w-32"
            />
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name *"
              className="flex-1"
            />
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="Quantity *"
              className="flex-1"
            />
            <Select value={form.priceCurrency} onValueChange={(v) => setForm({ ...form, priceCurrency: v })}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["USD", "GBP", "EUR", "SEK", "DKK"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={form.lastPrice}
              onChange={(e) => setForm({ ...form, lastPrice: e.target.value })}
              placeholder={`Last price (${form.priceCurrency})`}
              className="flex-1"
            />
            <Input
              type="number"
              value={form.valueGbp}
              onChange={(e) => setForm({ ...form, valueGbp: e.target.value })}
              placeholder="Value (£)"
              className="flex-1"
            />
          </div>
          <Input
            type="number"
            value={form.costGbp}
            onChange={(e) => setForm({ ...form, costGbp: e.target.value })}
            placeholder="Cost basis (£) *"
          />
          <Input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes"
          />
          <Button onClick={submit} className="w-full">Add Holding</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Holding Row ──────────────────────────────────────────────────────────────

function HoldingRow({
  holding,
  livePrice,
  onUpdate,
  onDelete,
}: {
  holding: Holding;
  livePrice?: LivePrice;
  onUpdate: (id: string, data: Partial<Holding>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    ticker:        holding.ticker        ?? "",
    name:          holding.name,
    quantity:      String(holding.quantity),
    priceCurrency: holding.priceCurrency,
    lastPrice:     holding.lastPrice  != null ? String(holding.lastPrice)  : "",
    valueGbp:      holding.valueGbp   != null ? String(holding.valueGbp)   : "",
    costGbp:       String(holding.costGbp),
    notes:         holding.notes ?? "",
  });

  const displayPrice = livePrice?.price ?? holding.lastPrice;
  const displayValue = livePrice?.valueGbp ?? holding.valueGbp;
  const pl    = (displayValue ?? 0) - holding.costGbp;
  const plPct = holding.costGbp > 0 ? (pl / holding.costGbp) * 100 : 0;

  async function save() {
    await onUpdate(holding.id, {
      ticker:        form.ticker    || null,
      name:          form.name,
      quantity:      parseFloat(form.quantity),
      priceCurrency: form.priceCurrency,
      lastPrice:     form.lastPrice  ? parseFloat(form.lastPrice)  : null,
      valueGbp:      form.valueGbp   ? parseFloat(form.valueGbp)   : null,
      costGbp:       parseFloat(form.costGbp),
      notes:         form.notes || null,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <tr className="border-t border-border/30">
        <td colSpan={8} className="p-3">
          <div className="flex flex-wrap gap-2 items-end">
            <Input value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })} placeholder="Ticker" className="w-24 h-7 text-xs" />
            <Input value={form.name}   onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="flex-1 min-w-40 h-7 text-xs" />
            <Input type="number" value={form.quantity}  onChange={(e) => setForm({ ...form, quantity: e.target.value })}  placeholder="Qty"    className="w-20 h-7 text-xs" />
            <Input type="number" value={form.lastPrice} onChange={(e) => setForm({ ...form, lastPrice: e.target.value })} placeholder="Price"  className="w-24 h-7 text-xs" />
            <Input type="number" value={form.valueGbp}  onChange={(e) => setForm({ ...form, valueGbp: e.target.value })}  placeholder="£ val"  className="w-24 h-7 text-xs" />
            <Input type="number" value={form.costGbp}   onChange={(e) => setForm({ ...form, costGbp: e.target.value })}   placeholder="£ cost" className="w-24 h-7 text-xs" />
            <Button size="sm" onClick={save} className="h-7 text-xs">Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-7 text-xs">Cancel</Button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-border/30 hover:bg-muted/30 transition-colors group">
      <td className="py-2.5 px-3 text-xs font-mono font-medium">{holding.ticker ?? "—"}</td>
      <td className="py-2.5 px-3 text-xs text-muted-foreground max-w-48 truncate">{holding.name}</td>
      <td className="py-2.5 px-3 text-xs text-right tabular-nums">{holding.quantity}</td>
      <td className="py-2.5 px-3 text-xs text-right tabular-nums">
        <div className={livePrice ? "text-foreground" : "text-muted-foreground"}>
          {displayPrice != null ? `${displayPrice.toFixed(2)} ${holding.priceCurrency}` : "—"}
        </div>
        {livePrice?.changePercent != null && (
          <div className={cn("text-xs tabular-nums", plColor(livePrice.changePercent))}>
            {livePrice.changePercent >= 0 ? "+" : ""}{livePrice.changePercent.toFixed(2)}% today
          </div>
        )}
      </td>
      <td className="py-2.5 px-3 text-xs text-right tabular-nums font-medium">
        {displayValue != null ? `£${fmt(displayValue)}` : "—"}
      </td>
      <td className="py-2.5 px-3 text-xs text-right tabular-nums text-muted-foreground">£{fmt(holding.costGbp)}</td>
      <td className={cn("py-2.5 px-3 text-xs text-right tabular-nums font-medium", plColor(pl))}>
        {pl >= 0 ? "+" : ""}£{fmt(pl)}
      </td>
      <td className={cn("py-2.5 px-3 text-xs text-right tabular-nums", plColor(plPct))}>
        {pl >= 0 ? "+" : ""}{plPct.toFixed(1)}%
      </td>
      <td className="py-2.5 px-3">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground">
            <Pencil className="h-3 w-3" />
          </button>
          <button onClick={() => onDelete(holding.id)} className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Account Card ─────────────────────────────────────────────────────────────

function AccountCard({
  account,
  livePrices,
  onUpdateAccount,
  onUpdateHolding,
  onDeleteHolding,
  onAddHolding,
}: {
  account: Account;
  livePrices?: Record<string, LivePrice>;
  onUpdateAccount: (id: string, data: Partial<Account>) => void;
  onUpdateHolding: (id: string, data: Partial<Holding>) => void;
  onDeleteHolding: (id: string) => void;
  onAddHolding: (accountId: string, h: Holding) => void;
}) {
  const [holdingsOpen, setHoldingsOpen] = useState(true);
  const [editingCash, setEditingCash] = useState(false);
  const [cashDraft, setCashDraft] = useState(String(account.cashBalanceGbp));
  const [interestDraft, setInterestDraft] = useState(account.interestRate ? String(account.interestRate) : "");
  const [returnDraft, setReturnDraft] = useState(account.totalReturnGbp != null ? String(account.totalReturnGbp) : "");

  const { value: holdingsValue, cost: holdingsCost, pl, pct } = calcHoldingsPl(account.holdings, livePrices);
  const totalValue = holdingsValue + account.cashBalanceGbp;
  const annualInterest = account.interestRate && account.cashBalanceGbp > 0
    ? (account.cashBalanceGbp * account.interestRate) / 100
    : 0;

  async function saveCash() {
    await onUpdateAccount(account.id, {
      cashBalanceGbp: parseFloat(cashDraft) || 0,
      interestRate: interestDraft ? parseFloat(interestDraft) : null,
      totalReturnGbp: returnDraft ? parseFloat(returnDraft) : null,
    });
    setEditingCash(false);
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Account header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-sm">{account.name}</h3>
                <span className="text-xs text-muted-foreground">{account.broker}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", ACCOUNT_TYPE_COLORS[account.accountType] ?? ACCOUNT_TYPE_COLORS.OTHER)}>
                  {ACCOUNT_TYPE_LABELS[account.accountType] ?? account.accountType}
                </span>
              </div>
              <p className="text-2xl font-bold tabular-nums">£{fmt(totalValue)}</p>
              {account.holdings.length > 0 && (
                <p className={cn("text-sm font-medium tabular-nums", plColor(pl))}>
                  {pl >= 0 ? "+" : ""}£{fmt(pl)} ({pl >= 0 ? "+" : ""}{pct.toFixed(2)}%) on holdings
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              {account.cashBalanceGbp > 0 && (
                <div className="text-xs text-muted-foreground">
                  <div>Cash: <span className="font-medium text-foreground">£{fmt(account.cashBalanceGbp)}</span></div>
                  {account.totalReturnGbp != null && (
                    <div className={cn("font-medium", account.totalReturnGbp >= 0 ? "text-emerald-400" : "text-red-400")}>
                      Earned: +£{fmt(account.totalReturnGbp)}
                    </div>
                  )}
                  {account.interestRate && (
                    <div className="text-muted-foreground/70">~£{fmt(annualInterest)} p.a. projected</div>
                  )}
                </div>
              )}
              {account.isaAllowanceUsed != null && (
                <div className="text-xs text-muted-foreground mt-1">
                  ISA used: £{fmt(account.isaAllowanceUsed)} / £20,000
                </div>
              )}
            </div>
          </div>

          {/* Cash / interest edit */}
          <div className="mt-3 flex items-center gap-2">
            {editingCash ? (
              <>
                <Input
                  type="number"
                  value={cashDraft}
                  onChange={(e) => setCashDraft(e.target.value)}
                  placeholder="Cash (£)"
                  className="h-7 text-xs w-36"
                />
                <Input
                  type="number"
                  value={interestDraft}
                  onChange={(e) => setInterestDraft(e.target.value)}
                  placeholder="Interest rate %"
                  className="h-7 text-xs w-28"
                />
                <Input
                  type="number"
                  value={returnDraft}
                  onChange={(e) => setReturnDraft(e.target.value)}
                  placeholder="Earned (£)"
                  className="h-7 text-xs w-28"
                />
                <Button size="sm" onClick={saveCash} className="h-7 text-xs">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingCash(false)} className="h-7 text-xs">Cancel</Button>
              </>
            ) : (
              <button
                onClick={() => setEditingCash(true)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Pencil className="h-3 w-3" />
                Update cash balance
              </button>
            )}
          </div>
        </div>

        {/* Holdings */}
        {account.holdings.length > 0 && (
          <div>
            <button
              onClick={() => setHoldingsOpen(!holdingsOpen)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full border-b border-border/30"
            >
              {holdingsOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              {account.holdings.length} holding{account.holdings.length !== 1 ? "s" : ""} · cost £{fmt(holdingsCost)} · value £{fmt(holdingsValue)}
            </button>

            {holdingsOpen && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-muted-foreground bg-muted/30">
                      <th className="py-2 px-3 text-left font-medium">Ticker</th>
                      <th className="py-2 px-3 text-left font-medium">Name</th>
                      <th className="py-2 px-3 text-right font-medium">Qty</th>
                      <th className="py-2 px-3 text-right font-medium">Last Price</th>
                      <th className="py-2 px-3 text-right font-medium">Value</th>
                      <th className="py-2 px-3 text-right font-medium">Cost</th>
                      <th className="py-2 px-3 text-right font-medium">P&L</th>
                      <th className="py-2 px-3 text-right font-medium">P&L %</th>
                      <th className="py-2 px-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {account.holdings.map((h) => (
                      <HoldingRow
                        key={h.id}
                        holding={h}
                        livePrice={livePrices?.[h.id]}
                        onUpdate={onUpdateHolding}
                        onDelete={onDeleteHolding}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="px-4 py-2.5 flex items-center justify-between border-t border-border/30 bg-muted/10">
          <AddHoldingDialog accountId={account.id} onAdd={(h) => onAddHolding(account.id, h)} />
          <p className="text-xs text-muted-foreground">
            Updated {new Date(account.updatedAt).toLocaleDateString("en-GB")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Add Account Dialog ───────────────────────────────────────────────────────

function AddAccountDialog({ onAdd }: { onAdd: (a: Account) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    broker: "",
    accountType: "INVEST",
    cashBalanceGbp: "",
    interestRate: "",
    isaAllowanceUsed: "",
    notes: "",
  });

  async function submit() {
    if (!form.name || !form.broker) return;
    const res = await fetch("/api/investments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:             form.name,
        broker:           form.broker,
        accountType:      form.accountType,
        cashBalanceGbp:   form.cashBalanceGbp   ? parseFloat(form.cashBalanceGbp)   : 0,
        interestRate:     form.interestRate      ? parseFloat(form.interestRate)      : null,
        isaAllowanceUsed: form.isaAllowanceUsed  ? parseFloat(form.isaAllowanceUsed)  : null,
        notes:            form.notes || null,
      }),
    });
    const a = await res.json();
    onAdd(a);
    setOpen(false);
    setForm({ name: "", broker: "", accountType: "INVEST", cashBalanceGbp: "", interestRate: "", isaAllowanceUsed: "", notes: "" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Investment Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="flex gap-2">
            <Input value={form.name}   onChange={(e) => setForm({ ...form, name: e.target.value })}   placeholder="Account name *" className="flex-1" />
            <Input value={form.broker} onChange={(e) => setForm({ ...form, broker: e.target.value })} placeholder="Broker *"       className="flex-1" />
          </div>
          <Select value={form.accountType} onValueChange={(v) => setForm({ ...form, accountType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(ACCOUNT_TYPE_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input type="number" value={form.cashBalanceGbp}   onChange={(e) => setForm({ ...form, cashBalanceGbp: e.target.value })}   placeholder="Cash balance (£)"   className="flex-1" />
            <Input type="number" value={form.interestRate}      onChange={(e) => setForm({ ...form, interestRate: e.target.value })}      placeholder="Interest rate %"     className="flex-1" />
          </div>
          {(form.accountType === "ISA_STOCKS" || form.accountType === "ISA_CASH") && (
            <Input type="number" value={form.isaAllowanceUsed} onChange={(e) => setForm({ ...form, isaAllowanceUsed: e.target.value })} placeholder="ISA allowance used (£)" />
          )}
          <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" />
          <Button onClick={submit} className="w-full">Add Account</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InvestmentsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState<LivePriceState | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/investments")
      .then((r) => r.json())
      .then((data) => { setAccounts(data); setLoading(false); });
  }, []);

  // Fetch live prices once accounts have loaded
  useEffect(() => {
    if (!loading && accounts.length > 0) fetchLivePrices();
  }, [loading]);

  async function fetchLivePrices() {
    setLiveLoading(true);
    setLiveError(null);
    try {
      const r = await fetch("/api/investments/prices");
      const data = await r.json();
      if (data.error) { setLiveError(data.error); return; }
      setLive(data);
    } catch (e) {
      setLiveError(String(e));
    } finally {
      setLiveLoading(false);
    }
  }

  async function saveLivePrices() {
    if (!live) return;
    setSaving(true);
    try {
      await fetch("/api/investments/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prices: Object.fromEntries(
          Object.entries(live.prices).map(([id, p]) => [id, { price: p.price, valueGbp: p.valueGbp }])
        )}),
      });
      // Refresh accounts from DB to reflect saved prices
      const data = await fetch("/api/investments").then(r => r.json());
      setAccounts(data);
    } finally {
      setSaving(false);
    }
  }

  // ── Aggregates ──
  const allHoldings = accounts.flatMap((a) => a.holdings);
  const { value: totalHoldingsValue, cost: totalCost, pl: totalPl, pct: totalPct } = calcHoldingsPl(allHoldings, live?.prices);
  const totalCash = accounts.reduce((s, a) => s + a.cashBalanceGbp, 0);
  const totalPortfolio = totalHoldingsValue + totalCash;
  const annualInterestTotal = accounts.reduce((s, a) => {
    if (a.interestRate && a.cashBalanceGbp > 0) return s + (a.cashBalanceGbp * a.interestRate) / 100;
    return s;
  }, 0);

  // ── Handlers ──
  async function handleUpdateAccount(id: string, data: Partial<Account>) {
    const res = await fetch(`/api/investments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    setAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }

  async function handleUpdateHolding(id: string, data: Partial<Holding>) {
    const res = await fetch(`/api/investments/holdings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    setAccounts((prev) =>
      prev.map((a) => ({
        ...a,
        holdings: a.holdings.map((h) => (h.id === id ? updated : h)),
      }))
    );
  }

  async function handleDeleteHolding(id: string) {
    await fetch(`/api/investments/holdings/${id}`, { method: "DELETE" });
    setAccounts((prev) =>
      prev.map((a) => ({ ...a, holdings: a.holdings.filter((h) => h.id !== id) }))
    );
  }

  function handleAddAccount(a: Account) {
    setAccounts((prev) => [...prev, a]);
  }

  function handleAddHolding(accountId: string, h: Holding) {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId ? { ...a, holdings: [...a.holdings, h] } : a
      )
    );
  }

  const liveStatusCrumb = live
    ? `LIVE · ${new Date(live.fetchedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
    : `${accounts.length} ACCOUNTS · ${allHoldings.length} HOLDINGS`;

  return (
    <>
      <Topbar
        title="Investments"
        crumb={liveStatusCrumb}
        actions={
          <div className="flex items-center gap-2">
            {live && (
              <AtlasBtn variant="default" onClick={saveLivePrices} disabled={saving}>
                <Save className="h-[13px] w-[13px]" />
                {saving ? "Saving…" : "Save prices"}
              </AtlasBtn>
            )}
            <AtlasBtn variant="default" onClick={fetchLivePrices} disabled={liveLoading}>
              <RefreshCw className={cn("h-[13px] w-[13px]", liveLoading && "animate-spin")} />
              {liveLoading ? "Fetching…" : "Refresh"}
            </AtlasBtn>
            <AddAccountDialog onAdd={handleAddAccount} />
          </div>
        }
      />

      <div className="px-8 pt-7 pb-16 max-w-5xl">
        {/* Live price status */}
        {(liveLoading || liveError) && (
          <div className="mb-4">
            {liveLoading && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3 animate-spin" /> Fetching live prices from Yahoo Finance…
              </p>
            )}
            {!liveLoading && liveError && (
              <p className="text-xs text-red-400 flex items-center gap-1.5">
                <WifiOff className="h-3 w-3" /> Could not fetch live prices: {liveError}
              </p>
            )}
          </div>
        )}

        {/* Stat tiles */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatTile
            label="Total portfolio"
            num={`£${fmt(totalPortfolio)}`}
            sub={<span>{accounts.length} accounts</span>}
          />
          <StatTile
            label="Holdings P&L"
            num={`${totalPl >= 0 ? "+" : ""}£${fmt(totalPl)}`}
            sub={<span className={plColor(totalPct)}>{totalPct >= 0 ? "+" : ""}{totalPct.toFixed(2)}%</span>}
            delta={totalPl >= 0 ? `+${totalPct.toFixed(1)}%` : `${totalPct.toFixed(1)}%`}
            deltaDir={totalPl >= 0 ? "up" : "down"}
          />
          <StatTile
            label="Cash uninvested"
            num={`£${fmt(totalCash)}`}
            sub={annualInterestTotal > 0 ? <span>~£{fmt(annualInterestTotal)} p.a.</span> : <span>no interest</span>}
          />
          <StatTile
            label="Cost basis"
            num={`£${fmt(totalCost)}`}
            sub={<span>holdings only</span>}
          />
        </div>

        {/* Live prices badge */}
        {!liveLoading && live && (
          <p className="text-xs flex items-center gap-1.5 mb-4" style={{ color: "oklch(0.72 0.16 165)" }}>
            <Wifi className="h-3 w-3" />
            Live as of {new Date(live.fetchedAt).toLocaleTimeString("en-GB")}
            {live.gbpUsd && <span className="ml-2" style={{ color: "var(--fg-3)" }}>GBP/USD {live.gbpUsd.toFixed(4)}</span>}
          </p>
        )}

        {/* Account cards */}
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : accounts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No accounts yet</p>
            <p className="text-sm mt-1">Add an account to start tracking</p>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((acc) => (
              <AccountCard
                key={acc.id}
                account={acc}
                livePrices={live?.prices}
                onUpdateAccount={handleUpdateAccount}
                onUpdateHolding={handleUpdateHolding}
                onDeleteHolding={handleDeleteHolding}
                onAddHolding={handleAddHolding}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
