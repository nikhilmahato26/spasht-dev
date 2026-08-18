import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <>
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
    </>
  );
}
