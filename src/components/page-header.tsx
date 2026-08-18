import type { LucideIcon } from "lucide-react";

export function PageHeader({
  icon: Icon,
  color,
  title,
  action,
}: {
  icon: LucideIcon;
  color: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-btn flex items-center justify-center shrink-0 shadow-sm"
          style={{ backgroundColor: color }}
        >
          <Icon size={18} strokeWidth={2.25} className="text-white" />
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
      </div>
      {action}
    </div>
  );
}
