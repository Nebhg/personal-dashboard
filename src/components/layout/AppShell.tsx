"use client";

import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="lg:ml-[220px] min-h-screen bg-background">
        {children}
      </main>
    </>
  );
}

