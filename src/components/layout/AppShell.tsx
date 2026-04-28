"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { SidebarContext } from "./SidebarContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggle = () => setSidebarOpen((o) => !o);
  const close = () => setSidebarOpen(false);

  return (
    <SidebarContext.Provider value={{ open: sidebarOpen, toggle }}>
      {/* Mobile backdrop — only mounted when open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={close}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={close} />

      <main className="lg:ml-[220px] min-h-screen bg-background">
        {children}
      </main>
    </SidebarContext.Provider>
  );
}
