import type { CSSProperties, ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type PortalTabItem<TValue extends string = string> = {
  value: TValue;
  label: ReactNode;
  testId?: string;
};

type PortalTabsProps<TValue extends string> = {
  value: TValue;
  onValueChange: (value: TValue) => void;
  tabs: readonly PortalTabItem<TValue>[];
  children: ReactNode;
  accentColor?: string;
  className?: string;
  barClassName?: string;
};

export function PortalTabs<TValue extends string>({
  value,
  onValueChange,
  tabs,
  children,
  accentColor = "#E8503A",
  className,
  barClassName,
}: PortalTabsProps<TValue>) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as TValue)}
      className={cn("flex min-h-0 flex-1 flex-col w-full", className)}
      style={{ "--portal-tab-accent": accentColor } as CSSProperties}
    >
      <div className={cn("sticky-tab-bar border-b px-5", barClassName)} style={{ borderColor: "#EBEBEB" }}>
        <TabsList className="!h-auto !w-full !justify-start !overflow-x-auto !rounded-none !bg-transparent !p-0 !text-[#8A7260]">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              data-testid={tab.testId}
              className="!rounded-none !bg-transparent px-4 py-2.5 text-sm font-medium !shadow-none transition-colors border-b-2 border-transparent -mb-px data-[state=active]:!bg-transparent data-[state=active]:!text-[#1E1B3A] data-[state=active]:!shadow-none"
              style={{
                borderBottomColor: value === tab.value ? "var(--portal-tab-accent)" : "transparent",
              }}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {children}
    </Tabs>
  );
}

export const PortalTabContent = TabsContent;
