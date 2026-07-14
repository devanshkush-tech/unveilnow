import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Pricing } from "@/components/landing/Pricing";
import { SEO } from "@/components/SEO";

const PricingPage = () => (
  <div className="min-h-screen bg-background">
    <SEO
      title="Pricing | Unveil Now — Membership Plans"
      description="Simple membership plans for serious singles in India. Free for women, small entry fee for men. Includes blind date credits."
      path="/pricing"
    />
    <Navbar />
    <div className="pt-28 md:pt-32">
      <h1 className="sr-only">Unveil Now Pricing — Membership Plans for Serious Daters</h1>
      <Pricing />
    </div>
    <Footer />
  </div>
);
export default PricingPage;

