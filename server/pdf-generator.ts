import PDFDocument from "pdfkit";
import { uploadFile } from "./app-storage";

export interface PlaceholderPDFOptions {
  title: string;
  companyName: string;
  description?: string;
  reportType?: string;
  date?: string;
}

export async function generatePlaceholderPDF(options: PlaceholderPDFOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.rect(0, 0, 595.28, 120)
      .fill("#1a1a2e");

    doc.fontSize(28)
      .fillColor("#ffffff")
      .text("INNOVATR", 50, 40, { continued: false });

    doc.fontSize(12)
      .fillColor("#9ca3af")
      .text("Research & Insights", 50, 75);

    doc.moveDown(4);
    doc.fontSize(24)
      .fillColor("#1a1a2e")
      .text(options.title, 50, 160);

    doc.moveDown(1);
    doc.fontSize(14)
      .fillColor("#6b7280")
      .text(options.companyName);

    if (options.reportType) {
      doc.moveDown(0.5);
      doc.fontSize(12)
        .fillColor("#059669")
        .text(options.reportType);
    }

    if (options.date) {
      doc.moveDown(0.5);
      doc.fontSize(10)
        .fillColor("#9ca3af")
        .text(`Delivered: ${options.date}`);
    }

    doc.moveDown(2);
    if (options.description) {
      doc.fontSize(12)
        .fillColor("#374151")
        .text(options.description, {
          width: 495,
          lineGap: 4,
        });
    }

    doc.moveDown(3);
    doc.strokeColor("#e5e7eb")
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(2);
    doc.fontSize(14)
      .fillColor("#1a1a2e")
      .text("Report Contents", 50);

    doc.moveDown(1);
    doc.fontSize(11)
      .fillColor("#6b7280");

    const sections = [
      "1. Executive Summary",
      "2. Research Methodology",
      "3. Key Findings & Insights",
      "4. Consumer Preference Analysis",
      "5. Competitive Landscape",
      "6. Strategic Recommendations",
      "7. Appendix & Data Tables",
    ];

    sections.forEach((section) => {
      doc.text(section, 70);
      doc.moveDown(0.5);
    });

    doc.moveDown(3);
    doc.rect(50, doc.y, 495, 80)
      .fill("#f3f4f6");

    doc.fontSize(10)
      .fillColor("#6b7280")
      .text("This is a placeholder report.", 70, doc.y + 20)
      .text("The actual research findings would appear in the full document.", 70)
      .moveDown(0.5)
      .text("Contact your Innovatr account manager for access to the complete report.", 70);

    const footerY = 780;
    doc.fontSize(9)
      .fillColor("#9ca3af")
      .text("Confidential - For Internal Use Only", 50, footerY)
      .text("innovatr.co.za", 495, footerY, { align: "right" });

    doc.end();
  });
}

export async function createAndUploadPlaceholderPDF(
  options: PlaceholderPDFOptions,
  storagePath: string
): Promise<{ success: boolean; url: string | null; error?: string }> {
  try {
    const pdfBuffer = await generatePlaceholderPDF(options);
    const result = await uploadFile(pdfBuffer, storagePath);

    if (result.ok && result.path) {
      return {
        success: true,
        url: `/api/files/${result.path}`,
      };
    }

    return {
      success: false,
      url: null,
      error: result.error || "Upload failed",
    };
  } catch (error) {
    console.error("PDF generation error:", error);
    return {
      success: false,
      url: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
