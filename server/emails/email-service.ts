import { Resend } from "resend";

let connectionSettings: any;

const FRONTEND_URL = process.env.FRONTEND_URL || "https://www.innovatr.co.za";
const BRAND_COLOR = "#5865F2";
const TEXT_COLOR = "#1a1a1a";
const MUTED_COLOR = "#666666";
const FOOTER_COLOR = "#888888";

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
         style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
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
  <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
            <tr>
              <td style="padding: 40px;">
                <h1 style="margin: 0 0 30px 0; font-size: 24px; font-weight: 700; color: ${TEXT_COLOR};">
                  ${escapeHtml(title)}
                </h1>
                
                <p style="font-size: 16px; color: ${TEXT_COLOR}; margin: 0 0 20px 0;">
                  ${greeting}
                </p>
                
                <div style="font-size: 16px; color: ${TEXT_COLOR}; line-height: 1.6;">
                  ${bodyHtml}
                </div>
                
                ${buttonHtml}
                ${footerNoteHtml}
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 40px 10px 40px;">
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: ${TEXT_COLOR};">
                  Innovatr
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f9f9f9; padding: 30px 40px; border-top: 1px solid #eeeeee;">
                <p style="margin: 0 0 10px 0; font-size: 12px; color: ${FOOTER_COLOR};">
                  This is an automated message from Innovatr.
                </p>
                <p style="margin: 0 0 10px 0; font-size: 12px; color: ${FOOTER_COLOR};">
                  If you have any questions, contact us at <a href="mailto:hannah@innovatr.co.za" style="color: ${BRAND_COLOR}; text-decoration: none;">hannah@innovatr.co.za</a> or <a href="mailto:richard@innovatr.co.za" style="color: ${BRAND_COLOR}; text-decoration: none;">richard@innovatr.co.za</a>.
                </p>
                <p style="margin: 0; font-size: 12px; color: ${FOOTER_COLOR};">
                  &copy; 2024 Innovatr. All rights reserved.
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

    case "EMAIL_VERIFICATION": {
      const bodyHtml = `
        <p style="margin: 0 0 15px 0;">Please confirm your email address to complete your Innovatr account setup.</p>
      `;
      const footerNote = "This link will expire in 1 hour.\n\nIf you did not sign up for Innovatr, you can safely ignore this email.";
      
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
        subject: "Verify Your Innovatr Account",
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
        <p style="margin: 0 0 15px 0;">Good news, your audience is officially live.</p>
        <p style="margin: 0 0 15px 0;">We are now collecting real consumer data. Your full insights report will be ready within 24 hours.</p>
        <p style="margin: 0 0 15px 0;">You can track your project status anytime in your My Research portal.</p>
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
        subject: "Your Test24 Audience Is Live",
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
        <p style="margin: 0 0 15px 0;">You will receive fresh insights, trends, and real data from South African markets, all crafted to help you build what people actually want.</p>
        <p style="margin: 0 0 15px 0;">You can unsubscribe anytime by clicking the link in any email.</p>
      `;
      
      const options: BaseEmailOptions = {
        title: "Welcome to Innovatr Intelligence",
        greetingName: data.firstName,
        bodyHtml,
        showButton: false,
      };
      
      return {
        subject: "You Are Now Subscribed to Innovatr Mailers",
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
        subject: "You Have Been Unsubscribed",
        html: renderBaseEmail(options),
        text: renderBaseEmailText(options),
      };
    }

    case "CREDITS_ADDED": {
      const creditsLink = `${FRONTEND_URL}/portal/credits`;
      const basicCredits = data.basicCredits ?? 0;
      const proCredits = data.proCredits ?? 0;
      
      const bodyHtml = `
        <p style="margin: 0 0 15px 0;">Your Innovatr research credits have been updated.</p>
        <p style="margin: 0 0 15px 0;"><strong>Available now:</strong></p>
        <ul style="margin: 0 0 15px 20px; padding: 0;">
          <li style="margin: 5px 0;">Test24 Basic Credits: <strong>${basicCredits}</strong></li>
          <li style="margin: 5px 0;">Test24 Pro Credits: <strong>${proCredits}</strong></li>
        </ul>
        <p style="margin: 0 0 15px 0;">These are now ready to use in your portal.</p>
      `;
      
      const options: BaseEmailOptions = {
        title: "Credits Added Successfully",
        greetingName: data.firstName,
        bodyHtml,
        buttonLabel: "View Credits",
        buttonUrl: creditsLink,
        showButton: true,
      };
      
      return {
        subject: "Your Innovatr Credits Have Been Updated",
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
        <p style="margin: 0 0 15px 0;">You can top up anytime in your portal under Credits & Billing.</p>
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
        subject: "You Are Running Low on Research Credits",
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
        <p style="margin: 0 0 15px 0;">You can track your orders anytime in Credits & Billing.</p>
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
        subject: "Your Innovatr Order Has Been Confirmed",
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
        subject: "Your Innovatr Invoice Is Ready",
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
        (item) => `<li>${escapeHtml(item.description || item.type || 'Item')} - Qty: ${item.quantity}</li>`
      ).join("") || '';
      
      const bodyHtml = `
        <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px; margin: 15px 0; color: #856404;">
          <strong>Payment Pending:</strong> This is an invoice request. Credits will NOT be activated until payment is confirmed.
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> <code style="background-color: #e9ecef; padding: 2px 6px; border-radius: 3px;">${escapeHtml(data.orderId || '')}</code></p>
          <p style="margin: 5px 0;"><strong>Customer Name:</strong> ${escapeHtml(data.customerName || '')}</p>
          <p style="margin: 5px 0;"><strong>Customer Email:</strong> ${escapeHtml(data.customerEmail || '')}</p>
          <p style="margin: 5px 0;"><strong>Company:</strong> ${escapeHtml(data.customerCompany || '')}</p>
          <p style="margin: 5px 0;"><strong>Credit Pack:</strong> ${escapeHtml(data.packDescription || '')}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> <strong>${escapeHtml(data.amount || '')}</strong></p>
        </div>
        <p style="margin: 15px 0 10px 0;"><strong>Order Items:</strong></p>
        <ul style="margin: 0 0 15px 20px; padding: 0;">${itemsHtml}</ul>
        <p style="margin: 0; font-style: italic; color: ${MUTED_COLOR};">Please prepare an invoice for this customer and follow up for payment. Once paid, mark the order as "paid" to activate the credits.</p>
      `;
      
      const options: BaseEmailOptions = {
        title: "New Invoice Request from Member Portal",
        bodyHtml,
        showButton: false,
      };
      
      return {
        subject: `Invoice Request: ${data.customerCompany || 'Company'} - ${data.packDescription || 'Credit Pack'}`,
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
      
      // Convert relative file URLs to absolute URLs
      const getAbsoluteFileUrl = (url: string) => {
        if (url.startsWith("http://") || url.startsWith("https://")) {
          return url;
        }
        // Use the app's base URL for relative paths
        const baseUrl = process.env.REPLIT_DEV_DOMAIN 
          ? `https://${process.env.REPLIT_DEV_DOMAIN}`
          : FRONTEND_URL;
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

export { FRONTEND_URL };
