import { motion } from "framer-motion";
import { HelpCircle, Lightbulb } from "lucide-react";
import squarePegGif from "@assets/EFC8B961-B983-4667-B510-566895277C4B_1768849610643.gif";

export default function ProblemSolutionSection() {
  return (
    <>
      {/* THE PROBLEM - Two column layout on desktop with GIF on left */}
      <section 
        id="problem-solution" 
        className="py-16 md:py-20 lg:py-24 bg-[#2B5597]"
        aria-labelledby="problem-heading"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
            {/* GIF on left - Desktop only */}
            <div className="hidden lg:block lg:w-1/2">
              <motion.img
                src={squarePegGif}
                alt="Square peg trying to fit in round hole - innovation challenge"
                className="w-full h-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
              />
            </div>
            
            {/* Text content on right */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, rotate: -5 }}
                whileInView={{ opacity: 1, rotate: -3 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="mb-4"
              >
                <HelpCircle className="w-10 h-10 mx-auto lg:mx-0 text-white/70 stroke-[1.5]" style={{ filter: "drop-shadow(0 2px 4px rgba(255,255,255,0.1))" }} />
              </motion.div>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-xs uppercase tracking-[0.35em] mb-6 text-white/60"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                The Problem
              </motion.p>
              <motion.h2 
                id="problem-heading"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-white mb-8 md:mb-12"
                style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "0.04em", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
              >
                <span className="hidden lg:inline whitespace-nowrap">Innovation is too important to fail.</span>
                <span className="lg:hidden">Innovation is too<br />important to fail.</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="max-w-2xl mx-auto lg:mx-0 text-white/90 leading-relaxed"
                style={{ fontFamily: "Roboto, sans-serif", fontSize: "clamp(1rem, 1.5vw, 1.15rem)" }}
              >
                So why does it feel so risky every time?<br />
                Projects drag on, spend escalates, and past failures make every new idea feel like a gamble.
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* THE SOLUTION - with pale blue background */}
      <section 
        className="py-24 md:py-32 lg:py-40 bg-[#E8F4FC]"
        aria-labelledby="solution-heading"
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, rotate: 5 }}
              whileInView={{ opacity: 1, rotate: 3 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-4"
            >
              <Lightbulb className="w-10 h-10 mx-auto text-black/70 stroke-[1.5]" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }} />
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-xs uppercase tracking-[0.35em] mb-6 text-black/60"
              style={{ fontFamily: "Roboto, sans-serif" }}
            >
              The Solution
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-black mb-8 md:mb-12"
              style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "0.04em", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            >
              Trust Expert Do-ers, rather than fluffy consultants.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="max-w-2xl mx-auto text-black/90 leading-relaxed"
              style={{ fontFamily: "Roboto, sans-serif", fontSize: "clamp(1rem, 1.5vw, 1.15rem)" }}
            >
              Idea to market.<br />Agile in-house strategy, research, design and go-to-market experts all in one team.
            </motion.p>
          </div>
        </div>
      </section>

    </>
  );
}
