export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-card p-8 flex flex-col items-center shadow-[0_24px_60px_-28px_rgba(27,29,30,0.22)]">
        {children}
      </div>
    </div>
  );
}
