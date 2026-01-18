import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";

import marketShareImg from "@assets/generated_images/market_share_simulator_3d.png";
import aiQualImg from "@assets/generated_images/ai_qual_neural_brain.png";
import storytellerImg from "@assets/generated_images/storyteller_flowing_book.png";
import gamificationImg from "@assets/generated_images/gamification_controller_abstract.png";
import upsiideImg from "@assets/generated_images/upsiide_dashboard_floating.png";
import speedImg from "@assets/generated_images/24hr_speed_clock_bolt.png";

const tools = [
  {
    id: "market-share",
    title: "Market Share Simulator",
    description: "Model competitive scenarios and predict market dynamics before you make your move. Run 'what-if' analyses to pressure-test your strategy.",
    image: marketShareImg,
  },
  {
    id: "ai-qual",
    title: "AI Qual",
    description: "Deep qualitative insights at quantitative scale. Our AI-powered platform conducts nuanced conversations with thousands of consumers simultaneously.",
    image: aiQualImg,
  },
  {
    id: "storyteller",
    title: "Storyteller",
    description: "Transform raw data into compelling narratives. Auto-generate insight decks that leadership actually wants to read.",
    image: storytellerImg,
  },
  {
    id: "gamification",
    title: "Gamification",
    description: "Engage respondents with interactive survey experiences. Higher completion rates, richer data, happier participants.",
    image: gamificationImg,
  },
  {
    id: "upsiide",
    title: "Upsiide Dashboard",
    description: "Innovation testing platform that ranks and optimizes ideas in real-time. See which concepts have the highest potential before you invest.",
    image: upsiideImg,
  },
  {
    id: "speed",
    title: "24hr Report Speed",
    description: "From fieldwork to insights in a single day. Our streamlined process delivers actionable reports while your competition is still waiting.",
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
      className="relative py-24 sm:py-32 bg-gradient-to-b from-[#1D2DC8] via-[#151FB0] to-[#0D1598]"
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
            Turn Insights into evidence based decisions.
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
