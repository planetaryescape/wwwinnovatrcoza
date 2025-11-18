import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroBackground from "@assets/Picture 1_1763460279573.jpg";

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
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/40" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-serif font-bold text-white mb-4 tracking-tight leading-tight">
          Launch Better Innovation
        </h1>
        <p className="text-2xl sm:text-3xl text-white/90 mb-12 font-light">
          Smart, Affordable Research in 24hrs
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 border border-primary-border backdrop-blur-sm"
            onClick={handleTestNow}
            data-testid="button-test-now"
          >
            Run a Test Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-6 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
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
