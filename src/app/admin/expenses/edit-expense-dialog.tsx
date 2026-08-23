"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { FormSelect } from "@/components/form-select";
import { paisaToRupees } from "@/lib/money";
import { updateExpense } from "./actions";

export function EditExpenseDialog({
  expense,
  expenseCategories,
}: {
  expense: {
    id: string;
    label: string;
    amount: number;
    isRecurring: boolean;
    dealId: string | null;
    expenseCategoryId: string | null;
    team: "DEV" | "MARKETING" | null;
  };
  expenseCategories: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const action = updateExpense.bind(null, expense.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit expense</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await action(formData);
            setOpen(false);
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-label text-text-muted font-semibold">Label</label>
            <input
              name="label"
              defaultValue={expense.label}
              required
              className="border border-border rounded-input px-3 py-2 text-base bg-surface"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-label text-text-muted font-semibold">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              defaultValue={paisaToRupees(expense.amount)}
              min="0"
              required
              className="border border-border rounded-input px-3 py-2 text-base bg-surface font-mono"
            />
          </div>
          {!expense.dealId && (
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-label text-text-muted font-semibold">Category</label>
              <FormSelect
                name="expenseCategoryId"
                defaultValue={expense.expenseCategoryId ?? ""}
                placeholder="No category"
                options={[
                  { value: "", label: "No category" },
                  ...expenseCategories.map((c) => ({ value: c.id, label: c.name })),
                ]}
                className="w-full h-auto py-2 rounded-input"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-label text-text-muted font-semibold">Team</label>
            <FormSelect
              name="team"
              defaultValue={expense.team ?? ""}
              placeholder="Unassigned"
              options={[
                { value: "", label: "Unassigned" },
                { value: "DEV", label: "Dev" },
                { value: "MARKETING", label: "Marketing" },
              ]}
              className="w-full h-auto py-2 rounded-input"
            />
          </div>
          <DialogFooter>
            <SubmitButton
              pendingText="Saving..."
              className="bg-text text-surface border border-text px-4 py-2 rounded-btn text-base font-medium hover:bg-black transition-colors disabled:opacity-60"
            >
              Save changes
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
