"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handler = () => setSidebarOpen((o) => !o);
    document.addEventListener("atlas:toggle-sidebar", handler);
    return () => document.removeEventListener("atlas:toggle-sidebar", handler);
  }, []);

  const close = () => setSidebarOpen(false);

  return (
    <>
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
    </>
  );
}
