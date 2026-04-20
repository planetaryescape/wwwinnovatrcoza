import { useLocation } from "wouter";
import { LayoutDashboard, FlaskConical, BarChart2, Lightbulb, Building2, Settings } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

const VDK   = "#1E1B3A";
const CORAL  = "#E8503A";

function MobileNavBtn({ icon, label, isActive, onClick, testId }: {
  icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; testId?: string;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className="flex flex-col items-center justify-center flex-1 gap-0.5 py-2 relative"
      style={{ minHeight: "44px", color: isActive ? CORAL : "rgba(255,255,255,0.45)" }}
    >
      {isActive && (
        <span
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full"
          style={{ width: "24px", height: "2px", background: CORAL }}
        />
      )}
      <span style={{ color: isActive ? CORAL : "rgba(255,255,255,0.45)" }}>{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

export function MobilePortalNav() {
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const { isAdmin } = useAuth();

  if (!isMobile) return null;

  const isDashboard = location === "/portal" || location === "/portal/dashboard";
  const isExplore   = location === "/portal/explore";
  const isTest      = location === "/portal/test";
  const isAct       = location === "/portal/act";
  const isHealth    = location.startsWith("/portal/health");
  const isSettings  = location === "/portal/settings";

  return (
    <nav
      className="flex items-center justify-around"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        background: VDK,
        borderTop: "1px solid rgba(255,255,255,0.08)",
        height: "56px",
      }}
      data-testid="mobile-bottom-nav"
    >
      <MobileNavBtn icon={<LayoutDashboard className="w-5 h-5" />} label="Home"   isActive={isDashboard} onClick={() => setLocation("/portal/dashboard")} testId="mobile-nav-dashboard" />
      <MobileNavBtn icon={<FlaskConical   className="w-5 h-5" />}  label="Explore" isActive={isExplore}   onClick={() => setLocation("/portal/explore")}   testId="mobile-nav-explore"   />
      <MobileNavBtn icon={<BarChart2      className="w-5 h-5" />}  label="Test"    isActive={isTest}      onClick={() => setLocation("/portal/test")}      testId="mobile-nav-test"      />
      {isAdmin ? (
        <>
          <MobileNavBtn icon={<Lightbulb      className="w-5 h-5" />}  label="Act"     isActive={isAct}       onClick={() => setLocation("/portal/act")}       testId="mobile-nav-act"       />
          <MobileNavBtn icon={<Building2      className="w-5 h-5" />}  label="Health"  isActive={isHealth}    onClick={() => setLocation("/portal/health")}    testId="mobile-nav-health"    />
        </>
      ) : (
        <MobileNavBtn icon={<Settings       className="w-5 h-5" />}  label="Settings" isActive={isSettings}  onClick={() => setLocation("/portal/settings")}  testId="mobile-nav-settings" />
      )}
    </nav>
  );
}
