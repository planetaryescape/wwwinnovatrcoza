import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

interface OrderItem {
  type: string;
  description?: string;
  quantity: number;
  unitAmount: string;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  customerName: string;
  customerEmail: string;
  customerCompany: string;
  businessRegNumber?: string;
  vatNumber?: string;
  orderItems: OrderItem[];
  currency: string;
}

const VAT_RATE = 0.15;

export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${year}${month}${day}-${random}`;
}

export function calculateInvoiceTotals(items: OrderItem[]): {
  subtotal: number;
  vatAmount: number;
  total: number;
} {
  const total = items.reduce((sum, item) => {
    return sum + Number(item.unitAmount) * item.quantity;
  }, 0);

  const subtotal = total / (1 + VAT_RATE);
  const vatAmount = total - subtotal;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

function formatCurrency(amount: number, currency: string = "ZAR"): string {
  if (currency === "ZAR") {
    return `R ${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${currency} ${amount.toFixed(2)}`;
}

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const { subtotal, vatAmount, total } = calculateInvoiceTotals(data.orderItems);

      const primaryColor = "#667eea";
      const textColor = "#333333";
      const mutedColor = "#666666";

      // Add logo image
      const logoPath = path.join(process.cwd(), "client/public/Innovatr_logo-01.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { width: 100 });
      } else {
        // Fallback to text if logo not found
        doc
          .fillColor(primaryColor)
          .fontSize(28)
          .font("Helvetica-Bold")
          .text("INNOVATR", 50, 50);
      }

      // TAX INVOICE header - positioned to the right
      doc
        .fillColor(primaryColor)
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("TAX INVOICE", 350, 45, { align: "right", width: 195 });

      // Invoice details - below the TAX INVOICE text
      doc
        .fillColor(textColor)
        .fontSize(10)
        .font("Helvetica")
        .text(`Invoice #: ${data.invoiceNumber}`, 350, 75, { align: "right", width: 195 })
        .text(
          `Date: ${data.invoiceDate.toLocaleDateString("en-ZA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`,
          350,
          90,
          { align: "right", width: 195 }
        );

      const billingTop = 180;
      
      // Company details (From) - left column
      doc
        .fillColor(primaryColor)
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("From:", 50, billingTop);

      doc
        .fillColor(textColor)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Innovatr (Pty) Ltd.", 50, billingTop + 18);
      
      doc
        .fillColor(mutedColor)
        .fontSize(9)
        .font("Helvetica")
        .text("Workshop 17, Hyde Park Corner", 50, billingTop + 32)
        .text("JHB, 2196", 50, billingTop + 44)
        .text("VAT No: 4030317293", 50, billingTop + 56);

      // Bill To - right column (same row as From)
      doc
        .fillColor(primaryColor)
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Bill To:", 300, billingTop);

      doc
        .fillColor(textColor)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(data.customerCompany, 300, billingTop + 18);

      doc
        .fillColor(mutedColor)
        .fontSize(9)
        .font("Helvetica")
        .text(data.customerName, 300, billingTop + 32)
        .text(data.customerEmail, 300, billingTop + 44);

      let billToOffset = 56;
      if (data.businessRegNumber) {
        doc.text(`Reg No: ${data.businessRegNumber}`, 300, billingTop + billToOffset);
        billToOffset += 12;
      }
      if (data.vatNumber) {
        doc.text(`VAT No: ${data.vatNumber}`, 300, billingTop + billToOffset);
      }

      const tableTop = 270;
      const colItem = 50;
      const colQty = 300;
      const colPrice = 350;
      const colTotal = 440;

      doc
        .fillColor("#f0f0f0")
        .rect(45, tableTop - 5, 505, 25)
        .fill();

      doc
        .fillColor(textColor)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Description", colItem, tableTop)
        .text("Qty", colQty, tableTop)
        .text("Unit Price", colPrice, tableTop)
        .text("Amount", colTotal, tableTop);

      let yPos = tableTop + 30;
      doc.font("Helvetica").fontSize(10);

      data.orderItems.forEach((item, index) => {
        const lineTotal = Number(item.unitAmount) * item.quantity;
        const description = item.description || item.type;

        if (index % 2 === 1) {
          doc.fillColor("#f9f9f9").rect(45, yPos - 5, 505, 20).fill();
        }

        doc
          .fillColor(textColor)
          .text(description, colItem, yPos, { width: 280 })
          .text(String(item.quantity), colQty, yPos)
          .text(formatCurrency(Number(item.unitAmount), data.currency), colPrice, yPos)
          .text(formatCurrency(lineTotal, data.currency), colTotal, yPos);

        yPos += 25;
      });

      yPos += 20;
      doc.strokeColor("#e0e0e0").moveTo(45, yPos).lineTo(550, yPos).stroke();

      yPos += 15;
      const labelX = 340;
      const valueX = 440;

      doc
        .fillColor(textColor)
        .fontSize(10)
        .font("Helvetica")
        .text("Subtotal (excl. VAT):", labelX, yPos)
        .text(formatCurrency(subtotal, data.currency), valueX, yPos);

      yPos += 18;
      doc
        .text("VAT (15%):", labelX, yPos)
        .text(formatCurrency(vatAmount, data.currency), valueX, yPos);

      yPos += 25;
      doc.strokeColor("#e0e0e0").moveTo(labelX, yPos - 5).lineTo(550, yPos - 5).stroke();

      doc
        .fillColor(primaryColor)
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Total:", labelX, yPos)
        .text(formatCurrency(total, data.currency), valueX, yPos);

      // Bank details section
      yPos += 40;
      doc.strokeColor("#e0e0e0").moveTo(50, yPos).lineTo(250, yPos).stroke();
      
      yPos += 10;
      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Banking Details", 50, yPos);
      
      yPos += 15;
      doc
        .fillColor(textColor)
        .fontSize(9)
        .font("Helvetica")
        .text("FNB - Gold Business Account", 50, yPos)
        .text("Account Number: 63066106923", 50, yPos + 12)
        .text("Account Name: Innovatr (Pty) Ltd.", 50, yPos + 24);

      // Footer at bottom of page
      const pageHeight = doc.page.height;
      const footerTop = pageHeight - 70;

      doc.strokeColor("#e0e0e0").moveTo(50, footerTop).lineTo(550, footerTop).stroke();

      doc
        .fillColor(mutedColor)
        .fontSize(8)
        .font("Helvetica")
        .text("Thank you for your business! This is a computer-generated invoice and is valid without a signature.", 50, footerTop + 10, {
          align: "center",
          width: 500,
        })
        .text(
          "For questions, please contact richard@innovatr.co.za",
          50,
          footerTop + 22,
          { align: "center", width: 500 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
