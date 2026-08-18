import { notFound, redirect } from "next/navigation";
import { Handshake } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { getDealForUser } from "@/lib/deals-data";
import { paisaToRupees } from "@/lib/money";
import { DealMoneyForm } from "@/components/deal-money-form";
import { SubmitButton } from "@/components/submit-button";
import { FormSelect } from "@/components/form-select";
import { PageHeader } from "@/components/page-header";
import { updateDeal } from "../../actions";

export default async function EditDealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const deal = await getDealForUser(id, user);
  if (!deal) notFound();

  const canEdit =
    user.role === "ADMIN" ||
    deal.createdById === user.id ||
    deal.closedById === user.id ||
    deal.assignments.some((a) => a.userId === user.id);
  if (!canEdit) redirect(`/admin/deals/${deal.id}`);

  const [categories, users] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const assignableMembers = users.filter((u) => u.role !== "ADMIN");

  const action = updateDeal.bind(null, deal.id);

  return (
    <div>
      <PageHeader icon={Handshake} color="#39568F" title="Edit deal" />

      <form action={action} className="flex flex-col gap-5 max-w-2xl">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-label text-text-muted font-semibold">Client</label>
          <div className="border border-border rounded-input px-3 py-2 text-base bg-surface-2 text-text-muted">
            {deal.client.name}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
              Project name *
            </label>
            <input
              name="projectName"
              defaultValue={deal.projectName}
              required
              className="border border-border rounded-input px-3 py-2 text-base bg-surface"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-label text-text-muted font-semibold">Link</label>
            <input
              name="link"
              defaultValue={deal.link ?? ""}
              className="border border-border rounded-input px-3 py-2 text-base bg-surface"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-label text-text-muted font-semibold">Category</label>
            <FormSelect
              name="categoryId"
              defaultValue={deal.categoryId ?? ""}
              placeholder="None"
              options={[
                { value: "", label: "None" },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
              className="w-full h-auto py-2 rounded-input"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-label text-text-muted font-semibold">Status</label>
            <FormSelect
              name="status"
              defaultValue={deal.status}
              placeholder="Status"
              options={[
                { value: "LEAD", label: "Lead" },
                { value: "IN_PROGRESS", label: "In progress" },
                { value: "DELIVERED", label: "Delivered" },
                { value: "PAID", label: "Paid" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
              className="w-full h-auto py-2 rounded-input"
            />
          </div>
        </div>

        <DealMoneyForm
          users={assignableMembers}
          defaultTotalPrice={paisaToRupees(deal.totalPrice)}
          defaultFixedCosts={paisaToRupees(deal.fixedCosts)}
          defaultMarketingPercent={deal.marketingPercent}
          defaultDevPoolPercent={deal.devPoolPercent}
          defaultAdvanceReceived={paisaToRupees(deal.advanceReceived)}
          existingAssignments={deal.assignments}
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
            Closed by
          </label>
          <FormSelect
            name="closedById"
            defaultValue={deal.closedById ?? ""}
            placeholder="Unassigned"
            options={[
              { value: "", label: "Unassigned" },
              ...users.map((u) => ({ value: u.id, label: u.name })),
            ]}
            className="w-full h-auto py-2 rounded-input"
          />
        </div>

        <SubmitButton
          pendingText="Saving..."
          className="self-start bg-text text-surface border border-text px-4 py-2.5 rounded-btn text-base font-medium hover:bg-black transition-colors disabled:opacity-60"
        >
          Save changes
        </SubmitButton>
      </form>
    </div>
  );
}
