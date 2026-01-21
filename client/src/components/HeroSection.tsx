import heroVideo from "@assets/ScreenRecording_01-21-2026_15_1769001798127.mov";

export default function HeroSection() {
  const scrollToServices = () => {
    const servicesSection = document.getElementById("services");
    servicesSection?.scrollIntoView({ behavior: "smooth" });
  };

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
      
      {/* Mobile layout - centered text with GIF at bottom edge */}
      <div className="lg:hidden flex flex-col min-h-screen">
        {/* Text content - left aligned */}
        <div className="flex-1 flex items-center px-4 sm:px-6">
          <div className="text-left">
            <h1 
              className="font-serif font-bold mb-6 leading-[0.95] uppercase"
              style={{ 
                fontFamily: "'DM Serif Display', serif", 
                letterSpacing: "0.06em",
                fontSize: "clamp(2rem, 6vw, 3rem)"
              }}
            >
              <span className="text-[#ED876E]">TRANSFORMING</span><br />
              <span className="text-white">CONSUMER INSIGHTS.</span>
            </h1>
            <p 
              className="text-gray-300 max-w-xl mx-auto"
              style={{ fontSize: "clamp(1rem, 3vw, 1.25rem)" }}
            >
              Launch Better Innovation<br />through smart 24hr research
            </p>
          </div>
        </div>
        
        {/* Video at bottom edge - full width */}
        <div className="w-full">
          <video 
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto object-cover"
            data-testid="video-hero-mobile"
          />
        </div>
      </div>
      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <button 
          onClick={scrollToServices}
          className="hover-elevate rounded-full p-2"
          data-testid="button-scroll-down"
        >
          <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-[#ED876E] rounded-full animate-bounce" />
          </div>
        </button>
      </div>
    </section>
  );
}
