"use client";

// Purely controlled — the parent (DealsTable) owns the pending-changes map
// and decides when to persist via the "Apply changes" bulk action, so this
// component just reflects whatever value it's given and reports edits up.
export function AdvanceDistributedToggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value ? "yes" : "no"}
      onChange={(e) => onChange(e.target.value === "yes")}
      disabled={disabled}
      className="border border-border rounded-input px-2 py-1 text-xs bg-surface disabled:opacity-60"
    >
      <option value="no">No</option>
      <option value="yes">Yes</option>
    </select>
  );
}
