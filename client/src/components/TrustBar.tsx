import { useEffect, useRef } from "react";

const clients = [
  "Heineken",
  "Discovery Bank",
  "Rain",
  "DGB",
  "Rugani Juice",
  "Namibian Breweries",
  "Mondelez",
  "ooba",
  "Revlon",
  "Dairy Maid",
  "Netflorist",
  "KWV",
];

export default function TrustBar() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    const scroll = () => {
      scrollAmount += 0.5;
      if (scrollContainer.scrollWidth > 0) {
        if (scrollAmount >= scrollContainer.scrollWidth / 2) {
          scrollAmount = 0;
        }
        scrollContainer.scrollLeft = scrollAmount;
      }
      requestAnimationFrame(scroll);
    };

    const animationFrame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="py-8 border-y border-border overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex gap-12 items-center whitespace-nowrap overflow-hidden"
        style={{ scrollBehavior: 'auto' }}
      >
        {[...clients, ...clients, ...clients].map((client, index) => (
          <div
            key={index}
            className="text-2xl font-semibold text-muted-foreground/60 px-4"
            data-testid={`client-${index}`}
          >
            {client}
          </div>
        ))}
      </div>
    </div>
  );
}
