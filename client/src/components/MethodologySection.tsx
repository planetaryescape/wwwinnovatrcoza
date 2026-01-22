import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import neonLightsBackground from "@assets/pexels-chris-f-8344064_1763492180742.jpeg";

const features = [
  { label: "SPEED", subtitle: "24hr Turn-Around" },
  { label: "EASY", subtitle: "Automated Briefing" },
  { label: "SMART", subtitle: "Quant + AI Qual" },
  { label: "+25 MARKETS", subtitle: "44M panel" },
];

export default function MethodologySection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showStopButton, setShowStopButton] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasInteracted) {
            setIsPlaying(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (videoContainerRef.current) {
      observer.observe(videoContainerRef.current);
    }

    return () => observer.disconnect();
  }, [hasInteracted]);

  const handlePlayClick = () => {
    setIsPlaying(true);
    setHasInteracted(true);
  };

  const handleVideoClick = () => {
    setShowStopButton(true);
    // Clear any existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    // Hide after 3 seconds
    hideTimeoutRef.current = setTimeout(() => {
      setShowStopButton(false);
    }, 3000);
  };

  const handleStopClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setShowStopButton(false);
    setHasInteracted(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };

  return (
    <section className="pb-20 pt-0 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${neonLightsBackground})`,
          opacity: 0.15
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="relative z-10">
        <div className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-[#5ab4d4]" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="text-sm font-semibold text-white/90 mb-4 uppercase tracking-wider">
                01 — Our Difference
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6 max-w-4xl mx-auto leading-tight text-white drop-shadow-sm">
                <span className="block">Turn insights into</span>
                <span className="block">evidence based decisions</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="text-center transition-all duration-300"
                  data-testid={`feature-${index}`}
                >
                  <div className="text-2xl font-serif font-bold mb-1 text-white drop-shadow-sm">{index + 1}</div>
                  <h3 className="font-bold mb-1 text-white">{feature.label}</h3>
                  <p className="text-sm text-white/90">{feature.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden mt-20">
          <div className="relative z-10">
            <div className="text-center mb-6 sm:mb-8 px-4">
              <div className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                02 — The Proof
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6" style={{ color: '#4D5FF1' }}>
                Don't Guess. Test.
              </h2>
              <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-6 sm:mb-8">
                Partnering with Upsiide we have made rapid testing truly AGILE
              </p>
            </div>
            
            <div 
              ref={videoContainerRef}
              className="relative aspect-video w-full overflow-hidden bg-black"
            >
              {!isPlaying ? (
                <div 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                  onClick={handlePlayClick}
                  data-testid="video-play-overlay"
                >
                  {/* Video thumbnail/placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
                  <iframe
                    src="https://player.vimeo.com/video/1138122776?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0&vimeo_logo=0&dnt=1&pip=0&keyboard=0&quality=auto&controls=0&muted=1"
                    className="w-full h-full absolute top-0 left-0 pointer-events-none"
                    frameBorder="0"
                    allow="autoplay"
                    title="Upsiide Demo Video Thumbnail"
                  />
                  {/* Play button */}
                  <div className="relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-2xl">
                    <Play className="w-8 h-8 md:w-10 md:h-10 text-[#4D5FF1] ml-1" fill="#4D5FF1" />
                  </div>
                </div>
              ) : (
                <div 
                  className="absolute inset-0 cursor-pointer"
                  onClick={handleVideoClick}
                  data-testid="video-playing-container"
                >
                  <iframe
                    src="https://player.vimeo.com/video/1138122776?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0&vimeo_logo=0&dnt=1&pip=0&keyboard=1&quality=auto&autoplay=1&controls=0"
                    className="w-full h-full absolute top-0 left-0 pointer-events-none"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    data-testid="video-upsiide-vimeo"
                    title="Upsiide Demo Video"
                  />
                  {/* Stop button overlay */}
                  {showStopButton && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center z-10"
                      onClick={handleStopClick}
                      data-testid="video-stop-overlay"
                    >
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/90 flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 shadow-2xl">
                        <Pause className="w-8 h-8 md:w-10 md:h-10 text-[#4D5FF1]" fill="#4D5FF1" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
