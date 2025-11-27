import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowLeft, Calendar, Briefcase } from "lucide-react";
import PortalLayout from "./PortalLayout";
import reportsData from "@/data/reports.json";
import { useToast } from "@/hooks/use-toast";

interface ReportSection {
  heading: string;
  body: string;
}

interface Report {
  id: number;
  category: string;
  industry: string;
  date: string;
  title: string;
  teaser: string;
  slug: string;
  coverImage: string;
  pdfPath: string;
  tags: string[];
  isNew: boolean;
  content?: {
    intro: string;
    sections: ReportSection[];
  };
}

export default function InsightDetail() {
  const [, params] = useRoute("/portal/insights/:slug");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const report = (reportsData as Report[]).find((r) => r.slug === params?.slug);

  if (!report) {
    return (
      <PortalLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center p-12">
            <h2 
              className="text-3xl font-bold mb-4 text-gray-900"
              style={{ fontFamily: 'DM Serif Display, serif' }}
            >
              Report Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The report you're looking for doesn't exist or has been moved.
            </p>
            <Button 
              onClick={() => setLocation("/portal/trends")} 
              className="rounded-full"
              style={{ backgroundColor: '#0033A0' }}
              data-testid="button-back-library"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your report is being downloaded.",
    });
    window.open(report.pdfPath, '_blank');
  };

  const formattedDate = new Date(report.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <PortalLayout>
      <div className="min-h-screen bg-white">
        <div className="relative w-full h-64 md:h-80 overflow-hidden">
          <img
            src={report.coverImage}
            alt={report.category}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        </div>

        <div className="max-w-3xl mx-auto px-6 -mt-20 relative z-10">
          <Button
            variant="ghost"
            onClick={() => setLocation("/portal/trends")}
            className="mb-4 text-white hover:text-white hover:bg-white/20"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>

          <div className="bg-white rounded-lg shadow-lg p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge 
                className="text-white text-xs font-medium px-3 py-1"
                style={{ backgroundColor: '#0033A0' }}
              >
                {report.category}
              </Badge>
              <span className="text-gray-500 text-sm">{report.industry}</span>
              {report.isNew && (
                <Badge 
                  className="text-white text-xs font-medium px-2 py-1"
                  style={{ backgroundColor: '#0033A0' }}
                >
                  NEW
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                <span>{report.industry}</span>
              </div>
            </div>

            <h1 
              className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 leading-tight"
              style={{ fontFamily: 'DM Serif Display, serif' }}
              data-testid="text-report-title"
            >
              {report.title}
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {report.teaser}
            </p>

            <Button 
              size="lg"
              onClick={handleDownload}
              className="rounded-full mb-8"
              style={{ backgroundColor: '#0033A0' }}
              data-testid="button-download-pdf"
            >
              <Download className="w-4 h-4 mr-2" />
              Download full report
            </Button>

            <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-100">
              {report.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="text-xs px-3 py-1 bg-gray-100 text-[#0033A0]"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {report.content && (
              <article className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line mb-10">
                  {report.content.intro}
                </div>

                {report.content.sections.map((section, index) => (
                  <div key={index} className="mb-10">
                    {index > 0 && <hr className="border-gray-100 my-10" />}
                    <h2 
                      className="text-2xl font-bold mb-4 text-gray-900"
                      style={{ fontFamily: 'DM Serif Display, serif' }}
                    >
                      {section.heading}
                    </h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {section.body}
                    </div>
                  </div>
                ))}
              </article>
            )}

            <div className="mt-12 pt-8 border-t border-gray-100 text-center">
              <h3 
                className="text-2xl font-bold mb-2 text-gray-900"
                style={{ fontFamily: 'DM Serif Display, serif' }}
              >
                Get the full story
              </h3>
              <p className="text-gray-600 mb-6">
                Download the complete report with all insights, data, and strategic recommendations.
              </p>
              <Button 
                size="lg"
                onClick={handleDownload}
                className="rounded-full"
                style={{ backgroundColor: '#0033A0' }}
                data-testid="button-download-footer"
              >
                <Download className="w-4 h-4 mr-2" />
                Download full report
              </Button>
            </div>
          </div>

          <div className="text-center py-8">
            <Button
              variant="outline"
              onClick={() => setLocation("/portal/trends")}
              className="rounded-full border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white"
              data-testid="button-back-footer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Trends Library
            </Button>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
