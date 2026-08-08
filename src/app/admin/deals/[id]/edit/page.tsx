import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { getDealForUser } from "@/lib/deals-data";
import { paisaToRupees } from "@/lib/money";
import { DealMoneyForm } from "@/components/deal-money-form";
import { SubmitButton } from "@/components/submit-button";
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
  if (!canEdit) redirect(`/deals/${deal.id}`);

  const [categories, users] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const assignableMembers = users.filter((u) => u.role !== "ADMIN");

  const action = updateDeal.bind(null, deal.id);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight mb-6">Edit deal</h1>

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
            <select
              name="categoryId"
              defaultValue={deal.categoryId ?? ""}
              className="border border-border rounded-input px-3 py-2 text-base bg-surface"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-label text-text-muted font-semibold">Status</label>
            <select
              name="status"
              defaultValue={deal.status}
              className="border border-border rounded-input px-3 py-2 text-base bg-surface"
            >
              <option value="LEAD">Lead</option>
              <option value="CLOSED">Closed</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="DELIVERED">Delivered</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
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
          <select
            name="closedById"
            defaultValue={deal.closedById ?? ""}
            className="border border-border rounded-input px-3 py-2 text-base bg-surface"
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
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
