import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/auth";
import { SubmitButton } from "@/components/submit-button";
import { PasswordField } from "@/components/password-field";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail } from "lucide-react";
import Image from "next/image";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <div className="rounded-card bg-text px-5 py-3 mb-5 shadow-[0_10px_24px_-10px_rgba(27,29,30,0.5)]">
        <Image src="/logo.png" alt="Spasht.dev" width={379} height={88} className="h-6 w-auto" priority />
      </div>

      <h1 className="text-2xl font-semibold tracking-tight text-center">Welcome back!</h1>
      <p className="text-sm text-text-muted mt-1.5 mb-6 text-center">
        Enter email &amp; password to continue.
      </p>

      {error && (
        <p className="w-full text-sm text-danger mb-4 bg-cost-soft border border-cost/30 rounded-input px-3 py-2 text-center">
          Invalid email or password.
        </p>
      )}

      <form
        className="w-full"
        action={async (formData) => {
          "use server";
          try {
            await signIn("credentials", {
              email: formData.get("email"),
              password: formData.get("password"),
              redirectTo: "/admin",
            });
          } catch (err) {
            if (err instanceof AuthError) {
              redirect("/login?error=CredentialsSignin");
            }
            throw err;
          }
        }}
      >
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel htmlFor="email" className="sr-only">Email</FieldLabel>
            <InputGroup className="h-auto rounded-input">
              <InputGroupAddon>
                <Mail className="text-text-muted" strokeWidth={1.75} />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email address"
                className="py-2.5 text-base placeholder:text-text-muted"
              />
            </InputGroup>
          </Field>

          <Field>
            <FieldLabel htmlFor="password" className="sr-only">Password</FieldLabel>
            <PasswordField />
          </Field>

          <div className="flex items-center justify-between text-sm -mt-1">
            <label className="flex items-center gap-2 text-text-muted cursor-pointer select-none">
              <Checkbox name="remember" defaultChecked />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-text-muted hover:text-text transition-colors">
              Forgot password
            </Link>
          </div>

          <SubmitButton
            pendingText="Signing in..."
            className="mt-2 w-full bg-text text-surface px-4 py-3 rounded-full text-base font-medium shadow-[0_10px_24px_-10px_rgba(27,29,30,0.5)] hover:bg-black active:scale-[0.98] transition-all disabled:opacity-60 disabled:active:scale-100"
          >
            Sign In
          </SubmitButton>
        </FieldGroup>
      </form>

      <p className="text-sm text-text-muted mt-6 text-center">
        Don&apos;t have an account? <span className="text-text font-medium">Ask your admin</span>
      </p>

      <p className="text-xs text-text-muted mt-8 text-center">
        &copy; 2026 Spasht.dev. All rights reserved.
      </p>
    </>
  );
}
