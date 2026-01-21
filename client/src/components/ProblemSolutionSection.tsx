import { motion } from "framer-motion";
import { HelpCircle, Lightbulb } from "lucide-react";
import clockGif from "@assets/36B39759-4D52-492D-81FE-C70D9A558743_1768973583589.gif";
import piggyBankGif from "@assets/5D239355-8267-4950-8318-00E0A2A42BA9_1768979038560.gif";

export default function ProblemSolutionSection() {
  return (
    <>
      {/* THE PROBLEM - Two column layout on desktop with GIF on left */}
      <section 
        id="problem-solution" 
        className="bg-[#E0F4FF]"
        aria-labelledby="problem-heading"
      >
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          {/* GIF on left - Desktop only, edge to edge */}
          <div className="hidden lg:block lg:w-1/2">
            <motion.img
              src={clockGif}
              alt="Clock animation - time pressure in innovation"
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            />
          </div>
          
          {/* Text content on right - centered */}
          <div className="lg:w-1/2 flex items-center justify-center py-16 md:py-20 lg:py-24 px-6 sm:px-8 lg:px-16">
            <div className="text-center max-w-md">
              <motion.div
                initial={{ opacity: 0, rotate: -5 }}
                whileInView={{ opacity: 1, rotate: -3 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="mb-4"
              >
                <HelpCircle className="w-10 h-10 mx-auto text-slate-600/70 stroke-[1.5]" />
              </motion.div>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-xs uppercase tracking-[0.35em] mb-6 text-slate-600/60"
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
                className="text-slate-800 mb-6 lg:mb-8"
                style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "0.02em", fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                Innovation is too important to fail.
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-slate-700 leading-relaxed"
                style={{ fontFamily: "Roboto, sans-serif", fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)" }}
              >
                So why does it feel so risky every time? Projects drag on, spend escalates, and past failures make every new idea feel like a gamble.
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* THE SOLUTION - Two column layout on desktop with GIF on right */}
      <section 
        className="bg-[#B8E4FF]"
        aria-labelledby="solution-heading"
      >
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          {/* Text content on left - centered */}
          <div className="lg:w-1/2 flex items-center justify-center py-16 md:py-20 lg:py-24 px-6 sm:px-8 lg:px-16 order-2 lg:order-1">
            <div className="text-center max-w-md">
              <motion.div
                initial={{ opacity: 0, rotate: 5 }}
                whileInView={{ opacity: 1, rotate: 3 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="mb-4"
              >
                <Lightbulb className="w-10 h-10 mx-auto text-slate-600/70 stroke-[1.5]" />
              </motion.div>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-xs uppercase tracking-[0.35em] mb-6 text-slate-600/60"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                The Solution
              </motion.p>
              <motion.h2 
                id="solution-heading"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-slate-800 mb-6 lg:mb-8"
                style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "0.02em", fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                Trust Expert Do-ers, rather than fluffy consultants.
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-slate-700 leading-relaxed"
                style={{ fontFamily: "Roboto, sans-serif", fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)" }}
              >
                Idea to market. Agile in-house strategy, research, design and go-to-market experts all in one team.
              </motion.p>
            </div>
          </div>
          
          {/* GIF on right - Desktop only, edge to edge */}
          <div className="hidden lg:block lg:w-1/2 order-1 lg:order-2">
            <motion.img
              src={piggyBankGif}
              alt="Piggy bank animation - smart investment in innovation"
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      </section>

    </>
  );
}
