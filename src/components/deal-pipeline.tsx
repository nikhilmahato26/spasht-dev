type Stage = { key: string; label: string; count: number; color: string };

export function DealPipeline({ stages }: { stages: Stage[] }) {
  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="flex flex-col gap-3">
      {stages.map((stage) => (
        <div key={stage.key} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-sm text-text-muted">{stage.label}</span>
          <div className="flex-1 h-6 bg-surface-2 rounded-[6px] overflow-hidden">
            <div
              className="h-full rounded-[6px] transition-all"
              style={{ width: `${(stage.count / max) * 100}%`, backgroundColor: stage.color }}
            />
          </div>
          <span className="w-8 shrink-0 text-right font-mono text-sm font-semibold">
            {stage.count}
          </span>
        </div>
      ))}
    </div>
  );
}
