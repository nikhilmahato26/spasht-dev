"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 h-16 z-50 flex items-center justify-between px-6 lg:px-12 backdrop-blur-md bg-[#0a0a0a]/80 border-b border-white/5"
    >
      <Link href="/" className="flex items-center gap-2">
        {/* We invert the logo since it was originally black, or if it's already white, it's fine. Wait, earlier it was a white logo on dark background, so invert might not be needed. If the logo is white, we just show it. */}
        <Image src="/logo.png" alt="Spasht" width={110} height={32} className="w-auto h-6" priority />
      </Link>
      
      <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide text-white/50 uppercase">
        <Link href="#services" className="hover:text-white transition-colors">Services</Link>
        <Link href="#features" className="hover:text-white transition-colors">Why Us</Link>
        <Link href="#portfolio" className="hover:text-white transition-colors">Portfolio</Link>
        <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        <Link href="#contact" className="hover:text-white transition-colors">Contact</Link>
      </nav>

      <div className="flex items-center gap-4">
        <Link 
          href="/login" 
          className="bg-white text-black px-4 py-2 rounded-[4px] text-sm font-semibold hover:bg-white/90 transition-colors shadow-sm"
        >
          Get Started
        </Link>
      </div>
    </motion.header>
  );
}
