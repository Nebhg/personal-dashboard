"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Utensils,
  Dumbbell,
  BookOpen,
  Target,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/diet", label: "Diet", icon: Utensils },
  { href: "/exercise", label: "Exercise", icon: Dumbbell },
  { href: "/learning", label: "Learning", icon: BookOpen },
  { href: "/habits", label: "Habits", icon: Target },
  { href: "/ai", label: "AI Coach", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-56 border-r bg-card flex flex-col z-10">
      <div className="p-5 border-b">
        <h1 className="font-bold text-lg tracking-tight">My Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Lifestyle tracker</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t">
        <p className="text-xs text-muted-foreground text-center">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </aside>
  );
}
