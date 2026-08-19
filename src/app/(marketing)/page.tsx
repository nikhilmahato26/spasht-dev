import { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Portfolio } from "@/components/landing/portfolio";
import { Pricing } from "@/components/landing/pricing";
import { Contact } from "@/components/landing/contact";
import { Footer } from "@/components/landing/footer";

import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Spasht.dev | Premium Digital Experiences",
  description: "We combine engineering precision with thoughtful design to deliver products that stand out and scale.",
};

export const revalidate = 3600; // revalidate every hour or rely on on-demand revalidation

export default async function LandingPage() {
  const dealsWithLinks = await db.deal.findMany({
    where: {
      link: { not: null },
      status: { in: ["IN_PROGRESS", "DELIVERED", "PAID"] },
    },
    include: {
      category: true,
      assignments: {
        include: { user: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="relative selection:bg-white/20 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <Portfolio deals={dealsWithLinks} />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
