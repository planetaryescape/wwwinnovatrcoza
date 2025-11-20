import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useState } from "react";
import UpgradeModal from "./UpgradeModal";

interface LockedFeatureProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  showButton?: boolean;
  customModalTitle?: string;
  customModalDescription?: string;
}

export default function LockedFeature({
  title,
  description,
  children,
  className = "",
  showButton = true,
  customModalTitle,
  customModalDescription,
}: LockedFeatureProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleClick = () => {
    setShowUpgradeModal(true);
  };

  return (
    <>
      <Card
        className={`relative border-primary/30 hover-elevate transition-all duration-300 ${className}`}
        data-testid="locked-feature"
      >
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-primary/10 border border-primary/30 rounded-md px-2 py-1 flex items-center gap-1">
            <Lock className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold">Locked</span>
          </div>
        </div>

        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
          {children}
          {showButton && (
            <div className="mt-4 pt-4 border-t">
              <Button
                onClick={handleClick}
                className="w-full"
                data-testid="button-unlock-feature"
              >
                <Lock className="w-4 h-4 mr-2" />
                Unlock with Membership
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title={customModalTitle}
        description={customModalDescription}
      />
    </>
  );
}
