import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { AUDIT_ACTION_LABELS, ENTITY_LINK_PREFIX } from "@/lib/audit-labels";

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string }>;
}) {
  await requireAdmin();
  const { entityType } = await searchParams;

  const [logs, entityTypeRows] = await Promise.all([
    db.auditLog.findMany({
      where: entityType ? { entityType } : {},
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.auditLog.findMany({ distinct: ["entityType"], select: { entityType: true } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight mb-6">Audit Log</h1>

      <form method="GET" className="flex gap-2 mb-5">
        <select
          name="entityType"
          defaultValue={entityType ?? ""}
          className="border border-border rounded-input px-3 py-2 text-sm bg-surface"
        >
          <option value="">All entity types</option>
          {entityTypeRows.map((row) => (
            <option key={row.entityType} value={row.entityType}>
              {row.entityType}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-surface text-text border border-border px-3 py-2 rounded-btn text-sm font-medium hover:border-text-faint transition-colors"
        >
          Apply
        </button>
      </form>

      <div className="bg-surface border border-border rounded-card overflow-hidden overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-label text-text-muted">
              <th className="text-left font-semibold px-4 py-2.5">When</th>
              <th className="text-left font-semibold px-4 py-2.5">User</th>
              <th className="text-left font-semibold px-4 py-2.5">Action</th>
              <th className="text-left font-semibold px-4 py-2.5">Entity</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const linkPrefix = ENTITY_LINK_PREFIX[log.entityType];
              const canLink = linkPrefix && !log.action.endsWith(".delete");
              return (
                <tr key={log.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3 text-sm text-text-faint whitespace-nowrap">
                    {log.createdAt.toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{log.user.name}</td>
                  <td className="px-4 py-3 text-sm">{AUDIT_ACTION_LABELS[log.action] ?? log.action}</td>
                  <td className="px-4 py-3 text-sm">
                    {canLink ? (
                      <Link href={`${linkPrefix}/${log.entityId}`} className="text-dev hover:underline">
                        {log.entityType}
                      </Link>
                    ) : (
                      <span className="text-text-muted">{log.entityType}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {logs.length === 0 && (
          <p className="text-text-muted text-sm px-4 py-6">No activity yet.</p>
        )}
      </div>
      {logs.length === 100 && (
        <p className="text-text-faint text-xs mt-2">Showing the most recent 100 entries.</p>
      )}
    </div>
  );
}
