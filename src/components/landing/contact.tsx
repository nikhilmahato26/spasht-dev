"use client";

import { motion } from "framer-motion";

export function Contact() {
  return (
    <section id="contact" className="py-24 px-6 lg:px-12 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto border-t border-white/5 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left Side */}
          <div className="flex flex-col">
            <div className="inline-block border border-white/10 rounded-full px-4 py-1 mb-8 w-fit">
              <span className="text-[10px] font-semibold tracking-widest uppercase text-white/60">Get In Touch</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-[1.1]">
              Let&apos;s Build<br />
              <span className="italic text-white/70">Something</span><br />
              Amazing.
            </h2>
            
            <p className="text-base text-white/50 max-w-md mb-12 leading-relaxed">
              Have a project in mind? Tell us about it and we&apos;ll get back to you within 24 hours with a tailored proposal.
            </p>
            
            <div className="space-y-6 mt-auto">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-[#111]">
                  <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-sm text-white/60">+91 93047 38536</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-[#111]">
                  <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm text-white/60">spashtdev@gmail.com</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-12">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-white/40">Typical response time: within 24 hours</span>
            </div>
          </div>
          
          {/* Right Side / Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#0e0e0e] border border-white/5 rounded-[24px] p-8 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            
            <form className="relative flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-white/40">Name</label>
                  <input 
                    type="text" 
                    placeholder="Your name" 
                    className="bg-[#161616] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-white/40">Email</label>
                  <input 
                    type="email" 
                    placeholder="you@company.com" 
                    className="bg-[#161616] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-widest uppercase text-white/40">Project Budget</label>
                <select className="bg-[#161616] border border-white/10 rounded-lg px-4 py-3 text-sm text-white/60 focus:outline-none focus:border-white/30 transition-colors appearance-none">
                  <option value="" disabled selected>Select budget range</option>
                  <option value="under-5k">Under ₹50,000</option>
                  <option value="5k-15k">₹50,000 - ₹1,50,000</option>
                  <option value="15k-30k">₹1,50,000 - ₹3,00,000</option>
                  <option value="30k-plus">₹3,00,000+</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-widest uppercase text-white/40">Project Details</label>
                <textarea 
                  rows={4}
                  placeholder="Tell us about your project, goals, and timeline..." 
                  className="bg-[#161616] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none"
                />
              </div>
              
              <button 
                type="button" 
                className="w-full bg-white text-black font-semibold text-sm py-4 rounded-lg mt-2 flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
              >
                Send Message
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
