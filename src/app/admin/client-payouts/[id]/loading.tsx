export default function ClientWorkspaceLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-5 bg-surface w-36 rounded" />
      <div className="h-9 bg-surface w-64 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-surface rounded-card border border-border" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 h-96 bg-surface rounded-card border border-border" />
        <div className="lg:col-span-7 h-96 bg-surface rounded-card border border-border" />
      </div>
    </div>
  );
}
