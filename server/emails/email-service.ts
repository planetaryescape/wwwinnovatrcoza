import { Resend } from "resend";

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }

  const response = await fetch(
    "https://" +
      hostname +
      "/api/v2/connection?include_secrets=true&connector_names=resend",
    {
      headers: {
        Accept: "application/json",
        X_REPLIT_TOKEN: xReplitToken,
      },
    },
  );

  const data = await response.json();
  connectionSettings = data.items?.[0];

  if (!connectionSettings || !connectionSettings.settings.api_key) {
    throw new Error("Resend not connected");
  }
  return {
    apiKey: connectionSettings.settings.api_key,
    fromEmail: connectionSettings.settings.from_email,
  };
}

async function getResendClient() {
  const { apiKey } = await getCredentials();
  return new Resend(apiKey);
}

async function getFromEmail() {
  const { fromEmail } = await getCredentials();
  return fromEmail;
}

function getAdminEmails(): string[] {
  const adminEmailEnv =
    process.env.ADMIN_EMAILS ||
    process.env.ADMIN_EMAIL ||
    "hannah@innovatr.co.za";
  return adminEmailEnv
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);
}

export async function sendAdminOrderNotification(orderData: {
  customerName: string;
  customerEmail: string;
  orderDescription: string;
  customerCompany: string
  orderTotal: string;
  orderItems: any[];
}) {
  try {
    const resend = await getResendClient();
    const fromEmail = await getFromEmail();
    const adminEmails = getAdminEmails();

    const itemsHtml = orderData.orderItems
      .map(
        (item) =>
          `<li>${item.description || item.type} - Qty: ${item.quantity}</li>`,
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h2 { color: #2c3e50; }
            .details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #555; }
            ul { padding-left: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>New Order Received</h2>
            <div class="details">
              <div class="detail-row"><span class="label">Customer Name:</span> ${orderData.customerName}</div>
              <div class="detail-row"><span class="label">Customer Email:</span> ${orderData.customerEmail}</div>
              <div class="detail-row"><span class="label">Company:</span> ${orderData.customerCompany}</div>
              <div class="detail-row"><span class="label">Order Total:</span> ${orderData.orderTotal}</div>
              <div class="detail-row"><span class="label">Description:</span> ${orderData.orderDescription}</div>
            </div>
            <h3>Order Items:</h3>
            <ul>
              ${itemsHtml}
            </ul>
            <p><em>Please process this order manually.</em></p>
          </div>
        </body>
      </html>
    `;

    const response = await resend.emails.send({
      from: `Innovatr <${fromEmail}>`,
      to: adminEmails,
      subject: `New Order from ${orderData.customerName}`,
      html: emailHtml,
    });

    return response;
  } catch (error) {
    console.error("Failed to send admin order notification:", error);
    throw error;
  }
}

function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

export async function sendContactFormMessage(contactData: {
  name: string;
  email: string;
  company: string;
  message: string;
}) {
  try {
    const resend = await getResendClient();
    const fromEmail = await getFromEmail();
    const adminEmails = getAdminEmails();

    const safeName = escapeHtml(contactData.name);
    const safeEmail = escapeHtml(contactData.email);
    const safeCompany = escapeHtml(contactData.company || "Not provided");
    const safeMessage = escapeHtml(contactData.message);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h2 { color: #2c3e50; }
            .details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #555; }
            .message-box { 
              background-color: #fff; 
              border: 1px solid #e2e8f0; 
              padding: 15px; 
              border-radius: 5px; 
              margin-top: 15px;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>New Contact Form Submission</h2>
            <div class="details">
              <div class="detail-row"><span class="label">Name:</span> ${safeName}</div>
              <div class="detail-row"><span class="label">Email:</span> ${safeEmail}</div>
              <div class="detail-row"><span class="label">Company:</span> ${safeCompany}</div>
            </div>
            <h3>Message:</h3>
            <div class="message-box">${safeMessage}</div>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">
              <em>This message was sent via the contact form on the Innovatr website.</em>
            </p>
          </div>
        </body>
      </html>
    `;

    const response = await resend.emails.send({
      from: `Innovatr Contact Form <${fromEmail}>`,
      to: adminEmails,
      replyTo: contactData.email,
      subject: `Contact Form: ${contactData.name} from ${contactData.company || "Unknown Company"}`,
      html: emailHtml,
    });

    return response;
  } catch (error) {
    console.error("Failed to send contact form message:", error);
    throw error;
  }
}

/**
 * Send invoice request notification to admin team
 * Sent to richard@innovatr.co.za and hannah@innovatr.co.za when a user requests an invoice
 * Credits are NOT activated until the invoice is marked as paid
 */
export async function sendInvoiceRequestNotification(orderData: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerCompany: string;
  packDescription: string;
  totalAmount: string;
  orderItems: { type: string; description: string; quantity: number }[];
}) {
  try {
    const resend = await getResendClient();
    const fromEmail = await getFromEmail();
    
    // Always send to both Richard and Hannah
    const adminEmails = ["richard@innovatr.co.za", "hannah@innovatr.co.za"];

    const itemsHtml = orderData.orderItems
      .map(
        (item) =>
          `<li>${item.description || item.type} - Qty: ${item.quantity}</li>`,
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h2 { color: #2c3e50; }
            .notice { 
              background-color: #fff3cd; 
              border: 1px solid #ffc107; 
              padding: 15px; 
              border-radius: 5px; 
              margin: 20px 0;
              color: #856404;
            }
            .details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #555; }
            ul { padding-left: 20px; }
            .order-id { 
              font-family: monospace; 
              background-color: #e9ecef; 
              padding: 2px 6px; 
              border-radius: 3px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>New Invoice Request from Member Portal</h2>
            
            <div class="notice">
              <strong>Payment Pending:</strong> This is an invoice request. Credits will NOT be activated until payment is confirmed.
            </div>
            
            <div class="details">
              <div class="detail-row"><span class="label">Order ID:</span> <span class="order-id">${orderData.orderId}</span></div>
              <div class="detail-row"><span class="label">Customer Name:</span> ${orderData.customerName}</div>
              <div class="detail-row"><span class="label">Customer Email:</span> ${orderData.customerEmail}</div>
              <div class="detail-row"><span class="label">Company:</span> ${orderData.customerCompany}</div>
              <div class="detail-row"><span class="label">Credit Pack:</span> ${orderData.packDescription}</div>
              <div class="detail-row"><span class="label">Total Amount:</span> <strong>${orderData.totalAmount}</strong></div>
            </div>
            
            <h3>Order Items:</h3>
            <ul>
              ${itemsHtml}
            </ul>
            
            <p><em>Please prepare an invoice for this customer and follow up for payment. Once paid, mark the order as "paid" to activate the credits.</em></p>
          </div>
        </body>
      </html>
    `;

    const response = await resend.emails.send({
      from: `Innovatr <${fromEmail}>`,
      to: adminEmails,
      subject: `Invoice Request: ${orderData.customerCompany} - ${orderData.packDescription}`,
      html: emailHtml,
    });

    return response;
  } catch (error) {
    console.error("Failed to send invoice request notification:", error);
    throw error;
  }
}

export async function sendCustomerOrderConfirmation(orderData: {
  customerName: string;
  customerEmail: string;
  customerCompany: string;
  orderDescription: string;
  orderTotal: string;
  orderItems: any[];
  invoiceAttachment?: {
    filename: string;
    content: Buffer;
  };
}) {
  try {
    const resend = await getResendClient();
    const fromEmail = await getFromEmail();

    const hasInvoice = !!orderData.invoiceAttachment;

    const itemsHtml = orderData.orderItems
      .map(
        (item) =>
          `
          <tr style="border-bottom: 1px solid #e8ecf1;">
            <td style="padding: 12px 0; text-align: left;">${item.description || item.type}</td>
            <td style="padding: 12px 0; text-align: center;">x${item.quantity}</td>
          </tr>
        `,
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              color: #1a202c; 
              background-color: #f7fafc;
              line-height: 1.6;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content { 
              padding: 40px 20px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section h2 {
              font-size: 18px;
              font-weight: 600;
              color: #2d3748;
              margin: 0 0 15px 0;
              border-bottom: 2px solid #667eea;
              padding-bottom: 10px;
            }
            .info-box {
              background-color: #f7fafc;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin-bottom: 15px;
              border-radius: 4px;
            }
            .info-row {
              margin: 10px 0;
              display: flex;
              justify-content: space-between;
            }
            .label {
              font-weight: 600;
              color: #4a5568;
            }
            .value {
              color: #2d3748;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            table td {
              padding: 12px 0;
              text-align: left;
            }
            .total-row {
              font-size: 20px;
              font-weight: 700;
              color: #667eea;
              border-top: 2px solid #e2e8f0;
              padding-top: 15px;
              margin-top: 15px;
            }
            .cta-box {
              background-color: #edf2f7;
              border-radius: 6px;
              padding: 20px;
              text-align: center;
              margin: 25px 0;
            }
            .cta-text {
              color: #4a5568;
              font-size: 14px;
            }
            .footer {
              background-color: #f7fafc;
              padding: 20px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
              font-size: 12px;
              color: #718096;
            }
            .footer a {
              color: #667eea;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed ✓</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 16px; margin: 0 0 20px 0;">Hello ${orderData.customerName},</p>
              <p style="color: #4a5568; margin: 0 0 25px 0;">Thank you for your order! We've received your request and our team will be in touch shortly to process your payment and complete your order.</p>

              <div class="section">
                <h2>Order Summary</h2>
                <div class="info-box">
                  <div class="info-row">
                    <span class="label">Company:</span>
                    <span class="value">${orderData.customerCompany}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Package:</span>
                    <span class="value">${orderData.orderDescription}</span>
                  </div>
                </div>
              </div>

              <div class="section">
                <h2>Order Details</h2>
                <table>
                  <thead>
                    <tr style="border-bottom: 2px solid #667eea; color: #4a5568;">
                      <th style="text-align: left; padding: 12px 0; font-weight: 600;">Item</th>
                      <th style="text-align: center; padding: 12px 0; font-weight: 600;">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
                <div class="total-row">
                  <div style="display: flex; justify-content: space-between;">
                    <span>Total Amount:</span>
                    <span>${orderData.orderTotal}</span>
                  </div>
                </div>
              </div>

              <div class="cta-box">
                <p class="cta-text">${hasInvoice 
                  ? `Your tax invoice is attached to this email for your records.` 
                  : `Our team will contact you at <strong>${orderData.customerEmail}</strong> within 24 hours to process your payment and finalize your order.`}</p>
              </div>

              <p style="color: #718096; font-size: 14px; margin: 20px 0 0 0;">If you have any questions, please don't hesitate to reach out to our support team.</p>
            </div>

            <div class="footer">
              <p style="margin: 0;">© ${new Date().getFullYear()} Innovatr. All rights reserved.</p>
              <p style="margin: 5px 0 0 0;">This is an automated confirmation email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailOptions: {
      from: string;
      to: string[];
      subject: string;
      html: string;
      attachments?: { filename: string; content: Buffer }[];
    } = {
      from: `Innovatr <${fromEmail}>`,
      to: [orderData.customerEmail, ...(hasInvoice ? ["richard@innovatr.co.za"] : [])],
      subject: hasInvoice 
        ? `Tax Invoice - ${orderData.orderDescription}` 
        : `Order Confirmation - ${orderData.orderDescription}`,
      html: emailHtml,
    };

    if (orderData.invoiceAttachment) {
      emailOptions.attachments = [{
        filename: orderData.invoiceAttachment.filename,
        content: orderData.invoiceAttachment.content,
      }];
    }

    const response = await resend.emails.send(emailOptions);

    return response;
  } catch (error) {
    console.error("Failed to send customer order confirmation:", error);
    throw error;
  }
}

// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Brief file type
interface BriefFileInfo {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

/**
 * Send brief submission confirmation to client
 */
export async function sendBriefConfirmationEmail(briefData: {
  submittedByName: string;
  submittedByEmail: string;
  companyName: string;
  studyType: string;
  numIdeas: number;
  researchObjective: string;
  files?: BriefFileInfo[];
}) {
  try {
    const resend = await getResendClient();
    const fromEmail = await getFromEmail();

    // Build files section if files exist
    const files = briefData.files || [];
    const filesHtml = files.length > 0 ? `
      <div style="margin-top: 20px;">
        <p><strong>Files attached to your brief:</strong></p>
        <ul style="padding-left: 20px;">
          ${files.map(file => {
            if (!file.url) {
              console.warn(`Brief file ${file.fileName} missing URL, skipping`);
              return '';
            }
            return `<li>${escapeHtml(file.fileName)} – ${formatFileSize(file.fileSize)}</li>`;
          }).filter(Boolean).join('')}
        </ul>
      </div>
    ` : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
              color: #1a202c; 
              background-color: #f7fafc;
              line-height: 1.6;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
            }
            .content { 
              padding: 40px 20px;
            }
            .info-box {
              background-color: #f7fafc;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-row {
              margin: 10px 0;
            }
            .label {
              font-weight: 600;
              color: #4a5568;
            }
            .footer {
              background-color: #f7fafc;
              padding: 20px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
              font-size: 12px;
              color: #718096;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Brief Received</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 16px;">Hello ${escapeHtml(briefData.submittedByName)},</p>
              <p>Thank you for submitting your research brief. We've received your ${escapeHtml(briefData.studyType)} request and our team will review it shortly.</p>

              <div class="info-box">
                <div class="info-row"><span class="label">Company:</span> ${escapeHtml(briefData.companyName)}</div>
                <div class="info-row"><span class="label">Study Type:</span> ${escapeHtml(briefData.studyType)}</div>
                <div class="info-row"><span class="label">Number of Ideas:</span> ${briefData.numIdeas}</div>
              </div>

              <p><strong>Research Objective:</strong></p>
              <p style="background-color: #f7fafc; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${escapeHtml(briefData.researchObjective.substring(0, 500))}${briefData.researchObjective.length > 500 ? '...' : ''}</p>

              ${filesHtml}

              <p style="margin-top: 25px;">Richard or Hannah will be in touch shortly to discuss your project and next steps.</p>
              
              <p style="color: #718096;">Expected turnaround: <strong>24 hours</strong> from survey launch.</p>
            </div>

            <div class="footer">
              <p style="margin: 0;">${new Date().getFullYear()} Innovatr. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await resend.emails.send({
      from: `Innovatr <${fromEmail}>`,
      to: [briefData.submittedByEmail],
      subject: `Innovatr | We've received your ${briefData.studyType} brief`,
      html: emailHtml,
    });

    return response;
  } catch (error) {
    console.error("Failed to send brief confirmation email:", error);
    throw error;
  }
}

/**
 * Send brief submission notification to admin team (Richard and Hannah)
 */
export async function sendBriefAdminNotification(briefData: {
  id: string;
  submittedByName: string;
  submittedByEmail: string;
  submittedByContact?: string | null;
  companyName: string;
  companyBrand?: string | null;
  studyType: string;
  numIdeas: number;
  researchObjective: string;
  regions: string[];
  ages: string[];
  genders: string[];
  incomes: string[];
  industry?: string | null;
  competitors: string[];
  projectFileUrls: string[];
  files?: BriefFileInfo[];
  createdAt: Date;
}) {
  try {
    const resend = await getResendClient();
    const fromEmail = await getFromEmail();
    
    const adminEmails = ["richard@innovatr.co.za", "hannah@innovatr.co.za"];

    const formatArray = (arr: string[]) => arr.length > 0 ? arr.join(", ") : "Not specified";
    const formatDate = (date: Date) => new Date(date).toLocaleString("en-ZA", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Build file HTML from new files array with download links
    const files = briefData.files || [];
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` 
        : '';
    
    let filesHtml: string;
    if (files.length > 0) {
      filesHtml = files.map(file => {
        const downloadUrl = file.url.startsWith('http') ? file.url : `${baseUrl}${file.url}`;
        return `<li><a href="${downloadUrl}" target="_blank" rel="noopener">${escapeHtml(file.fileName)}</a> (${formatFileSize(file.fileSize)})</li>`;
      }).join("");
    } else if (briefData.projectFileUrls.length > 0) {
      filesHtml = briefData.projectFileUrls.map(url => `<li><a href="${url}">${url}</a></li>`).join("");
    } else {
      filesHtml = "<li>No files uploaded</li>";
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; }
            h2 { color: #2c3e50; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
            .section { margin: 25px 0; }
            .section h3 { color: #4a5568; margin-bottom: 10px; font-size: 16px; }
            .details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .detail-row { margin: 8px 0; }
            .label { font-weight: bold; color: #555; display: inline-block; min-width: 150px; }
            .objective-box { 
              background-color: #fff; 
              border: 1px solid #e2e8f0; 
              padding: 15px; 
              border-radius: 5px;
              white-space: pre-wrap;
            }
            ul { padding-left: 20px; }
            .cta-button {
              display: inline-block;
              background-color: #667eea;
              color: white !important;
              padding: 12px 24px;
              border-radius: 5px;
              text-decoration: none;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>New ${escapeHtml(briefData.studyType)} Brief Submitted</h2>
            
            <div class="section">
              <h3>Submission Details</h3>
              <div class="details">
                <div class="detail-row"><span class="label">Submitted:</span> ${formatDate(briefData.createdAt)}</div>
                <div class="detail-row"><span class="label">Brief ID:</span> <code>${briefData.id}</code></div>
              </div>
            </div>

            <div class="section">
              <h3>Client Information</h3>
              <div class="details">
                <div class="detail-row"><span class="label">Name:</span> ${escapeHtml(briefData.submittedByName)}</div>
                <div class="detail-row"><span class="label">Email:</span> <a href="mailto:${briefData.submittedByEmail}">${escapeHtml(briefData.submittedByEmail)}</a></div>
                <div class="detail-row"><span class="label">Contact:</span> ${briefData.submittedByContact || "Not provided"}</div>
                <div class="detail-row"><span class="label">Company:</span> ${escapeHtml(briefData.companyName)}</div>
                <div class="detail-row"><span class="label">Brand:</span> ${briefData.companyBrand || "Not provided"}</div>
                <div class="detail-row"><span class="label">Industry:</span> ${briefData.industry || "Not provided"}</div>
              </div>
            </div>

            <div class="section">
              <h3>Study Details</h3>
              <div class="details">
                <div class="detail-row"><span class="label">Study Type:</span> <strong>${escapeHtml(briefData.studyType)}</strong></div>
                <div class="detail-row"><span class="label">Number of Ideas:</span> ${briefData.numIdeas}</div>
              </div>
            </div>

            <div class="section">
              <h3>Research Objective</h3>
              <div class="objective-box">${escapeHtml(briefData.researchObjective)}</div>
            </div>

            <div class="section">
              <h3>Target Audience</h3>
              <div class="details">
                <div class="detail-row"><span class="label">Regions:</span> ${formatArray(briefData.regions)}</div>
                <div class="detail-row"><span class="label">Age Groups:</span> ${formatArray(briefData.ages)}</div>
                <div class="detail-row"><span class="label">Gender:</span> ${formatArray(briefData.genders)}</div>
                <div class="detail-row"><span class="label">Income Levels:</span> ${formatArray(briefData.incomes)}</div>
              </div>
            </div>

            <div class="section">
              <h3>Competitors</h3>
              <div class="details">
                ${briefData.competitors.length > 0 
                  ? `<ul>${briefData.competitors.map(c => `<li>${escapeHtml(c)}</li>`).join("")}</ul>`
                  : "<p>No competitors specified</p>"
                }
              </div>
            </div>

            <div class="section">
              <h3>Uploaded Files</h3>
              <ul>${filesHtml}</ul>
            </div>

            <p style="margin-top: 30px;">
              <em>Reply directly to this email to contact the client at ${escapeHtml(briefData.submittedByEmail)}</em>
            </p>
          </div>
        </body>
      </html>
    `;

    const response = await resend.emails.send({
      from: `Innovatr <${fromEmail}>`,
      to: adminEmails,
      replyTo: briefData.submittedByEmail,
      subject: `New ${briefData.studyType} brief submitted – ${briefData.companyName}`,
      html: emailHtml,
    });

    return response;
  } catch (error) {
    console.error("Failed to send brief admin notification:", error);
    throw error;
  }
}
