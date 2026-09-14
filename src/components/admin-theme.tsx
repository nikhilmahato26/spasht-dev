"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Moon } from "lucide-react";

const STORAGE_KEY = "admin-theme";

const AdminThemeContext = createContext<{ dark: boolean; toggle: () => void } | null>(null);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Reads localStorage (unavailable during SSR) to restore the saved theme.
  // Deferred to an effect so the server-rendered and first client-rendered
  // markup match (both start light); the "mounted" gate then applies the
  // real value a frame later instead of on first paint. This is a one-time
  // hydration sync from localStorage, not a state-sync loop.
  useEffect(() => {
    let next = false;
    try {
      next = localStorage.getItem(STORAGE_KEY) === "dark";
    } catch {
      // localStorage unavailable (private mode etc.) — fall back to light.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(next);
    setMounted(true);
  }, []);

  function toggle() {
    setDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      } catch {
        // ignore write failures
      }
      return next;
    });
  }

  return (
    <AdminThemeContext.Provider value={{ dark, toggle }}>
      {/* display:contents keeps this wrapper out of the flex layout — it only
          exists so the "dark" class scopes the CSS variable overrides (see
          globals.css) to the admin panel via normal custom-property
          inheritance, without adding an extra layout box. */}
      <div className={mounted && dark ? "dark" : undefined} style={{ display: "contents" }}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error("useAdminTheme must be used within AdminThemeProvider");
  return ctx;
}

export function NightModeToggle() {
  const { dark, toggle } = useAdminTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to night mode"}
      aria-pressed={dark}
      className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
        dark
          ? "border-dev bg-dev-soft text-dev"
          : "border-border text-text-muted hover:text-text hover:border-text-faint"
      }`}
    >
      <Moon size={16} />
    </button>
  );
}
