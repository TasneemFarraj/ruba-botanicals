"use client";

import { useEffect } from "react";

/* The admin panel is designed light-only. Pin <html> to light while it's mounted
   so portaled dialogs/selects also get light tokens; restore the user's theme on leave. */
export function ForceLight() {
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.getAttribute("data-theme");
    root.setAttribute("data-theme", "light");
    return () => { if (prev) root.setAttribute("data-theme", prev); };
  }, []);
  return null;
}
