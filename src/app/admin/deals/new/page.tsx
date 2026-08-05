import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { ClientPicker } from "@/components/client-picker";
import { DealMoneyForm } from "@/components/deal-money-form";
import { SubmitButton } from "@/components/submit-button";
import { createDeal } from "../actions";

export default async function NewDealPage() {
  await requireUser();

  const [clients, categories, users] = await Promise.all([
    db.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, company: true } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const assignableMembers = users.filter((u) => u.role !== "ADMIN");

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight mb-6">New deal</h1>

      <form action={createDeal} className="flex flex-col gap-5 max-w-2xl">
        <ClientPicker clients={clients} />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
              Project name *
            </label>
            <input
              name="projectName"
              required
              className="border border-border rounded-input px-3 py-2 text-base bg-surface"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-label text-text-muted font-semibold">Link</label>
            <input
              name="link"
              placeholder="https://..."
              className="border border-border rounded-input px-3 py-2 text-base bg-surface"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-label text-text-muted font-semibold">Category</label>
            <select
              name="categoryId"
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
              defaultValue="CLOSED"
              className="border border-border rounded-input px-3 py-2 text-base bg-surface"
            >
              <option value="LEAD">Lead</option>
              <option value="CLOSED">Closed</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="DELIVERED">Delivered</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
        </div>

        <DealMoneyForm users={assignableMembers} />

        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
            Closed by
          </label>
          <select
            name="closedById"
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
          pendingText="Creating..."
          className="self-start bg-text text-surface border border-text px-4 py-2.5 rounded-btn text-base font-medium hover:bg-black transition-colors disabled:opacity-60"
        >
          Create deal
        </SubmitButton>
      </form>
    </div>
  );
}
