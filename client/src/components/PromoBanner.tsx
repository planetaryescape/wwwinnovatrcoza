import { Button } from "@/components/ui/button";
import { Wrench, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import promoBackground from "@assets/pexels-raphael-brasileiro-6047129_1764658374911.jpeg";

export default function PromoBanner() {
  const [, setLocation] = useLocation();

  const handleExploreTools = () => {
    setLocation("/consult#consult-tools");
  };

  return (
    <section className="py-6 md:py-12 bg-accent text-accent-foreground relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${promoBackground})`
        }}
      />
      <div className="absolute inset-0 from-black/40 via-black/50 to-black/60 bg-[#60e0aa]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-row items-center justify-between gap-3 md:gap-6">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Wrench className="w-8 h-8 md:w-12 md:h-12 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="text-lg md:text-2xl font-serif font-bold mb-0 md:mb-1">The Tools</h3>
              <p className="text-accent-foreground/90 text-sm md:text-lg truncate md:whitespace-normal">
                Explore our Proprietary Research Toolkit
              </p>
            </div>
          </div>
          <Button 
            size="default"
            variant="outline"
            className="flex-shrink-0 bg-white/10 hover:bg-white/20 text-white border-0 text-sm md:text-base px-3 md:px-4"
            onClick={handleExploreTools}
            data-testid="button-explore-tools"
          >
            <span className="hidden sm:inline">Explore Tools</span>
            <span className="sm:hidden">Explore</span>
            <ArrowRight className="w-4 h-4 ml-1 md:ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
