import type { LucideIcon } from "lucide-react";

export function SummaryCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: LucideIcon;
}) {
  return (
    <div
      className="group relative bg-surface border border-border rounded-card p-3.5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
      style={{ backgroundImage: `linear-gradient(to top, ${color}14, transparent 65%)` }}
    >
      <div
        aria-hidden
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-[0.15] group-hover:opacity-25 transition-opacity duration-200"
        style={{ backgroundColor: color }}
      />
      <div className="relative flex items-center justify-between gap-2 mb-2">
        <p className="text-xs uppercase tracking-label text-text-muted font-semibold">{label}</p>
        <div
          className="w-9 h-9 rounded-btn flex items-center justify-center shrink-0 shadow-sm"
          style={{ backgroundColor: color }}
        >
          <Icon size={16} strokeWidth={2.25} className="text-white" />
        </div>
      </div>
      <p className="relative font-mono text-2xl font-semibold tracking-tighter">{value}</p>
    </div>
  );
}
