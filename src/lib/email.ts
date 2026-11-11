// Provider-agnostic e-mail sending. Server only.
// SMTP (nodemailer) when SMTP_HOST is set; otherwise the message is only logged:
//   - production: subject + masked recipient (never the body, codes or links),
//   - development: the full plain-text body, so reset/verify flows can be tested locally.
// Never throws and never waits on SMTP for more than SEND_TIMEOUT_MS.
import type { Transporter } from "nodemailer";

export const DEFAULT_FROM = "Poskoo <hello@poskoo.com>";
export const SEND_TIMEOUT_MS = 10_000;

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** Short label for logs, e.g. "password_reset". */
  tag?: string;
};

export type SendResult = { ok: true; via: "smtp" | "log" } | { ok: false; error: string };

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST?.trim());
}

/** "jane@example.com" -> "ja***@example.com" (logs only). */
export function maskAddress(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 2)}***@${domain}`;
}

declare global {
  var __poskooMailer: Transporter | undefined;
}

async function transporter(): Promise<Transporter> {
  if (globalThis.__poskooMailer) return globalThis.__poskooMailer;
  const nodemailer = (await import("nodemailer")).default;
  const port = Number(process.env.SMTP_PORT || 465);
  const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure = secureEnv ? secureEnv === "true" || secureEnv === "1" : port === 465;
  const user = process.env.SMTP_USER?.trim();
  globalThis.__poskooMailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST!.trim(),
    port,
    secure,
    auth: user ? { user, pass: process.env.SMTP_PASS ?? "" } : undefined,
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 10_000,
  });
  return globalThis.__poskooMailer;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

export async function sendEmail(msg: EmailMessage): Promise<SendResult> {
  const tag = msg.tag ?? "email";
  if (!msg.to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg.to)) return { ok: false, error: "invalid recipient" };
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === "production") {
      console.info(`[email:${tag}] not sent (SMTP not configured): "${msg.subject}" -> ${maskAddress(msg.to)}`);
    } else {
      console.info(`\n[email:${tag}] (dev, SMTP not configured, not sent)\nTo: ${msg.to}\nSubject: ${msg.subject}\n\n${msg.text}\n[/email]\n`);
    }
    return { ok: true, via: "log" };
  }
  try {
    const t = await transporter();
    await withTimeout(
      t.sendMail({
        from: process.env.EMAIL_FROM?.trim() || DEFAULT_FROM,
        to: msg.to,
        replyTo: msg.replyTo ?? (process.env.EMAIL_REPLY_TO?.trim() || undefined),
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      }),
      SEND_TIMEOUT_MS,
    );
    return { ok: true, via: "smtp" };
  } catch (err) {
    const error = err instanceof Error ? err.message.slice(0, 160) : "unknown error";
    console.error(`[email:${tag}] send failed -> ${maskAddress(msg.to)}: ${error}`);
    return { ok: false, error };
  }
}
