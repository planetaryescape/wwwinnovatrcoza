import { Card } from "@/components/ui/card";
import { Sparkles, TrendingUp, MessageSquare, BarChart3, Lock } from "lucide-react";

const methodologies = [
  { icon: Sparkles, label: "Swipe Testing" },
  { icon: TrendingUp, label: "Trade-off Pairs" },
  { icon: MessageSquare, label: "AI Qual" },
  { icon: BarChart3, label: "Market Simulator" },
  { icon: Lock, label: "Private Dashboard" },
];

export default function MethodologySection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">
              04 — The Proof
            </div>
            <h2 className="text-4xl font-bold mb-6">
              Be sure it sells before it hits the shelves
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Partnering with Upsiide, we've made rapid testing truly AGILE. 
              Impulse-based testing. Trade-off decisions. AI-powered diagnostics.
            </p>
            <p className="text-lg text-muted-foreground">
              Our methodology combines behavioral science with cutting-edge AI to deliver 
              insights that drive real business decisions—fast.
            </p>
          </div>

          <div className="relative aspect-video rounded-lg overflow-hidden bg-card border border-card-border">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-600/10">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Upsiide Demo Video
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-12">
          {methodologies.map((method, index) => (
            <Card 
              key={index}
              className="p-6 text-center hover-elevate transition-all duration-300"
              data-testid={`methodology-${index}`}
            >
              <method.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
              <p className="text-sm font-medium">{method.label}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
