"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Static Marketing Website",
    icon: (
      <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    price: "₹2,500",
    period: "One-time payment",
    description: "A clean, conversion-focused landing page that makes a lasting first impression.",
    features: ["Responsive landing page", "Modern UI/UX design", "Fast loading (<1s)", "Mobile optimized", "SEO friendly"],
    buttonLabel: "Get Started →",
    popular: false,
  },
  {
    name: "Small Dashboard",
    icon: (
      <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    price: "₹25,000",
    originalPrice: "₹30,000",
    period: "Starting from",
    description: "A full-featured admin dashboard with auth, analytics, and data management.",
    features: ["Admin dashboard", "Authentication system", "Charts & analytics", "CRUD operations", "API integration"],
    buttonLabel: "Get Started →",
    popular: true,
  },
  {
    name: "Full Scale Dashboard",
    icon: (
      <svg className="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="4" width="16" height="4" rx="1" />
        <rect x="4" y="10" width="16" height="10" rx="1" />
      </svg>
    ),
    price: "Contact Us",
    period: "Custom pricing",
    description: "Enterprise-grade architecture for complex, high-scale digital products.",
    features: ["Enterprise-grade architecture", "Advanced analytics", "Role-based access control", "Scalable backend integration", "Custom workflows"],
    buttonLabel: "Let's Talk →",
    popular: false,
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 lg:px-12 bg-[#050505]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-block border border-white/10 rounded-full px-4 py-1 mb-8">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-white/60">Services</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">
            Simple, Transparent<br />Pricing
          </h2>
          <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto">
            Every project is crafted with the same level of attention to detail — from landing pages to enterprise platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={cn(
                "relative flex flex-col rounded-[24px] border bg-[#0a0a0a] p-8",
                plan.popular ? "border-white/20" : "border-white/5"
              )}
            >
              {plan.popular && (
                <div className="absolute top-6 right-6 bg-white text-black text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                  Popular
                </div>
              )}
              
              <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#161616]">
                {plan.icon}
              </div>
              
              <h3 className="text-base font-medium text-white mb-4">{plan.name}</h3>
              
              <div className="flex items-end gap-3 mb-2">
                <span className={cn("font-serif font-bold text-white tracking-tight", plan.price === "Contact Us" ? "text-3xl" : "text-4xl")}>
                  {plan.price}
                </span>
                {plan.originalPrice && (
                  <span className="text-sm text-white/30 line-through mb-1.5">{plan.originalPrice}</span>
                )}
              </div>
              <p className="text-xs text-white/40 mb-6">{plan.period}</p>
              
              <p className="text-sm text-white/50 leading-relaxed mb-8 h-10">
                {plan.description}
              </p>
              
              <div className="h-[1px] w-full bg-white/5 mb-8" />
              
              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/60">
                    <Check className="w-4 h-4 text-white/30" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/login"
                className={cn(
                  "w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center transition-colors",
                  plan.popular 
                    ? "bg-white text-black hover:bg-white/90" 
                    : "bg-[#111] text-white/80 hover:bg-[#161616] border border-white/10 hover:border-white/20 hover:text-white"
                )}
              >
                {plan.buttonLabel}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
