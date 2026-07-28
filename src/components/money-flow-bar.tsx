import type { DealSplit } from "@/lib/deal-calc";

export function MoneyFlowBar({ split }: { split: DealSplit }) {
  const segments = [
    { key: "costs", value: Math.max(split.costs, 0), className: "bg-cost-soft" },
    { key: "marketing", value: Math.max(split.marketing, 0), className: "bg-marketing" },
    { key: "devPool", value: Math.max(split.devPool, 0), className: "bg-dev" },
    // Whatever's left after costs/marketing/dev pool — left unlabeled and
    // uncolored in the bar; it's not a separate party taking a cut.
    { key: "remainder", value: Math.max(split.unallocated, 0), className: "bg-surface-2" },
  ];
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <div className="flex h-[26px] rounded-[6px] overflow-hidden border border-border">
      {segments.map((s) => (
        <div key={s.key} className={s.className} style={{ flex: s.value / total }} />
      ))}
    </div>
  );
}
