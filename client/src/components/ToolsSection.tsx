import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, X, Wrench, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

import gamifiedRespondentImg from "@assets/IMG_8480_1768743786622.jpeg";
import emotionalAppealImg from "@assets/IMG_8482_1768743819583.jpeg";
import marketShareImg2 from "@assets/IMG_8483_1768743852255.jpeg";
import aiQualImg2 from "@assets/IMG_8492_1768744027913.jpeg";
import dashboardImg from "@assets/IMG_8494_1768744362356.jpeg";
import heatmapImg from "@assets/image_1768991760693.png";

import agileImg1 from "@assets/IMG_8495_1768760848107.jpeg";
import agileImg2 from "@assets/IMG_8498_1768760848107.jpeg";
import agileImg3 from "@assets/IMG_8500_1768760848107.jpeg";
import agileImg4 from "@assets/IMG_8497_1768760848107.jpeg";
import agileImg5 from "@assets/IMG_8496_1768760848107.jpeg";
import agileImg6 from "@assets/IMG_8501_1768760848107.jpeg";
import agileImg7 from "@assets/IMG_8503_1768760848107.jpeg";
import agileImg8 from "@assets/IMG_8502_1768760848107.jpeg";
import agileImg9 from "@assets/IMG_8504_1768760848107.jpeg";
import agileImg10 from "@assets/IMG_8508_1768760848107.jpeg";
import agileImg11 from "@assets/IMG_8507_1768760848107.jpeg";
import agileImg12 from "@assets/IMG_8510_1768760848107.jpeg";
import agileImg13 from "@assets/IMG_8512_1768760848107.jpeg";
import agileImg14 from "@assets/IMG_8509_1768760848107.jpeg";
import agileImg15 from "@assets/IMG_8511_1768760848107.jpeg";
import agileImg16 from "@assets/IMG_8505_1768760848107.jpeg";
import agileImg17 from "@assets/IMG_8506_1768760848107.jpeg";
import agileImg18 from "@assets/IMG_8499_1768760848107.jpeg";
import privateDashboardVideo from "@assets/agile_research,_purpose-built_for_innovation._(720p)_3_1768994342505.mov";

const agileDesignImages = [
  agileImg1, agileImg2, agileImg3, agileImg4, agileImg5, agileImg6,
  agileImg7, agileImg8, agileImg9, agileImg10, agileImg11, agileImg12,
  agileImg13, agileImg14, agileImg15, agileImg16, agileImg17, agileImg18
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface Tool {
  id: string;
  name: string;
  headlineTitle: string;
  whatText: string;
  whyText: string;
  image: string | null;
  video?: string;
  imagePosition?: string;
  isCarousel?: boolean;
  comingSoon?: boolean;
}

const tools: Tool[] = [
  {
    id: "private-dashboard",
    name: "Private Dashboard",
    headlineTitle: "Analyse results live on your private dashboard",
    whatText: "Inspiring data visualizations and modeling. Your dedicated dashboard presents results in real-time with intuitive charts and actionable insights.",
    whyText: "Brilliant innovation marries rigor with playfulness and exploration. Make data inspiring and shareable across your team.",
    image: dashboardImg,
    video: privateDashboardVideo,
  },
  {
    id: "social-media",
    name: "Social Media Feel",
    headlineTitle: "Track Emotional Appeal via Idea Score",
    whatText: "A set of 24 emojis based on Robert Plutchik's wheel of emotions. Understand how people feel about your innovations at a deeper level.",
    whyText: "Dig deeper into drivers of strong or weak performance while maintaining an experience that feels like social media, not a survey.",
    image: emotionalAppealImg,
    video: "https://diginsights.com/wp-content/uploads/2024/07/Upsiide-home-swiping.webm",
  },
  {
    id: "filtering",
    name: "Filtering",
    headlineTitle: "Gamified Respondent Experience via Upsiide",
    whatText: "An intuitive swiping interface that places your ideas in a competitive context. Upsiide identifies innovations that will break through the noise.",
    whyText: "Consumers engage naturally, revealing true preferences without survey fatigue. Get authentic reactions, not forced answers.",
    image: gamifiedRespondentImg,
    video: "https://diginsights.com/wp-content/uploads/2024/07/Upsiide-home-filters.gif?_t=1720575215",
  },
  {
    id: "heatmapping",
    name: "Heatmapping",
    headlineTitle: "Visual Attention Analysis",
    whatText: "Advanced eye-tracking simulation that reveals where consumers look first, what captures attention, and what gets missed entirely.",
    whyText: "Optimize your packaging and communications for maximum shelf impact. Know what works before you go to market.",
    image: heatmapImg,
    video: "https://diginsights.com/wp-content/uploads/2024/07/Features-tabvideo-heatmap-1.webm",
    imagePosition: "object-left",
  },
  {
    id: "market-simulator",
    name: "Market Share Simulator",
    headlineTitle: "Predict Market Share with Precision",
    whatText: "Proprietary, patented data modeling that converts respondent data into forecasts of share of choice, source of volume, incrementality and cannibalization.",
    whyText: "This is the data you need to make compelling business decisions. Know your potential before you invest.",
    image: marketShareImg2,
    video: "https://diginsights.com/wp-content/uploads/2024/07/Upsiide-home-marketsimSpindrift.gif?_t=1720574730",
  },
  {
    id: "ai-qual",
    name: "AI Qual",
    headlineTitle: "Empathy at Scale via AI Video Interview",
    whatText: "An AI qualitative moderator that understands your information objectives and conducts a naturalistic interview, summarizing the learnings with a show reel.",
    whyText: "Makes agile qualitative research accessible. Bring the voice of the consumer to your stakeholders on demand.",
    image: aiQualImg2,
    video: "https://diginsights.com/wp-content/uploads/2024/10/Dig_AIVideo_abovefold-1.webm",
    comingSoon: true,
  },
  {
    id: "one-clique",
    name: "Cultural Context Engine",
    headlineTitle: "Instant Consumer Communities",
    whatText: "Build and engage with dedicated consumer panels at the click of a button. Fast, flexible, and always-on access to your target audience.",
    whyText: "Skip the recruitment delays. Get answers from real consumers within hours, not weeks.",
    image: dashboardImg,
    video: "https://downloads.intercomcdn.com/i/o/gbd7mpwj/1767906628/08c72a09b954ca3db0280c8dc201/Upsiide+Dashboard+%2816%29.gif?expires=1768908600&signature=ae8d62c71bb845da19da5e66cf65cffbb3bf9e19390fd505fda342a61000aa78&req=dSchEcB%2Bm4ddUfMW1HO4zdGgnhW5czxhdQkFH3PWHqZc0rM4jnGqQ0Ix2Plz%0AEyldw4Cg9rAznRfbV04%3D%0A",
    comingSoon: true,
  },
  {
    id: "design",
    name: "Agile Design",
    headlineTitle: "Bring your concept to life with Agile Design",
    whatText: "Creatively led, results driven. With 3 offices and clients across Africa, the Middle East, and Europe. From artisanal brands to retail powerhouses.",
    whyText: "Our designs are not just Instagram-worthy, but also highly effective. Beautiful design that sells.",
    image: null,
    isCarousel: true,
  },
];

function ImageCarousel({ images, isHovered }: { images: string[]; isHovered: boolean }) {
  const shuffledImages = useMemo(() => shuffleArray(images), []);
  const duplicatedImages = [...shuffledImages, ...shuffledImages, ...shuffledImages];

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div 
        className="flex h-full absolute left-0 top-0"
        style={{ 
          animation: isHovered ? `scrollLeft 25s linear infinite` : 'none',
        }}
      >
        {duplicatedImages.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt="Design portfolio"
            className="h-full w-auto flex-shrink-0 object-cover"
            style={{ minWidth: '200px' }}
          />
        ))}
      </div>
      <style>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isCarousel = tool.isCarousel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="relative h-[280px] sm:h-[300px] lg:h-[320px] perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`tool-card-${tool.id}`}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Front of card - Clean, minimal design */}
        <div 
          className="absolute inset-0 bg-white rounded-xl shadow-lg overflow-hidden backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Image/Video area - takes most of the card */}
          <div className="h-[70%] relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
            {isCarousel ? (
              <ImageCarousel images={agileDesignImages} isHovered={isHovered} />
            ) : tool.video ? (
              tool.video.includes('.gif') ? (
                isHovered ? (
                  <img 
                    src={tool.video}
                    alt={tool.name}
                    className="w-full h-full object-contain bg-slate-100 transition-transform duration-700 scale-[0.85]"
                    data-testid={`gif-tool-${tool.id}`}
                  />
                ) : (
                  <img 
                    src={tool.image || ""}
                    alt={tool.name}
                    className="w-full h-full object-cover transition-transform duration-700 scale-[0.85]"
                    data-testid={`img-tool-${tool.id}`}
                  />
                )
              ) : (
                <video 
                  src={isHovered ? tool.video : undefined}
                  autoPlay={isHovered}
                  loop
                  muted
                  playsInline
                  poster={tool.image || ""}
                  className={`w-full h-full object-cover object-left transition-transform duration-700 ${isHovered ? 'scale-[0.95]' : 'scale-[0.85]'}`}
                  data-testid={`video-tool-${tool.id}`}
                />
              )
            ) : (
              <img 
                src={tool.image || ""}
                alt={tool.name}
                className={`w-full h-full object-cover transition-transform duration-700 ${tool.imagePosition || ''} ${isHovered ? 'scale-[0.95]' : 'scale-[0.85]'}`}
                data-testid={`img-tool-${tool.id}`}
              />
            )}
            
            {/* Coming Soon badge */}
            {tool.comingSoon && (
              <div className="absolute top-3 left-3 bg-[#5A5EFF] text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Coming Soon
              </div>
            )}
          </div>
          
          {/* Title area - clean and minimal */}
          <div className="p-4 h-[30%] flex items-center justify-between">
            <h3 
              className="text-base sm:text-lg text-slate-800 font-semibold leading-tight"
              style={{ fontFamily: "Roboto, sans-serif" }}
              data-testid={`text-tool-title-${tool.id}`}
            >
              {tool.name}
            </h3>
            
            {/* Plus button */}
            <Button
              size="icon"
              onClick={() => setIsFlipped(true)}
              className="flex-shrink-0 rounded-full bg-[#5A5EFF] border-[#5A5EFF]"
              aria-label={`Learn more about ${tool.name}`}
              data-testid={`button-flip-${tool.id}`}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Back of card - Detailed info with What/Why structure */}
        <div 
          className="absolute inset-0 bg-white rounded-xl shadow-lg overflow-hidden backface-hidden"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="p-4 sm:p-5 h-full flex flex-col overflow-y-auto">
            {/* Headline title */}
            <h3 
              className="text-lg sm:text-xl text-slate-800 mb-3 leading-tight"
              style={{ fontFamily: "'DM Serif Display', serif" }}
              data-testid={`text-tool-back-title-${tool.id}`}
            >
              {tool.headlineTitle}
            </h3>
            
            {/* What section */}
            <div className="mb-3">
              <p 
                className="text-xs uppercase tracking-wider text-[#5A5EFF] font-semibold mb-1"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                What
              </p>
              <p 
                className="text-slate-600 leading-relaxed text-sm"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                {tool.whatText}
              </p>
            </div>
            
            {/* Why section */}
            <div className="flex-1">
              <p 
                className="text-xs uppercase tracking-wider text-[#5A5EFF] font-semibold mb-1"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                Why it matters
              </p>
              <p 
                className="text-slate-600 leading-relaxed text-sm"
                style={{ fontFamily: "Roboto, sans-serif" }}
                data-testid={`text-tool-description-${tool.id}`}
              >
                {tool.whyText}
              </p>
            </div>
            
            {/* Close button */}
            <div className="mt-3 flex items-center justify-end">
              <Button
                size="icon"
                variant="secondary"
                onClick={() => setIsFlipped(false)}
                className="rounded-full"
                aria-label="Close details"
                data-testid={`button-close-${tool.id}`}
              >
                <X className="w-4 h-4" />
              </Button>
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
      className="relative py-20 sm:py-28 bg-[#DDA0DD]"
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
          className="text-center mb-12 sm:mb-16"
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
          <a 
            href="/test24-basic"
            className="inline-block mt-6 text-white underline underline-offset-4 hover:text-white/80 transition-colors"
            style={{ 
              fontFamily: "Roboto, sans-serif",
              fontSize: "clamp(0.9rem, 1.3vw, 1rem)" 
            }}
            data-testid="link-test24-basic"
          >
            See how we Test Ideas in 24hrs
          </a>
        </motion.div>

        {/* Tools Grid - 4 columns desktop, 2 columns mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {tools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
