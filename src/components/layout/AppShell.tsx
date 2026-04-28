"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/60 lg:hidden transition-opacity duration-200",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile hamburger — only visible when sidebar is closed */}
      <button
        className={cn(
          "fixed top-[13px] left-4 z-50 lg:hidden",
          "flex items-center justify-center w-8 h-8 rounded-[4px]",
          "text-[var(--fg-2)] hover:text-foreground transition-colors",
          "bg-[var(--sidebar)] border border-[var(--hairline,oklch(1_0_0/0.07))]",
          sidebarOpen && "invisible"
        )}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation"
      >
        <Menu style={{ width: 15, height: 15 }} />
      </button>

      <main className="lg:ml-[220px] min-h-screen bg-background">
        {children}
      </main>
    </>
  );
}
