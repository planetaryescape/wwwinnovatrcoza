import { useRoute, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowLeft, Calendar, Briefcase } from "lucide-react";
import PortalLayout from "./PortalLayout";
import reportsData from "@/data/reports.json";
import { useAuth } from "@/contexts/AuthContext";

export default function InsightDetail() {
  const [, params] = useRoute("/portal/insights/:slug");
  const [, setLocation] = useLocation();
  const { isMember } = useAuth();

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

  // Non-members can only view reports marked as free preview
  if (!isMember && !report.freePreview) {
    return (
      <PortalLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <Card className="border-primary bg-primary/5">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-serif font-bold mb-4">Members-Only Content</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                This report is exclusive to Innovatr Members. Join now to access our full library of industry reports, market trends, and consumer insights.
              </p>
              <div className="flex gap-3 justify-center">
                <Button size="lg" onClick={() => setLocation("/#membership")} data-testid="button-join-now">
                  Join Membership
                </Button>
                <Button variant="outline" size="lg" onClick={() => setLocation("/portal/trends")} data-testid="button-back-library">
                  Back to Library
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    );
  }

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
        <Card className="bg-accent/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">Download Full Report</h3>
                <p className="text-sm text-muted-foreground">
                  Get the complete PDF with all insights and data
                </p>
              </div>
              <Button size="lg" data-testid="button-download-pdf">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
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
        <Card className="bg-primary/5 border-primary">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-serif font-bold mb-3">Chat soon!</h3>
            <p className="text-lg font-semibold text-primary mb-6">Innovatr Intelligence</p>
            <Button size="lg" data-testid="button-download-footer">
              <Download className="w-4 h-4 mr-2" />
              Download Full Report
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
