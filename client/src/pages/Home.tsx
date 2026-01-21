import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import StatsCounter from "@/components/StatsCounter";
import ServicesSection from "@/components/ServicesSection";
import PricingSection from "@/components/PricingSection";
import MembershipSection from "@/components/MembershipSection";
import MethodologySection from "@/components/MethodologySection";
import PromoBanner from "@/components/PromoBanner";
import MailerSection from "@/components/MailerSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <StatsCounter />
      <MethodologySection />
      <PromoBanner />
      <div id="services">
        <ServicesSection />
      </div>
      <PricingSection />
      <MembershipSection />
      <MailerSection />
      <div id="contact">
        <ContactSection />
      </div>
      <Footer />
    </div>
  );
}
