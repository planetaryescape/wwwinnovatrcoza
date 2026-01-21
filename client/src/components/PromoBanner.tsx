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
    <section className="py-12 bg-accent text-accent-foreground relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${promoBackground})`
        }}
      />
      <div className="absolute inset-0 from-black/40 via-black/50 to-black/60 bg-[#60e0aa]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Wrench className="w-12 h-12 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-serif font-bold mb-1">The Tools</h3>
              <p className="text-accent-foreground/90 text-lg">
                Explore our Proprietary Research Toolkit
              </p>
            </div>
          </div>
          <Button 
            size="lg" 
            variant="outline"
            className="w-full md:w-auto bg-white/10 hover:bg-white/20 text-white border-0"
            onClick={handleExploreTools}
            data-testid="button-explore-tools"
          >
            Explore Tools
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
