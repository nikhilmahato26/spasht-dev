import { ScrollText } from "lucide-react";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { FormSelect } from "@/components/form-select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { AuditTable } from "./audit-table";

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
        <AuditTable
          data={logs.map((log) => ({
            id: log.id,
            createdAt: log.createdAt,
            userName: log.user.name,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
          }))}
        />
      </Card>
      {logs.length === 100 && (
        <p className="text-text-faint text-xs mt-2">Showing the most recent 100 entries.</p>
      )}
    </div>
  );
}
