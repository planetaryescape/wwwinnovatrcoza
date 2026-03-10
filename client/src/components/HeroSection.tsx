import heroVideo from "@assets/ScreenRecording_01-21-2026_15_1769001798127.mov";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#4c4de1]">
      {/* Desktop layout */}
      <div className="hidden lg:flex items-center justify-center flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left side */}
          <div className="text-left">
            <h1
              className="font-serif font-bold mb-4 leading-[1.05]"
              style={{
                fontFamily: "'DM Serif Display', serif",
                letterSpacing: "0.02em",
                fontSize: "clamp(2rem, 3.8vw, 3.5rem)",
              }}
            >
              <span className="text-[#ED876E]">Stop Guessing.<br />Launch Better Innovation.</span>
            </h1>
            <p
              className="text-white"
              style={{ fontSize: "clamp(1rem, 1.6vw, 1.2rem)", fontWeight: 400 }}
            >
              Through Smart 24hr Research &amp; Growth Consulting.
            </p>
          </div>

          {/* Right side - Hero Video */}
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

      {/* Mobile layout */}
      <div className="lg:hidden flex flex-col min-h-screen pt-16">
        <div className="flex-1 flex flex-col justify-center px-4 py-6">
          <h1
            className="font-serif font-bold mb-3 leading-[1.1]"
            style={{
              fontFamily: "'DM Serif Display', serif",
              letterSpacing: "0.02em",
              fontSize: "clamp(1.8rem, 8vw, 2.6rem)",
            }}
          >
            <span className="text-[#ED876E]">Stop Guessing.<br />Launch Better Innovation.</span>
          </h1>
          <p
            className="text-white leading-relaxed"
            style={{ fontSize: "clamp(0.95rem, 4vw, 1.1rem)" }}
          >
            Through Smart 24hr Research<br />&amp; Growth Consulting.
          </p>
        </div>

        {/* Video at bottom edge */}
        <div className="w-full flex-shrink-0">
          <video
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto max-h-[40vh] object-cover object-center"
            data-testid="video-hero-mobile"
          />
        </div>
      </div>
    </section>
  );
}
