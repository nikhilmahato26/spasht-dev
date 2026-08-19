"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type PortfolioProps = {
  deals: any[];
};

const wireframes = [
  (
    <div className="flex-1 w-full bg-[#111] border border-white/5 rounded-t-xl p-4 flex flex-col gap-4 overflow-hidden">
      <div className="flex gap-4">
        <div className="w-16 h-4 bg-white/10 rounded-full" />
        <div className="w-16 h-4 bg-white/5 rounded-full" />
        <div className="w-16 h-4 bg-white/5 rounded-full" />
        <div className="w-16 h-4 bg-white/5 rounded-full" />
      </div>
      <div className="flex gap-4 flex-1">
        <div className="w-1/4 h-full bg-white/5 rounded-lg flex flex-col gap-2 p-2">
           <div className="w-full h-3 bg-white/10 rounded-full" />
           <div className="w-3/4 h-3 bg-white/10 rounded-full" />
           <div className="w-1/2 h-3 bg-white/10 rounded-full" />
           <div className="w-5/6 h-3 bg-white/10 rounded-full mt-4" />
        </div>
        <div className="w-3/4 h-full flex flex-col gap-4">
          <div className="h-2/3 bg-gradient-to-t from-white/10 to-transparent rounded-lg border-b border-white/20 relative overflow-hidden">
             <svg className="absolute bottom-0 w-full h-full text-white/20" preserveAspectRatio="none" viewBox="0 0 100 100">
               <path d="M0 100 C 20 80, 40 90, 60 50 S 80 40, 100 20 L 100 100 Z" fill="currentColor" opacity="0.5" />
               <path d="M0 100 C 20 80, 40 90, 60 50 S 80 40, 100 20" fill="none" stroke="currentColor" strokeWidth="2" />
             </svg>
          </div>
          <div className="h-1/3 flex gap-2 items-end justify-between px-2">
             <div className="w-1/6 bg-white/10 rounded-t-sm" style={{ height: "40%" }} />
             <div className="w-1/6 bg-white/20 rounded-t-sm" style={{ height: "70%" }} />
             <div className="w-1/6 bg-white/10 rounded-t-sm" style={{ height: "50%" }} />
             <div className="w-1/6 bg-white/30 rounded-t-sm" style={{ height: "90%" }} />
             <div className="w-1/6 bg-white/10 rounded-t-sm" style={{ height: "60%" }} />
          </div>
        </div>
      </div>
    </div>
  ),
  (
    <div className="flex-1 w-full bg-[#111] border border-white/5 rounded-t-xl p-4 flex flex-col gap-4 overflow-hidden items-center justify-center relative">
       <div className="w-full flex justify-between absolute top-4 px-4">
          <div className="w-12 h-3 bg-white/10 rounded-full" />
          <div className="w-12 h-3 bg-white/10 rounded-full" />
       </div>
       <div className="relative w-24 h-24 rounded-full border-[8px] border-white/5 flex items-center justify-center mt-4">
          <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/20" strokeDasharray="289" strokeDashoffset="75" />
          </svg>
          <span className="text-[10px] font-mono text-white/50">74%</span>
       </div>
    </div>
  ),
  (
    <div className="flex-1 w-full bg-[#111] border border-white/5 rounded-t-xl p-4 flex flex-col gap-4 items-center overflow-hidden">
      <div className="w-full flex justify-between">
         <div className="w-8 h-2 bg-white/10 rounded-full" />
         <div className="flex gap-2">
           <div className="w-6 h-2 bg-white/10 rounded-full" />
           <div className="w-6 h-2 bg-white/10 rounded-full" />
           <div className="w-10 h-2 bg-white/20 rounded-full" />
         </div>
      </div>
      <div className="w-2/3 h-2 bg-white/20 rounded-full mt-4" />
      <div className="w-1/2 h-2 bg-white/10 rounded-full" />
      <div className="w-1/4 h-4 bg-white/5 rounded-full mt-2" />
    </div>
  ),
  (
    <div className="flex-1 w-full bg-[#111] border border-white/5 rounded-t-xl p-4 flex flex-col gap-4 overflow-hidden">
       <div className="w-full flex justify-between items-center border-b border-white/5 pb-2">
         <div className="w-16 h-2 bg-white/20 rounded-full" />
         <div className="flex gap-3">
           <div className="w-8 h-1.5 bg-white/10 rounded-full" />
           <div className="w-8 h-1.5 bg-white/10 rounded-full" />
           <div className="w-8 h-1.5 bg-white/10 rounded-full" />
           <div className="w-12 h-3 bg-white/10 rounded-full" />
         </div>
       </div>
       <div className="flex gap-6 mt-2">
          <div className="flex-1 flex flex-col gap-3">
             <div className="w-3/4 h-3 bg-white/20 rounded-full" />
             <div className="w-full h-2 bg-white/10 rounded-full" />
             <div className="w-5/6 h-2 bg-white/10 rounded-full" />
             <div className="flex gap-2 mt-2">
               <div className="w-16 h-6 bg-white/5 rounded-sm" />
               <div className="w-16 h-6 bg-white/5 rounded-sm" />
             </div>
          </div>
          <div className="w-1/3 flex flex-col gap-2">
             <div className="w-full h-8 bg-white/5 rounded-sm" />
             <div className="w-full h-8 bg-white/5 rounded-sm" />
             <div className="w-full h-8 bg-white/5 rounded-sm" />
          </div>
       </div>
    </div>
  )
];

export function Portfolio({ deals = [] }: PortfolioProps) {
  const [activeTab, setActiveTab] = useState("All");

  if (deals.length === 0) return null; // Don't show if no portfolio items

  // Get unique categories for the tabs
  const categories = ["All", ...Array.from(new Set(deals.map(deal => deal.category?.name || "PROJECT")))] as string[];

  const filteredDeals = activeTab === "All" 
    ? deals 
    : deals.filter(deal => (deal.category?.name || "PROJECT") === activeTab);

  return (
    <section id="portfolio" className="py-24 px-6 lg:px-12 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block border border-white/10 rounded-full px-4 py-1 mb-8">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-white/60">Portfolio</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">
            Speaks for Itself.
          </h2>
          <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto mb-12">
            A selection of projects we've built for founders, startups, and growing businesses.
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === cat 
                    ? "bg-white text-black" 
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[350px]">
          <AnimatePresence>
            {filteredDeals.map((deal, idx) => {
              const wireframe = wireframes[idx % wireframes.length];
              const tags = deal.assignments?.filter((a: any) => a.user.type === "DEV").map((a: any) => a.user.name).slice(0, 3) || [];
              const categoryName = deal.category?.name || "PROJECT";

              return (
                <motion.div
                  layout
                  key={deal.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group flex flex-col overflow-hidden rounded-[24px] border border-white/5 bg-[#0e0e0e] hover:border-white/10 transition-colors"
                >
                  <a href={deal.link} target="_blank" rel="noopener noreferrer" className="h-[200px] w-full p-4 pb-0 flex items-end justify-center cursor-pointer opacity-80 group-hover:opacity-100 transition-opacity">
                    {wireframe}
                  </a>
                  <div className="p-6 pt-4 flex flex-col flex-1">
                    <div className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-2">
                      {categoryName}
                    </div>
                    <h3 className="text-lg font-medium text-white/90 mb-2">
                      <a href={deal.link} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                        {deal.projectName}
                      </a>
                    </h3>
                    <p className="text-xs text-white/50 leading-relaxed mb-4 flex-1">
                      Delivered with excellence.
                    </p>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {tags.map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-1 rounded-sm border border-white/10 bg-[#161616] text-[10px] text-white/60">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
