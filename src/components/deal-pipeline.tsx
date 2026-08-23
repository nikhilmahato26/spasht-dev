import { formatPaisa } from "@/lib/money";

type Stage = { key: string; label: string; count: number; amount: number; color: string };

export function DealPipeline({ stages }: { stages: Stage[] }) {
  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="flex flex-col gap-4">
      {stages.map((stage) => (
        <div key={stage.key}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-text">{stage.label}</span>
            <span className="text-xs text-text-muted">
              <span className="font-mono">{stage.count}</span>
              <span className="mx-1.5 text-text-faint">|</span>
              <span className="font-mono">{formatPaisa(stage.amount)}</span>
            </span>
          </div>
          <div className="h-2.5 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(stage.count / max) * 100}%`, backgroundColor: stage.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
