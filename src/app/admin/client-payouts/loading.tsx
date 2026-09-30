export default function ClientPayoutsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-surface w-48 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-surface rounded-card border border-border" />
        ))}
      </div>
      <div className="h-10 bg-surface w-72 rounded-input" />
      <div className="h-72 bg-surface rounded-card border border-border" />
    </div>
  );
}
