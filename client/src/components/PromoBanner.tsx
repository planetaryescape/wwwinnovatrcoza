import { Wrench, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import promoBackground from "@assets/pexels-raphael-brasileiro-6047129_1764658374911.jpeg";

export default function PromoBanner() {
  const [, setLocation] = useLocation();

  const handleExploreTools = () => {
    setLocation("/consult#consult-tools");
  };

  return (
    <section className="pb-6 md:pb-12 pt-6 md:pt-12 bg-accent text-accent-foreground relative overflow-hidden -mt-1">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${promoBackground})`
        }}
      />
      <div className="absolute inset-0 from-black/40 via-black/50 to-black/60 bg-[#60e0aa]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-row items-center gap-2 md:gap-4">
          <Wrench className="w-8 h-8 md:w-12 md:h-12 flex-shrink-0" />
          <div>
            <h3 className="text-lg md:text-2xl font-serif font-bold mb-0 md:mb-1">The Tools</h3>
            <button 
              onClick={handleExploreTools}
              className="text-accent-foreground/90 text-sm md:text-lg hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
              data-testid="button-explore-tools"
            >
              Explore our Research Toolkit
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
