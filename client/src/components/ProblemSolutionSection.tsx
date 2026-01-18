import { motion } from "framer-motion";

export default function ProblemSolutionSection() {
  return (
    <section 
      id="problem-solution" 
      className="py-24 md:py-32 lg:py-40 bg-black"
      aria-labelledby="problem-heading"
    >
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* THE PROBLEM */}
        <div className="text-center mb-32 md:mb-40 lg:mb-48">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.35em] mb-6 text-white/50"
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
            className="text-[#5A5EFF] mb-8 md:mb-12"
            style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "0.04em", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Innovation is too important to fail. But, DAMN it's tough.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-white/60 leading-relaxed"
            style={{ fontFamily: "Roboto, sans-serif", fontSize: "clamp(1rem, 1.5vw, 1.15rem)" }}
          >
            How fast is enough? Why is the project so expensive? Will this launch fail like the last one?
          </motion.p>
        </div>

        {/* THE SOLUTION */}
        <div className="text-center">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.35em] mb-6 text-white/50"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            The Solution
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-[#5A5EFF] mb-8 md:mb-12"
            style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "0.04em", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            A team of do-ers, not powerpoint consultants.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-white/60 leading-relaxed"
            style={{ fontFamily: "Roboto, sans-serif", fontSize: "clamp(1rem, 1.5vw, 1.15rem)" }}
          >
            Idea to market. Agile in-house strategy, research, design and go-to-market experts all in one team.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
