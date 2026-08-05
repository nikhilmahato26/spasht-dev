import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { SubmitButton } from "@/components/submit-button";
import Image from "next/image";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <Image 
        src="/logo.png" 
        alt="Spasht" 
        width={160} 
        height={40} 
        className="w-auto h-10 mb-4"
        priority 
      />
      <p className="text-sm text-text-muted mb-5">Sign in to your account</p>

      {error && (
        <p className="text-sm text-danger mb-4 bg-cost-soft border border-cost/30 rounded-input px-3 py-2">
          Invalid email or password.
        </p>
      )}

      <form
        className="flex flex-col gap-3"
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
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-xs uppercase tracking-label text-text-muted font-semibold">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="border border-border rounded-input px-3 py-2 text-base bg-surface"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-xs uppercase tracking-label text-text-muted font-semibold">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="border border-border rounded-input px-3 py-2 text-base bg-surface"
          />
        </div>

        <SubmitButton
          pendingText="Signing in..."
          className="mt-2 bg-text text-surface border border-text px-4 py-2.5 rounded-btn text-base font-medium hover:bg-black transition-colors disabled:opacity-60"
        >
          Sign in
        </SubmitButton>
      </form>
    </>
  );
}
