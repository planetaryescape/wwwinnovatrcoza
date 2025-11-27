import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowLeft, Calendar, Briefcase } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { Link } from "wouter";
import reportsData from "@/data/reports.json";
import { useToast } from "@/hooks/use-toast";

const categoryCoverImages: Record<string, string> = {
  insights: "/assets/covers/insights-cover.png",
  irl: "/assets/covers/irl-cover.png",
  inside: "/assets/covers/inside-cover.png",
  launch: "/assets/covers/launch-cover.png",
};

function normalizeCategoryKey(category: string): string {
  const normalized = category.toLowerCase().trim().replace("innovatr ", "");
  return normalized;
}

function getCoverImage(category: string): string {
  const key = normalizeCategoryKey(category);
  return categoryCoverImages[key] || categoryCoverImages.insights;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  insights: { bg: "bg-blue-50", text: "text-[#0033A0]" },
  launch: { bg: "bg-orange-50", text: "text-orange-700" },
  inside: { bg: "bg-violet-50", text: "text-violet-700" },
  irl: { bg: "bg-rose-50", text: "text-rose-700" },
};

function getCategoryStyle(category: string) {
  const key = normalizeCategoryKey(category);
  return categoryColors[key] || categoryColors.insights;
}

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

function RelatedReportCard({ report }: { report: Report }) {
  const categoryStyle = getCategoryStyle(report.category);
  const coverImage = getCoverImage(report.category);

  return (
    <Link href={`/portal/insights/${report.slug}`}>
      <article className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 flex flex-col h-full">
        <div className="relative h-28 overflow-hidden">
          <img
            src={coverImage}
            alt={report.category}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-3">
          <Badge 
            className={`${categoryStyle.bg} ${categoryStyle.text} text-xs font-medium px-2 py-0.5 border-0 mb-2`}
          >
            {report.category}
          </Badge>
          <h4 
            className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#0033A0] transition-colors"
            style={{ fontFamily: 'DM Serif Display, serif' }}
          >
            {report.title}
          </h4>
        </div>
      </article>
    </Link>
  );
}

export default function InsightDetail() {
  const [, params] = useRoute("/portal/insights/:slug");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const report = (reportsData as Report[]).find((r) => r.slug === params?.slug);

  const relatedReports = report 
    ? (reportsData as Report[])
        .filter((r) => r.id !== report.id && (r.category === report.category || r.tags.some(t => report.tags.includes(t))))
        .slice(0, 3)
    : [];

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

  const formattedDate = new Date(report.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const categoryStyle = getCategoryStyle(report.category);
  const coverImage = getCoverImage(report.category);

  return (
    <PortalLayout>
      <div className="min-h-screen bg-white">
        <div className="relative w-full h-72 md:h-96 overflow-hidden">
          <img
            src={coverImage}
            alt={report.category}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="max-w-3xl mx-auto">
              <Button
                variant="ghost"
                onClick={() => setLocation("/portal/trends")}
                className="mb-4 text-white hover:text-white hover:bg-white/20 -ml-2"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Library
              </Button>
              
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge 
                  className={`${categoryStyle.bg} ${categoryStyle.text} text-xs font-medium px-2.5 py-1 border-0`}
                >
                  {report.category}
                </Badge>
                <Badge 
                  variant="secondary"
                  className="text-xs px-2.5 py-1 bg-white/90 text-gray-700"
                >
                  {report.industry}
                </Badge>
                {report.isNew && (
                  <Badge 
                    className="text-white text-xs font-medium px-2 py-1"
                    style={{ backgroundColor: '#0033A0' }}
                  >
                    NEW
                  </Badge>
                )}
              </div>

              <h1 
                className="text-2xl md:text-4xl font-bold mb-3 text-white leading-tight"
                style={{ fontFamily: 'DM Serif Display, serif' }}
                data-testid="text-report-title"
              >
                {report.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span>{report.industry}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {report.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="text-xs px-3 py-1 bg-gray-100 text-gray-600"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {report.pdfPath && (
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
          )}

          <div className="border-b border-gray-100 mb-8" />

          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            {report.teaser}
          </p>

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

          {report.pdfPath && (
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
          )}

          {relatedReports.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
              <h3 
                className="text-xl font-bold mb-6 text-gray-900"
                style={{ fontFamily: 'DM Serif Display, serif' }}
              >
                Related content
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedReports.map((related) => (
                  <RelatedReportCard key={related.id} report={related as Report} />
                ))}
              </div>
            </div>
          )}

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
