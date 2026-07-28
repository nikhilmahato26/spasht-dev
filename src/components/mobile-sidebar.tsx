"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export function MobileSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <>
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

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 shrink-0 border-r border-border bg-surface px-3 py-5 transition-transform duration-200 lg:static lg:translate-x-0 lg:z-auto lg:shrink-0 ${
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
        {children}
      </aside>
    </>
  );
}
