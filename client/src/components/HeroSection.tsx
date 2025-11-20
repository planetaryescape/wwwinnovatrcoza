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
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${heroBackground})`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4 tracking-tight leading-tight">
          Launch Better Innovation
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-12 font-light">
          Smart, Affordable Research in 24hrs
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <Button 
            size="default"
            className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 bg-primary hover:bg-primary/90 border border-primary-border backdrop-blur-sm w-full sm:w-auto"
            onClick={handleTestNow}
            data-testid="button-test-now"
          >
            New: See Test24
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button 
            size="default"
            variant="outline" 
            className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 w-full sm:w-auto"
            onClick={handleMembership}
            data-testid="button-membership"
          >
            See Membership Plans
          </Button>
        </div>
      </div>
    </section>
  );
}
