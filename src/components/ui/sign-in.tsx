"use client";

import React, { useState, useTransition } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// --- HELPER COMPONENTS (ICONS) ---

export const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);

// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

export interface SignInPageProps {
  logo?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  error?: React.ReactNode;
  showSocialLogin?: boolean;
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  action?: (formData: FormData) => void | Promise<void>;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  footerNote?: React.ReactNode;
  submitButtonText?: string;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-dev focus-within:bg-dev-soft/30">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial; delay: string }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-2xl bg-black/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-4 w-64 shadow-2xl text-white`}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={testimonial.avatarSrc} className="h-9 w-9 object-cover rounded-xl border border-white/10 shrink-0" alt="avatar" />
    <div className="text-xs leading-snug">
      <p className="flex items-center gap-1 font-medium text-white">{testimonial.name}</p>
      <p className="text-white/50 text-[11px] font-mono">{testimonial.handle}</p>
      <p className="mt-1.5 text-white/80 line-clamp-3">{testimonial.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  logo = (
    <div className="rounded-xl bg-text px-4 py-2.5 inline-flex items-center shadow-md">
      <Image src="/logo.png" alt="Spasht" width={120} height={28} className="h-5 w-auto" priority />
    </div>
  ),
  title = <span className="font-light text-foreground tracking-tight">Welcome back</span>,
  description = "Access your account and manage your projects with precision.",
  heroImageSrc,
  testimonials = [],
  error,
  showSocialLogin = false,
  onSignIn,
  action,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  footerNote,
  submitButtonText = "Sign In",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (action) {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      startTransition(async () => {
        await action(formData);
      });
    } else if (onSignIn) {
      onSignIn(e);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col md:flex-row w-full bg-background text-foreground">
      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            {/* Logo */}
            {logo && <div className="animate-element animate-delay-100 mb-2">{logo}</div>}

            <div className="animate-element animate-delay-200">
              <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground mt-2">{description}</p>
            </div>

            {error && (
              <div className="animate-element animate-delay-200 w-full text-xs text-danger bg-cost-soft border border-cost/30 rounded-xl px-3.5 py-2.5 text-center font-medium">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div className="animate-element animate-delay-300">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address</label>
                <GlassInputWrapper>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    className="w-full bg-transparent text-sm px-4 py-3.5 rounded-2xl focus:outline-none placeholder:text-muted-foreground/60"
                  />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      className="w-full bg-transparent text-sm px-4 py-3.5 pr-12 rounded-2xl focus:outline-none placeholder:text-muted-foreground/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center p-1 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500 flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors">
                  <input type="checkbox" name="remember" defaultChecked className="rounded border-border accent-text" />
                  <span>Keep me signed in</span>
                </label>
                {onResetPassword ? (
                  <button
                    type="button"
                    onClick={onResetPassword}
                    className="hover:underline text-text font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                ) : (
                  <Link href="/forgot-password" className="hover:underline text-text font-medium transition-colors">
                    Forgot password?
                  </Link>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="animate-element animate-delay-600 w-full rounded-2xl bg-text text-surface py-3.5 text-sm font-medium hover:bg-black active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>{submitButtonText}</span>
                )}
              </button>
            </form>

            {showSocialLogin && (
              <>
                <div className="animate-element animate-delay-700 relative flex items-center justify-center my-1">
                  <span className="w-full border-t border-border"></span>
                  <span className="px-3 text-xs text-muted-foreground bg-background absolute">Or continue with</span>
                </div>

                <button
                  type="button"
                  onClick={onGoogleSignIn}
                  className="animate-element animate-delay-800 w-full flex items-center justify-center gap-2.5 border border-border rounded-2xl py-3 text-sm font-medium hover:bg-secondary transition-colors"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              </>
            )}

            {footerNote ? (
              <div className="animate-element animate-delay-900 text-center text-xs text-muted-foreground">
                {footerNote}
              </div>
            ) : onCreateAccount ? (
              <p className="animate-element animate-delay-900 text-center text-xs text-muted-foreground">
                New to our platform?{" "}
                <button
                  type="button"
                  onClick={onCreateAccount}
                  className="text-text font-medium hover:underline transition-colors"
                >
                  Create Account
                </button>
              </p>
            ) : (
              <p className="animate-element animate-delay-900 text-center text-xs text-muted-foreground">
                Don&apos;t have an account? <span className="text-text font-medium">Ask your workspace admin</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4 lg:p-6">
          <div
            className="animate-slide-right animate-delay-300 relative h-full min-h-[500px] w-full rounded-3xl bg-cover bg-center overflow-hidden border border-border/40 shadow-2xl"
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          >
            {/* Gradient Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

            {/* Testimonials */}
            {testimonials.length > 0 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-6 w-full justify-center">
                <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
                {testimonials[1] && (
                  <div className="hidden xl:flex">
                    <TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" />
                  </div>
                )}
                {testimonials[2] && (
                  <div className="hidden 2xl:flex">
                    <TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" />
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
