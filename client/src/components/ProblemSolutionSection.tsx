import { motion } from "framer-motion";
import { HelpCircle, Lightbulb } from "lucide-react";

export default function ProblemSolutionSection() {
  return (
    <section 
      id="problem-solution" 
      className="py-24 md:py-32 lg:py-40 bg-[#FFF5EE]"
      aria-labelledby="problem-heading"
    >
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* THE PROBLEM */}
        <div className="text-center mb-32 md:mb-40 lg:mb-48">
          <motion.div
            initial={{ opacity: 0, rotate: -5 }}
            whileInView={{ opacity: 1, rotate: -3 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <HelpCircle className="w-10 h-10 mx-auto text-slate-800 stroke-[1.5]" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }} />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.35em] mb-6 text-slate-800"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            The Problem
          </motion.p>
          <motion.h2 
            id="problem-heading"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-slate-800 mb-8 md:mb-12"
            style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "0.04em", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Innovation is too important to fail.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate-700 leading-relaxed"
            style={{ fontFamily: "Roboto, sans-serif", fontSize: "clamp(1rem, 1.5vw, 1.15rem)" }}
          >
            Why are projects so slow? Why is it so expensive? Will this launch fail like the last one?
          </motion.p>
        </div>

        {/* THE SOLUTION */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, rotate: 5 }}
            whileInView={{ opacity: 1, rotate: 3 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <Lightbulb className="w-10 h-10 mx-auto text-slate-800 stroke-[1.5]" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }} />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.35em] mb-6 text-slate-800"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            The Solution
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-slate-800 mb-8 md:mb-12"
            style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "0.04em", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Trust Expert Do-ers, rather than fluffy consultants.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate-700 leading-relaxed"
            style={{ fontFamily: "Roboto, sans-serif", fontSize: "clamp(1rem, 1.5vw, 1.15rem)" }}
          >
            Idea to market.<br />Agile in-house strategy, research, design and go-to-market experts all in one team.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
