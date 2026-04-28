"use client";

import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  title: string;
  crumb?: string;
  actions?: React.ReactNode;
  className?: string;
}

function toggleSidebar() {
  document.dispatchEvent(new CustomEvent("atlas:toggle-sidebar"));
}

export function Topbar({ title, crumb, actions, className }: TopbarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 lg:px-8 py-5",
        "border-b border-border sticky top-0 z-10 bg-background",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden shrink-0 flex items-center justify-center rounded-[4px] text-[var(--fg-2)] hover:text-foreground transition-colors"
          style={{ width: 44, height: 44, marginLeft: -10, touchAction: "manipulation" }}
          aria-label="Open navigation"
        >
          <Menu style={{ width: 18, height: 18 }} />
        </button>

        <div className="flex items-baseline gap-3 min-w-0">
          <h1 className="text-[17px] lg:text-[18px] font-semibold tracking-[-0.01em] m-0 leading-none shrink-0">
            {title}
          </h1>
          {crumb && (
            <span className="mono text-[11px] text-[var(--fg-3,oklch(0.58_0.01_240))] tracking-[0.04em] uppercase hidden sm:inline truncate">
              {crumb}
            </span>
          )}
        </div>
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0 ml-3">{actions}</div>}
    </div>
  );
}

interface AtlasBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "ghost";
  children: React.ReactNode;
}

export function AtlasBtn({ variant = "default", className, children, ...props }: AtlasBtnProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 h-[30px] px-3 text-[12px] font-medium rounded-[4px] cursor-pointer transition-all",
        variant === "default" &&
          "bg-transparent text-[var(--fg-2,oklch(0.78_0.01_240))] border border-[var(--hairline-strong,oklch(1_0_0/0.12))] hover:text-foreground hover:border-[var(--fg-4,oklch(0.42_0.01_240))]",
        variant === "primary" &&
          "bg-primary text-primary-foreground border border-primary hover:bg-[var(--accent-2,oklch(0.86_0.10_285))] hover:border-[var(--accent-2,oklch(0.86_0.10_285))]",
        variant === "ghost" &&
          "bg-transparent text-[var(--fg-2,oklch(0.78_0.01_240))] border border-transparent hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
