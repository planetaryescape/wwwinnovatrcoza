import { Card } from "@/components/ui/card";
import { Sparkles, TrendingUp, MessageSquare, BarChart3, Zap, Clock } from "lucide-react";

const features = [
  { icon: Clock, label: "SPEED", subtitle: "24hr Turn-Around" },
  { icon: Zap, label: "EASY", subtitle: "Automated Briefing" },
  { icon: TrendingUp, label: "SMART", subtitle: "Quant + AI Qual" },
  { icon: BarChart3, label: "LOCAL", subtitle: "SA Insights" },
];

export default function MethodologySection() {

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <div className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
            01 — Our Difference
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-5xl font-serif font-bold mb-6 max-w-4xl mx-auto leading-tight">
            Turning local insights into<br />fast decision making
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 text-center hover-elevate transition-all duration-300"
              data-testid={`feature-${index}`}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <div className="text-2xl font-serif font-bold mb-1">{index + 1}</div>
              <h3 className="font-bold mb-1">{feature.label}</h3>
              <p className="text-sm text-muted-foreground">{feature.subtitle}</p>
            </Card>
          ))}
        </div>

        <div className="bg-card border border-card-border rounded-lg p-8 md:p-12">
          <div className="text-center mb-4">
            <div className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
              03 — The Proof
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-center">
            Don't Guess. Test.
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Partnering with Upsiide we have made rapid testing truly AGILE
          </p>
          
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/50 border border-border">
            <iframe
              src="https://player.vimeo.com/video/1138122776?h=a8b9c0d1e2&title=0&byline=0&portrait=0"
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              data-testid="video-upsiide-vimeo"
              title="Upsiide Demo Video"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
