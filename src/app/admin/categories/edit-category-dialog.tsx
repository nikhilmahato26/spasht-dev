"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { updateCategory } from "./actions";

export function EditCategoryDialog({
  category,
}: {
  category: { id: string; name: string; color: string | null };
}) {
  const [open, setOpen] = useState(false);
  const action = updateCategory.bind(null, category.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Pencil className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit category</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            await action(formData);
            setOpen(false);
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-label text-text-muted font-semibold">Name</label>
            <input
              name="name"
              defaultValue={category.name}
              required
              className="border border-border rounded-input px-3 py-2 text-base bg-surface"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-label text-text-muted font-semibold">Color</label>
            <input
              name="color"
              type="color"
              defaultValue={category.color ?? "#39568f"}
              className="w-11 h-[38px] border border-border rounded-input bg-surface p-1"
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
