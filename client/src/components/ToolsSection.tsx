import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, Wrench } from "lucide-react";

import marketShareImg from "@assets/generated_images/market_share_simulator_3d.png";
import aiQualImg from "@assets/generated_images/ai_qual_neural_brain.png";
import storytellerImg from "@assets/generated_images/storyteller_flowing_book.png";
import gamificationImg from "@assets/generated_images/gamification_controller_abstract.png";
import upsiideImg from "@assets/generated_images/upsiide_dashboard_floating.png";
import speedImg from "@assets/generated_images/24hr_speed_clock_bolt.png";

const tools = [
  {
    id: "storyteller",
    title: "Gamified Respondent Experience",
    description: "Will consumers engage with my innovation? Will months of development be discarded in a moment as consumers ignore your idea? Upsiide identifies innovations that will break through with an intuitive swiping interface that places your ideas in a competitive context.",
    image: storytellerImg,
  },
  {
    id: "ai-qual",
    title: "Empathy at Scale via AI Qual",
    description: "AI Video Interview. What: An AI qualitative moderator that understands your information objectives and conducts a naturalistic interview and summarizes the learnings, complete with a show reel. Why it matters: Makes agile qualitative research accessible. Bring the voice of the consumer to your stakeholders on demand.",
    image: aiQualImg,
  },
  {
    id: "gamification",
    title: "Track Emotional Appeal",
    description: "Emojis. To understand how people feel about your innovations, we created a set of 24 emojis based on Robert Plutchik's wheel of emotions. This allows us to dig deeper into drivers of strong or weak performance of your ideas while maintaining an experience that feels like social media, not a survey.",
    image: gamificationImg,
  },
  {
    id: "market-share",
    title: "Predict Market Share",
    description: "Proprietary Market Simulator. Market Simulator is a proprietary, patented data modeling that converts respondent data into forecasts of share of choice, source of volume, incrementality and cannibalization. This is the data you need to make compelling business decisions.",
    image: marketShareImg,
  },
  {
    id: "upsiide",
    title: "Analyse live results on your private dashboard",
    description: "Inspiring Data Visualizations and Modeling. Brilliant innovation marries rigor with playfulness and exploration. Your private dashboards make data inspiring.",
    image: upsiideImg,
  },
  {
    id: "agile-design",
    title: "Bring your concept to life with Agile Design",
    description: "Just Design: Creatively Led. Results Driven. With 3 offices and clients across Africa, the Middle East, and Europe. Whether it's a small-scale artisanal brand or a retail powerhouse with a vast product line, our designs are not just Instagram-worthy, but also highly effective.",
    image: speedImg,
  },
];

function ToolCard({ tool, index }: { tool: typeof tools[0]; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative h-[360px] sm:h-[400px] perspective-1000"
      data-testid={`tool-card-${tool.id}`}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Front of card */}
        <div 
          className="absolute inset-0 bg-white rounded-2xl shadow-xl overflow-hidden backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Image area */}
          <div className="h-[65%] relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
            <img 
              src={tool.image}
              alt={tool.title}
              className="w-full h-full object-cover"
              data-testid={`img-tool-${tool.id}`}
            />
          </div>
          
          {/* Title area */}
          <div className="p-5 h-[35%] flex items-start justify-between">
            <h3 
              className="text-lg sm:text-xl text-slate-800 font-medium leading-tight pr-4"
              style={{ fontFamily: "'DM Serif Display', serif" }}
              data-testid={`text-tool-title-${tool.id}`}
            >
              {tool.title}
            </h3>
            
            {/* Plus button */}
            <button
              onClick={() => setIsFlipped(true)}
              className="flex-shrink-0 w-10 h-10 rounded-full bg-[#5A5EFF] text-white flex items-center justify-center transition-transform duration-300 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5A5EFF] focus-visible:ring-offset-2"
              aria-label={`Learn more about ${tool.title}`}
              data-testid={`button-flip-${tool.id}`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Back of card */}
        <div 
          className="absolute inset-0 bg-white rounded-2xl shadow-xl overflow-hidden backface-hidden"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="p-6 h-full flex flex-col">
            <h3 
              className="text-xl sm:text-2xl text-slate-800 mb-4"
              style={{ fontFamily: "'DM Serif Display', serif" }}
              data-testid={`text-tool-back-title-${tool.id}`}
            >
              {tool.title}
            </h3>
            
            <p 
              className="text-slate-600 leading-relaxed flex-1"
              style={{ fontFamily: "Roboto, sans-serif", fontSize: "0.95rem" }}
              data-testid={`text-tool-description-${tool.id}`}
            >
              {tool.description}
            </p>
            
            <div className="mt-4 flex items-center justify-between">
              <span 
                className="text-[#5A5EFF]/60 text-sm"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                Coming soon
              </span>
              
              {/* Close button */}
              <button
                onClick={() => setIsFlipped(false)}
                className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center transition-all duration-300 hover:bg-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                aria-label="Close details"
                data-testid={`button-close-${tool.id}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ToolsSection() {
  return (
    <section 
      id="consult-tools"
      className="relative py-24 sm:py-32 bg-[#DDA0DD]"
      data-testid="section-tools"
    >
      {/* Light gradient overlay at top for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(90,94,255,0.15),transparent_60%)]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="mb-4" style={{ transform: "rotate(-2deg)" }}>
            <Wrench className="w-10 h-10 mx-auto text-white/70 stroke-[1.5]" style={{ filter: "drop-shadow(0 2px 4px rgba(255,255,255,0.1))" }} />
          </div>
          <p 
            className="text-xs uppercase tracking-[0.35em] mb-6 text-white/50"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            The Tools
          </p>
          <h2 
            className="text-white mb-6"
            style={{ 
              fontFamily: "'DM Serif Display', serif", 
              letterSpacing: "0.04em",
              fontSize: "clamp(2rem, 5vw, 3.5rem)"
            }}
          >
            Turn Insights into <span className="font-bold">evidence based</span> decisions.
          </h2>
          <p 
            className="text-white/60 max-w-2xl mx-auto leading-relaxed"
            style={{ 
              fontFamily: "Roboto, sans-serif",
              fontSize: "clamp(1rem, 1.5vw, 1.15rem)" 
            }}
          >
            Our proprietary toolkit accelerates every phase of research — from hypothesis to action.
          </p>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {tools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
