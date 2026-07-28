import {
  Bell,
  Handshake,
  Home,
  LogOut,
  Receipt,
  ScrollText,
  Tag,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import { requireUser } from "@/lib/dal";
import { signOut } from "@/auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { MobileSidebar } from "@/components/mobile-sidebar";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const iconProps = { size: 16, strokeWidth: 2, className: "shrink-0" };

  const groups = [
    {
      label: "Operations",
      items: [
        { href: "/", label: "Home", icon: <Home {...iconProps} /> },
        { href: "/deals", label: "Deals", icon: <Handshake {...iconProps} /> },
        { href: "/clients", label: "Clients", icon: <Users {...iconProps} /> },
        { href: "/expenses", label: "Expenses", icon: <Receipt {...iconProps} /> },
        { href: "/categories", label: "Categories", icon: <Tag {...iconProps} /> },
        ...(user.role === "ADMIN"
          ? [{ href: "/team", label: "Team", icon: <UsersRound {...iconProps} /> }]
          : []),
        ...(user.role === "MEMBER"
          ? [{ href: "/my-payouts", label: "My Payouts", icon: <Wallet {...iconProps} /> }]
          : []),
      ],
    },
    ...(user.role === "ADMIN"
      ? [
          {
            label: "System",
            items: [{ href: "/audit", label: "Audit Log", icon: <ScrollText {...iconProps} /> }],
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen flex">
      <MobileSidebar>
        <div className="flex items-center gap-2.5 px-3 mb-7">
          <div className="w-8 h-8 rounded-btn bg-linear-to-br from-dev to-company flex items-center justify-center shrink-0">
            <span className="font-display text-surface text-sm font-bold">S</span>
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold">Spasht</p>
            <p className="text-2xs text-text-muted -mt-0.5">Finance Tracker</p>
          </div>
        </div>

        <SidebarNav groups={groups} />
      </MobileSidebar>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-border bg-surface flex items-center justify-end px-4 lg:px-6 shrink-0 gap-3">
          <div className="lg:hidden w-9 mr-auto" aria-hidden />
          <button
            type="button"
            title="Notifications"
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text-faint transition-colors"
          >
            <Bell size={16} />
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-dev text-surface flex items-center justify-center text-xs font-semibold shrink-0">
              {initials(user.name ?? "?")}
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-2xs uppercase tracking-label text-text-muted">
                {user.role} · {user.type}
              </p>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                title="Sign out"
                className="w-8 h-8 rounded-btn flex items-center justify-center text-text-muted hover:text-danger hover:bg-cost-soft transition-colors"
              >
                <LogOut size={15} />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="mx-auto max-w-app px-4 py-6 lg:px-6 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
