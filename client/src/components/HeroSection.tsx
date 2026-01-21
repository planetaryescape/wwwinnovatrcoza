import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  const handleTestNow = () => {
    const pricingSection = document.getElementById("pricing");
    pricingSection?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToServices = () => {
    const servicesSection = document.getElementById("services");
    servicesSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f1a]" />
      <div className="absolute inset-0 overflow-hidden bg-[#4860fa]">
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-[#ED876E] rounded-full opacity-20 blur-[80px]" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-[#F4A261] rounded-full opacity-15 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-[#E76F51] rounded-full opacity-15 blur-[90px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#2A9D8F] rounded-full opacity-10 blur-[80px]" />
      </div>
      
      {/* Hero Content - matching consult container and spacing */}
      <div className="relative z-10 min-h-screen flex flex-col justify-start px-6 sm:px-10 lg:px-16 pt-32 sm:pt-40 lg:pt-48 pb-16">
        {/* Two-column layout matching consult structure */}
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            {/* Text content - Left side (matching consult's left column) */}
            <div className="text-left lg:flex-1">
              <p className="text-sm uppercase tracking-[0.25em] text-[#ED876E] mb-6 font-semibold">
                Research & Innovation
              </p>
              <h1 
                className="font-serif font-bold leading-[0.95] uppercase"
                style={{ 
                  fontFamily: "'DM Serif Display', serif", 
                  letterSpacing: "0.06em",
                  fontSize: "clamp(3rem, 8vw, 9rem)"
                }}
              >
                <span className="text-white">WE ARE </span>
                <span className="bg-gradient-to-r from-[#ED876E] to-[#F4A261] bg-clip-text text-transparent">
                  TRANSFORMING
                </span>
                <br />
                <span className="text-white">CONSUMER<br className="sm:hidden" /> INSIGHTS</span>
              </h1>
              <p 
                className="mt-6 font-sans text-gray-300 max-w-md"
                style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
              >
                Launch Better Innovation<br />through smart 24hr research
              </p>
              
              {/* CTAs - under subtitle in left column */}
              <div className="flex flex-row flex-wrap items-center gap-4 mt-8">
                <Button 
                  size="lg"
                  className="bg-[#ED876E]/20 text-white px-8 border border-[#ED876E]/40 min-w-[160px]"
                  onClick={handleTestNow}
                  data-testid="button-test-now"
                >
                  24hr Testing
                </Button>
                <Link href="/consult">
                  <Button 
                    size="lg"
                    className="bg-[#ED876E]/20 text-white px-8 border border-[#ED876E]/40 min-w-[160px]"
                    data-testid="button-consulting"
                  >
                    Consulting
                  </Button>
                </Link>
              </div>
              
              {/* Coral box - Mobile only, after buttons */}
              <div className="flex justify-center mt-12 lg:hidden">
                <div className="relative">
                  <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-[#ED876E] to-[#E76F51] flex items-center justify-center shadow-2xl shadow-[#ED876E]/20">
                    <div className="text-center">
                      <div className="text-6xl font-serif font-bold text-white">24</div>
                      <div className="text-sm uppercase tracking-[0.3em] text-white/80 mt-2">Hours</div>
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-10 h-10 rounded-xl bg-[#2A9D8F] opacity-80" />
                  <div className="absolute -bottom-3 -left-3 w-8 h-8 rounded-lg bg-[#F4A261] opacity-70" />
                </div>
              </div>
            </div>
            
            {/* Right side - Bold color block with "24" (Desktop only) */}
            <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end">
              <div className="relative">
                {/* Main color block */}
                <div className="w-72 h-72 xl:w-80 xl:h-80 rounded-3xl bg-gradient-to-br from-[#ED876E] to-[#E76F51] flex items-center justify-center shadow-2xl shadow-[#ED876E]/20">
                  <div className="text-center">
                    <div className="text-8xl xl:text-9xl font-serif font-bold text-white">24</div>
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
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
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
