import Link from "next/link";
import { ScrollText } from "lucide-react";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { AUDIT_ACTION_LABELS, ENTITY_LINK_PREFIX } from "@/lib/audit-labels";
import { FormSelect } from "@/components/form-select";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";

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
      <PageHeader icon={ScrollText} color="#71716B" title="Audit Log" />

      <form method="GET" className="flex gap-2 mb-5">
        <FormSelect
          name="entityType"
          defaultValue={entityType ?? ""}
          placeholder="All entity types"
          options={[
            { value: "", label: "All entity types" },
            ...entityTypeRows.map((row) => ({ value: row.entityType, label: row.entityType })),
          ]}
          className="h-auto py-2 rounded-input text-sm"
        />
        <Button type="submit" variant="outline" className="h-auto text-sm px-3 py-2 rounded-btn">
          Apply
        </Button>
      </form>

      <Card className="border border-border rounded-card ring-0 py-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">When</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">User</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">Action</TableHead>
              <TableHead className="h-auto text-xs uppercase tracking-label text-text-muted font-semibold px-4 py-2.5">Entity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const linkPrefix = ENTITY_LINK_PREFIX[log.entityType];
              const canLink = linkPrefix && !log.action.endsWith(".delete");
              return (
                <TableRow key={log.id}>
                  <TableCell className="px-4 py-3 text-sm text-text-faint whitespace-nowrap">
                    {log.createdAt.toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium whitespace-nowrap">{log.user.name}</TableCell>
                  <TableCell className="px-4 py-3 text-sm whitespace-normal">{AUDIT_ACTION_LABELS[log.action] ?? log.action}</TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    {canLink ? (
                      <Link href={`${linkPrefix}/${log.entityId}`} className="text-dev hover:underline">
                        {log.entityType}
                      </Link>
                    ) : (
                      <span className="text-text-muted">{log.entityType}</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {logs.length === 0 && (
          <p className="text-text-muted text-sm px-4 py-6">No activity yet.</p>
        )}
      </Card>
      {logs.length === 100 && (
        <p className="text-text-faint text-xs mt-2">Showing the most recent 100 entries.</p>
      )}
    </div>
  );
}
