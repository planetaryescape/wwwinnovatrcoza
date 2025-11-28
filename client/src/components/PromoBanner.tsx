import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { useLocation } from "wouter";

export default function PromoBanner() {
  const [, setLocation] = useLocation();

  const handleClaimOffer = () => {
    setLocation("/claim-coupon");
  };

  return (
    <section className="py-12 bg-accent text-accent-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Gift className="w-12 h-12 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-serif font-bold mb-1">Limited Time Offer</h3>
              <p className="text-accent-foreground/90 text-lg">
                First Test24 basic idea on us.
              </p>
            </div>
          </div>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white hover:bg-white/90 text-[#141414]"
            onClick={handleClaimOffer}
            data-testid="button-view-deals"
          >
            Claim Offer
          </Button>
        </div>
      </div>
    </section>
  );
}
