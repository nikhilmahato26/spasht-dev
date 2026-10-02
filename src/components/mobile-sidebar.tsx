"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

// Read server-side in the admin layout so the first paint already has the
// right width (no expand-then-collapse flash).
export const SIDEBAR_COLLAPSED_COOKIE = "sidebar-collapsed";

const DESKTOP_QUERY = "(min-width: 1024px)"; // Tailwind `lg`

function subscribeDesktop(cb: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

// True only when the sidebar is actually rendered as the icon rail — the
// mobile drawer always shows full labels, whatever the saved preference.
const SidebarRailContext = createContext(false);
export const useSidebarRail = () => useContext(SidebarRailContext);

export function MobileSidebar({
  defaultCollapsed = false,
  children,
}: {
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true
  );

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      document.cookie = `${SIDEBAR_COLLAPSED_COOKIE}=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }

  // Cmd/Ctrl + B toggles the rail, like most editors.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "b" && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
        const t = e.target as HTMLElement | null;
        if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
        e.preventDefault();
        toggleCollapsed();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SidebarRailContext.Provider value={collapsed && isDesktop}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="lg:hidden fixed top-3.5 left-4 z-40 w-9 h-9 rounded-btn bg-surface border border-border flex items-center justify-center shadow-sm text-text-muted hover:text-text"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        />
      )}

      {/* data-collapsed drives the rail layout through `group-data-*` classes
          (all lg-scoped), so server-rendered children can adapt too. */}
      <aside
        data-collapsed={collapsed}
        className={`group/sidebar fixed inset-y-0 left-0 z-50 w-60 shrink-0 flex flex-col border-r border-border bg-surface px-3 py-5 overflow-y-auto overflow-x-hidden transition-[transform,width] duration-200 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:z-auto lg:shrink-0 lg:data-[collapsed=true]:w-16 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="lg:hidden absolute top-4 right-3 w-8 h-8 rounded-btn flex items-center justify-center text-text-muted hover:text-text"
        >
          <X size={18} />
        </button>

        <div className="flex-1">{children}</div>

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          title={`${collapsed ? "Expand" : "Collapse"} sidebar (⌘B)`}
          className="hidden lg:flex items-center gap-2.5 mt-4 px-3 py-2 rounded-btn text-sm font-medium text-text-muted hover:bg-surface-2 hover:text-text transition-colors whitespace-nowrap"
        >
          {collapsed ? (
            <PanelLeftOpen size={16} className="shrink-0" />
          ) : (
            <PanelLeftClose size={16} className="shrink-0" />
          )}
          <span className="transition-opacity duration-150 group-data-[collapsed=true]/sidebar:opacity-0">
            Collapse
          </span>
        </button>
      </aside>
    </SidebarRailContext.Provider>
  );
}
