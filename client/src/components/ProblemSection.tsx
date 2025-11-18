import { AlertCircle, TrendingDown, Clock, DollarSign } from "lucide-react";

export default function ProblemSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <div className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
            01 — The Problem
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8 max-w-4xl mx-auto leading-tight">
            Move Beyond Consumer Centric to Decision Centric
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="font-bold mb-2">Too Slow</h3>
            <p className="text-sm text-muted-foreground">
              Traditional research takes weeks
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="font-bold mb-2">Too Expensive</h3>
            <p className="text-sm text-muted-foreground">
              High costs limit testing volume
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="font-bold mb-2">Too Complex</h3>
            <p className="text-sm text-muted-foreground">
              Difficult to brief and interpret
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="font-bold mb-2">Wrong Focus</h3>
            <p className="text-sm text-muted-foreground">
              Consumer-centric, not decision-centric
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
