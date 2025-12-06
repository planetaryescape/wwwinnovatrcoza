import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroBackground from "@assets/Cover Image_1763495477591.jpg";

export default function HeroSection() {
  const handleTestNow = () => {
    console.log("Run a Test Now clicked");
    const pricingSection = document.getElementById("pricing");
    pricingSection?.scrollIntoView({ behavior: "smooth" });
  };

  const handleMembership = () => {
    console.log("See Membership Plans clicked");
    const membershipSection = document.getElementById("membership");
    membershipSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${heroBackground})`
        }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex items-center justify-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-serif font-semibold text-white tracking-tight leading-tight text-center">
            Launch Better Innovation
          </h1>
          
          <p className="mt-8 md:mt-6 max-w-[640px] mx-auto text-base md:text-lg text-slate-50 leading-relaxed text-center drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]">
            Smart, Affordable Research in 24hrs
          </p>
          
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="default"
              className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 bg-primary hover:bg-primary/90 backdrop-blur-sm border-0"
              onClick={handleTestNow}
              data-testid="button-test-now"
            >
              See TEST24
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              size="default"
              variant="outline" 
              className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
              onClick={handleMembership}
              data-testid="button-membership"
            >
              See Membership Plans
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
