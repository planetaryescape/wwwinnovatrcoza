import { Resend } from "resend";

let connectionSettings: any;

const FRONTEND_URL = process.env.FRONTEND_URL || "https://www.innovatr.co.za";
const BRAND_COLOR = "#5865F2";
const BRAND_COLOR_LIGHT = "#EEF0FE";
const CORAL_COLOR = "#E8503A";
const TEXT_COLOR = "#1a1a1a";
const MUTED_COLOR = "#666666";
const FOOTER_COLOR = "#888888";
const BG_COLOR = "#f5f5f5";
const CARD_BG = "#ffffff";
const EMAIL_FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

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

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '  - ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

interface BaseEmailOptions {
  title: string;
  greetingName?: string;
  bodyHtml: string;
  buttonLabel?: string;
  buttonUrl?: string;
  showButton?: boolean;
  showLinkFallback?: boolean;
  footerNote?: string;
}

function renderBaseEmail(options: BaseEmailOptions): string {
  const {
    title,
    greetingName,
    bodyHtml,
    buttonLabel,
    buttonUrl,
    showButton = true,
    showLinkFallback = false,
    footerNote,
  } = options;

  const greeting = greetingName ? `Hi ${escapeHtml(greetingName)},` : 'Hi there,';
  
  const buttonHtml = (showButton && buttonLabel && buttonUrl) ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${buttonUrl}" 
         style="display: inline-block; background-color: ${CORAL_COLOR}; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; font-family: ${EMAIL_FONT}; letter-spacing: 0.01em;">
        ${escapeHtml(buttonLabel)}
      </a>
    </div>
    ${showLinkFallback ? `
    <p style="font-size: 12px; color: ${MUTED_COLOR}; margin-top: 20px; word-break: break-all;">
      If the button does not work, copy and paste this link in your browser:<br>
      <a href="${buttonUrl}" style="color: ${BRAND_COLOR};">${buttonUrl}</a>
    </p>
    ` : ''}
  ` : '';

  const footerNoteHtml = footerNote ? `<p style="font-size: 12px; color: ${MUTED_COLOR}; margin-top: 20px;">${footerNote}</p>` : '';

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: ${BG_COLOR}; font-family: ${EMAIL_FONT};">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BG_COLOR}; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: ${CARD_BG}; border-radius: 8px; overflow: hidden;">
            <tr>
              <td style="background-color: ${BRAND_COLOR}; padding: 24px 40px;">
                <p style="margin: 0; font-family: Georgia, serif; font-size: 20px; font-weight: 400; color: #ffffff; letter-spacing: -0.01em;">Innovatr</p>
                <p style="margin: 2px 0 0 0; font-size: 10px; color: rgba(255,255,255,0.45); letter-spacing: 0.1em; text-transform: uppercase; font-weight: 500;">Insights Platform</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px;">
                <h1 style="margin: 0 0 24px 0; font-family: Georgia, serif; font-size: 22px; font-weight: 400; color: ${TEXT_COLOR}; line-height: 1.2;">
                  ${escapeHtml(title)}
                </h1>
                
                <p style="font-size: 15px; color: ${TEXT_COLOR}; margin: 0 0 20px 0; line-height: 1.6;">
                  ${greeting}
                </p>
                
                <div style="font-size: 15px; color: ${TEXT_COLOR}; line-height: 1.7;">
                  ${bodyHtml}
                </div>
                
                ${buttonHtml}
                ${footerNoteHtml}
              </td>
            </tr>
            <tr>
              <td style="background-color: #f9f9f9; padding: 24px 40px; border-top: 1px solid #eeeeee;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: ${FOOTER_COLOR};">
                  This is an automated message from Innovatr.
                </p>
                <p style="margin: 0 0 8px 0; font-size: 12px; color: ${FOOTER_COLOR};">
                  If you have any questions, contact us at <a href="mailto:hannah@innovatr.co.za" style="color: ${BRAND_COLOR}; text-decoration: none;">hannah@innovatr.co.za</a> or <a href="mailto:richard@innovatr.co.za" style="color: ${BRAND_COLOR}; text-decoration: none;">richard@innovatr.co.za</a>.
                </p>
                <p style="margin: 0; font-size: 12px; color: ${FOOTER_COLOR};">
                  &copy; 2025 Innovatr. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderBaseEmailText(options: BaseEmailOptions): string {
  const { title, greetingName, bodyHtml, buttonLabel, buttonUrl, showButton = true, showLinkFallback = false, footerNote } = options;
  
  const greeting = greetingName ? `Hi ${greetingName},` : 'Hi there,';
  const bodyText = stripHtml(bodyHtml);
  const buttonText = (showButton && buttonLabel && buttonUrl) ? `\n${buttonLabel}: ${buttonUrl}\n` : '';
  const fallbackText = (showLinkFallback && buttonUrl) ? `\nIf the button does not work, copy and paste this link in your browser:\n${buttonUrl}\n` : '';
  const footerNoteText = footerNote ? `\n${footerNote}\n` : '';

  return `${title}

${greeting}

${bodyText}
${buttonText}${fallbackText}${footerNoteText}
Innovatr

---
This is an automated message from Innovatr.
If you have any questions, contact us at hannah@innovatr.co.za or richard@innovatr.co.za.
© 2024 Innovatr. All rights reserved.`;
}

export type EmailTemplateType =
  | "PASSWORD_RESET_REQUEST"
  | "PASSWORD_RESET_SUCCESS"
  | "ACCOUNT_CREATED"
  | "WELCOME_PASSWORD_SETUP"
  | "EMAIL_VERIFICATION"
  | "BRIEF_SUBMITTED"
  | "AUDIENCE_LIVE"
  | "STUDY_COMPLETE"
  | "SUBSCRIPTION_CONFIRMED"
  | "SUBSCRIPTION_CANCELLED"
  | "CREDITS_ADDED"
  | "CREDITS_LOW"
  | "PAYMENT_CONFIRMED"
  | "INVOICE_ISSUED"
  | "ADMIN_ORDER_NOTIFICATION"
  | "ADMIN_BRIEF_NOTIFICATION"
  | "ADMIN_CONTACT_FORM"
  | "ADMIN_INVOICE_REQUEST";

export interface EmailTemplateData {
  firstName?: string;
  resetLink?: string;
  verifyLink?: string;
  portalLink?: string;
  reportLink?: string;
  basicCredits?: number;
  proCredits?: number;
  invoiceNumber?: string;
  amount?: string;
  orderReference?: string;
  studyTitle?: string;
  studyType?: string;
  companyName?: string;
  customerName?: string;
  customerEmail?: string;
  customerCompany?: string;
  orderDescription?: string;
  orderTotal?: string;
  orderItems?: { type?: string; description?: string; quantity: number }[];
  message?: string;
  briefId?: string;
  numIdeas?: number;
  researchObjective?: string;
  regions?: string[];
  ages?: string[];
  genders?: string[];
  incomes?: string[];
  industry?: string;
  competitors?: string[];
  files?: { fileName: string; fileSize: number; url: string }[];
  createdAt?: Date;
  orderId?: string;
  packDescription?: string;
  submittedByContact?: string;
  companyBrand?: string;
}

export function renderEmailTemplate(
  type: EmailTemplateType,
  data: EmailTemplateData
): { subject: string; html: string; text: string } {
  switch (type) {
    case "PASSWORD_RESET_REQUEST": {
      const bodyHtml = `
        <p style="margin: 0 0 15px 0;">We received a request to reset the password for your Innovatr account.</p>
        <p style="margin: 0 0 15px 0;">You can create a new password at this link:</p>
      `;
      const footerNote = "If you did not request this, you can ignore the message. Your current password will stay the same unless you choose to change it.";
      
      const options: BaseEmailOptions = {
        title: "Reset Your Password",
        greetingName: data.firstName,
        bodyHtml,
        buttonLabel: "Create New Password",
        buttonUrl: data.resetLink,
        showButton: true,
        showLinkFallback: true,
        footerNote,
      };
      
      return {
        subject: "Reset your Innovatr password",
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "PASSWORD_RESET_SUCCESS": {
      const bodyHtml = `
        <p style="margin: 0 0 15px 0;">Your password has been successfully updated. You can now log in to your Innovatr account using your new password.</p>
        <p style="margin: 0 0 15px 0;">If you did not make this change or believe your account was accessed without permission, please contact us immediately at <a href="mailto:hannah@innovatr.co.za" style="color: ${BRAND_COLOR};">hannah@innovatr.co.za</a> or <a href="mailto:richard@innovatr.co.za" style="color: ${BRAND_COLOR};">richard@innovatr.co.za</a>.</p>
      `;
      
      const options: BaseEmailOptions = {
        title: "Password Updated Successfully",
        greetingName: data.firstName,
        bodyHtml,
        showButton: false,
      };
      
      return {
        subject: "Your Innovatr password has been updated",
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "ACCOUNT_CREATED": {
      const portalLink = data.portalLink || `${FRONTEND_URL}/?login=true`;
      const bodyHtml = `
        <p style="margin: 0 0 15px 0;">Your Innovatr account is ready. This is your space to explore research, track your projects and understand what is happening in the market in real time.</p>
        <p style="margin: 0 0 15px 0;">If you are on a free plan you will see all Inside content and a few unlocked reports. Everything else will show with a gentle lock so you can see what becomes available when you join a membership.</p>
        <p style="margin: 0 0 15px 0;">If you get stuck or want help planning your first study, just reply. A real person will help.</p>
      `;
      
      const options: BaseEmailOptions = {
        title: "Your Innovatr Account Is Ready",
        greetingName: data.firstName,
        bodyHtml,
        buttonLabel: "Log in to your portal",
        buttonUrl: portalLink,
        showButton: true,
      };
      
      return {
        subject: "Welcome to Innovatr. Your portal is ready",
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "WELCOME_PASSWORD_SETUP": {
      const setupLink = data.resetLink;
      const companyName = data.companyName || "your company";
      const bodyHtml = `
        <p style="margin: 0 0 15px 0;">Welcome to Innovatr. An account has been created for you as part of ${companyName}'s membership.</p>
        <p style="margin: 0 0 15px 0;">To get started, please set up your password using the button below. This link will expire in 24 hours.</p>
        <p style="margin: 0 0 15px 0;">Once you have set your password, you will have full access to your company's research portal, including trend reports, insights library, and past research.</p>
        <p style="margin: 0 0 15px 0;">If you have any questions, just reply to this email. A real person will help.</p>
      `;
      const footerNote = "This link will expire in 24 hours. If you did not expect this email, please contact us at hannah@innovatr.co.za.";
      
      const options: BaseEmailOptions = {
        title: "Set Up Your Innovatr Account",
        greetingName: data.firstName,
        bodyHtml,
        buttonLabel: "Set Up Your Password",
        buttonUrl: setupLink,
        showButton: true,
        showLinkFallback: true,
        footerNote,
      };
      
      return {
        subject: "Welcome to Innovatr. Set up your account",
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "EMAIL_VERIFICATION": {
      const bodyHtml = `
        <p style="margin: 0 0 15px 0;">Please confirm your email address to complete your Innovatr account setup.</p>
      `;
      const footerNote = "This link will expire in 1 hour. If you did not sign up for Innovatr, you can safely ignore this email.";
      
      const options: BaseEmailOptions = {
        title: "Confirm Your Email Address",
        greetingName: data.firstName,
        bodyHtml,
        buttonLabel: "Verify Email",
        buttonUrl: data.verifyLink,
        showButton: true,
        showLinkFallback: true,
        footerNote,
      };
      
      return {
        subject: "Verify your Innovatr account",
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "BRIEF_SUBMITTED": {
      const portalLink = data.portalLink || `${FRONTEND_URL}/portal/research`;
      const bodyHtml = `
        <p style="margin: 0 0 15px 0;">Thank you for sending your Test24 brief. It has been received and added to your portal.</p>
        <p style="margin: 0 0 15px 0;">You can track your study and download results in My Research.</p>
        <p style="margin: 0 0 15px 0;">If anything changes, reply to this email as soon as possible so we can adjust the project before it launches.</p>
      `;
      
      const options: BaseEmailOptions = {
        title: "We Received Your Test24 Brief",
        greetingName: data.firstName,
        bodyHtml,
        buttonLabel: "View My Research",
        buttonUrl: portalLink,
        showButton: true,
      };
      
      return {
        subject: "We received your Test24 brief",
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "AUDIENCE_LIVE": {
      const portalLink = data.portalLink || `${FRONTEND_URL}/portal/research`;
      const bodyHtml = `
        <p style="margin: 0 0 15px 0;">Good news. Your audience is officially live.</p>
        <p style="margin: 0 0 15px 0;">We are now collecting real consumer data. Your full insights report will be ready within 24 hours.</p>
        <p style="margin: 0 0 15px 0;">You can track your project status anytime in My Research.</p>
      `;
      
      const options: BaseEmailOptions = {
        title: "Your Study Is Now Live",
        greetingName: data.firstName,
        bodyHtml,
        buttonLabel: "View Study Status",
        buttonUrl: portalLink,
        showButton: true,
      };
      
      return {
        subject: "Your Test24 audience is live",
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "STUDY_COMPLETE": {
      const buttonUrl = data.reportLink || data.portalLink || `${FRONTEND_URL}/portal/research`;
      const bodyHtml = `
        <p style="margin: 0 0 15px 0;">Your Test24 results are ready in your Innovatr portal. You can open the report, share it with your team and start using the findings.</p>
        <p style="margin: 0 0 15px 0;">If you would like us to walk you through the results or present them to your team, reply to this email and we will arrange a session.</p>
      `;
      
      const options: BaseEmailOptions = {
        title: "Your Test24 Report Is Ready",
        greetingName: data.firstName,
        bodyHtml,
        buttonLabel: "View your report",
        buttonUrl,
        showButton: true,
      };
      
      return {
        subject: "Your Test24 report is ready",
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "SUBSCRIPTION_CONFIRMED": {
      const bodyHtml = `
        <p style="margin: 0 0 15px 0;">You are now subscribed to Innovatr mailers.</p>
        <p style="margin: 0 0 15px 0;">You will receive fresh insights, trends and real data from South African markets, all crafted to help you build what people actually want.</p>
        <p style="margin: 0 0 15px 0;">You can unsubscribe anytime by clicking the link in any email.</p>
      `;
      
      const options: BaseEmailOptions = {
        title: "Welcome to Innovatr Intelligence",
        greetingName: data.firstName,
        bodyHtml,
        showButton: false,
      };
      
      return {
        subject: "You are now subscribed to Innovatr mailers",
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "SUBSCRIPTION_CANCELLED": {
      const bodyHtml = `
        <p style="margin: 0 0 15px 0;">You have been successfully unsubscribed from Innovatr mailers.</p>
        <p style="margin: 0 0 15px 0;">If this was a mistake or you want to rejoin later, you can subscribe again anytime on our website.</p>
      `;
      
      const options: BaseEmailOptions = {
        title: "You Are Unsubscribed",
        greetingName: data.firstName,
        bodyHtml,
        buttonLabel: "Visit Innovatr",
        buttonUrl: FRONTEND_URL,
        showButton: true,
      };
      
      return {
        subject: "You have been unsubscribed",
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "CREDITS_ADDED": {
      const launchLink = `${FRONTEND_URL}/portal/launch`;
      const basicCredits = data.basicCredits ?? 0;
      const proCredits = data.proCredits ?? 0;
      
      const bodyHtml = `
        <p style="margin: 0 0 15px 0;">Good news. Your payment has been confirmed and your credits are now active on your Innovatr account.</p>
        <p style="margin: 0 0 15px 0;"><strong>Available now:</strong></p>
        <ul style="margin: 0 0 15px 20px; padding: 0;">
          <li style="margin: 5px 0;">Test24 Basic Credits: <strong>${basicCredits}</strong></li>
          <li style="margin: 5px 0;">Test24 Pro Credits: <strong>${proCredits}</strong></li>
        </ul>
        <p style="margin: 0 0 15px 0;">Launch a new Test24 study whenever you are ready.</p>
        <p style="margin: 0 0 15px 0;">If you want help with what to test next, reply and we will guide you.</p>
      `;
      
      const options: BaseEmailOptions = {
        title: "Your Innovatr Credits Are Active",
        greetingName: data.firstName,
        bodyHtml,
        buttonLabel: "Launch a new study",
        buttonUrl: launchLink,
        showButton: true,
      };
      
      return {
        subject: "Your Innovatr credits are active",
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "CREDITS_LOW": {
      const creditsLink = `${FRONTEND_URL}/portal/credits`;
      const basicCredits = data.basicCredits ?? 0;
      const proCredits = data.proCredits ?? 0;
      
      const bodyHtml = `
        <p style="margin: 0 0 15px 0;">Just a heads up, your Innovatr research credits are running low.</p>
        <p style="margin: 0 0 15px 0;"><strong>Remaining:</strong></p>
        <ul style="margin: 0 0 15px 20px; padding: 0;">
          <li style="margin: 5px 0;">Basic Credits: <strong>${basicCredits}</strong></li>
          <li style="margin: 5px 0;">Pro Credits: <strong>${proCredits}</strong></li>
        </ul>
        <p style="margin: 0 0 15px 0;">You can top up anytime in your portal under Credits and Billing.</p>
      `;
      
      const options: BaseEmailOptions = {
        title: "Low Credit Alert",
        greetingName: data.firstName,
        bodyHtml,
        buttonLabel: "Top Up Credits",
        buttonUrl: creditsLink,
        showButton: true,
      };
      
      return {
        subject: "You are running low on research credits",
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "PAYMENT_CONFIRMED": {
      const creditsLink = `${FRONTEND_URL}/portal/credits`;
      
      let detailsHtml = '';
      if (data.orderReference || data.amount) {
        detailsHtml = '<div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">';
        if (data.orderReference) {
          detailsHtml += `<p style="margin: 5px 0; font-size: 14px;"><strong>Order reference:</strong> ${escapeHtml(data.orderReference)}</p>`;
        }
        if (data.amount) {
          detailsHtml += `<p style="margin: 5px 0; font-size: 14px;"><strong>Amount:</strong> ${escapeHtml(data.amount)}</p>`;
        }
        detailsHtml += '</div>';
      }
      
      const bodyHtml = `
        <p style="margin: 0 0 15px 0;">We have received your payment and your order is now confirmed.</p>
        <p style="margin: 0 0 15px 0;">Your study will begin as soon as your brief is submitted and approved.</p>
        <p style="margin: 0 0 15px 0;">You can track your orders anytime in Credits and Billing.</p>
        ${detailsHtml}
      `;
      
      const options: BaseEmailOptions = {
        title: "Payment Received",
        greetingName: data.firstName,
        bodyHtml,
        buttonLabel: "View Order",
        buttonUrl: creditsLink,
        showButton: true,
      };
      
      return {
        subject: "Your Innovatr order has been confirmed",
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "INVOICE_ISSUED": {
      const creditsLink = `${FRONTEND_URL}/portal/credits`;
      
      let detailsHtml = '';
      if (data.invoiceNumber || data.amount) {
        detailsHtml = '<div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">';
        if (data.invoiceNumber) {
          detailsHtml += `<p style="margin: 5px 0; font-size: 14px;"><strong>Invoice number:</strong> ${escapeHtml(data.invoiceNumber)}</p>`;
        }
        if (data.amount) {
          detailsHtml += `<p style="margin: 5px 0; font-size: 14px;"><strong>Amount:</strong> ${escapeHtml(data.amount)}</p>`;
        }
        detailsHtml += '</div>';
      }
      
      const bodyHtml = `
        <p style="margin: 0 0 15px 0;">Your invoice has been generated and sent to your email.</p>
        <p style="margin: 0 0 15px 0;">Your study will begin once payment or a purchase order has been received.</p>
        <p style="margin: 0 0 15px 0;">If you need help or require the invoice to be resent, please let us know.</p>
        ${detailsHtml}
      `;
      
      const options: BaseEmailOptions = {
        title: "Invoice Issued",
        greetingName: data.firstName,
        bodyHtml,
        buttonLabel: "View Invoice",
        buttonUrl: creditsLink,
        showButton: true,
      };
      
      return {
        subject: "Your Innovatr invoice is ready",
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "ADMIN_ORDER_NOTIFICATION": {
      const itemsHtml = data.orderItems?.map(
        (item) => `<li>${escapeHtml(item.description || item.type || 'Item')} - Qty: ${item.quantity}</li>`
      ).join("") || '';
      
      const bodyHtml = `
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Customer Name:</strong> ${escapeHtml(data.customerName || '')}</p>
          <p style="margin: 5px 0;"><strong>Customer Email:</strong> ${escapeHtml(data.customerEmail || '')}</p>
          <p style="margin: 5px 0;"><strong>Company:</strong> ${escapeHtml(data.customerCompany || '')}</p>
          <p style="margin: 5px 0;"><strong>Order Total:</strong> ${escapeHtml(data.orderTotal || '')}</p>
          <p style="margin: 5px 0;"><strong>Description:</strong> ${escapeHtml(data.orderDescription || '')}</p>
        </div>
        <p style="margin: 15px 0 10px 0;"><strong>Order Items:</strong></p>
        <ul style="margin: 0 0 15px 20px; padding: 0;">${itemsHtml}</ul>
        <p style="margin: 0; font-style: italic; color: ${MUTED_COLOR};">Please process this order manually.</p>
      `;
      
      const options: BaseEmailOptions = {
        title: "New Order Received",
        bodyHtml,
        showButton: false,
      };
      
      return {
        subject: `New Order from ${data.customerName || 'Customer'}`,
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "ADMIN_CONTACT_FORM": {
      const bodyHtml = `
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Name:</strong> ${escapeHtml(data.customerName || '')}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${escapeHtml(data.customerEmail || '')}</p>
          <p style="margin: 5px 0;"><strong>Company:</strong> ${escapeHtml(data.customerCompany || 'Not provided')}</p>
        </div>
        <p style="margin: 15px 0 10px 0;"><strong>Message:</strong></p>
        <div style="background-color: #ffffff; border: 1px solid #eeeeee; padding: 15px; border-radius: 6px; white-space: pre-wrap;">
          ${escapeHtml(data.message || '')}
        </div>
        <p style="margin: 20px 0 0 0; font-size: 12px; color: ${MUTED_COLOR}; font-style: italic;">
          This message was sent via the contact form on the Innovatr website.
        </p>
      `;
      
      const options: BaseEmailOptions = {
        title: "New Contact Form Submission",
        bodyHtml,
        showButton: false,
      };
      
      return {
        subject: `Contact Form: ${data.customerName || 'Unknown'} from ${data.customerCompany || 'Unknown Company'}`,
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "ADMIN_INVOICE_REQUEST": {
      const itemsHtml = data.orderItems?.map(
        (item) => `<li>${escapeHtml(item.description || item.type || 'Item')} (Qty: ${item.quantity})</li>`
      ).join("") || '';
      
      const bodyHtml = `
        <p style="margin: 0 0 15px 0;">A new invoice request has been submitted from the member portal. Credits will only activate once payment reflects on our side. Clients have thirty days to complete payment.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> <code style="background-color: #e9ecef; padding: 2px 6px; border-radius: 3px;">${escapeHtml(data.orderId || '')}</code></p>
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${escapeHtml(data.customerName || '')}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${escapeHtml(data.customerEmail || '')}</p>
          <p style="margin: 5px 0;"><strong>Company:</strong> ${escapeHtml(data.customerCompany || '')}</p>
          <p style="margin: 5px 0;"><strong>Credit pack:</strong> ${escapeHtml(data.packDescription || '')}</p>
          <p style="margin: 5px 0;"><strong>Total amount:</strong> <strong>${escapeHtml(data.amount || '')}</strong></p>
        </div>
        <p style="margin: 15px 0 10px 0;"><strong>Order Items:</strong></p>
        <ul style="margin: 0 0 15px 20px; padding: 0;">${itemsHtml}</ul>
        <p style="margin: 0; font-style: italic; color: ${MUTED_COLOR};">Once the invoice has been created and payment is confirmed, activate the credits for the account in the admin section.</p>
      `;
      
      const options: BaseEmailOptions = {
        title: "Invoice Request for Credit Pack",
        bodyHtml,
        showButton: false,
      };
      
      return {
        subject: `Invoice request for ${data.customerCompany || 'Company'} credit pack`,
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "ADMIN_BRIEF_NOTIFICATION": {
      const formatArray = (arr?: string[]) => arr && arr.length > 0 ? arr.join(", ") : "Not specified";
      const formatDate = (date?: Date) => date ? new Date(date).toLocaleString("en-ZA", {
        dateStyle: "medium",
        timeStyle: "short",
      }) : "Unknown";
      
      // Convert relative file URLs to absolute public URLs for email links
      const getAbsoluteFileUrl = (url: string) => {
        if (url.startsWith("http://") || url.startsWith("https://")) {
          return url;
        }
        // Use the app's base URL for relative paths
        const baseUrl = process.env.REPLIT_DEV_DOMAIN 
          ? `https://${process.env.REPLIT_DEV_DOMAIN}`
          : FRONTEND_URL;
        
        // Convert /api/files/briefs/... to /api/public/brief-files/briefs/... for public access
        if (url.includes("/api/files/briefs/")) {
          const publicUrl = url.replace("/api/files/", "/api/public/brief-files/");
          return `${baseUrl}${publicUrl.startsWith("/") ? "" : "/"}${publicUrl}`;
        }
        
        return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
      };

      const filesHtml = data.files && data.files.length > 0 
        ? data.files.map(file => `<li><a href="${getAbsoluteFileUrl(file.url)}" style="color: ${BRAND_COLOR};">${escapeHtml(file.fileName)}</a> (${formatFileSize(file.fileSize)})</li>`).join("")
        : "<li>No files uploaded</li>";
      
      const competitorsHtml = data.competitors && data.competitors.length > 0 
        ? data.competitors.map(c => `<li>${escapeHtml(c)}</li>`).join("")
        : "<li>No competitors specified</li>";

      const bodyHtml = `
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Submitted:</strong> ${formatDate(data.createdAt)}</p>
          <p style="margin: 5px 0;"><strong>Brief ID:</strong> <code style="background-color: #e9ecef; padding: 2px 6px; border-radius: 3px;">${escapeHtml(data.briefId || '')}</code></p>
        </div>
        
        <p style="margin: 20px 0 10px 0; font-weight: 600; color: ${TEXT_COLOR};">Client Information</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 0 0 15px 0;">
          <p style="margin: 5px 0;"><strong>Name:</strong> ${escapeHtml(data.customerName || '')}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${data.customerEmail}" style="color: ${BRAND_COLOR};">${escapeHtml(data.customerEmail || '')}</a></p>
          <p style="margin: 5px 0;"><strong>Contact:</strong> ${escapeHtml(data.submittedByContact || 'Not provided')}</p>
          <p style="margin: 5px 0;"><strong>Company:</strong> ${escapeHtml(data.companyName || '')}</p>
          <p style="margin: 5px 0;"><strong>Brand:</strong> ${escapeHtml(data.companyBrand || 'Not provided')}</p>
          <p style="margin: 5px 0;"><strong>Industry:</strong> ${escapeHtml(data.industry || 'Not provided')}</p>
        </div>
        
        <p style="margin: 20px 0 10px 0; font-weight: 600; color: ${TEXT_COLOR};">Study Details</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 0 0 15px 0;">
          <p style="margin: 5px 0;"><strong>Study Type:</strong> <strong>${escapeHtml(data.studyType || '')}</strong></p>
          <p style="margin: 5px 0;"><strong>Number of Ideas:</strong> ${data.numIdeas || 0}</p>
        </div>
        
        <p style="margin: 20px 0 10px 0; font-weight: 600; color: ${TEXT_COLOR};">Research Objective</p>
        <div style="background-color: #ffffff; border: 1px solid #eeeeee; padding: 15px; border-radius: 6px; white-space: pre-wrap; margin: 0 0 15px 0;">
          ${escapeHtml(data.researchObjective || '')}
        </div>
        
        <p style="margin: 20px 0 10px 0; font-weight: 600; color: ${TEXT_COLOR};">Target Audience</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 0 0 15px 0;">
          <p style="margin: 5px 0;"><strong>Regions:</strong> ${formatArray(data.regions)}</p>
          <p style="margin: 5px 0;"><strong>Age Groups:</strong> ${formatArray(data.ages)}</p>
          <p style="margin: 5px 0;"><strong>Gender:</strong> ${formatArray(data.genders)}</p>
          <p style="margin: 5px 0;"><strong>Income Levels:</strong> ${formatArray(data.incomes)}</p>
        </div>
        
        <p style="margin: 20px 0 10px 0; font-weight: 600; color: ${TEXT_COLOR};">Competitors</p>
        <ul style="margin: 0 0 15px 20px; padding: 0;">${competitorsHtml}</ul>
        
        <p style="margin: 20px 0 10px 0; font-weight: 600; color: ${TEXT_COLOR};">Uploaded Files</p>
        <ul style="margin: 0 0 15px 20px; padding: 0;">${filesHtml}</ul>
        
        <p style="margin: 30px 0 0 0; font-style: italic; color: ${MUTED_COLOR};">
          Reply directly to this email to contact the client at ${escapeHtml(data.customerEmail || '')}
        </p>
      `;
      
      const options: BaseEmailOptions = {
        title: `New ${data.studyType || 'Test24'} Brief Submitted`,
        bodyHtml,
        showButton: false,
      };
      
      return {
        subject: `New ${data.studyType || 'Test24'} brief submitted – ${data.companyName || 'Company'}`,
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    default:
      throw new Error(`Unknown email template type: ${type}`);
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  cc?: string[];
  attachments?: { filename: string; content: Buffer }[];
}) {
  const resend = await getResendClient();
  const fromEmail = await getFromEmail();
  
  const toArray = Array.isArray(options.to) ? options.to : [options.to];
  
  const emailOptions: any = {
    from: `Innovatr <${fromEmail}>`,
    to: toArray,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };
  
  if (options.replyTo) {
    emailOptions.replyTo = options.replyTo;
  }
  if (options.cc && options.cc.length > 0) {
    emailOptions.cc = options.cc;
  }
  if (options.attachments && options.attachments.length > 0) {
    emailOptions.attachments = options.attachments;
  }
  
  const response = await resend.emails.send(emailOptions);
  return response;
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
) {
  try {
    const { subject, html, text } = renderEmailTemplate("PASSWORD_RESET_REQUEST", {
      firstName: name,
      resetLink: resetUrl,
    });
    
    const response = await sendEmail({
      to: email,
      subject,
      html,
      text,
    });
    
    console.log("Password reset email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
}

export async function sendPasswordResetSuccessEmail(
  email: string,
  name: string
) {
  try {
    const { subject, html, text } = renderEmailTemplate("PASSWORD_RESET_SUCCESS", {
      firstName: name,
    });
    
    const response = await sendEmail({
      to: email,
      subject,
      html,
      text,
    });
    
    console.log("Password reset success email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Failed to send password reset success email:", error);
    throw error;
  }
}

export async function sendAccountCreatedEmail(
  email: string,
  name: string
) {
  try {
    const { subject, html, text } = renderEmailTemplate("ACCOUNT_CREATED", {
      firstName: name,
      portalLink: `${FRONTEND_URL}/?login=true`,
    });
    
    const response = await sendEmail({
      to: email,
      subject,
      html,
      text,
    });
    
    console.log("Account created email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Failed to send account created email:", error);
    throw error;
  }
}

export async function sendWelcomeWithPasswordSetup(
  email: string,
  name: string,
  companyName: string,
  setupUrl: string
) {
  try {
    const { subject, html, text } = renderEmailTemplate("WELCOME_PASSWORD_SETUP", {
      firstName: name,
      companyName: companyName,
      resetLink: setupUrl,
    });
    
    const response = await sendEmail({
      to: email,
      subject,
      html,
      text,
    });
    
    console.log("Welcome with password setup email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Failed to send welcome with password setup email:", error);
    throw error;
  }
}

export async function sendSubscriptionConfirmedEmail(
  email: string,
  name?: string
) {
  try {
    const { subject, html, text } = renderEmailTemplate("SUBSCRIPTION_CONFIRMED", {
      firstName: name,
    });
    
    const response = await sendEmail({
      to: email,
      subject,
      html,
      text,
    });
    
    console.log("Subscription confirmed email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Failed to send subscription confirmed email:", error);
    throw error;
  }
}

export async function sendCreditsAddedEmail(
  email: string,
  name: string,
  basicCredits: number,
  proCredits: number
) {
  try {
    const { subject, html, text } = renderEmailTemplate("CREDITS_ADDED", {
      firstName: name,
      basicCredits,
      proCredits,
    });
    
    const response = await sendEmail({
      to: email,
      subject,
      html,
      text,
    });
    
    console.log("Credits added email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Failed to send credits added email:", error);
    throw error;
  }
}

export async function sendAdminOrderNotification(orderData: {
  customerName: string;
  customerEmail: string;
  orderDescription: string;
  customerCompany: string;
  orderTotal: string;
  orderItems: any[];
}) {
  try {
    const adminEmails = getAdminEmails();
    
    const { subject, html, text } = renderEmailTemplate("ADMIN_ORDER_NOTIFICATION", {
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerCompany: orderData.customerCompany,
      orderDescription: orderData.orderDescription,
      orderTotal: orderData.orderTotal,
      orderItems: orderData.orderItems,
    });
    
    const response = await sendEmail({
      to: adminEmails,
      subject,
      html,
      text,
    });
    
    return response;
  } catch (error) {
    console.error("Failed to send admin order notification:", error);
    throw error;
  }
}

export async function sendContactFormMessage(contactData: {
  name: string;
  email: string;
  company: string;
  message: string;
}) {
  try {
    const adminEmails = getAdminEmails();
    
    const { subject, html, text } = renderEmailTemplate("ADMIN_CONTACT_FORM", {
      customerName: contactData.name,
      customerEmail: contactData.email,
      customerCompany: contactData.company || "Not provided",
      message: contactData.message,
    });
    
    const response = await sendEmail({
      to: adminEmails,
      subject,
      html,
      text,
      replyTo: contactData.email,
      cc: ["richard@innovatr.co.za", "alroy@innovatr.co.za"],
    });
    
    return response;
  } catch (error) {
    console.error("Failed to send contact form message:", error);
    throw error;
  }
}

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
    const adminEmails = ["richard@innovatr.co.za", "hannah@innovatr.co.za"];
    
    const { subject, html, text } = renderEmailTemplate("ADMIN_INVOICE_REQUEST", {
      orderId: orderData.orderId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerCompany: orderData.customerCompany,
      packDescription: orderData.packDescription,
      amount: orderData.totalAmount,
      orderItems: orderData.orderItems,
    });
    
    const response = await sendEmail({
      to: adminEmails,
      subject,
      html,
      text,
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
    const hasInvoice = !!orderData.invoiceAttachment;
    
    const { subject, html, text } = renderEmailTemplate("PAYMENT_CONFIRMED", {
      firstName: orderData.customerName.split(' ')[0],
      orderReference: orderData.orderDescription,
      amount: orderData.orderTotal,
    });
    
    const toList = [orderData.customerEmail];
    if (hasInvoice) {
      toList.push("richard@innovatr.co.za");
    }
    
    const response = await sendEmail({
      to: toList,
      subject: hasInvoice 
        ? `Tax Invoice - ${orderData.orderDescription}` 
        : subject,
      html,
      text,
      attachments: orderData.invoiceAttachment ? [{
        filename: orderData.invoiceAttachment.filename,
        content: orderData.invoiceAttachment.content,
      }] : undefined,
    });
    
    return response;
  } catch (error) {
    console.error("Failed to send customer order confirmation:", error);
    throw error;
  }
}

export async function sendBriefConfirmationEmail(briefData: {
  submittedByName: string;
  submittedByEmail: string;
  companyName: string;
  studyType: string;
  numIdeas: number;
  researchObjective: string;
  files?: { id: string; fileName: string; fileSize: number; mimeType: string; url: string; uploadedAt: string }[];
}) {
  try {
    const { subject, html, text } = renderEmailTemplate("BRIEF_SUBMITTED", {
      firstName: briefData.submittedByName.split(' ')[0],
      portalLink: `${FRONTEND_URL}/portal/research`,
    });
    
    const response = await sendEmail({
      to: briefData.submittedByEmail,
      subject,
      html,
      text,
    });
    
    return response;
  } catch (error) {
    console.error("Failed to send brief confirmation email:", error);
    throw error;
  }
}

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
  files?: { id: string; fileName: string; fileSize: number; mimeType: string; url: string; uploadedAt: string }[];
  createdAt: Date;
}) {
  try {
    const adminEmails = ["richard@innovatr.co.za", "hannah@innovatr.co.za"];
    
    const { subject, html, text } = renderEmailTemplate("ADMIN_BRIEF_NOTIFICATION", {
      briefId: briefData.id,
      customerName: briefData.submittedByName,
      customerEmail: briefData.submittedByEmail,
      submittedByContact: briefData.submittedByContact || undefined,
      companyName: briefData.companyName,
      companyBrand: briefData.companyBrand || undefined,
      studyType: briefData.studyType,
      numIdeas: briefData.numIdeas,
      researchObjective: briefData.researchObjective,
      regions: briefData.regions,
      ages: briefData.ages,
      genders: briefData.genders,
      incomes: briefData.incomes,
      industry: briefData.industry || undefined,
      competitors: briefData.competitors,
      files: briefData.files?.map(f => ({ fileName: f.fileName, fileSize: f.fileSize, url: f.url })),
      createdAt: briefData.createdAt,
    });
    
    const response = await sendEmail({
      to: adminEmails,
      subject,
      html,
      text,
      replyTo: briefData.submittedByEmail,
    });
    
    return response;
  } catch (error) {
    console.error("Failed to send brief admin notification:", error);
    throw error;
  }
}

export async function sendStudyLiveNotification(studyData: {
  clientEmail: string;
  clientName: string;
  studyTitle: string;
  studyType: string;
  companyName: string;
}) {
  try {
    const adminEmails = getAdminEmails();
    
    const { subject, html, text } = renderEmailTemplate("AUDIENCE_LIVE", {
      firstName: studyData.clientName.split(' ')[0],
      studyTitle: studyData.studyTitle,
      studyType: studyData.studyType,
      companyName: studyData.companyName,
      portalLink: `${FRONTEND_URL}/portal/research`,
    });
    
    const response = await sendEmail({
      to: studyData.clientEmail,
      subject: `Your Test24 study is live – ${studyData.studyTitle}`,
      html,
      text,
      cc: adminEmails.slice(0, 1),
    });
    
    return response;
  } catch (error) {
    console.error("Failed to send study live notification:", error);
    throw error;
  }
}

export async function sendStudyCompletedNotification(studyData: {
  clientEmail: string;
  clientName: string;
  studyTitle: string;
  studyType: string;
  companyName: string;
  reportUrl?: string;
}) {
  try {
    const adminEmails = getAdminEmails();
    
    const { subject, html, text } = renderEmailTemplate("STUDY_COMPLETE", {
      firstName: studyData.clientName.split(' ')[0],
      studyTitle: studyData.studyTitle,
      studyType: studyData.studyType,
      companyName: studyData.companyName,
      reportLink: studyData.reportUrl,
      portalLink: `${FRONTEND_URL}/portal/research`,
    });
    
    const response = await sendEmail({
      to: studyData.clientEmail,
      subject: `Your Test24 results are ready – ${studyData.studyTitle}`,
      html,
      text,
      cc: adminEmails.slice(0, 1),
    });
    
    return response;
  } catch (error) {
    console.error("Failed to send study completed notification:", error);
    throw error;
  }
}

export async function sendInvoiceIssuedEmail(
  email: string,
  name: string,
  invoiceNumber?: string,
  amount?: string
) {
  try {
    const { subject, html, text } = renderEmailTemplate("INVOICE_ISSUED", {
      firstName: name,
      invoiceNumber,
      amount,
    });
    
    const response = await sendEmail({
      to: email,
      subject,
      html,
      text,
    });
    
    console.log("Invoice issued email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Failed to send invoice issued email:", error);
    throw error;
  }
}

export async function sendReportRequestNotification(request: {
  name: string;
  email: string;
  companyName?: string | null;
  industry: string;
  topic: string;
  reason: string;
}) {
  try {
    const resend = await getResendClient();
    const { fromEmail } = await getCredentials();

    const response = await resend.emails.send({
      from: fromEmail,
      to: "hannah@innovatr.co.za",
      subject: `New Report Request: ${request.topic}`,
      html: `
        <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, ${BRAND_COLOR}, #5046D4); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Report Request</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">A member has requested a new report</p>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: ${MUTED_COLOR}; font-size: 14px;">Name</td><td style="padding: 8px 0; color: ${TEXT_COLOR}; font-size: 14px; font-weight: 600;">${request.name}</td></tr>
              <tr><td style="padding: 8px 0; color: ${MUTED_COLOR}; font-size: 14px;">Email</td><td style="padding: 8px 0; color: ${TEXT_COLOR}; font-size: 14px;">${request.email}</td></tr>
              ${request.companyName ? `<tr><td style="padding: 8px 0; color: ${MUTED_COLOR}; font-size: 14px;">Company</td><td style="padding: 8px 0; color: ${TEXT_COLOR}; font-size: 14px;">${request.companyName}</td></tr>` : ''}
              <tr><td style="padding: 8px 0; color: ${MUTED_COLOR}; font-size: 14px;">Industry</td><td style="padding: 8px 0; color: ${TEXT_COLOR}; font-size: 14px;">${request.industry}</td></tr>
              <tr><td style="padding: 8px 0; color: ${MUTED_COLOR}; font-size: 14px;">Topic</td><td style="padding: 8px 0; color: ${TEXT_COLOR}; font-size: 14px; font-weight: 600;">${request.topic}</td></tr>
            </table>
            <div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid ${BRAND_COLOR};">
              <p style="margin: 0 0 4px; color: ${MUTED_COLOR}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Reason / Question</p>
              <p style="margin: 0; color: ${TEXT_COLOR}; font-size: 14px; line-height: 1.6;">${request.reason}</p>
            </div>
          </div>
          <p style="text-align: center; color: ${FOOTER_COLOR}; font-size: 12px; margin-top: 20px;">This request was submitted via the Trends & Insights Library</p>
        </div>
      `,
    });

    console.log("Report request notification sent:", response);
    return response;
  } catch (error) {
    console.error("Failed to send report request notification:", error);
    throw error;
  }
}

export async function sendReportRequestConfirmation(userEmail: string, userName: string, topic: string) {
  try {
    const resend = await getResendClient();
    const { fromEmail } = await getCredentials();

    const response = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: `We've received your report request: ${topic}`,
      html: `
        <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, ${BRAND_COLOR}, #5046D4); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Request Received</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: ${TEXT_COLOR}; font-size: 16px; line-height: 1.6;">Hi ${userName},</p>
            <p style="color: ${TEXT_COLOR}; font-size: 14px; line-height: 1.6;">We've received your request for a report on <strong>"${topic}"</strong>. Our research team will review this and get back to you shortly.</p>
            <p style="color: ${MUTED_COLOR}; font-size: 14px; line-height: 1.6;">Thank you for helping us shape our research agenda.</p>
            <p style="color: ${TEXT_COLOR}; font-size: 14px; margin-top: 24px;">The Innovatr Team</p>
          </div>
        </div>
      `,
    });

    console.log("Report request confirmation sent:", response);
    return response;
  } catch (error) {
    console.error("Failed to send report request confirmation:", error);
    throw error;
  }
}

export async function sendDailyAdminDigest(data: {
  isMonday: boolean;
  periodLabel: string;
  newUsers: { name: string; surname: string; email: string; company: string }[];
  activeUsers: number;
  freshLogins: number;
  totalLogins: number;
  uniqueLoginUsers: number;
  reportViews: number;
  reportDownloads: number;
  reportViewDetails: { userName: string; reportName: string }[];
  reportDownloadDetails: { userName: string; reportName: string }[];
  briefLaunches: number;
  totalEvents: number;
  companyActivity: { companyName: string; totalActions: number; uniqueUsers: number }[];
  recentEvents: { userName: string; userEmail: string; companyName: string; actionType: string; entityName: string | null; createdAt: string }[];
}) {
  try {
    const resend = await getResendClient();
    const fromEmail = await getFromEmail();

    const newUsersHtml = data.newUsers.length > 0
      ? data.newUsers.map(u =>
        `<tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px;">${escapeHtml(u.name)} ${escapeHtml(u.surname)}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px;">${escapeHtml(u.email)}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px;">${escapeHtml(u.company)}</td>
        </tr>`
      ).join("")
      : `<tr><td colspan="3" style="padding: 12px; text-align: center; color: ${MUTED_COLOR}; font-size: 14px;">No new users</td></tr>`;

    const companyHtml = data.companyActivity.length > 0
      ? data.companyActivity.map(c =>
        `<tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px;">${escapeHtml(c.companyName)}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px; text-align: center;">${c.uniqueUsers}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px; text-align: center;">${c.totalActions}</td>
        </tr>`
      ).join("")
      : `<tr><td colspan="3" style="padding: 12px; text-align: center; color: ${MUTED_COLOR}; font-size: 14px;">No company activity</td></tr>`;

    const actionLabels: Record<string, string> = {
      login: "Logged in",
      view_report: "Viewed report",
      download_report: "Downloaded report",
      download_client_report: "Downloaded client report",
      view_trends: "Viewed Trends & Insights",
      view_past_research: "Viewed Past Research",
      launch_brief: "Launched brief",
      view_deals: "Viewed Member Offers",
      view_dashboard: "Visited Dashboard",
      view_settings: "Visited Settings",
      view_credits: "Viewed Credits & Billing",
      view_client_report: "Viewed report",
    };

    const recentHtml = data.recentEvents.slice(0, 20).map(ev =>
      `<tr>
        <td style="padding: 6px 12px; border-bottom: 1px solid #eee; font-size: 13px;">${escapeHtml(ev.userName)}</td>
        <td style="padding: 6px 12px; border-bottom: 1px solid #eee; font-size: 13px;">${escapeHtml(ev.companyName)}</td>
        <td style="padding: 6px 12px; border-bottom: 1px solid #eee; font-size: 13px;">${actionLabels[ev.actionType] || ev.actionType}${ev.entityName ? `: ${escapeHtml(ev.entityName)}` : ""}</td>
        <td style="padding: 6px 12px; border-bottom: 1px solid #eee; font-size: 13px; color: ${MUTED_COLOR};">${new Date(ev.createdAt).toLocaleString("en-ZA", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</td>
      </tr>`
    ).join("");

    const bodyHtml = `
      <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: ${BRAND_COLOR}; padding: 24px 32px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; font-size: 22px; margin: 0;">Innovatr Daily Digest</h1>
          <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0 0;">${escapeHtml(data.periodLabel)}</p>
        </div>
        
        <div style="padding: 24px 32px;">
          <div style="display: flex; gap: 16px; margin-bottom: 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="25%" style="padding: 12px; text-align: center; background-color: #f8f9fa; border-radius: 8px;">
                  <div style="font-size: 28px; font-weight: 700; color: ${TEXT_COLOR};">${data.activeUsers}</div>
                  <div style="font-size: 12px; color: ${MUTED_COLOR}; margin-top: 4px;">Active Users (${data.freshLogins} fresh logins)</div>
                </td>
                <td width="25%" style="padding: 12px; text-align: center; background-color: #f8f9fa; border-radius: 8px;">
                  <div style="font-size: 28px; font-weight: 700; color: ${TEXT_COLOR};">${data.reportViews}</div>
                  <div style="font-size: 12px; color: ${MUTED_COLOR}; margin-top: 4px;">Report Views</div>
                </td>
                <td width="25%" style="padding: 12px; text-align: center; background-color: #f8f9fa; border-radius: 8px;">
                  <div style="font-size: 28px; font-weight: 700; color: ${TEXT_COLOR};">${data.reportDownloads}</div>
                  <div style="font-size: 12px; color: ${MUTED_COLOR}; margin-top: 4px;">Downloads</div>
                </td>
                <td width="25%" style="padding: 12px; text-align: center; background-color: #f8f9fa; border-radius: 8px;">
                  <div style="font-size: 28px; font-weight: 700; color: ${TEXT_COLOR};">${data.briefLaunches}</div>
                  <div style="font-size: 12px; color: ${MUTED_COLOR}; margin-top: 4px;">Briefs</div>
                </td>
              </tr>
            </table>
          </div>

          ${data.reportViewDetails.length > 0 ? `
          <h2 style="font-size: 16px; color: ${TEXT_COLOR}; margin: 24px 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid ${BRAND_COLOR};">Report Views (${data.reportViewDetails.length})</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 6px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: ${MUTED_COLOR}; text-transform: uppercase;">Report</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: ${MUTED_COLOR}; text-transform: uppercase;">Viewed By</th>
              </tr>
            </thead>
            <tbody>${data.reportViewDetails.map(r => `<tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px;">${escapeHtml(r.reportName)}</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px;">${escapeHtml(r.userName)}</td>
            </tr>`).join("")}</tbody>
          </table>
          ` : ""}

          ${data.reportDownloadDetails.length > 0 ? `
          <h2 style="font-size: 16px; color: ${TEXT_COLOR}; margin: 24px 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid ${BRAND_COLOR};">Report Downloads (${data.reportDownloadDetails.length})</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 6px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: ${MUTED_COLOR}; text-transform: uppercase;">Report</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: ${MUTED_COLOR}; text-transform: uppercase;">Downloaded By</th>
              </tr>
            </thead>
            <tbody>${data.reportDownloadDetails.map(r => `<tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px;">${escapeHtml(r.reportName)}</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px;">${escapeHtml(r.userName)}</td>
            </tr>`).join("")}</tbody>
          </table>
          ` : ""}

          ${data.newUsers.length > 0 ? `
          <h2 style="font-size: 16px; color: ${TEXT_COLOR}; margin: 24px 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid ${BRAND_COLOR};">New Users (${data.newUsers.length})</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 6px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: ${MUTED_COLOR}; text-transform: uppercase;">Name</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: ${MUTED_COLOR}; text-transform: uppercase;">Email</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: ${MUTED_COLOR}; text-transform: uppercase;">Company</th>
              </tr>
            </thead>
            <tbody>${newUsersHtml}</tbody>
          </table>
          ` : ""}

          <h2 style="font-size: 16px; color: ${TEXT_COLOR}; margin: 24px 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid ${BRAND_COLOR};">Company Activity</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 6px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: ${MUTED_COLOR}; text-transform: uppercase;">Company</th>
                <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: ${MUTED_COLOR}; text-transform: uppercase;">Active Users</th>
                <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: ${MUTED_COLOR}; text-transform: uppercase;">Actions</th>
              </tr>
            </thead>
            <tbody>${companyHtml}</tbody>
          </table>

          ${recentHtml ? `
          <h2 style="font-size: 16px; color: ${TEXT_COLOR}; margin: 24px 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid ${BRAND_COLOR};">Recent Activity</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 6px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: ${MUTED_COLOR}; text-transform: uppercase;">User</th>
                <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: ${MUTED_COLOR}; text-transform: uppercase;">Company</th>
                <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: ${MUTED_COLOR}; text-transform: uppercase;">Action</th>
                <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: ${MUTED_COLOR}; text-transform: uppercase;">Time</th>
              </tr>
            </thead>
            <tbody>${recentHtml}</tbody>
          </table>
          ` : ""}

          <p style="margin-top: 28px; font-size: 13px; color: ${FOOTER_COLOR}; text-align: center;">
            Total actions recorded: ${data.totalEvents}
          </p>
        </div>
      </div>
    `;

    const subject = `Innovatr Daily Digest - ${data.periodLabel}`;

    const response = await resend.emails.send({
      from: fromEmail,
      to: "hannah@innovatr.co.za",
      subject,
      html: bodyHtml,
      text: stripHtml(bodyHtml),
    });

    console.log("Daily admin digest sent:", response);
    return response;
  } catch (error) {
    console.error("Failed to send daily admin digest:", error);
    throw error;
  }
}

export async function sendFinancialPulseMailer(to: string, firstName: string = "there") {
  const resend = await getResendClient();
  const fromEmail = await getFromEmail();
  const baseUrl = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : FRONTEND_URL;
  const portalUrl = `${baseUrl}/portal/insights/cash-is-king-again`;
  const heroImageUrl = `${baseUrl}/reports/cash-is-king-again.jpg`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Cash Is King Again | Innovatr Insights</title></head>
<body style="margin:0;padding:0;background-color:#FAF3E8;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#f4f4f5;">Digital fatigue is real. And it's reshaping how people spend. &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF3E8;">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
        <tr><td style="background-color:${BRAND_COLOR};padding:10px 24px;text-align:center;"><span style="color:#ffffff;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Innovatr Insights</span></td></tr>
        <tr><td style="padding:0;line-height:0;"><img src="${heroImageUrl}" alt="Cash Is King Again" width="600" style="display:block;width:100%;max-width:600px;height:auto;" /></td></tr>
        <tr><td style="padding:32px 32px 8px;text-align:center;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${BRAND_COLOR};">Industry Insight · Financial Services</p>
          <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#0f0f11;line-height:1.25;">The "Cash Is King Again" Comeback</h1>
          <p style="margin:0;font-size:16px;color:#444;line-height:1.5;font-weight:500;">Why South Africans are taking cash back from the banks.</p>
        </td></tr>
        <tr><td style="padding:16px 32px 0;"><hr style="border:none;border-top:1px solid #eee;margin:0;" /></td></tr>
        <tr><td style="padding:24px 32px 0;">
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">Hey ${firstName},</p>
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">For a decade we were told cash is dying. Banks went mobile-first. Fintechs went wallet-crazy. Everyone acted like notes and coins were basically a museum exhibit.</p>
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">Then 2026 happened. And South Africans quietly did the opposite.</p>
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">Digital payments are still growing — but behaviour is splitting. People are reaching for cash again. Not because they hate tech. Because they hate invisible spending.</p>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f9ff;border-radius:8px;overflow:hidden;">
            <tr>
              <td width="33%" style="padding:20px 16px;text-align:center;border-right:1px solid #eaecf8;"><p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">61%</p><p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Use cash to budget</p></td>
              <td width="33%" style="padding:20px 16px;text-align:center;border-right:1px solid #eaecf8;"><p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">49%</p><p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Less control digitally</p></td>
              <td width="33%" style="padding:20px 16px;text-align:center;"><p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">73%</p><p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Digital for fixed bills</p></td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">That's not "cash-only". That's cash-on-purpose. Two big pressures are colliding: subscription creep (57% have been surprised by a debit order in the last six months) and fraud anxiety (SABRIC reported digital banking fraud losses up 74% to R1.888bn year-on-year).</p>
          <p style="margin:0;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">So consumers are doing the simplest risk hack available: use cash when it matters most. Cash creates a boundary.</p>
        </td></tr>
        <tr><td style="padding:0 32px 28px;">
          <div style="border-left:4px solid ${BRAND_COLOR};background:#f5f6ff;padding:16px 20px;border-radius:0 6px 6px 0;">
            <p style="margin:0;font-size:15px;color:#1a1a2e;line-height:1.6;font-style:italic;">"The next fintech advantage isn't more convenience. It's more control."</p>
            <p style="margin:8px 0 0;font-size:12px;color:${BRAND_COLOR};font-weight:700;letter-spacing:0.5px;">— INNOVATR TAKEAWAY</p>
          </div>
        </td></tr>
        <tr><td style="padding:0 32px 12px;text-align:center;"><a href="${portalUrl}" style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:700;font-size:15px;letter-spacing:0.3px;">Read Full Issue →</a></td></tr>
        <tr><td style="padding:12px 32px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #e0e3f7;border-radius:8px;overflow:hidden;">
            <tr><td style="padding:24px 28px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND_COLOR};">Strategic Market Report</p>
              <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:${TEXT_COLOR};line-height:1.3;">Cash Is King Again</p>
              <p style="margin:0 0 20px;font-size:13px;color:${MUTED_COLOR};line-height:1.6;">Full data, demographic analysis, spend reallocation models and brand strategy implications. Available exclusively for Innovatr members. Free members can read the full issue — downloading the report requires a paid membership.</p>
              <a href="${portalUrl}" style="display:inline-block;background-color:#f5f6ff;color:${BRAND_COLOR};text-decoration:none;padding:10px 24px;border-radius:6px;font-weight:600;font-size:14px;border:1.5px solid ${BRAND_COLOR};">Download Report</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background-color:#fafafa;border-top:1px solid #eee;padding:20px 32px;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0f0f11;">Innovatr</p>
          <p style="margin:0;font-size:12px;color:${MUTED_COLOR};line-height:1.6;">You're receiving this as an Innovatr Insights subscriber.&nbsp;&nbsp;|&nbsp;&nbsp;<a href="mailto:hannah@innovatr.co.za?subject=Unsubscribe" style="color:${MUTED_COLOR};">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const response = await resend.emails.send({
    from: `Innovatr <${fromEmail}>`,
    to: [to],
    subject: "Why South Africans Are Taking Cash Back from the Banks",
    html,
    text: `INNOVATR INSIGHTS\n\nThe "Cash Is King Again" Comeback\n\nHey ${firstName},\n\n61% use cash to budget. 49% feel less control digitally. 73% use digital for fixed bills.\n\nThe next fintech advantage isn't more convenience. It's more control.\n\nRead the full issue: ${portalUrl}`,
  });
  console.log("Financial Pulse mailer sent:", response);
  return response;
}

export async function sendBeautyPulseMailer(to: string, firstName: string = "there") {
  const resend = await getResendClient();
  const fromEmail = await getFromEmail();
  const baseUrl = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : FRONTEND_URL;
  const portalUrl = `${baseUrl}/portal/insights/township-beauty-economy`;
  const heroImageUrl = `${baseUrl}/reports/township-beauty-economy.jpg`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Township Beauty Economy | Innovatr Insights</title></head>
<body style="margin:0;padding:0;background-color:#FAF3E8;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#f4f4f5;">Informal entrepreneurs are becoming micro-brands — and retail is watching. &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF3E8;">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
        <tr><td style="background-color:${BRAND_COLOR};padding:10px 24px;text-align:center;"><span style="color:#ffffff;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Innovatr Insights</span></td></tr>
        <tr><td style="padding:0;line-height:0;"><img src="${heroImageUrl}" alt="Township Beauty Economy" width="600" style="display:block;width:100%;max-width:600px;height:auto;" /></td></tr>
        <tr><td style="padding:32px 32px 8px;text-align:center;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${BRAND_COLOR};">Industry Insight · Beauty</p>
          <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#0f0f11;line-height:1.25;">The Township Beauty Economy Is Formalising</h1>
          <p style="margin:0;font-size:16px;color:#444;line-height:1.5;font-weight:500;">Your next beauty influencer might live next door.</p>
        </td></tr>
        <tr><td style="padding:16px 32px 0;"><hr style="border:none;border-top:1px solid #eee;margin:0;" /></td></tr>
        <tr><td style="padding:24px 32px 0;">
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">Hey ${firstName},</p>
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">South Africa's beauty market isn't slowing down. It's just moving off the shelf.</p>
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">For years, beauty had two worlds: retail (Clicks, malls, counters) and informal (home salons, mobile techs, the girl with the ring light). In 2026, that "informal" world isn't underground anymore. It's formalising fast — and it's starting to look like a real distribution channel.</p>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f9ff;border-radius:8px;overflow:hidden;">
            <tr>
              <td width="33%" style="padding:20px 16px;text-align:center;border-right:1px solid #eaecf8;"><p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">42%</p><p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Buy direct from provider</p></td>
              <td width="33%" style="padding:20px 16px;text-align:center;border-right:1px solid #eaecf8;"><p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">38%</p><p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Spend outside retail</p></td>
              <td width="33%" style="padding:20px 16px;text-align:center;"><p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">59%</p><p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">TikTok influenced last buy</p></td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">Township beauty entrepreneurs are building micro-brands with four things retail can't replicate easily: proximity, proof, personalisation, and payment flexibility. And it's not just services anymore. Some are importing directly, reselling, and developing private-label products.</p>
          <p style="margin:0;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">The brands that win won't just chase shelf space — they'll build credibility inside communities where trust is already earned.</p>
        </td></tr>
        <tr><td style="padding:0 32px 28px;">
          <div style="border-left:4px solid ${BRAND_COLOR};background:#f5f6ff;padding:16px 20px;border-radius:0 6px 6px 0;">
            <p style="margin:0;font-size:15px;color:#1a1a2e;line-height:1.6;font-style:italic;">"The future of beauty isn't only in malls. It's in spare rooms with ring lights."</p>
            <p style="margin:8px 0 0;font-size:12px;color:${BRAND_COLOR};font-weight:700;letter-spacing:0.5px;">— INNOVATR TAKEAWAY</p>
          </div>
        </td></tr>
        <tr><td style="padding:0 32px 12px;text-align:center;"><a href="${portalUrl}" style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:700;font-size:15px;letter-spacing:0.3px;">Read Full Issue →</a></td></tr>
        <tr><td style="padding:12px 32px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #e0e3f7;border-radius:8px;overflow:hidden;">
            <tr><td style="padding:24px 28px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND_COLOR};">Strategic Market Report</p>
              <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:${TEXT_COLOR};line-height:1.3;">The Township Beauty Economy Is Formalising</p>
              <p style="margin:0 0 20px;font-size:13px;color:${MUTED_COLOR};line-height:1.6;">Full data, demographic analysis, spend reallocation models and brand strategy implications. Available exclusively for Innovatr members. Free members can read the full issue — downloading the report requires a paid membership.</p>
              <a href="${portalUrl}" style="display:inline-block;background-color:#f5f6ff;color:${BRAND_COLOR};text-decoration:none;padding:10px 24px;border-radius:6px;font-weight:600;font-size:14px;border:1.5px solid ${BRAND_COLOR};">Download Report</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background-color:#fafafa;border-top:1px solid #eee;padding:20px 32px;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0f0f11;">Innovatr</p>
          <p style="margin:0;font-size:12px;color:${MUTED_COLOR};line-height:1.6;">You're receiving this as an Innovatr Insights subscriber.&nbsp;&nbsp;|&nbsp;&nbsp;<a href="mailto:hannah@innovatr.co.za?subject=Unsubscribe" style="color:${MUTED_COLOR};">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const response = await resend.emails.send({
    from: `Innovatr <${fromEmail}>`,
    to: [to],
    subject: "Your Next Beauty Influencer Might Live Next Door",
    html,
    text: `INNOVATR INSIGHTS\n\nThe Township Beauty Economy Is Formalising\n\nHey ${firstName},\n\n42% buy direct from providers. 38% of township spend happens outside retail. 59% say TikTok influenced their last beauty purchase.\n\nRead the full issue: ${portalUrl}`,
  });
  console.log("Beauty Pulse mailer sent:", response);
  return response;
}

export async function sendHealthPulseMailer(to: string, firstName: string = "there") {
  const resend = await getResendClient();
  const fromEmail = await getFromEmail();
  const baseUrl = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : FRONTEND_URL;
  const portalUrl = `${baseUrl}/portal/insights/clinic-vs-clicks-vs-creator`;
  const heroImageUrl = `${baseUrl}/reports/clinic-vs-clicks-vs-creator.jpg`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Clinic vs Clicks vs Creator | Innovatr Insights</title></head>
<body style="margin:0;padding:0;background-color:#FAF3E8;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#f4f4f5;">Doctors still lead. But they're no longer alone. &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF3E8;">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
        <tr><td style="background-color:${BRAND_COLOR};padding:10px 24px;text-align:center;"><span style="color:#ffffff;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Innovatr Insights</span></td></tr>
        <tr><td style="padding:0;line-height:0;"><img src="${heroImageUrl}" alt="Clinic vs Clicks vs Creator" width="600" style="display:block;width:100%;max-width:600px;height:auto;" /></td></tr>
        <tr><td style="padding:32px 32px 8px;text-align:center;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${BRAND_COLOR};">Industry Insight · Health</p>
          <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#0f0f11;line-height:1.25;">Clinic vs Clicks vs Creator</h1>
          <p style="margin:0;font-size:16px;color:#444;line-height:1.5;font-weight:500;">Who do South Africans actually trust for health advice?</p>
        </td></tr>
        <tr><td style="padding:16px 32px 0;"><hr style="border:none;border-top:1px solid #eee;margin:0;" /></td></tr>
        <tr><td style="padding:24px 32px 0;">
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">Hey ${firstName},</p>
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">Health advice used to be simple. You got sick. You saw a doctor. You followed instructions. In 2026, that hierarchy doesn't exist anymore.</p>
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">Consumers now build their own health "panel". They Google symptoms, watch TikTok explainers, read product reviews, ask a pharmacist — and only then decide what to do next. Authority hasn't disappeared. It's fragmented.</p>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f9ff;border-radius:8px;overflow:hidden;">
            <tr>
              <td width="33%" style="padding:20px 16px;text-align:center;border-right:1px solid #eaecf8;"><p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">71%</p><p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Research online first</p></td>
              <td width="33%" style="padding:20px 16px;text-align:center;border-right:1px solid #eaecf8;"><p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">63%</p><p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Consult 2+ sources</p></td>
              <td width="33%" style="padding:20px 16px;text-align:center;"><p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">78%</p><p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Trust doctors most</p></td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">The supplement economy is accelerating this shift. South Africa's supplement market is now worth $1.06 billion and growing at nearly 10% annually. 62% of South Africans now take vitamins or supplements. 54% of under-35s have purchased a health product based on a creator recommendation.</p>
          <p style="margin:0;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">For health brands, the challenge isn't choosing a channel. It's surviving all of them at once.</p>
        </td></tr>
        <tr><td style="padding:0 32px 28px;">
          <div style="border-left:4px solid ${BRAND_COLOR};background:#f5f6ff;padding:16px 20px;border-radius:0 6px 6px 0;">
            <p style="margin:0;font-size:15px;color:#1a1a2e;line-height:1.6;font-style:italic;">"Health authority in South Africa hasn't collapsed. It's decentralised. The brands that win won't rely on one voice — they'll show up everywhere trust is being built."</p>
            <p style="margin:8px 0 0;font-size:12px;color:${BRAND_COLOR};font-weight:700;letter-spacing:0.5px;">— INNOVATR TAKEAWAY</p>
          </div>
        </td></tr>
        <tr><td style="padding:0 32px 12px;text-align:center;"><a href="${portalUrl}" style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:700;font-size:15px;letter-spacing:0.3px;">Read Full Issue →</a></td></tr>
        <tr><td style="padding:12px 32px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #e0e3f7;border-radius:8px;overflow:hidden;">
            <tr><td style="padding:24px 28px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND_COLOR};">Strategic Market Report</p>
              <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:${TEXT_COLOR};line-height:1.3;">Clinic vs Clicks vs Creator</p>
              <p style="margin:0 0 20px;font-size:13px;color:${MUTED_COLOR};line-height:1.6;">Full data, demographic analysis, spend reallocation models and brand strategy implications. Available exclusively for Innovatr members. Free members can read the full issue — downloading the report requires a paid membership.</p>
              <a href="${portalUrl}" style="display:inline-block;background-color:#f5f6ff;color:${BRAND_COLOR};text-decoration:none;padding:10px 24px;border-radius:6px;font-weight:600;font-size:14px;border:1.5px solid ${BRAND_COLOR};">Download Report</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background-color:#fafafa;border-top:1px solid #eee;padding:20px 32px;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0f0f11;">Innovatr</p>
          <p style="margin:0;font-size:12px;color:${MUTED_COLOR};line-height:1.6;">You're receiving this as an Innovatr Insights subscriber.&nbsp;&nbsp;|&nbsp;&nbsp;<a href="mailto:hannah@innovatr.co.za?subject=Unsubscribe" style="color:${MUTED_COLOR};">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const response = await resend.emails.send({
    from: `Innovatr <${fromEmail}>`,
    to: [to],
    subject: "Who Do South Africans Actually Trust for Health Advice?",
    html,
    text: `INNOVATR INSIGHTS\n\nClinic vs Clicks vs Creator\n\nHey ${firstName},\n\n71% research online before seeing a doctor. 63% consult 2+ sources. Creators are now part of the decision process.\n\nRead the full issue: ${portalUrl}`,
  });
  console.log("Health Pulse mailer sent:", response);
  return response;
}

export async function sendFoodPulseMailer(to: string, firstName: string = "there") {
  const resend = await getResendClient();
  const fromEmail = await getFromEmail();
  const baseUrl = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : FRONTEND_URL;
  const portalUrl = `${baseUrl}/portal/insights/price-memory-is-brutal`;
  const heroImageUrl = `${baseUrl}/reports/price-memory-is-brutal.jpg`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Price Memory Is Becoming Brutal | Innovatr Insights</title></head>
<body style="margin:0;padding:0;background-color:#FAF3E8;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#f4f4f5;">When prices move, consumers notice immediately. &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF3E8;">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
        <tr><td style="background-color:${BRAND_COLOR};padding:10px 24px;text-align:center;"><span style="color:#ffffff;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Innovatr Insights</span></td></tr>
        <tr><td style="padding:0;line-height:0;"><img src="${heroImageUrl}" alt="Price Memory Is Becoming Brutal" width="600" style="display:block;width:100%;max-width:600px;height:auto;" /></td></tr>
        <tr><td style="padding:32px 32px 8px;text-align:center;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${BRAND_COLOR};">Industry Insight · Food & Retail</p>
          <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#0f0f11;line-height:1.25;">Price Memory Is Becoming Brutal</h1>
          <p style="margin:0;font-size:16px;color:#444;line-height:1.5;font-weight:500;">South Africans now know exactly what things should cost.</p>
        </td></tr>
        <tr><td style="padding:16px 32px 0;"><hr style="border:none;border-top:1px solid #eee;margin:0;" /></td></tr>
        <tr><td style="padding:24px 32px 0;">
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">Hey ${firstName},</p>
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">For years, brands relied on a quiet assumption: consumers didn't really know what things cost. Prices could creep up. Pack sizes could shrink. Most shoppers felt inflation — but they didn't track it precisely.</p>
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">That assumption no longer holds. In 2026, South African consumers have developed something new: price memory. They know what bread used to cost. They know what yoghurt should cost. And when a product crosses that invisible line, it gets punished.</p>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f9ff;border-radius:8px;overflow:hidden;">
            <tr>
              <td width="33%" style="padding:20px 16px;text-align:center;border-right:1px solid #eaecf8;"><p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">68%</p><p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Compare prices actively</p></td>
              <td width="33%" style="padding:20px 16px;text-align:center;border-right:1px solid #eaecf8;"><p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">61%</p><p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Switched brand (3 months)</p></td>
              <td width="33%" style="padding:20px 16px;text-align:center;"><p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">49%</p><p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Chose smaller packs</p></td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">Price sensitivity isn't new. What's new is how precise it has become. Consumers are no longer reacting emotionally to "expensive". They're reacting to specific numbers that feel wrong — and when a price increase crosses that invisible benchmark, the brand loses a reference point in the consumer's mind.</p>
          <p style="margin:0;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">Once a shopper resets their mental benchmark around another product, winning them back becomes much harder.</p>
        </td></tr>
        <tr><td style="padding:0 32px 28px;">
          <div style="border-left:4px solid ${BRAND_COLOR};background:#f5f6ff;padding:16px 20px;border-radius:0 6px 6px 0;">
            <p style="margin:0;font-size:15px;color:#1a1a2e;line-height:1.6;font-style:italic;">"The brands that survive this shift won't compete on price alone. They'll compete on visible value — clearer quality signals, stronger justification, and smarter pricing architecture."</p>
            <p style="margin:8px 0 0;font-size:12px;color:${BRAND_COLOR};font-weight:700;letter-spacing:0.5px;">— INNOVATR TAKEAWAY</p>
          </div>
        </td></tr>
        <tr><td style="padding:0 32px 12px;text-align:center;"><a href="${portalUrl}" style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:700;font-size:15px;letter-spacing:0.3px;">Read Full Issue →</a></td></tr>
        <tr><td style="padding:12px 32px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #e0e3f7;border-radius:8px;overflow:hidden;">
            <tr><td style="padding:24px 28px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND_COLOR};">Strategic Market Report</p>
              <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:${TEXT_COLOR};line-height:1.3;">Price Memory Is Becoming Brutal</p>
              <p style="margin:0 0 20px;font-size:13px;color:${MUTED_COLOR};line-height:1.6;">Full data, demographic analysis, spend reallocation models and brand strategy implications. Available exclusively for Innovatr members. Free members can read the full issue — downloading the report requires a paid membership.</p>
              <a href="${portalUrl}" style="display:inline-block;background-color:#f5f6ff;color:${BRAND_COLOR};text-decoration:none;padding:10px 24px;border-radius:6px;font-weight:600;font-size:14px;border:1.5px solid ${BRAND_COLOR};">Download Report</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background-color:#fafafa;border-top:1px solid #eee;padding:20px 32px;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0f0f11;">Innovatr</p>
          <p style="margin:0;font-size:12px;color:${MUTED_COLOR};line-height:1.6;">You're receiving this as an Innovatr Insights subscriber.&nbsp;&nbsp;|&nbsp;&nbsp;<a href="mailto:hannah@innovatr.co.za?subject=Unsubscribe" style="color:${MUTED_COLOR};">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const response = await resend.emails.send({
    from: `Innovatr <${fromEmail}>`,
    to: [to],
    subject: "South Africans Now Know Exactly What Things Should Cost",
    html,
    text: `INNOVATR INSIGHTS\n\nPrice Memory Is Becoming Brutal\n\nHey ${firstName},\n\n68% compare prices actively. 61% have switched brands. 49% chose smaller packs to manage cash flow.\n\nRead the full issue: ${portalUrl}`,
  });
  console.log("Food Pulse mailer sent:", response);
  return response;
}

export async function sendPulseMailer(to: string, firstName: string = "there") {
  const resend = await getResendClient();
  const fromEmail = await getFromEmail();

  const baseUrl = process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : FRONTEND_URL;

  const portalUrl = `${baseUrl}/portal/insights/home-is-the-new-bar`;
  const heroImageUrl = `${baseUrl}/reports/home-is-the-new-bar.jpg`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Home Is the New Bar (Again, But Smarter) | Innovatr Insights</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF3E8;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <!-- Pre-header (preview text in inbox) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#f4f4f5;">
    South Africans Aren't Going Out Less. They're Drinking Differently. &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF3E8;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.07);">

          <!-- Top label bar -->
          <tr>
            <td style="background-color:${BRAND_COLOR};padding:10px 24px;text-align:center;">
              <span style="color:#ffffff;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Innovatr Insights</span>
            </td>
          </tr>

          <!-- Hero image -->
          <tr>
            <td style="padding:0;line-height:0;">
              <img src="${heroImageUrl}" alt="Home Is the New Bar" width="600" style="display:block;width:100%;max-width:600px;height:auto;" />
            </td>
          </tr>

          <!-- Title block -->
          <tr>
            <td style="padding:32px 32px 8px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${BRAND_COLOR};">Industry Insight · Beverages</p>
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#0f0f11;line-height:1.25;">Home Is the New Bar (Again, But Smarter)</h1>
              <p style="margin:0;font-size:16px;color:#444;line-height:1.5;font-weight:500;">South Africans aren't going out less. They're drinking differently.</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:16px 32px 0;"><hr style="border:none;border-top:1px solid #eee;margin:0;" /></td></tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 32px 0;">
              <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">Hey ${firstName},</p>
              <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">For years, alcohol culture revolved around going out — bars, restaurants, events, social occasions built around venues.</p>
              <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">But over the past few years, that behaviour has shifted. South Africans are still socialising. They're still drinking. But increasingly, they're doing it at home.</p>
              <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">What started as a necessity during pandemic restrictions has quietly evolved into a lasting habit — one that is reshaping how alcohol brands are consumed and what it means to win an occasion.</p>
            </td>
          </tr>

          <!-- Stats strip -->
          <tr>
            <td style="padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f9ff;border-radius:8px;overflow:hidden;">
                <tr>
                  <td width="33%" style="padding:20px 16px;text-align:center;border-right:1px solid #eaecf8;">
                    <p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">72%</p>
                    <p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Occasions at home</p>
                  </td>
                  <td width="33%" style="padding:20px 16px;text-align:center;border-right:1px solid #eaecf8;">
                    <p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">58%</p>
                    <p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Go out less often</p>
                  </td>
                  <td width="33%" style="padding:20px 16px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">47%</p>
                    <p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Host monthly</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- More body -->
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">Frequency may be moderating. But the quality of the occasion is increasing. Consumers are actively upgrading the at-home experience — better glassware, better mixers, ice moulds, cocktail kits, carefully curated drinks selections.</p>
              <p style="margin:0;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">For many brands, the mental model of drinking occasions still centres on venues. But when occasions move home, the role of the product changes. At a bar, the venue curates the experience. At home, the product becomes the experience.</p>
            </td>
          </tr>

          <!-- Callout -->
          <tr>
            <td style="padding:0 32px 28px;">
              <div style="border-left:4px solid ${BRAND_COLOR};background:#f5f6ff;padding:16px 20px;border-radius:0 6px 6px 0;">
                <p style="margin:0;font-size:15px;color:#1a1a2e;line-height:1.6;font-style:italic;">"Brands that equip the host — not just the drinker — gain relevance. The real growth sits inside the occasion."</p>
                <p style="margin:8px 0 0;font-size:12px;color:${BRAND_COLOR};font-weight:700;letter-spacing:0.5px;">— INNOVATR TAKEAWAY</p>
              </div>
            </td>
          </tr>

          <!-- Primary CTA -->
          <tr>
            <td style="padding:0 32px 12px;text-align:center;">
              <a href="${portalUrl}" style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:700;font-size:15px;letter-spacing:0.3px;">Read Full Issue →</a>
            </td>
          </tr>

          <!-- Download report card -->
          <tr>
            <td style="padding:12px 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #e0e3f7;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:24px 28px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND_COLOR};">Strategic Market Report</p>
                    <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:${TEXT_COLOR};line-height:1.3;">Home Is the New Bar (Again, But Smarter)</p>
                    <p style="margin:0 0 20px;font-size:13px;color:${MUTED_COLOR};line-height:1.6;">Full data, demographic analysis, spend reallocation models and brand strategy implications. Available exclusively for Innovatr members. Free members can read the full issue — downloading the report requires a paid membership.</p>
                    <a href="${portalUrl}" style="display:inline-block;background-color:#f5f6ff;color:${BRAND_COLOR};text-decoration:none;padding:10px 24px;border-radius:6px;font-weight:600;font-size:14px;border:1.5px solid ${BRAND_COLOR};">Download Report</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa;border-top:1px solid #eee;padding:20px 32px;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0f0f11;">Innovatr</p>
              <p style="margin:0;font-size:12px;color:${MUTED_COLOR};line-height:1.6;">
                You're receiving this as an Innovatr Insights subscriber.&nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="mailto:hannah@innovatr.co.za?subject=Unsubscribe" style="color:${MUTED_COLOR};">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `INNOVATR INSIGHTS

Home Is the New Bar (Again, But Smarter)
South Africans Aren't Going Out Less. They're Drinking Differently.

Hey ${firstName},

For years, alcohol culture revolved around going out — bars, restaurants, events, social occasions built around venues.

But over the past few years, that behaviour has shifted. South Africans are still socialising. They're still drinking. But increasingly, they're doing it at home.

72% of alcohol occasions now happen at home. 58% go out less often. 47% host at home monthly.

Brands that equip the host — not just the drinker — gain relevance. The real growth sits inside the occasion.

Read the full issue and download the strategic report:
${portalUrl}

---
You're receiving this as an Innovatr Insights subscriber. To unsubscribe reply to this email.`;

  const response = await resend.emails.send({
    from: `Innovatr <${fromEmail}>`,
    to: [to],
    subject: "Home Is the New Bar (Again, But Smarter)",
    html,
    text,
  });

  console.log("Pulse mailer sent:", response);
  return response;
}

export async function sendPredictiveModellingMailer(to: string, firstName: string = "there") {
  const resend = await getResendClient();
  const fromEmail = await getFromEmail();
  const baseUrl = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : FRONTEND_URL;
  const portalUrl = `${baseUrl}/portal/insights`;
  const heroImageUrl = `${baseUrl}/reports/predictive-modelling.jpg`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Predictive Modelling Behaviour | Innovatr Insights</title></head>
<body style="margin:0;padding:0;background-color:#FAF3E8;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#f4f4f5;">The signals were there. Brands that read them acted first. &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF3E8;">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.07);">

        <tr><td style="background-color:${BRAND_COLOR};padding:10px 24px;text-align:center;"><span style="color:#ffffff;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Innovatr Insights</span></td></tr>

        <tr><td style="padding:0;line-height:0;"><img src="${heroImageUrl}" alt="Predictive Modelling Behaviour" width="600" style="display:block;width:100%;max-width:600px;height:auto;" /></td></tr>

        <tr><td style="padding:32px 32px 8px;text-align:center;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${BRAND_COLOR};">Innovatr Research · Methodology Series</p>
          <p style="margin:0;font-size:16px;color:#444;line-height:1.5;font-weight:500;">How Innovatr reads the signals before consumers switch — and what your brand can do with that lead time.</p>
        </td></tr>

        <tr><td style="padding:16px 32px 0;"><hr style="border:none;border-top:1px solid #eee;margin:0;" /></td></tr>

        <tr><td style="padding:24px 32px 0;">
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">Hey ${firstName},</p>
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">Most brands find out a consumer switched after it happened. The quarterly tracker comes back. The sales data tells you. By then, you've lost the window.</p>
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">Innovatr's predictive modelling work starts from a different question: what are consumers doing in the weeks <em>before</em> they change behaviour? Not what they've done. What they're about to do.</p>
          <p style="margin:0;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">The answer is: a lot. And it's now detectable.</p>
        </td></tr>

        <tr><td style="padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f9ff;border-radius:8px;overflow:hidden;">
            <tr>
              <td width="33%" style="padding:20px 16px;text-align:center;border-right:1px solid #eaecf8;"><p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">67%</p><p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Purchase decisions<br>modelable 4–6 weeks out</p></td>
              <td width="33%" style="padding:20px 16px;text-align:center;border-right:1px solid #eaecf8;"><p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">3.2x</p><p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Better conversion when<br>timed to intent windows</p></td>
              <td width="33%" style="padding:20px 16px;text-align:center;"><p style="margin:0 0 4px;font-size:28px;font-weight:800;color:${BRAND_COLOR};">41%</p><p style="margin:0;font-size:11px;color:${MUTED_COLOR};text-transform:uppercase;letter-spacing:0.5px;">Brand switchers show<br>detectable signals first</p></td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 32px 24px;">
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;"><strong>What the signals look like</strong></p>
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">Across Innovatr's research panels, category switchers consistently exhibit three pre-switch patterns: they begin comparing (but haven't acted yet), they shift how they describe the category in qualitative responses, and they start engaging with adjacent brand content without consciously seeking alternatives.</p>
          <p style="margin:0 0 16px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">None of these signals is decisive on its own. Together, they create a composite score we call the <strong>Intent Velocity Index</strong> — a leading indicator of who is about to move, and in which direction.</p>
          <p style="margin:0;font-size:15px;color:${TEXT_COLOR};line-height:1.75;">When Intent Velocity accelerates for a segment, brands that intervene in that 4–6 week window — with the right message and the right offer — recover 3 times more of those at-risk consumers than brands that wait for the quarterly report.</p>
        </td></tr>

        <tr><td style="padding:0 32px 24px;">
          <p style="margin:0 0 14px;font-size:15px;color:${TEXT_COLOR};line-height:1.75;"><strong>The categories where this matters most right now</strong></p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:10px 16px;background:#f0f1fe;border-radius:6px;margin-bottom:8px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:13px;font-weight:700;color:${BRAND_COLOR};width:140px;vertical-align:top;padding:0 12px 0 0;">Financial services</td>
                    <td style="font-size:13px;color:${TEXT_COLOR};line-height:1.5;">Banking app abandonment, credit provider switching, and savings product disengagement — all showing elevated pre-switch activity right now.</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr><td style="height:6px;"></td></tr>
            <tr>
              <td style="padding:10px 16px;background:#f0f1fe;border-radius:6px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:13px;font-weight:700;color:${BRAND_COLOR};width:140px;vertical-align:top;padding:0 12px 0 0;">FMCG &amp; food</td>
                    <td style="font-size:13px;color:${TEXT_COLOR};line-height:1.5;">Private label migration continuing. Brands with strong loyalty programmes are seeing Intent Velocity slow — but only where they've invested in visible value.</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr><td style="height:6px;"></td></tr>
            <tr>
              <td style="padding:10px 16px;background:#f0f1fe;border-radius:6px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-size:13px;font-weight:700;color:${BRAND_COLOR};width:140px;vertical-align:top;padding:0 12px 0 0;">Health &amp; wellness</td>
                    <td style="font-size:13px;color:${TEXT_COLOR};line-height:1.5;">Supplement category showing unusually high intent velocity — driven by creator influence and price comparison behaviour, not dissatisfaction.</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 32px 28px;">
          <div style="border-left:4px solid ${BRAND_COLOR};background:#f5f6ff;padding:16px 20px;border-radius:0 6px 6px 0;">
            <p style="margin:0;font-size:15px;color:#1a1a2e;line-height:1.6;font-style:italic;">"Predictive modelling isn't about being clever with data. It's about giving your team enough lead time to actually do something about what's coming."</p>
            <p style="margin:8px 0 0;font-size:12px;color:${BRAND_COLOR};font-weight:700;letter-spacing:0.5px;">— INNOVATR RESEARCH TEAM</p>
          </div>
        </td></tr>

        <tr><td style="padding:0 32px 12px;text-align:center;"><a href="${portalUrl}" style="display:inline-block;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:700;font-size:15px;letter-spacing:0.3px;">Explore Full Intelligence →</a></td></tr>

        <tr><td style="padding:12px 32px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #e0e3f7;border-radius:8px;overflow:hidden;">
            <tr><td style="padding:24px 28px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${BRAND_COLOR};">Want This For Your Category?</p>
              <p style="margin:0 0 12px;font-size:16px;font-weight:700;color:${TEXT_COLOR};line-height:1.3;">Commission a Predictive Modelling Study</p>
              <p style="margin:0 0 20px;font-size:13px;color:${MUTED_COLOR};line-height:1.6;">Innovatr runs bespoke predictive research for brands who want to see where their category is moving — before the market does. Category-specific Intent Velocity modelling is available to Innovatr members as a commissioned study. Get in touch to discuss your category.</p>
              <a href="mailto:hannah@innovatr.co.za?subject=Predictive Modelling Study Enquiry" style="display:inline-block;background-color:#f5f6ff;color:${BRAND_COLOR};text-decoration:none;padding:10px 24px;border-radius:6px;font-weight:600;font-size:14px;border:1.5px solid ${BRAND_COLOR};">Enquire Now</a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="background-color:#fafafa;border-top:1px solid #eee;padding:20px 32px;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0f0f11;">Innovatr</p>
          <p style="margin:0;font-size:12px;color:${MUTED_COLOR};line-height:1.6;">You're receiving this as an Innovatr Insights subscriber.&nbsp;&nbsp;|&nbsp;&nbsp;<a href="mailto:hannah@innovatr.co.za?subject=Unsubscribe" style="color:${MUTED_COLOR};">Unsubscribe</a></p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;

  const response = await resend.emails.send({
    from: `Innovatr <${fromEmail}>`,
    to: [to],
    subject: "The Signals Were There. Did Your Brand See Them?",
    html,
    text: `INNOVATR INSIGHTS\n\nPredictive Modelling Behaviour\n\nHey ${firstName},\n\n67% of purchase decisions in studied categories can be modelled 4–6 weeks before they happen. 41% of brand switchers show detectable signals before they act. Brands that respond in that window convert 3.2x better.\n\nExplore full intelligence: ${portalUrl}`,
  });
  console.log("Predictive Modelling mailer sent:", response);
  return response;
}

export { FRONTEND_URL };
