import { Navbar } from "@/components/layout/Navbar";
import { PromoPopup } from "@/components/PromoPopup";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { WhyChoose } from "@/components/landing/WhyChoose";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhyDifferent } from "@/components/landing/WhyDifferent";
import { VideoTestimonials } from "@/components/landing/VideoTestimonials";
import { Pricing } from "@/components/landing/Pricing";
import { TrustFeatures } from "@/components/landing/TrustFeatures";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { FloatingSignupCTA } from "@/components/landing/FloatingSignupCTA";
import { SEO } from "@/components/SEO";
import { useEffect } from "react";
import { trackMetaEvent } from "@/lib/metaCapi";

const Index = () => {
  useEffect(() => {

    document.title = "Unveil Now | Story-First Dating Platform in India";
    const desc = "Unveil Now is a story-first dating platform where real connection starts before photos. Build chemistry through prompts, values, and meaningful conversations before revealing images.";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
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
      <PromoPopup />
      <Navbar />
      <main>
        <Hero />
        <WhyChoose />
        <HowItWorks />
        <WhyDifferent />
        <VideoTestimonials />
        <Pricing />
        <TrustFeatures />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <FloatingSignupCTA />
    </div>
  );
};

export default Index;
