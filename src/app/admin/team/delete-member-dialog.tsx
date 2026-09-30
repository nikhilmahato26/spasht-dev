"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deactivateMember, removeMember } from "./actions";

export function DeleteMemberDialog({
  member,
  hasHistory,
  isSelf,
}: {
  member: { id: string; name: string; isActive: boolean };
  hasHistory: boolean;
  isSelf: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (isSelf) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        title="You can't delete your own account"
        className="h-8 w-8 p-0 border-border"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span className="sr-only">Delete</span>
      </Button>
    );
  }

  const run = (action: typeof removeMember) => {
    setError(null);
    startTransition(async () => {
      const result = await action(member.id);
      if (result.ok) setOpen(false);
      else setError(result.error);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          title={`Delete ${member.name}`}
          className="h-8 w-8 p-0 border-border text-text-muted hover:text-danger hover:border-danger hover:bg-cost-soft transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="sr-only">Delete</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {hasHistory ? `${member.name} can't be deleted` : `Delete ${member.name}?`}
          </DialogTitle>
          <DialogDescription>
            {hasHistory
              ? "They're linked to deals, payouts or audit entries, and those records have to stay intact. Deactivating blocks their login and keeps the history."
              : "This permanently removes their account and login. It can't be undone."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="flex items-center gap-2 text-sm text-danger bg-cost-soft border border-cost/30 rounded-input px-3 py-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} className="text-sm">
            Cancel
          </Button>
          {hasHistory ? (
            member.isActive && (
              <Button
                type="button"
                disabled={isPending}
                onClick={() => run(deactivateMember)}
                className="bg-text text-surface border border-text px-4 rounded-btn text-sm font-medium hover:bg-black disabled:opacity-60"
              >
                {isPending ? "Deactivating..." : "Deactivate"}
              </Button>
            )
          ) : (
            <Button
              type="button"
              disabled={isPending}
              onClick={() => run(removeMember)}
              className="bg-danger text-surface border border-danger px-4 rounded-btn text-sm font-medium hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "Deleting..." : "Delete member"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
