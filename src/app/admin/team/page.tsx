import Link from "next/link";
import { UsersRound } from "lucide-react";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { getUserPayoutSummary } from "@/lib/payouts-data";
import { SubmitButton } from "@/components/submit-button";
import { FormSelect } from "@/components/form-select";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { memberHasHistory } from "@/lib/team-data";
import { TeamTable } from "./team-table";
import { PermissionsMatrix } from "./permissions-matrix";
import { createMember } from "./actions";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const admin = await requireAdmin();
  const { tab } = await searchParams;
  const activeTab = tab === "permissions" ? "permissions" : "members";

  const users = await db.user.findMany({ orderBy: { name: "asc" } });
  const rows = await Promise.all(
    users.map(async (user) => {
      const [summary, hasHistory] = await Promise.all([
        getUserPayoutSummary(user.id),
        memberHasHistory(user.id),
      ]);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        role: user.role,
        type: user.type,
        entitled: summary.entitled,
        paid: summary.paid,
        due: summary.due,
        permissions: user.permissions,
        hasHistory,
        isSelf: user.id === admin.id,
      };
    })
  );

  return (
    <div>
      <PageHeader icon={UsersRound} color="#9A5B13" title="Team" />

      <nav className="flex items-center gap-6 border-b border-border mb-6" aria-label="Team sections">
        {[
          { id: "members", label: "Members", href: "/admin/team" },
          { id: "permissions", label: "Permissions", href: "/admin/team?tab=permissions" },
        ].map((t) => (
          <Link
            key={t.id}
            href={t.href}
            aria-current={activeTab === t.id ? "page" : undefined}
            className={`-mb-px pb-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id
                ? "border-text text-text"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {activeTab === "permissions" ? (
        <Card className="border border-border rounded-card ring-0 py-0 gap-0 overflow-hidden">
          <PermissionsMatrix rows={rows} />
        </Card>
      ) : (
        <>
          <form
            action={createMember}
            className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-6 bg-surface border border-border rounded-card p-4"
          >
            <input
              name="name"
              placeholder="Name"
              required
              className="border border-border rounded-input px-3 py-2 text-base bg-surface"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="border border-border rounded-input px-3 py-2 text-base bg-surface"
            />
            <input
              name="password"
              type="password"
              placeholder="Initial password"
              required
              className="border border-border rounded-input px-3 py-2 text-base bg-surface"
            />
            <FormSelect
              name="role"
              defaultValue="MEMBER"
              placeholder="Role"
              options={[
                { value: "MEMBER", label: "Member" },
                { value: "ADMIN", label: "Admin" },
              ]}
              className="w-full h-auto py-2 rounded-input"
            />
            <FormSelect
              name="type"
              defaultValue="DEV"
              placeholder="Type"
              options={[
                { value: "DEV", label: "Dev" },
                { value: "MARKETING", label: "Marketing" },
              ]}
              className="w-full h-auto py-2 rounded-input"
            />
            <SubmitButton
              pendingText="Adding..."
              className="bg-text text-surface border border-text px-4 py-2 rounded-btn text-base font-medium hover:bg-black transition-colors disabled:opacity-60"
            >
              + Add member
            </SubmitButton>
          </form>

          <Card className="border border-border rounded-card ring-0 py-0 overflow-hidden">
            <TeamTable data={rows} />
          </Card>
        </>
      )}
    </div>
  );
}
