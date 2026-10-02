"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebarRail } from "@/components/mobile-sidebar";

type NavItem = { href: string; label: string; icon: ReactNode };
type NavGroup = { label: string; items: NavItem[] };

// The dashboard root is a prefix of every route, so it only matches exactly.
const ROOT_HREF = "/admin";

export function SidebarNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const rail = useSidebarRail();

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="relative h-4 mb-1.5">
              <p className="absolute inset-x-0 px-3 text-2xs uppercase tracking-label text-text-faint font-semibold whitespace-nowrap transition-opacity duration-150 lg:group-data-[collapsed=true]/sidebar:opacity-0">
                {group.label}
              </p>
              {/* In the rail, a short rule stands in for the group label. */}
              <span className="absolute left-3 right-3 top-1/2 h-px bg-border opacity-0 transition-opacity duration-150 lg:group-data-[collapsed=true]/sidebar:opacity-100" />
            </div>
            <nav className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === ROOT_HREF
                    ? pathname === ROOT_HREF
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const link = (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-btn text-base font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-surface-2 text-text"
                        : "text-text-muted hover:bg-surface-2 hover:text-text"
                    }`}
                  >
                    {item.icon}
                    <span className="transition-opacity duration-150 lg:group-data-[collapsed=true]/sidebar:opacity-0">
                      {item.label}
                    </span>
                  </Link>
                );
                return rail ? (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10}>
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Fragment key={item.href}>{link}</Fragment>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
