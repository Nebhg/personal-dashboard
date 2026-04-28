"use client";

import { createContext, useContext } from "react";

interface SidebarContextValue {
  open: boolean;
  toggle: () => void;
}

export const SidebarContext = createContext<SidebarContextValue>({
  open: false,
  toggle: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}
