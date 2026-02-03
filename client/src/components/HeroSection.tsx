import heroVideo from "@assets/ScreenRecording_01-21-2026_15_1769001798127.mov";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#4c4de1]">
      {/* Desktop layout */}
      <div className="hidden lg:flex items-center justify-center flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left side - Large bold text */}
          <div className="text-left">
            <h1 
              className="font-serif font-bold mb-8 leading-[0.95] uppercase"
              style={{ 
                fontFamily: "'DM Serif Display', serif", 
                letterSpacing: "0.06em",
                fontSize: "clamp(2rem, 4vw, 3.74rem)"
              }}
            >
              <span className="text-[#ED876E]">TRANSFORMING</span><br />
              <span className="text-white">CONSUMER INSIGHTS.</span>
            </h1>
            <p 
              className="text-gray-300 max-w-xl mb-6"
              style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
            >
              Launch Better Innovation<br />through smart 24hr research
            </p>
          </div>
          
          {/* Right side - Hero Video (desktop) */}
          <div className="flex justify-center items-center relative">
            <video 
              src={heroVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full max-w-md xl:max-w-lg h-auto object-contain"
              data-testid="video-hero-desktop"
            />
          </div>
        </div>
      </div>
      
      {/* Mobile layout - centered text with video at bottom edge */}
      <div className="lg:hidden flex flex-col min-h-screen pt-16">
        {/* Text content - left aligned with reduced spacing */}
        <div className="flex-1 flex items-center px-4 py-4">
          <div className="text-left w-full">
            <h1 
              className="font-serif font-bold mb-3 leading-[1.05] uppercase"
              style={{ 
                fontFamily: "'DM Serif Display', serif", 
                letterSpacing: "0.04em",
                fontSize: "clamp(2rem, 9vw, 2.75rem)"
              }}
            >
              <span className="text-[#f15d60]">TRANSFORMING</span><br />
              <span className="text-white">CONSUMER INSIGHTS.</span>
            </h1>
            <p 
              className="text-gray-300 max-w-sm leading-relaxed"
              style={{ fontSize: "clamp(1rem, 4.5vw, 1.2rem)" }}
            >
              Launch Better Innovation<br />through smart 24hr research
            </p>
          </div>
        </div>
        
        {/* Video at bottom edge - full width */}
        <div className="w-full flex-shrink-0">
          <video 
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto max-h-[50vh] object-cover object-center"
            data-testid="video-hero-mobile"
          />
        </div>
      </div>
    </section>
  );
}
