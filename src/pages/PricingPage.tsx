import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Pricing } from "@/components/landing/Pricing";

const PricingPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-28 md:pt-32"><Pricing /></div>
    <Footer />
  </div>
);
export default PricingPage;
