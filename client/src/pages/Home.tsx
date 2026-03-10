import { useEffect } from "react";
import { useLocation } from "wouter";
import { Microscope, Brain } from "lucide-react";
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

function WhatAreYouLookingFor() {
  const [, setLocation] = useLocation();

  function scrollToServices() {
    const el = document.getElementById("services");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="bg-[#4338ca] py-10 px-4" data-testid="section-what-looking-for">
      <div className="max-w-7xl mx-auto">
        <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-6 lg:text-center">
          What are you looking for?
        </p>
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 lg:justify-evenly">
          <button
            onClick={scrollToServices}
            data-testid="button-explore-research-band"
            className="flex items-center gap-3 text-left group"
          >
            <Microscope className="w-5 h-5 text-[#ED876E] flex-shrink-0" />
            <span
              className="text-white font-semibold group-hover:text-[#ED876E] transition-colors duration-150"
              style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)" }}
            >
              Rapid Consumer Research
            </span>
          </button>

          <button
            onClick={() => setLocation("/consult")}
            data-testid="button-explore-consulting-band"
            className="flex items-center gap-3 text-left group"
          >
            <Brain className="w-5 h-5 text-[#ED876E] flex-shrink-0" />
            <span
              className="text-white font-semibold group-hover:text-[#ED876E] transition-colors duration-150"
              style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)" }}
            >
              Innovation Growth Consulting
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <WhatAreYouLookingFor />
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
