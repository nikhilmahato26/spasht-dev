import Link from "next/link";
import { UsersRound } from "lucide-react";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { formatPaisa } from "@/lib/money";
import { getUserPayoutSummary } from "@/lib/payouts-data";
import { SubmitButton } from "@/components/submit-button";
import { FormSelect } from "@/components/form-select";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { createMember } from "./actions";

export default async function TeamPage() {
  await requireAdmin();

  const users = await db.user.findMany({ orderBy: { name: "asc" } });
  const rows = await Promise.all(
    users.map(async (user) => ({ user, summary: await getUserPayoutSummary(user.id) }))
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
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">Name</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">Role</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5 text-right">Entitled</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5 text-right">Paid</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5 text-right">Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ user, summary }) => (
              <TableRow key={user.id}>
                <TableCell className="px-4 py-3 whitespace-normal">
                  <Link href={`/admin/team/${user.id}`} className="font-medium hover:underline">
                    {user.name}
                  </Link>
                  {!user.isActive && (
                    <span className="text-2xs text-text-faint uppercase tracking-label ml-2">
                      inactive
                    </span>
                  )}
                  <p className="text-sm text-text-faint">{user.email}</p>
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-text-muted">
                  {user.role} · {user.type}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-mono">{formatPaisa(summary.entitled)}</TableCell>
                <TableCell className="px-4 py-3 text-right font-mono">{formatPaisa(summary.paid)}</TableCell>
                <TableCell className="px-4 py-3 text-right font-mono">
                  {summary.due > 0 ? (
                    <span className="text-pending">{formatPaisa(summary.due)}</span>
                  ) : (
                    <span className="text-text-faint">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 && <p className="text-text-muted text-sm px-4 py-6">No team members yet.</p>}
      </Card>
    </div>
  );
}
