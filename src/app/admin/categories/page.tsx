import { Tag } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { SubmitButton } from "@/components/submit-button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { createCategory, deleteCategory } from "./actions";

export default async function CategoriesPage() {
  await requireUser();
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { deals: true } } },
  });

  return (
    <div>
      <PageHeader icon={Tag} color="#6B5490" title="Categories" />

      <form action={createCategory} className="flex gap-2 mb-6">
        <input
          name="name"
          placeholder="Category name"
          required
          className="border border-border rounded-input px-3 py-2 text-base bg-surface flex-1"
        />
        <input
          name="color"
          type="color"
          defaultValue="#39568F"
          className="w-11 h-[38px] border border-border rounded-input bg-surface p-1"
        />
        <SubmitButton
          pendingText="Adding..."
          className="bg-text text-surface border border-text px-4 py-2 rounded-btn text-base font-medium hover:bg-black transition-colors disabled:opacity-60"
        >
          Add
        </SubmitButton>
      </form>

      <div className="flex flex-col gap-2">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="flex-row items-center justify-between border border-border rounded-card ring-0 gap-0 px-4 py-3"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: category.color ?? "#71716B" }}
              />
              <span className="font-medium">{category.name}</span>
              <span className="text-sm text-text-muted">
                {category._count.deals} deal{category._count.deals === 1 ? "" : "s"}
              </span>
            </div>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={category.id} />
              <SubmitButton pendingText="Deleting..." className="h-auto p-0 bg-transparent text-sm text-danger hover:underline hover:bg-transparent disabled:opacity-60">
                Delete
              </SubmitButton>
            </form>
          </Card>
        ))}
        {categories.length === 0 && (
          <p className="text-text-muted text-sm">No categories yet.</p>
        )}
      </div>
    </div>
  );
}
