import { motion } from "framer-motion";

export default function ProblemSolutionSection() {
  return (
    <section 
      id="problem-solution" 
      className="py-24 md:py-32 lg:py-40 bg-[#4444ff]"
    >
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* THE PROBLEM */}
        <div className="text-center mb-32 md:mb-40 lg:mb-48">
          <motion.h2 
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-serif font-bold text-white mb-8 md:mb-12
              text-[clamp(3rem,10vw,8rem)] leading-[1.05]"
            style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "0.08em" }}
          >
            THE PROBLEM
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto space-y-4 sm:space-y-5 md:space-y-6 text-white/60 font-sans 
              text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed px-4"
          >
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
          </motion.div>
        </div>

        {/* THE SOLUTION */}
        <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-serif font-bold text-white mb-8 md:mb-12
              text-[clamp(3rem,10vw,8rem)] leading-[1.05]"
            style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "0.08em" }}
          >
            THE SOLUTION
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto space-y-4 sm:space-y-5 md:space-y-6 text-white/60 font-sans 
              text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed px-4"
          >
            <p className="text-[#ffffff]">
              We align stakeholders, clarify options, and use real market evidence to show where to focus, how to play, and how to win, with confidence.
            </p>
            <p className="text-[#ffffff]">
              From strategy and innovation to execution and scale.
            </p>
            <p className="font-medium text-[#ffffff]">
              No noise. No guesswork.
              <br />
              Just momentum.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
