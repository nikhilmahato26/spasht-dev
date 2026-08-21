"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Lock } from "lucide-react";

type DealAssignment = {
  id?: string;
  user: {
    name: string;
    type: string;
  };
};

type DealItem = {
  id: string;
  projectName: string;
  link?: string | null;
  previewImage?: string | null;
  category?: {
    name: string;
  } | null;
  client?: {
    company?: string | null;
    name?: string | null;
  } | null;
  assignments?: DealAssignment[];
};

type PortfolioProps = {
  deals: DealItem[];
};

function normalizeUrl(rawUrl?: string | null): string {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function getDisplayDomain(rawUrl?: string | null): string {
  if (!rawUrl) return "";
  try {
    const url = new URL(normalizeUrl(rawUrl));
    return url.hostname.replace(/^www\./, "");
  } catch {
    return rawUrl.replace(/^https?:\/\//i, "").replace(/^www\./, "").split("/")[0] || rawUrl;
  }
}

// Fallback wireframes for loading or failed screenshot states
function FallbackWireframe({ index }: { index: number }) {
  const mod = index % 4;
  if (mod === 0) {
    return (
      <div className="w-full h-full bg-[#111] p-4 flex flex-col gap-3 overflow-hidden">
        <div className="flex gap-2">
          <div className="w-12 h-3 bg-white/10 rounded-full" />
          <div className="w-12 h-3 bg-white/5 rounded-full" />
          <div className="w-12 h-3 bg-white/5 rounded-full" />
        </div>
        <div className="flex gap-3 flex-1">
          <div className="w-1/4 h-full bg-white/5 rounded-lg flex flex-col gap-2 p-2">
            <div className="w-full h-2.5 bg-white/10 rounded-full" />
            <div className="w-3/4 h-2.5 bg-white/10 rounded-full" />
            <div className="w-1/2 h-2.5 bg-white/10 rounded-full" />
          </div>
          <div className="w-3/4 h-full flex flex-col gap-2">
            <div className="h-2/3 bg-gradient-to-t from-white/10 to-transparent rounded-lg border-b border-white/20 relative overflow-hidden">
              <svg className="absolute bottom-0 w-full h-full text-white/20" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0 100 C 20 80, 40 90, 60 50 S 80 40, 100 20 L 100 100 Z" fill="currentColor" opacity="0.5" />
              </svg>
            </div>
            <div className="h-1/3 flex gap-2 items-end justify-between px-2">
              <div className="w-1/5 bg-white/10 rounded-t-sm h-[40%]" />
              <div className="w-1/5 bg-white/20 rounded-t-sm h-[70%]" />
              <div className="w-1/5 bg-white/10 rounded-t-sm h-[50%]" />
              <div className="w-1/5 bg-white/30 rounded-t-sm h-[90%]" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (mod === 1) {
    return (
      <div className="w-full h-full bg-[#111] p-4 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-full flex justify-between absolute top-4 px-4">
          <div className="w-12 h-3 bg-white/10 rounded-full" />
          <div className="w-12 h-3 bg-white/10 rounded-full" />
        </div>
        <div className="relative w-20 h-20 rounded-full border-[6px] border-white/5 flex items-center justify-center mt-2">
          <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/20" strokeDasharray="289" strokeDashoffset="75" />
          </svg>
          <span className="text-[10px] font-mono text-white/50">Live</span>
        </div>
      </div>
    );
  }
  if (mod === 2) {
    return (
      <div className="w-full h-full bg-[#111] p-4 flex flex-col gap-3 overflow-hidden">
        <div className="w-full flex justify-between">
          <div className="w-8 h-2 bg-white/10 rounded-full" />
          <div className="flex gap-2">
            <div className="w-6 h-2 bg-white/10 rounded-full" />
            <div className="w-10 h-2 bg-white/20 rounded-full" />
          </div>
        </div>
        <div className="w-2/3 h-2 bg-white/20 rounded-full mt-2" />
        <div className="w-1/2 h-2 bg-white/10 rounded-full" />
        <div className="w-1/4 h-3 bg-white/5 rounded-full mt-2" />
      </div>
    );
  }
  return (
    <div className="w-full h-full bg-[#111] p-4 flex flex-col gap-3 overflow-hidden">
      <div className="w-full flex justify-between items-center border-b border-white/5 pb-2">
        <div className="w-16 h-2 bg-white/20 rounded-full" />
        <div className="flex gap-2">
          <div className="w-8 h-1.5 bg-white/10 rounded-full" />
          <div className="w-8 h-1.5 bg-white/10 rounded-full" />
        </div>
      </div>
      <div className="flex gap-4 mt-1">
        <div className="flex-1 flex flex-col gap-2">
          <div className="w-3/4 h-2.5 bg-white/20 rounded-full" />
          <div className="w-full h-2 bg-white/10 rounded-full" />
          <div className="w-5/6 h-2 bg-white/10 rounded-full" />
        </div>
        <div className="w-1/3 flex flex-col gap-2">
          <div className="w-full h-6 bg-white/5 rounded-sm" />
          <div className="w-full h-6 bg-white/5 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

function WebsiteCardPreview({ deal, index }: { deal: DealItem; index: number }) {
  const normalizedUrl = normalizeUrl(deal.link);
  const displayDomain = getDisplayDomain(deal.link);

  // Use stored Cloudinary preview image first; fallback to dynamic screenshot
  const dynamicScreenshotUrl = normalizedUrl
    ? `https://api.microlink.io/?url=${encodeURIComponent(normalizedUrl)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1024&viewport.height=640&viewport.deviceScaleFactor=1`
    : "";

  const initialSrc = deal.previewImage || dynamicScreenshotUrl;

  const [currentSrc, setCurrentSrc] = useState<string>(initialSrc);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(!initialSrc);

  const handleImageError = () => {
    // If Cloudinary failed or was outdated, try dynamic screenshot before giving up
    if (!hasTriedFallback && deal.previewImage && dynamicScreenshotUrl) {
      setHasTriedFallback(true);
      setCurrentSrc(dynamicScreenshotUrl);
    } else {
      setHasError(true);
    }
  };

  return (
    <div className="w-full flex flex-col rounded-t-[18px] overflow-hidden border border-white/10 bg-[#141414]">
      {/* Mock Browser Top Header Bar */}
      <div className="h-7 px-3 bg-[#1a1a1a] border-b border-white/5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-[#ff5f56]/80 transition-colors" />
          <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-[#ffbd2e]/80 transition-colors" />
          <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-[#27c93f]/80 transition-colors" />
        </div>
        
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0e0e0e] border border-white/5 text-[10px] font-mono text-white/50 max-w-[160px] truncate">
          <Lock className="w-2.5 h-2.5 text-white/40 shrink-0" />
          <span className="truncate">{displayDomain || "project.live"}</span>
        </div>

        <div className="w-4 flex justify-end">
          <ArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* Website Preview Screenshot / Image Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0d0d0d] flex items-center justify-center">
        {currentSrc && !hasError ? (
          <>
            {/* Loading Shimmer / Wireframe */}
            {!isLoaded && (
              <div className="absolute inset-0 z-10 bg-[#111] animate-pulse flex items-center justify-center">
                <FallbackWireframe index={index} />
              </div>
            )}
            
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentSrc}
              alt={deal.projectName || "Website preview"}
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
              onError={handleImageError}
              className={`w-full h-full object-cover object-top transition-all duration-500 group-hover:scale-105 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            {/* Subtle bottom gradient to blend into card */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-40 pointer-events-none" />
          </>
        ) : (
          <FallbackWireframe index={index} />
        )}
      </div>
    </div>
  );
}

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
            A selection of projects we&apos;ve built for founders, startups, and growing businesses.
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

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredDeals.map((deal, idx) => {
              const tags = deal.assignments?.filter((a) => a.user.type === "DEV").map((a) => a.user.name).slice(0, 3) || [];
              const categoryName = deal.category?.name || "PROJECT";
              const targetUrl = normalizeUrl(deal.link);
              const displayDomain = getDisplayDomain(deal.link);

              return (
                <motion.div
                  layout
                  key={deal.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group flex flex-col overflow-hidden rounded-[24px] border border-white/5 bg-[#0e0e0e] hover:border-white/15 hover:shadow-2xl hover:shadow-white/[0.02] transition-all"
                >
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 pb-0 block cursor-pointer opacity-90 group-hover:opacity-100 transition-opacity"
                  >
                    <WebsiteCardPreview deal={deal} index={idx} />
                  </a>

                  <div className="p-6 pt-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[10px] font-semibold tracking-widest uppercase text-white/50 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5">
                        {categoryName}
                      </span>
                      {displayDomain && (
                        <span className="text-[11px] font-mono text-white/30 truncate max-w-[140px]">
                          {displayDomain}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-medium text-white/90 mb-2">
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                      >
                        {deal.projectName}
                      </a>
                    </h3>

                    <p className="text-xs text-white/50 leading-relaxed mb-4 flex-1">
                      {deal.client?.company ? `Crafted for ${deal.client.company}.` : "Delivered with engineering precision and clean design."}
                    </p>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-white/5">
                        {tags.map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-sm border border-white/10 bg-[#161616] text-[10px] text-white/60"
                          >
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
