import heroGif from "@assets/1C123D7B-4B5C-461A-98D9-E0A683A2D801_1768998251716.gif";

export default function HeroSection() {
  const scrollToServices = () => {
    const servicesSection = document.getElementById("services");
    servicesSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Warm, vibrant background with personality */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f1a]" />
      {/* Colorful accent blocks - warm and inviting */}
      <div className="absolute inset-0 overflow-hidden bg-[#4c4de1]">
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-[#ED876E] rounded-full opacity-20 blur-[80px]" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-[#F4A261] rounded-full opacity-15 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-[#E76F51] rounded-full opacity-15 blur-[90px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#2A9D8F] rounded-full opacity-10 blur-[80px]" />
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#4f4be0]">
        <div className="flex flex-col items-start justify-center">
          {/* Main content row - headline and gif side by side */}
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            {/* Left side - Large bold text */}
            <div className="text-left">
              <h1 
                className="font-serif font-bold mb-8 leading-[0.95] uppercase text-[#ED876E]"
                style={{ 
                  fontFamily: "'DM Serif Display', serif", 
                  letterSpacing: "0.06em",
                  fontSize: "clamp(2rem, 4vw, 3.74rem)"
                }}
              >
                TRANSFORMING<br />
                CONSUMER INSIGHTS.
              </h1>
              <p 
                className="text-gray-300 max-w-xl mb-6"
                style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
              >
                Launch Better Innovation<br />through smart 24hr research
              </p>
            </div>
            
            {/* Right side - Hero GIF (desktop) */}
            <div className="hidden lg:flex justify-center items-center relative">
              <img 
                src={heroGif}
                alt="Innovation animation"
                className="w-full max-w-md xl:max-w-lg h-auto object-contain"
                data-testid="img-hero-gif-desktop"
              />
            </div>
          </div>
          
          {/* Hero GIF - Mobile (full width below content) */}
          <div className="lg:hidden w-screen -mx-4 sm:-mx-6 mt-8">
            <img 
              src={heroGif}
              alt="Innovation animation"
              className="w-full h-auto object-contain"
              data-testid="img-hero-gif-mobile"
            />
          </div>
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
