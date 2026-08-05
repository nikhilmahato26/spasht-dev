import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { formatPaisa } from "@/lib/money";
import { getUserPayoutSummary } from "@/lib/payouts-data";
import { SubmitButton } from "@/components/submit-button";
import { createMember } from "./actions";

export default async function TeamPage() {
  await requireAdmin();

  const users = await db.user.findMany({ orderBy: { name: "asc" } });
  const rows = await Promise.all(
    users.map(async (user) => ({ user, summary: await getUserPayoutSummary(user.id) }))
  );

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight mb-6">Team</h1>

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
        <select
          name="role"
          defaultValue="MEMBER"
          className="border border-border rounded-input px-3 py-2 text-base bg-surface"
        >
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          name="type"
          defaultValue="DEV"
          className="border border-border rounded-input px-3 py-2 text-base bg-surface"
        >
          <option value="DEV">Dev</option>
          <option value="MARKETING">Marketing</option>
        </select>
        <SubmitButton
          pendingText="Adding..."
          className="bg-text text-surface border border-text px-4 py-2 rounded-btn text-base font-medium hover:bg-black transition-colors disabled:opacity-60"
        >
          + Add member
        </SubmitButton>
      </form>

      <div className="bg-surface border border-border rounded-card overflow-hidden overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-label text-text-muted">
              <th className="text-left font-semibold px-4 py-2.5">Name</th>
              <th className="text-left font-semibold px-4 py-2.5">Role</th>
              <th className="text-right font-semibold px-4 py-2.5">Entitled</th>
              <th className="text-right font-semibold px-4 py-2.5">Paid</th>
              <th className="text-right font-semibold px-4 py-2.5">Due</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ user, summary }) => (
              <tr key={user.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                <td className="px-4 py-3">
                  <Link href={`/team/${user.id}`} className="font-medium hover:underline">
                    {user.name}
                  </Link>
                  {!user.isActive && (
                    <span className="text-2xs text-text-faint uppercase tracking-label ml-2">
                      inactive
                    </span>
                  )}
                  <p className="text-sm text-text-faint">{user.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-text-muted">
                  {user.role} · {user.type}
                </td>
                <td className="px-4 py-3 text-right font-mono">{formatPaisa(summary.entitled)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatPaisa(summary.paid)}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {summary.due > 0 ? (
                    <span className="text-pending">{formatPaisa(summary.due)}</span>
                  ) : (
                    <span className="text-text-faint">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="text-text-muted text-sm px-4 py-6">No team members yet.</p>}
      </div>
    </div>
  );
}
