export interface EmailProvider {
  send(to: string, subject: string, html: string): Promise<void>;
}

class ResendEmailProvider implements EmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        from: "ModaScope <digest@modascope.com>",
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send email: ${error}`);
    }
  }
}

class ConsoleEmailProvider implements EmailProvider {
  async send(to: string, subject: string, html: string): Promise<void> {
    console.log(`[EMAIL] To: ${to}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Body: ${html.substring(0, 200)}...`);
  }
}

let emailProvider: EmailProvider;

export function initEmailProvider(): EmailProvider {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (apiKey) {
    emailProvider = new ResendEmailProvider(apiKey);
    console.log("Email provider: Resend");
  } else {
    emailProvider = new ConsoleEmailProvider();
    console.log("Email provider: Console (no RESEND_API_KEY configured)");
  }

  return emailProvider;
}

export function getEmailProvider(): EmailProvider {
  if (!emailProvider) {
    return initEmailProvider();
  }
  return emailProvider;
}

export function buildDigestEmailHtml(news: Array<{
  brand: string;
  title: string;
  summary: string;
  whyItMatters: string;
  image: string;
}>): string {
  const itemsHtml = news.map(item => `
    <tr>
      <td style="padding: 20px; border-bottom: 1px solid #333;">
        <img src="${item.image}" alt="${item.brand}" style="width: 100%; max-width: 400px; height: auto; display: block; margin-bottom: 12px;" />
        <p style="color: #C9A962; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">${item.brand}</p>
        <h3 style="color: #F5F0E8; font-size: 18px; margin: 0 0 8px 0; font-family: Georgia, serif;">${item.title}</h3>
        <p style="color: #F5F0E8; font-size: 14px; margin: 0 0 12px 0; line-height: 1.5; opacity: 0.7;">${item.summary}</p>
        <p style="color: #C9A962; font-size: 13px; margin: 0;"><strong>Why it matters:</strong> ${item.whyItMatters}</p>
      </td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #0A0A0A; border: 1px solid #333;">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 20px; text-align: center; border-bottom: 1px solid #333;">
              <div style="width: 40px; height: 40px; border: 1px solid #C9A962; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                <span style="color: #C9A962; font-size: 20px; font-family: Georgia, serif;">M</span>
              </div>
              <h1 style="color: #F5F0E8; font-size: 24px; margin: 0; font-family: Georgia, serif;">ModaScope</h1>
              <p style="color: #F5F0E8; font-size: 14px; margin: 8px 0 0 0; opacity: 0.6;">Your Daily Fashion Digest</p>
            </td>
          </tr>
          
          <!-- Date -->
          <tr>
            <td style="padding: 20px; text-align: center; border-bottom: 1px solid #333;">
              <p style="color: #C9A962; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
                ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </td>
          </tr>
          
          <!-- News Items -->
          ${itemsHtml}
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 20px; text-align: center; border-top: 1px solid #333;">
              <p style="color: #F5F0E8; font-size: 13px; margin: 0 0 8px 0; opacity: 0.5;">
                Powered by ModaScope — Your finger on the pulse of fashion
              </p>
              <p style="color: #C9A962; font-size: 12px; margin: 0;">
                <a href="#" style="color: #C9A962; text-decoration: none;">Manage Preferences</a> · 
                <a href="#" style="color: #C9A962; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
