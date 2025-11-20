import { useRoute, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowLeft, Calendar, Briefcase, Lock } from "lucide-react";
import PortalLayout from "./PortalLayout";
import reportsData from "@/data/reports.json";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function InsightDetail() {
  const [, params] = useRoute("/portal/insights/:slug");
  const [, setLocation] = useLocation();
  const { isMember } = useAuth();
  const { toast } = useToast();

  const report = reportsData.find((r) => r.slug === params?.slug);

  if (!report) {
    return (
      <PortalLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-serif font-bold mb-4">Report Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The report you're looking for doesn't exist or has been moved.
              </p>
              <Button onClick={() => setLocation("/portal/trends")} data-testid="button-back-library">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Library
              </Button>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  // Determine if download is locked for this user
  const isDownloadLocked = !isMember && !report.freePreview;

  const handleDownload = () => {
    if (isDownloadLocked) {
      toast({
        title: "Download Locked",
        description: "Upgrade to a membership plan to download this report.",
        variant: "destructive",
      });
      return;
    }
    // Handle actual download logic here
    toast({
      title: "Download Started",
      description: "Your report is being downloaded.",
    });
  };

  return (
    <PortalLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation("/portal/trends")}
          data-testid="button-back"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Library
        </Button>

        {/* Hero Section */}
        <Card className="border-primary">
          <CardContent className="p-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="text-sm">{report.category}</Badge>
              <Badge variant="outline" className="text-sm">{report.industry}</Badge>
              {report.isNew && (
                <Badge variant="default" className="text-sm">NEW</Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid="text-report-title">
              {report.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>{report.industry}</span>
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {report.teaser}
            </p>

            <div className="flex flex-wrap gap-2 mt-6">
              {report.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Download CTA */}
        <Card className={isDownloadLocked ? "bg-muted/30 border-muted" : "bg-accent/10"}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">Download Full Report</h3>
                <p className="text-sm text-muted-foreground">
                  {isDownloadLocked 
                    ? "Upgrade to membership to download this report" 
                    : "Get the complete PDF with all insights and data"}
                </p>
              </div>
              <Button 
                size="lg" 
                data-testid="button-download-pdf"
                onClick={handleDownload}
                variant={isDownloadLocked ? "outline" : "default"}
              >
                {isDownloadLocked ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Locked
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content Sections */}
        <div className="prose prose-lg max-w-none">
          {/* Intro */}
          <Card>
            <CardContent className="p-8">
              <div className="whitespace-pre-line text-foreground leading-relaxed">
                {report.content.intro}
              </div>
            </CardContent>
          </Card>

          {/* Body Sections */}
          {report.content.sections.map((section, index) => (
            <Card key={index}>
              <CardContent className="p-8">
                <h2 className="text-3xl font-serif font-bold mb-4 text-foreground">
                  {section.heading}
                </h2>
                <div className="whitespace-pre-line text-foreground leading-relaxed">
                  {section.body}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer CTA */}
        <Card className={isDownloadLocked ? "bg-muted/30 border-muted" : "bg-primary/5 border-primary"}>
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-serif font-bold mb-3">
              {isDownloadLocked ? "Upgrade to Download" : "Chat soon!"}
            </h3>
            <p className="text-lg font-semibold mb-6" style={{color: isDownloadLocked ? 'inherit' : '#4D5FF1'}}>
              {isDownloadLocked ? "Become a Member to Download All Reports" : "Innovatr Intelligence"}
            </p>
            <Button 
              size="lg" 
              data-testid="button-download-footer"
              onClick={isDownloadLocked ? () => setLocation("/#membership") : handleDownload}
              variant={isDownloadLocked ? "default" : "default"}
            >
              {isDownloadLocked ? (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Upgrade to Download
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Full Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Back to Library */}
        <div className="text-center pt-6">
          <Button
            variant="outline"
            onClick={() => setLocation("/portal/trends")}
            data-testid="button-back-footer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trends Library
          </Button>
        </div>
      </div>
    </PortalLayout>
  );
}
