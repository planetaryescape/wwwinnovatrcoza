import PDFDocument from "pdfkit";

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

      doc
        .fillColor(primaryColor)
        .fontSize(28)
        .font("Helvetica-Bold")
        .text("INNOVATR", 50, 50);

      doc
        .fillColor(mutedColor)
        .fontSize(10)
        .font("Helvetica")
        .text("Digital Innovation Solutions", 50, 82)
        .text("South Africa", 50, 95);

      doc
        .fillColor(primaryColor)
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("TAX INVOICE", 400, 50, { align: "right" });

      doc
        .fillColor(textColor)
        .fontSize(10)
        .font("Helvetica")
        .text(`Invoice #: ${data.invoiceNumber}`, 400, 80, { align: "right" })
        .text(
          `Date: ${data.invoiceDate.toLocaleDateString("en-ZA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`,
          400,
          95,
          { align: "right" }
        );

      const billingTop = 150;

      doc
        .fillColor(primaryColor)
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Bill To:", 50, billingTop);

      doc
        .fillColor(textColor)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(data.customerCompany, 50, billingTop + 20);

      doc
        .font("Helvetica")
        .text(data.customerName, 50, billingTop + 35)
        .text(data.customerEmail, 50, billingTop + 50);

      if (data.businessRegNumber) {
        doc.text(`Reg No: ${data.businessRegNumber}`, 50, billingTop + 65);
      }
      if (data.vatNumber) {
        doc.text(`VAT No: ${data.vatNumber}`, 50, billingTop + (data.businessRegNumber ? 80 : 65));
      }

      const tableTop = 260;
      const colItem = 50;
      const colQty = 340;
      const colPrice = 400;
      const colTotal = 480;

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
      const labelX = 380;
      const valueX = 480;

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

      const pageHeight = doc.page.height;
      const footerTop = pageHeight - 100;

      doc.strokeColor("#e0e0e0").moveTo(50, footerTop).lineTo(550, footerTop).stroke();

      doc
        .fillColor(mutedColor)
        .fontSize(9)
        .font("Helvetica")
        .text("Thank you for your business!", 50, footerTop + 15, {
          align: "center",
          width: 500,
        })
        .text(
          "This is a computer-generated invoice and is valid without a signature.",
          50,
          footerTop + 30,
          { align: "center", width: 500 }
        )
        .text(
          "For questions about this invoice, please contact support@innovatr.co.za",
          50,
          footerTop + 45,
          { align: "center", width: 500 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
