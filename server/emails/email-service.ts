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
      from: fromEmail,
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
