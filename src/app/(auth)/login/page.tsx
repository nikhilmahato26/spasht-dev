import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import Image from "next/image";

const loginTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    name: "Sarah Chen",
    handle: "@sarahchen",
    text: "Spasht streamlined our development pipeline completely. The engineering quality and attention to detail are exceptional.",
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    name: "Marcus Vance",
    handle: "@marcus_v",
    text: "From concept to live deployment in days. Fast turnaround and scalable modern architecture.",
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    name: "Elena Rostova",
    handle: "@elenarostova",
    text: "The cleanest UI/UX we've had built for our startup. Intuitive, robust, and beautifully designed.",
  },
];

export default async function LoginPage(props: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const error = searchParams?.error;

  async function handleSignIn(formData: FormData) {
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
  }

  return (
    <SignInPage
      logo={
        <div className="rounded-xl bg-text px-4 py-2.5 inline-flex items-center shadow-md">
          <Image src="/logo.png" alt="Spasht.dev" width={120} height={28} className="h-5 w-auto" priority />
        </div>
      }
      title={<span className="font-light text-foreground tracking-tight">Welcome back</span>}
      description="Enter your email and password to access your dashboard."
      heroImageSrc="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=2160&auto=format&fit=crop&q=80"
      testimonials={loginTestimonials}
      error={error ? "Invalid email or password. Please try again." : undefined}
      showSocialLogin={false}
      action={handleSignIn}
      submitButtonText="Sign In"
    />
  );
}
