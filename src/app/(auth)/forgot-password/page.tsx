import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-card p-8 flex flex-col items-center shadow-[0_24px_60px_-28px_rgba(27,29,30,0.22)]">
        <div className="rounded-card bg-text px-4 py-2.5 mb-5 shadow-sm">
          <Image src="/logo.png" alt="Spasht.dev" width={120} height={28} className="h-5 w-auto" priority />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-center">Reset your password</h1>
        <p className="text-sm text-text-muted mt-1.5 mb-6 text-center max-w-xs">
          Password resets aren&apos;t self-serve yet. Reach out to your workspace admin and they can help you regain access.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text hover:text-text-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
