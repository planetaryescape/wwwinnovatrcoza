import heroVideo from "@assets/ScreenRecording_01-21-2026_15_1769001798127.mov";
import { Microscope, Brain } from "lucide-react";
import { useLocation } from "wouter";

function scrollToServices() {
  const el = document.getElementById("services");
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function HeroSection() {
  const [, setLocation] = useLocation();

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
              className="text-white mb-8"
              style={{ fontSize: "clamp(1rem, 1.6vw, 1.2rem)", fontWeight: 400 }}
            >
              Through Smart 24hr Research &amp; Growth Consulting.
            </p>

            {/* What are you looking for? */}
            <p className="text-gray-300 text-sm font-medium mb-3 uppercase tracking-widest">
              What are you looking for?
            </p>
            <div className="flex gap-4">
              {/* Option 1 */}
              <div className="flex-1 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-[#ED876E] flex-shrink-0" />
                  <span className="text-white font-semibold text-sm">Rapid Consumer Research</span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Test concepts, products and campaigns with real consumers in as little as 24 hours.
                </p>
                <button
                  onClick={scrollToServices}
                  data-testid="button-explore-research"
                  className="mt-auto w-full rounded-lg bg-[#ED876E] hover:bg-[#e07560] text-white text-sm font-semibold py-2.5 px-4 transition-colors duration-150"
                >
                  Explore Research
                </button>
              </div>

              {/* Option 2 */}
              <div className="flex-1 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#ED876E] flex-shrink-0" />
                  <span className="text-white font-semibold text-sm">Innovation Growth Consulting</span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Work with our strategists to shape better propositions, brands and innovation pipelines.
                </p>
                <button
                  onClick={() => setLocation("/consult")}
                  data-testid="button-explore-consulting"
                  className="mt-auto w-full rounded-lg border border-white/40 hover:bg-white/10 text-white text-sm font-semibold py-2.5 px-4 transition-colors duration-150"
                >
                  Explore Consulting
                </button>
              </div>
            </div>
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

      {/* Mobile layout */}
      <div className="lg:hidden flex flex-col min-h-screen pt-16">
        {/* Text + cards */}
        <div className="flex-1 flex flex-col px-4 py-6 gap-5">
          <div>
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
              Through Smart 24hr Research &amp; Growth Consulting.
            </p>
          </div>

          {/* What are you looking for? */}
          <div>
            <p className="text-gray-300 text-xs font-medium mb-3 uppercase tracking-widest">
              What are you looking for?
            </p>
            <div className="flex flex-col gap-3">
              {/* Option 1 */}
              <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <Microscope className="w-4 h-4 text-[#ED876E] flex-shrink-0" />
                  <span className="text-white font-semibold text-sm">Rapid Consumer Research</span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Test concepts, products and campaigns with real consumers in as little as 24 hours.
                </p>
                <button
                  onClick={scrollToServices}
                  data-testid="button-explore-research-mobile"
                  className="w-full rounded-lg bg-[#ED876E] hover:bg-[#e07560] text-white text-sm font-semibold py-2.5 px-4 transition-colors duration-150"
                >
                  Explore Research
                </button>
              </div>

              {/* Option 2 */}
              <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#ED876E] flex-shrink-0" />
                  <span className="text-white font-semibold text-sm">Innovation Growth Consulting</span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Work with our strategists to shape better propositions, brands and innovation pipelines.
                </p>
                <button
                  onClick={() => setLocation("/consult")}
                  data-testid="button-explore-consulting-mobile"
                  className="w-full rounded-lg border border-white/40 hover:bg-white/10 text-white text-sm font-semibold py-2.5 px-4 transition-colors duration-150"
                >
                  Explore Consulting
                </button>
              </div>
            </div>
          </div>
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
