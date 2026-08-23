import { Receipt, Code2, Megaphone } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { formatPaisa } from "@/lib/money";
import { dealScopeWhere } from "@/lib/deals-data";
import { SummaryCard } from "@/components/summary-card";
import { FormSelect } from "@/components/form-select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { ExpensesTable } from "./expenses-table";
import { AddExpenseForm } from "./add-expense-form";
import type { MemberType } from "@/generated/prisma/client";

function monthOptions() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      value: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    };
  });
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; team?: string; expenseCategoryId?: string }>;
}) {
  const user = await requireUser();
  const { month, team, expenseCategoryId } = await searchParams;
  const isAdmin = user.role === "ADMIN";
  const teamFilter: MemberType | undefined = team === "DEV" || team === "MARKETING" ? team : undefined;

  // Members never see general (deal-less) company overhead — only expenses
  // on deals they're already scoped to. Admins see everything.
  const scopeFilter = isAdmin ? {} : { dealId: { not: null }, deal: dealScopeWhere(user) };

  let dateFilter: { gte: Date; lt: Date } | undefined;
  if (month) {
    const [yearStr, monthStr] = month.split("-");
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10);
    dateFilter = { gte: new Date(year, monthIndex, 1), lt: new Date(year, monthIndex + 1, 1) };
  }

  const [costItems, expenseCategories] = await Promise.all([
    db.costItem.findMany({
      where: {
        ...scopeFilter,
        ...(dateFilter ? { createdAt: dateFilter } : {}),
        ...(teamFilter ? { team: teamFilter } : {}),
        ...(expenseCategoryId ? { expenseCategoryId } : {}),
      },
      include: { deal: true, expenseCategory: true },
      orderBy: { createdAt: "desc" },
    }),
    db.expenseCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  const total = costItems.reduce((sum, c) => sum + c.amount, 0);
  const devTotal = costItems
    .filter((c) => c.team === "DEV")
    .reduce((sum, c) => sum + c.amount, 0);
  const marketingTotal = costItems
    .filter((c) => c.team === "MARKETING")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div>
      <PageHeader icon={Receipt} color="#ad4a3b" title="Expenses" />

      {isAdmin && <AddExpenseForm expenseCategories={expenseCategories} />}

      <form method="GET" className="flex flex-wrap gap-2 mb-3">
        <FormSelect
          name="month"
          defaultValue={month ?? ""}
          placeholder="All time"
          options={[{ value: "", label: "All time" }, ...monthOptions()]}
          className="h-auto py-2 rounded-input text-sm"
        />
        <FormSelect
          name="team"
          defaultValue={team ?? ""}
          placeholder="All teams"
          options={[
            { value: "", label: "All teams" },
            { value: "DEV", label: "Dev" },
            { value: "MARKETING", label: "Marketing" },
          ]}
          className="h-auto py-2 rounded-input text-sm"
        />
        <FormSelect
          name="expenseCategoryId"
          defaultValue={expenseCategoryId ?? ""}
          placeholder="All categories"
          options={[
            { value: "", label: "All categories" },
            ...expenseCategories.map((c) => ({ value: c.id, label: c.name })),
          ]}
          className="h-auto py-2 rounded-input text-sm"
        />
        <Button type="submit" variant="outline" className="h-auto text-sm px-3 py-2 rounded-btn">
          Apply
        </Button>
      </form>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <SummaryCard label="Total expenses" value={formatPaisa(total)} color="#ad4a3b" icon={Receipt} />
        <SummaryCard label="Dev team" value={formatPaisa(devTotal)} color="#39568f" icon={Code2} />
        <SummaryCard label="Marketing team" value={formatPaisa(marketingTotal)} color="#b9832a" icon={Megaphone} />
      </div>

      <Card className="border border-border rounded-card ring-0 py-0 overflow-hidden">
        <ExpensesTable data={costItems} expenseCategories={expenseCategories} />
      </Card>
    </div>
  );
}
