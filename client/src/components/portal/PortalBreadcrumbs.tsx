import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

type PortalBreadcrumbItem = {
  label: string;
  href?: string;
};

type PortalBreadcrumbsProps = {
  items: readonly PortalBreadcrumbItem[];
  className?: string;
};

export function PortalBreadcrumbs({ items, className }: PortalBreadcrumbsProps) {
  const [, setLocation] = useLocation();

  return (
    <Breadcrumb className={cn("mb-3", className)}>
      <BreadcrumbList className="gap-1.5 text-xs font-semibold text-[#A89078] sm:gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem className="gap-1.5">
                {item.href && !isLast ? (
                  <BreadcrumbLink
                    href={item.href}
                    onClick={(event) => {
                      event.preventDefault();
                      setLocation(item.href!);
                    }}
                  >
                    {item.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="font-semibold text-[#1E1B3A]">
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="text-[#C9B99A]" />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
