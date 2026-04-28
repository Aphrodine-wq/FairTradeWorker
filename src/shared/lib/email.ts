import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM_EMAIL || "FairTradeWorker <noreply@fairtradeworker.com>";
const TO_INTERNAL = process.env.CONTACT_INBOX_EMAIL || "hello@fairtradeworker.com";

const resend = apiKey ? new Resend(apiKey) : null;

type SendResult = { ok: true } | { ok: false; error: string };

async function send(opts: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — email not sent:", opts.subject);
    return { ok: false, error: "Email service not configured" };
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    if (error) {
      console.error("[email] send failed:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] send threw:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Send failed" };
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function sendContactNotification(input: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<SendResult> {
  const subject = input.subject?.trim() || "New contact form submission";
  const html = `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h2 style="margin: 0 0 16px; color: #0F1419;">New contact form submission</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #6B7280; width: 100px;">From</td><td style="padding: 8px 0; color: #0F1419;">${escape(input.name)} &lt;${escape(input.email)}&gt;</td></tr>
        <tr><td style="padding: 8px 0; color: #6B7280;">Subject</td><td style="padding: 8px 0; color: #0F1419;">${escape(subject)}</td></tr>
      </table>
      <div style="margin-top: 16px; padding: 16px; background: #F7F8FA; border-left: 3px solid #059669; white-space: pre-wrap; color: #0F1419;">${escape(input.message)}</div>
      <p style="margin-top: 24px; color: #6B7280; font-size: 12px;">Reply directly to this email to respond.</p>
    </div>
  `.trim();
  return send({
    to: TO_INTERNAL,
    subject: `[Contact] ${subject}`,
    html,
    replyTo: input.email,
  });
}

export function sendContactReceipt(input: { name: string; email: string }): Promise<SendResult> {
  const html = `
    <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h2 style="margin: 0 0 16px; color: #0F1419;">We got your message</h2>
      <p style="color: #0F1419; line-height: 1.6;">Hi ${escape(input.name)},</p>
      <p style="color: #0F1419; line-height: 1.6;">Thanks for reaching out to FairTradeWorker. Someone on our team will get back to you within one business day.</p>
      <p style="color: #6B7280; line-height: 1.6; margin-top: 24px; font-size: 14px;">— The FairTradeWorker Team</p>
    </div>
  `.trim();
  return send({
    to: input.email,
    subject: "We got your message",
    html,
  });
}

export const isEmailConfigured = (): boolean => resend !== null;
