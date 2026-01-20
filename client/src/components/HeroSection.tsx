import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Link } from "wouter";

export default function HeroSection() {
  const handleTestNow = () => {
    const pricingSection = document.getElementById("pricing");
    pricingSection?.scrollIntoView({ behavior: "smooth" });
  };

  const handleMembership = () => {
    const membershipSection = document.getElementById("membership");
    membershipSection?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToServices = () => {
    const servicesSection = document.getElementById("services");
    servicesSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d0d15] to-[#0a0a0f]" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4D5FF1]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-[#ED876E]/15 rounded-full blur-[100px]" />
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <p className="text-sm uppercase tracking-[0.3em] text-[#4D5FF1] mb-6 font-medium">
              Research & Innovation
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-8 leading-tight">
              Launch Better{" "}
              <span className="bg-gradient-to-r from-[#4D5FF1] to-[#8B5CF6] bg-clip-text text-transparent">
                Innovation
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-xl mb-4">
              Smart, affordable research in 24hrs. Make confident decisions backed by real consumer insights.
            </p>
            <p className="text-sm text-gray-500 max-w-lg mb-10">
              From rapid testing to strategic consulting — we help ambitious teams validate ideas and scale what works.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button 
                size="lg"
                className="bg-[#4D5FF1] hover:bg-[#4D5FF1]/90 text-white px-8"
                onClick={handleTestNow}
                data-testid="button-test-now"
              >
                24hr Research
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-white/5"
                onClick={handleMembership}
                data-testid="button-membership"
              >
                Memberships
              </Button>
              <Link href="/consult">
                <Button 
                  size="lg"
                  className="bg-transparent border border-[#4D5FF1]/50 hover:bg-[#4D5FF1]/10 text-white"
                  data-testid="button-consulting"
                >
                  Consulting
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:flex justify-center items-center relative">
            <div className="absolute w-80 h-80 rounded-full opacity-40 blur-3xl bg-gradient-to-br from-[#4D5FF1] to-[#8B5CF6]" />
            <div className="relative z-10 text-center">
              <div className="text-8xl font-serif font-bold text-white/10">24</div>
              <div className="text-2xl uppercase tracking-[0.3em] text-gray-600 -mt-4">Hours</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button 
          onClick={scrollToServices}
          className="group"
          data-testid="button-scroll-down"
        >
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2 group-hover:border-gray-400 transition-colors">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
          </div>
        </button>
      </div>
    </section>
  );
}
