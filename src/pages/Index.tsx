import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { SocialProofStats } from "@/components/landing/SocialProofStats";
import { HeroTestimonials } from "@/components/landing/HeroTestimonials";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TrustFeatures } from "@/components/landing/TrustFeatures";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { FloatingSignupCTA } from "@/components/landing/FloatingSignupCTA";
import { useEffect } from "react";
import { trackMetaEvent } from "@/lib/metaCapi";

const Index = () => {
  useEffect(() => {
    document.title = "Unveil — Meaningful dating. Vibes first.";
    const meta = document.querySelector('meta[name="description"]');
    const content = "Unveil is intentional dating for urban professionals. Connect through prompts and voice — photos reveal only with mutual consent.";
    if (meta) meta.setAttribute("content", content);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = content;
      document.head.appendChild(m);
    }
    trackMetaEvent("ViewContent", {
      event_id: `view_landing_${Date.now()}`,
      custom_data: {
        content_name: "Landing",
        content_category: "marketing",
        content_type: "product_group",
        content_ids: ["starter", "premium", "elite"],
        currency: "INR",
        value: 199,
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <TrustFeatures />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <FloatingSignupCTA />
    </div>
  );
};

export default Index;
