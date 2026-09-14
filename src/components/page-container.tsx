"use client";

import { usePathname } from "next/navigation";

// Routes whose content should use the full width of the main column
// (everything to the right of the sidebar) instead of the default
// centered, reading-width container. `matchChildren: true` also widens
// sub-routes (e.g. /admin/dev-projects has none); false matches only the
// exact path, so a listing page can go full-width without also widening its
// /new or /[id] detail/form sub-routes, which read better at normal width.
const FULL_WIDTH_ROUTES: { path: string; matchChildren: boolean }[] = [
  { path: "/admin/dev-projects", matchChildren: true },
  { path: "/admin/deals", matchChildren: false },
];

// Routes that manage their own internal scroll region (e.g. a pinned
// header/filters/cards section above a scrollable table) instead of letting
// the page itself scroll. These get a height-constrained flex container so
// their content can size a flex-1 child to "whatever's left" of the screen.
const FIXED_HEIGHT_ROUTES = ["/admin/dev-projects"];

export function PageContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullWidth = FULL_WIDTH_ROUTES.some(
    ({ path, matchChildren }) =>
      pathname === path || (matchChildren && pathname?.startsWith(`${path}/`))
  );
  const isFixedHeight = FIXED_HEIGHT_ROUTES.some(
    (route) => pathname === route || pathname?.startsWith(`${route}/`)
  );

  const widthClass = isFullWidth ? "" : "mx-auto max-w-app";
  const heightClass = isFixedHeight ? "h-full flex flex-col" : "";

  return (
    <div className={`px-4 py-6 lg:px-6 lg:py-8 ${widthClass} ${heightClass}`}>{children}</div>
  );
}
