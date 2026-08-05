import { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Portfolio } from "@/components/landing/portfolio";
import { Pricing } from "@/components/landing/pricing";
import { Contact } from "@/components/landing/contact";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Spasht.dev | Premium Digital Experiences",
  description: "We combine engineering precision with thoughtful design to deliver products that stand out and scale.",
};

export default function LandingPage() {
  return (
    <div className="relative selection:bg-white/20 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
