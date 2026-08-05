"use client";

import { motion } from "framer-motion";

const projects = [
  {
    title: "SaaS Dashboard",
    category: "WEB APPLICATION",
    description: "Analytics dashboard with real-time data viz, role-based access, and a dark-mode interface.",
    tags: ["Next.js", "TypeScript", "Recharts"],
    className: "md:col-span-2 md:row-span-2",
    wireframe: (
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
    )
  },
  {
    title: "Analytics Platform",
    category: "ENTERPRISE SOFTWARE",
    description: "Cohort analysis, funnel tracking, and customizable reporting dashboards at scale.",
    tags: ["React", "Node.js", "PostgreSQL"],
    className: "md:col-span-1 md:row-span-2",
    wireframe: (
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
    )
  },
  {
    title: "Startup Landing Page",
    category: "MARKETING WEBSITE",
    description: "Conversion-optimized landing with hero, feature grids, and pricing for a B2B SaaS startup.",
    className: "md:col-span-1 md:row-span-1",
    wireframe: (
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
    )
  },
  {
    title: "Business Website",
    category: "CORPORATE WEBSITE",
    description: "Multi-page corporate site with blog, team pages, contact forms, and CMS integration.",
    className: "md:col-span-2 md:row-span-1",
    wireframe: (
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
  }
];

export function Portfolio() {
  return (
    <section id="portfolio" className="py-24 px-6 lg:px-12 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block border border-white/10 rounded-full px-4 py-1 mb-8">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-white/60">Portfolio</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">
            Speaks for Itself.
          </h2>
          <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto">
            A selection of projects we've built for founders, startups, and growing businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-6 auto-rows-[300px]">
          {projects.map((project, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`group flex flex-col overflow-hidden rounded-[24px] border border-white/5 bg-[#0e0e0e] hover:border-white/10 transition-colors ${project.className}`}
            >
              <div className="h-[200px] w-full p-4 pb-0 flex items-end justify-center">
                {project.wireframe}
              </div>
              <div className="p-6 pt-4 flex flex-col flex-1">
                <div className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-2">
                  {project.category}
                </div>
                <h3 className="text-lg font-medium text-white/90 mb-2">{project.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed mb-4 flex-1">{project.description}</p>
                {project.tags && (
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 rounded-sm border border-white/10 bg-[#161616] text-[10px] text-white/60">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
