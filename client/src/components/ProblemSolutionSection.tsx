import { motion } from "framer-motion";

export default function ProblemSolutionSection() {
  return (
    <section 
      id="problem-solution" 
      className="py-24 md:py-32 lg:py-40 bg-gradient-to-b from-[#5A5EFF] via-[#4D55F5] to-[#3D4DE8]"
      aria-labelledby="problem-heading"
    >
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* THE PROBLEM */}
        <div className="text-center mb-32 md:mb-40 lg:mb-48">
          <motion.h2 
            id="problem-heading"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-serif font-bold text-white mb-8 md:mb-12 leading-[1.05]"
            style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "0.06em", fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
          >
            THE PROBLEM
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto space-y-5 md:space-y-6 text-white/90 font-sans leading-relaxed px-4"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
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
            className="font-serif font-bold text-white mb-8 md:mb-12 leading-[1.05]"
            style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "0.06em", fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
          >
            THE SOLUTION
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto space-y-5 md:space-y-6 text-white/90 font-sans leading-relaxed px-4"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
          >
            <p>
              We align stakeholders, clarify options, and use real market evidence to show where to focus, how to play, and how to win, with confidence.
            </p>
            <p>
              From strategy & innovation to execution & scale.
            </p>
            <p className="font-medium">
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
