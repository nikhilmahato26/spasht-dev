import { Handshake } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { ClientPicker } from "@/components/client-picker";
import { DealMoneyForm } from "@/components/deal-money-form";
import { SubmitButton } from "@/components/submit-button";
import { FormSelect } from "@/components/form-select";
import { PageHeader } from "@/components/page-header";
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
      <PageHeader icon={Handshake} color="#39568F" title="New deal" />

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
            <FormSelect
              name="categoryId"
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
              defaultValue="LEAD"
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

        <DealMoneyForm users={assignableMembers} />

        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-label text-text-muted font-semibold">
            Closed by
          </label>
          <FormSelect
            name="closedById"
            placeholder="Unassigned"
            options={[
              { value: "", label: "Unassigned" },
              ...users.map((u) => ({ value: u.id, label: u.name })),
            ]}
            className="w-full h-auto py-2 rounded-input"
          />
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
