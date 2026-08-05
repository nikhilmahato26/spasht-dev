import { Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn(playfair.variable, "min-h-screen bg-[#0a0a0a] text-white/90 selection:bg-white/20 font-sans")}>
      {children}
    </div>
  );
}
