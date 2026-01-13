import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ProblemSolutionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  const problemOpacity = useTransform(scrollYProgress, [0, 0.35, 0.45], [1, 1, 0]);
  const problemY = useTransform(scrollYProgress, [0, 0.35, 0.5], [0, 0, -60]);
  
  const solutionOpacity = useTransform(scrollYProgress, [0.45, 0.55, 1], [0, 1, 1]);
  const solutionY = useTransform(scrollYProgress, [0.4, 0.55, 1], [60, 0, 0]);

  if (reducedMotion) {
    return (
      <section 
        id="problem-solution" 
        className="bg-[#0a0a0f] py-24 md:py-32 lg:py-40"
      >
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-24 md:mb-32 lg:mb-40">
            <h2 
              className="font-serif font-bold text-white mb-8 md:mb-12 tracking-tight
                text-[clamp(2.5rem,8vw,6rem)] leading-[1.1]"
            >
              THE PROBLEM
            </h2>
            <div className="max-w-2xl mx-auto space-y-6 text-white/70 font-sans text-base sm:text-lg md:text-xl leading-relaxed">
              <p>
                Big decisions don't fail because of a lack of ideas.
                <br />
                They fail because there are too many routes, too many opinions, and no clear way forward.
              </p>
              <p>
                Teams get stuck debating direction, testing in silos, or moving too slowly while the market keeps shifting.
              </p>
            </div>
          </div>

          <div className="text-center">
            <h2 
              className="font-serif font-bold text-white mb-8 md:mb-12 tracking-tight
                text-[clamp(2.5rem,8vw,6rem)] leading-[1.1]"
            >
              THE SOLUTION
            </h2>
            <div className="max-w-2xl mx-auto space-y-6 text-white/70 font-sans text-base sm:text-lg md:text-xl leading-relaxed">
              <p>
                Innovatr Consult brings structure to complexity.
              </p>
              <p>
                We design a clear learning agenda, test the right questions at the right moments, and turn evidence into decisive action — across strategy, innovation & execution.
              </p>
              <p className="text-white/90 font-medium">
                No noise. No guesswork. Just momentum.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={sectionRef}
      id="problem-solution" 
      className="relative bg-[#0a0a0f]"
      style={{ height: "220vh" }}
    >
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, #0a0a0f 70%)"
        }}
      />
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="relative w-full max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            style={{ opacity: problemOpacity, y: problemY }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
          >
            <h2 
              className="font-serif font-bold text-white mb-6 sm:mb-8 md:mb-10 lg:mb-12 tracking-tight
                text-[clamp(3rem,10vw,8rem)] leading-[1.05]"
              style={{ letterSpacing: "-0.02em" }}
            >
              THE PROBLEM
            </h2>
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5 md:space-y-6 text-white/60 font-sans 
              text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed px-4">
              <p>
                Innovation isn't linear, but too often, decisions are forced to be.
              </p>
              <p>
                Big decisions don't fail because of a lack of ideas.
                <br className="hidden sm:block" />
                They fail because there are too many routes, too many opinions, and no clear way forward.
              </p>
              <p>
                Multiple ideas. Multiple stakeholders. Conflicting signals.
                <br className="hidden sm:block" />
                Progress stalls while certainty stays just out of reach.
              </p>
            </div>
          </motion.div>

          <motion.div
            style={{ opacity: solutionOpacity, y: solutionY }}
            className="flex flex-col items-center justify-center text-center min-h-[60vh]"
          >
            <h2 
              className="font-serif font-bold text-white mb-6 sm:mb-8 md:mb-10 lg:mb-12 tracking-tight
                text-[clamp(3rem,10vw,8rem)] leading-[1.05]"
              style={{ letterSpacing: "-0.02em" }}
            >
              THE SOLUTION
            </h2>
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5 md:space-y-6 text-white/60 font-sans 
              text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed px-4">
              <p>
                Innovatr Consult brings structure to complexity.
              </p>
              <p className="text-[#ffffff]">
                We design a clear learning agenda, test the right questions at the right moments, and turn evidence into decisive action — across strategy, innovation & execution.
              </p>
              <p className="text-white/80 font-medium">
                No noise. No guesswork. Just momentum.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
