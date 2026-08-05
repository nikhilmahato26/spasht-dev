"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 overflow-hidden pt-20 pb-10 bg-[#0a0a0a]">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="max-w-4xl text-center z-10 flex flex-col items-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="inline-block border border-white/10 rounded-full px-4 py-1 mb-8 w-fit bg-[#111]"
        >
          <span className="text-[10px] font-semibold tracking-widest uppercase text-white/60">Digital Product Agency</span>
        </motion.div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-8 leading-[1.1] tracking-tight">
          We Build<br />
          <span className="italic text-white/80">Premium</span> Digital<br />
          Experiences.
        </h1>
        
        <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
          Transforming bold ideas into scalable, conversion-focused websites and powerful web applications.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            href="#pricing"
            className="w-full sm:w-auto px-8 py-4 rounded-lg bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            View Pricing
          </Link>
          <Link 
            href="#portfolio"
            className="w-full sm:w-auto px-8 py-4 rounded-lg border border-white/10 bg-[#111] text-white/80 font-medium text-sm hover:bg-[#161616] hover:text-white transition-colors"
          >
            See Our Work
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
