import { useEffect, useState, useRef } from "react";
import TrustBar from "./TrustBar";

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: "200+", label: "Studies" },
  { value: "25+", label: "Markets" },
  { value: "44M+", label: "Panel" },
  { value: "10+", label: "Industries" },
];

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function StatsCounter() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm mb-8 uppercase tracking-wider font-bold" style={{ color: '#4D5FF1' }}>
          Ambitious Brands who trust Innovatr
        </p>
        <div className="mb-12">
          <TrustBar />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center" data-testid={`stat-${index}`}>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.value.includes("M+") ? (
                  <>
                    <AnimatedNumber target={parseInt(stat.value)} />M+
                  </>
                ) : stat.value.includes("k+") ? (
                  <>
                    <AnimatedNumber target={parseInt(stat.value)} />k+
                  </>
                ) : stat.value.includes("+") ? (
                  <>
                    <AnimatedNumber target={parseInt(stat.value)} />+
                  </>
                ) : stat.value.includes("%") ? (
                  <>
                    <AnimatedNumber target={parseInt(stat.value)} />%
                  </>
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
