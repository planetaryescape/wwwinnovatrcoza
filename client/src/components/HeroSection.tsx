import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
      {/* Warm, vibrant background with personality */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f1a]" />
      
      {/* Colorful accent blocks - warm and inviting */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-[#ED876E] rounded-full opacity-20 blur-[80px]" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-[#F4A261] rounded-full opacity-15 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-[#E76F51] rounded-full opacity-15 blur-[90px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#2A9D8F] rounded-full opacity-10 blur-[80px]" />
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Large bold text */}
          <div className="text-left">
            <p className="text-sm uppercase tracking-[0.25em] text-[#ED876E] mb-6 font-semibold">
              Research & Innovation
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-8 leading-[1.1]">
              Launch{" "}
              <span className="text-[#ED876E]">Better</span>{" "}
              Innovation
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-xl mb-4 font-light">
              Smart, affordable research in 24hrs.
            </p>
            <p className="text-base text-gray-400 max-w-lg mb-10">
              Make confident decisions backed by real consumer insights. From rapid testing to strategic consulting.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button 
                size="lg"
                className="bg-[#ED876E] text-white px-8 border-[#ED876E]"
                onClick={handleTestNow}
                data-testid="button-test-now"
              >
                24hr Research
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/30 text-white bg-white/5"
                onClick={handleMembership}
                data-testid="button-membership"
              >
                Memberships
              </Button>
              <Link href="/consult">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-[#2A9D8F]/50 text-[#2A9D8F] bg-[#2A9D8F]/5"
                  data-testid="button-consulting"
                >
                  Consulting
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Right side - Bold color block with "24" */}
          <div className="hidden lg:flex justify-center items-center relative">
            <div className="relative">
              {/* Main color block */}
              <div className="w-72 h-72 rounded-3xl bg-gradient-to-br from-[#ED876E] to-[#E76F51] flex items-center justify-center shadow-2xl shadow-[#ED876E]/20">
                <div className="text-center">
                  <div className="text-8xl font-serif font-bold text-white">24</div>
                  <div className="text-lg uppercase tracking-[0.3em] text-white/80 mt-2">Hours</div>
                </div>
              </div>
              {/* Accent floating elements */}
              <div className="absolute -top-6 -right-6 w-16 h-16 rounded-xl bg-[#2A9D8F] opacity-80" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-lg bg-[#F4A261] opacity-70" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button 
          onClick={scrollToServices}
          className="hover-elevate rounded-full p-2"
          data-testid="button-scroll-down"
        >
          <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-[#ED876E] rounded-full animate-bounce" />
          </div>
        </button>
      </div>
    </section>
  );
}
