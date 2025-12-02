import { Card } from "@/components/ui/card";
import { Sparkles, TrendingUp, MessageSquare, BarChart3, Zap, Clock } from "lucide-react";
import neonLightsBackground from "@assets/pexels-chris-f-8344064_1763492180742.jpeg";
import circlesBackground from "@assets/pexels-pixabay-247676_1763492180745.jpeg";
import differenceBackground from "@assets/pexels-merlin-lightpainting-10874566_1764656420841.jpeg";

const features = [
  { icon: Clock, label: "SPEED", subtitle: "24hr Turn-Around" },
  { icon: Zap, label: "EASY", subtitle: "Automated Briefing" },
  { icon: TrendingUp, label: "SMART", subtitle: "Quant + AI Qual" },
  { icon: BarChart3, label: "+25 MARKETS", subtitle: "44M panel" },
];

export default function MethodologySection() {

  return (
    <section className="py-20 relative overflow-hidden">
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
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${differenceBackground})`
            }}
          />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                01 — Our Difference
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6 max-w-4xl mx-auto leading-tight text-white">
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
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-serif font-bold mb-1 text-white">{index + 1}</div>
                  <h3 className="font-bold mb-1 text-white">{feature.label}</h3>
                  <p className="text-sm text-white">{feature.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative bg-card border border-card-border rounded-lg p-8 md:p-12 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${circlesBackground})`,
              filter: 'blur(1px)',
              opacity: 0.08
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/80 to-card" />
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                02 — The Proof
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6" style={{ color: '#4D5FF1' }}>
                Don't Guess. Test.
              </h2>
            </div>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8">
              Partnering with Upsiide we have made rapid testing truly AGILE
            </p>
            
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/50 border border-border">
              <iframe
                src="https://player.vimeo.com/video/1138122776?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0"
                className="w-full h-full absolute top-0 left-0"
                frameBorder="0"
                allow="fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                data-testid="video-upsiide-vimeo"
                title="Upsiide Demo Video"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
