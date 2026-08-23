import { UsersRound } from "lucide-react";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { getUserPayoutSummary } from "@/lib/payouts-data";
import { SubmitButton } from "@/components/submit-button";
import { FormSelect } from "@/components/form-select";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { TeamTable } from "./team-table";
import { createMember } from "./actions";

export default async function TeamPage() {
  await requireAdmin();

  const users = await db.user.findMany({ orderBy: { name: "asc" } });
  const rows = await Promise.all(
    users.map(async (user) => {
      const summary = await getUserPayoutSummary(user.id);
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
      };
    })
  );

  return (
    <div>
      <PageHeader icon={UsersRound} color="#9A5B13" title="Team" />

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
    </div>
  );
}
