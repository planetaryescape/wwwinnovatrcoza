import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function PromoBanner() {
  const handleViewDeals = () => {
    console.log("View Deals clicked");
  };

  return (
    <section className="py-12 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Sparkles className="w-12 h-12 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold mb-1">This Month's Special</h3>
              <p className="text-primary-foreground/90 text-lg">
                Run 2 Test24 Basic Ideas, Get 1 Free
              </p>
            </div>
          </div>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
            onClick={handleViewDeals}
            data-testid="button-view-deals"
          >
            View Deals
          </Button>
        </div>
      </div>
    </section>
  );
}
