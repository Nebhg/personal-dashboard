"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Utensils,
  Dumbbell,
  Target,
  Briefcase,
  Code2,
  TrendingUp,
  Wallet,
  BookOpen,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const WORKSPACE = [
  { href: "/dashboard",   label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar",    label: "Calendar",  icon: Calendar },
  { href: "/habits",      label: "Habits",    icon: Target },
  { href: "/diet",        label: "Diet",      icon: Utensils },
  { href: "/exercise",    label: "Exercise",  icon: Dumbbell },
];

const TRACKING = [
  { href: "/career",      label: "Career",      icon: Briefcase },
  { href: "/leetcode",    label: "LeetCode",    icon: Code2 },
  { href: "/macro",       label: "Macro",       icon: TrendingUp },
  { href: "/investments", label: "Investments", icon: Wallet },
  { href: "/learning",    label: "Learning",    icon: BookOpen },
];

function NavItem({
  href,
  label,
  icon: Icon,
  count,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  count?: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-[10px] px-3 py-[7px] text-[13px] rounded-[4px] transition-colors no-underline",
        active
          ? "bg-[var(--sidebar-accent)] text-foreground"
          : "text-[var(--fg-2,oklch(0.78_0.01_240))] hover:bg-[var(--sidebar-accent)] hover:text-foreground"
      )}
    >
      {active && (
        <span
          className="absolute left-0 top-2 bottom-2 w-[2px] rounded-[1px] bg-primary"
          aria-hidden
        />
      )}
      <Icon
        className={cn(
          "shrink-0",
          active ? "text-primary" : "text-[var(--fg-3,oklch(0.58_0.01_240))]"
        )}
        style={{ width: 14, height: 14 }}
      />
      <span className="flex-1 min-w-0">{label}</span>
      {count != null && (
        <span className="mono text-[10px] text-[var(--fg-3,oklch(0.58_0.01_240))]">
          {String(count).padStart(2, "0")}
        </span>
      )}
    </Link>
  );
}

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full w-[220px] flex flex-col z-40",
        "transition-transform duration-200 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
      style={{ borderRight: "1px solid var(--hairline, oklch(1 0 0 / 0.07))", background: "var(--sidebar)" }}
    >
      {/* Brand */}
      <div
        className="px-6 pb-6 pt-7 relative"
        style={{ borderBottom: "1px solid var(--hairline, oklch(1 0 0 / 0.07))" }}
      >
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 lg:hidden flex items-center justify-center w-7 h-7 rounded-[4px] text-[var(--fg-3)] hover:text-foreground transition-colors"
            aria-label="Close navigation"
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        )}
        <div className="flex items-center gap-[10px]">
          {/* Glyph: half-fill diagonal + inset border */}
          <div
            className="relative shrink-0 rounded-[3px]"
            style={{
              width: 22,
              height: 22,
              background:
                "linear-gradient(135deg, var(--primary) 0 50%, var(--muted) 50% 100%)",
            }}
          >
            <span
              className="absolute rounded-[1px]"
              style={{
                inset: 4,
                border: "1px solid var(--background)",
              }}
            />
          </div>
          <div>
            <div className="text-[13px] font-semibold tracking-[-0.01em] leading-none">Atlas</div>
            <div
              className="mono text-[10px] tracking-[0.1em] uppercase mt-1 leading-none"
              style={{ color: "var(--fg-3, oklch(0.58 0.01 240))" }}
            >
              v2.4 · personal
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
        <div>
          <div className="label px-3 pb-1.5">Workspace</div>
          <div className="space-y-px">
            {WORKSPACE.map((item) => (
              <NavItem key={item.href} {...item} active={isActive(item.href)} />
            ))}
          </div>
        </div>
        <div>
          <div className="label px-3 pb-1.5">Tracking</div>
          <div className="space-y-px">
            {TRACKING.map((item) => (
              <NavItem key={item.href} {...item} active={isActive(item.href)} />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div
        className="mx-3 pt-4 pb-4 space-y-0"
        style={{ borderTop: "1px solid var(--hairline, oklch(1 0 0 / 0.07))" }}
      >
        <div className="flex items-center justify-between px-3 py-2">
          <span className="label" style={{ fontSize: 9 }}>Local time</span>
          <span className="mono text-[11px]" style={{ color: "var(--fg-2, oklch(0.78 0.01 240))" }}>
            {time}
          </span>
        </div>
        <div className="flex items-center justify-between px-3 py-2">
          <span className="label" style={{ fontSize: 9 }}>Sync</span>
          <span className="mono text-[11px] text-primary">● live</span>
        </div>
      </div>
    </aside>
  );
}
