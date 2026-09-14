import {
  Bell,
  Code,
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
import { PageContainer } from "@/components/page-container";
import { AdminThemeProvider, NightModeToggle } from "@/components/admin-theme";
import Image from "next/image";

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
        { href: "/admin", label: "Home", icon: <Home {...iconProps} /> },
        { href: "/admin/deals", label: "Deals", icon: <Handshake {...iconProps} /> },
        { href: "/admin/clients", label: "Clients", icon: <Users {...iconProps} /> },
        { href: "/admin/expenses", label: "Expenses", icon: <Receipt {...iconProps} /> },
        { href: "/admin/categories", label: "Categories", icon: <Tag {...iconProps} /> },
        ...(user.role === "ADMIN" || user.type === "DEV"
          ? [{ href: "/admin/dev-projects", label: "Dev Projects", icon: <Code {...iconProps} /> }]
          : []),
        ...(user.role === "ADMIN"
          ? [{ href: "/admin/team", label: "Team", icon: <UsersRound {...iconProps} /> }]
          : []),
        ...(user.role === "MEMBER"
          ? [{ href: "/admin/my-payouts", label: "My Payouts", icon: <Wallet {...iconProps} /> }]
          : []),
      ],
    },
    ...(user.role === "ADMIN"
      ? [
          {
            label: "System",
            items: [{ href: "/admin/audit", label: "Audit Log", icon: <ScrollText {...iconProps} /> }],
          },
        ]
      : []),
  ];

  return (
    <AdminThemeProvider>
      {/* bg-bg/text-text re-declared here (not just inherited from <body>,
          which sits outside the .dark scope) so this div actually paints a
          dark background and gives every descendant a correct default text
          color to inherit — otherwise only elements with their own explicit
          text-* class would pick up the dark palette. */}
      <div className="h-screen flex overflow-hidden bg-bg text-text">
        <MobileSidebar>
          <div className="px-3 mb-7">
            {/* bg-[#1b1d1e] instead of bg-text: the logo PNG is a fixed
                light-colored asset, so its chip needs a permanently dark
                backdrop — bg-text would flip to a light background in night
                mode (since --color-text lightens) and hide the logo. */}
            <div className="rounded-btn bg-[#1b1d1e] px-3 py-2 inline-flex items-center shadow-sm">
              <Image
                src="/logo.png"
                alt="Spasht"
                width={140}
                height={40}
                className="w-auto h-6"
                priority
              />
            </div>
          </div>

          <SidebarNav groups={groups} />
        </MobileSidebar>

        <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
          <header className="h-16 border-b border-border bg-surface flex items-center justify-end px-4 lg:px-6 shrink-0 gap-3">
            <div className="lg:hidden w-9 mr-auto" aria-hidden />
            <NightModeToggle />
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
            <PageContainer>{children}</PageContainer>
          </main>
        </div>
      </div>
    </AdminThemeProvider>
  );
}
