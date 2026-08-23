"use client";

import { useState } from "react";
import { FormSelect } from "@/components/form-select";
import { SubmitButton } from "@/components/submit-button";
import { createExpense, createExpenseCategory } from "./actions";

export function AddExpenseForm({
  expenseCategories,
}: {
  expenseCategories: { id: string; name: string }[];
}) {
  const [addingCategory, setAddingCategory] = useState(false);

  return (
    <div className="mb-6 bg-surface border border-border rounded-card p-4">
      <form action={createExpense} className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <FormSelect
          name="expenseCategoryId"
          placeholder="Category (optional)"
          options={[
            { value: "", label: "No category" },
            ...expenseCategories.map((c) => ({ value: c.id, label: c.name })),
          ]}
          className="w-full h-auto py-2 rounded-input"
        />
        <FormSelect
          name="team"
          placeholder="Team (optional)"
          options={[
            { value: "", label: "Unassigned" },
            { value: "DEV", label: "Dev" },
            { value: "MARKETING", label: "Marketing" },
          ]}
          className="w-full h-auto py-2 rounded-input"
        />
        <input
          name="label"
          placeholder="Label (e.g. Domain)"
          required
          className="border border-border rounded-input px-3 py-2 text-base bg-surface"
        />
        <input
          type="number"
          name="amount"
          placeholder="₹ amount"
          min="0"
          required
          className="border border-border rounded-input px-3 py-2 text-base bg-surface font-mono"
        />
        <SubmitButton
          pendingText="Adding..."
          className="bg-text text-surface border border-text px-4 py-2 rounded-btn text-base font-medium hover:bg-black transition-colors disabled:opacity-60"
        >
          + Add expense
        </SubmitButton>
      </form>

      <div className="mt-3 pt-3 border-t border-border">
        {addingCategory ? (
          <form
            action={async (formData) => {
              await createExpenseCategory(formData);
              setAddingCategory(false);
            }}
            className="flex items-center gap-2"
          >
            <input
              name="name"
              placeholder="New category name"
              required
              autoFocus
              className="border border-border rounded-input px-3 py-1.5 text-sm bg-surface flex-1 max-w-60"
            />
            <SubmitButton
              pendingText="Adding..."
              className="bg-surface text-text border border-border px-3 py-1.5 rounded-btn text-sm font-medium hover:border-text-faint transition-colors"
            >
              Add
            </SubmitButton>
            <button
              type="button"
              onClick={() => setAddingCategory(false)}
              className="text-sm text-text-muted hover:text-text px-1"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAddingCategory(true)}
            className="text-sm text-dev hover:underline"
          >
            + New expense category
          </button>
        )}
      </div>
    </div>
  );
}
