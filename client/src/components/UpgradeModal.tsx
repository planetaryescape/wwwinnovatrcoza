import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";
import { useLocation } from "wouter";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function UpgradeModal({ isOpen, onClose, title, description }: UpgradeModalProps) {
  const [, setLocation] = useLocation();

  const handleViewPlans = () => {
    onClose();
    setLocation("/#membership");
    setTimeout(() => {
      const membershipSection = document.getElementById("membership");
      membershipSection?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const benefits = [
    "Unlimited trends library access",
    "Member pricing discounts (up to 50% off)",
    "Private dashboards for all research",
    "Research credits system",
    "Exclusive monthly deals",
    "Personalized recommendations",
    "Priority support",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-upgrade">
        <DialogHeader>
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            {title || "Unlock Full Innovatr Access"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description || "Get unlimited trends, member pricing, private dashboards, research credits, and exclusive monthly deals."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={handleViewPlans}
            className="w-full"
            data-testid="button-view-plans"
          >
            See Membership Plans
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
            data-testid="button-continue-browsing"
          >
            Continue Browsing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
