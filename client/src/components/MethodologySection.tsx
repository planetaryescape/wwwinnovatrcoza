import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, MessageSquare, BarChart3, Zap, Clock, Upload, X, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const features = [
  { icon: Clock, label: "SPEED", subtitle: "24hr Turn-Around" },
  { icon: Zap, label: "EASY", subtitle: "Automated Briefing" },
  { icon: TrendingUp, label: "SMART", subtitle: "Quant + AI Qual" },
  { icon: BarChart3, label: "LOCAL", subtitle: "SA Insights" },
];

export default function MethodologySection() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file (MP4, WebM, etc.)",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 150 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a video smaller than 150MB",
        variant: "destructive",
      });
      return;
    }

    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    
    toast({
      title: "Video uploaded successfully",
      description: "Your Upsiide demo video is now displayed",
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleRemoveVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast({
      title: "Video removed",
      description: "Upload a new video when ready",
    });
  };

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
            {videoUrl ? (
              <>
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full object-cover"
                  data-testid="video-upsiide-demo"
                >
                  Your browser does not support the video tag.
                </video>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-4 right-4 z-10"
                  onClick={handleRemoveVideo}
                  data-testid="button-remove-video"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove Video
                </Button>
              </>
            ) : (
              <div
                className={`absolute inset-0 flex items-center justify-center transition-colors ${
                  isDragging ? "bg-primary/10 border-primary" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Upload Upsiide Demo Video</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your video here, or click to browse
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                    data-testid="input-video-file"
                  />
                  <Button
                    variant="default"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="button-upload-video"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Video File
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Supported formats: MP4, WebM, MOV (max 150MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
