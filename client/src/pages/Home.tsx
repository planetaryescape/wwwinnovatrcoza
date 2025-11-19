import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import StatsCounter from "@/components/StatsCounter";
import ServicesSection from "@/components/ServicesSection";
import PricingSection from "@/components/PricingSection";
import MembershipSection from "@/components/MembershipSection";
import MethodologySection from "@/components/MethodologySection";
import PromoBanner from "@/components/PromoBanner";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <StatsCounter />
      <MethodologySection />
      <div id="services">
        <ServicesSection />
      </div>
      <PricingSection />
      <MembershipSection />
      <PromoBanner />
      <div id="contact">
        <ContactSection />
      </div>
      <Footer />
    </div>
  );
}
