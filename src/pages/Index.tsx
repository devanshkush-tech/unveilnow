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
import { FAQ, faqs } from "@/components/landing/FAQ";
import { Helmet } from "react-helmet-async";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { FloatingSignupCTA } from "@/components/landing/FloatingSignupCTA";
import { SEO } from "@/components/SEO";
import { useEffect } from "react";
import { trackMetaEvent } from "@/lib/metaCapi";

const Index = () => {
  useEffect(() => {
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
      <SEO
        title="Unveil Now | Story-First Dating Platform in India"
        description="Story-first dating in India. Build real chemistry through prompts, values, and conversation before photos are revealed."
        path="/"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
      </Helmet>
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
