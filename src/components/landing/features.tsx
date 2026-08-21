"use client";

import { motion } from "framer-motion";
import { Palette, Zap, Smartphone, Layers, Search, Gauge } from "lucide-react";

const features = [
  {
    title: "Modern UI/UX",
    description: "Interfaces inspired by Vercel, Linear, and Raycast — minimal, intentional, and beautiful.",
    icon: <Palette className="w-5 h-5 text-white/70" />,
  },
  {
    title: "Fast Development",
    description: "Rapid delivery without cutting corners. From concept to launch in days, not months.",
    icon: <Zap className="w-5 h-5 text-white/70" />,
  },
  {
    title: "Mobile Responsive",
    description: "Pixel-perfect across every screen size and device — phones, tablets, and desktops.",
    icon: <Smartphone className="w-5 h-5 text-white/70" />,
  },
  {
    title: "Scalable Architecture",
    description: "Built on Next.js and TypeScript with clean, modular code that grows with your product.",
    icon: <Layers className="w-5 h-5 text-white/70" />,
  },
  {
    title: "SEO Optimized",
    description: "Structured metadata, fast core web vitals, and semantic HTML for maximum discoverability.",
    icon: <Search className="w-5 h-5 text-white/70" />,
  },
  {
    title: "Smooth Performance",
    description: "Optimized animations, lazy loading, and edge-ready deployments for near-instant loads.",
    icon: <Gauge className="w-5 h-5 text-white/70" />,
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block border border-white/10 rounded-full px-4 py-1 mb-8">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-white/60">Why Choose Us</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">
            Built Different,<br />By Design.
          </h2>
          <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto">
            We combine engineering precision with thoughtful design to deliver products that stand out and scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-[20px] border border-white/5 bg-[#0e0e0e] p-8 hover:border-white/10 transition-colors"
            >
              <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#161616]">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-lg font-medium text-white/90">{feature.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
