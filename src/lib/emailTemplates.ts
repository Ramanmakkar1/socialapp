// On-brand transactional e-mail templates (pure: no DB, no Next imports, unit tested).
// Table layout + inline styles for Gmail / Outlook / Apple Mail; a <style> block only adds
// dark-mode and small-screen refinements. Every template returns HTML AND a plain-text part.
import { BRAND } from "@/lib/brand";

export type RenderedEmail = { subject: string; preheader: string; html: string; text: string };

// Palette: src/app/globals.css (--poskoo-*).
const C = {
  paper: "#fffcf6",
  card: "#ffffff",
  ink: "#1e1631",
  ink2: "#3d3450",
  muted: "#5f5873",
  line: "#ece6da",
  lime: "#ddf46b",
  violet: "#6b4eff",
  coral: "#ff6a3d",
  band: "#f3eeff",
  lilac: "#cdbdf6",
  peach: "#ffcf96",
  mint: "#bdebd2",
  pink: "#f6b6da",
  red: "#e5484d",
};
const FONT = "'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function siteUrl(): string {
  return BRAND.url;
}
function asset(name: string): string {
  return `${siteUrl()}/email/${name}`;
}
export function absoluteUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${siteUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
}

// ---- Building blocks (HTML) -------------------------------------------------------------

type Art = { file: string; width: number; height: number; bg: string };
const ART = {
  welcome: { file: "welcome.png", width: 420, height: 280, bg: C.lilac },
  verify: { file: "verify.png", width: 240, height: 213, bg: C.mint },
  security: { file: "security.png", width: 240, height: 235, bg: C.peach },
  device: { file: "device.png", width: 360, height: 240, bg: C.lilac },
  referral: { file: "referral.png", width: 156, height: 240, bg: C.pink },
  order: { file: "order.png", width: 240, height: 240, bg: C.lime },
  receipt: { file: "receipt.png", width: 240, height: 234, bg: C.mint },
  postFailed: { file: "post-failed.png", width: 240, height: 224, bg: C.peach },
} satisfies Record<string, Art>;

function artBand(art: Art): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
<tr><td align="center" bgcolor="${art.bg}" style="background-color:${art.bg};border-radius:20px;padding:18px 12px 6px;">
<img src="${asset(art.file)}" width="${art.width}" height="${art.height}" alt="" style="display:block;width:${art.width}px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;">
</td></tr></table>`;
}

function h1(text: string): string {
  return `<h1 class="pk-ink" style="margin:28px 0 0;font-family:${FONT};font-size:30px;line-height:1.1;font-weight:700;letter-spacing:-0.8px;color:${C.ink};">${text}</h1>`;
}

function p(html: string, opts: { muted?: boolean; size?: number; top?: number } = {}): string {
  const color = opts.muted ? C.muted : C.ink2;
  return `<p class="${opts.muted ? "pk-muted" : "pk-ink2"}" style="margin:${opts.top ?? 14}px 0 0;font-family:${FONT};font-size:${opts.size ?? 16}px;line-height:1.6;color:${color};">${html}</p>`;
}

/** Pill button (bulletproof: padded <a> inside a coloured cell; VML not needed for a solid pill). */
function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 0;border-collapse:separate;">
<tr><td class="pk-btn" align="center" bgcolor="${C.ink}" style="background-color:${C.ink};border-radius:999px;">
<a class="pk-btn-a" href="${esc(href)}" target="_blank" style="display:inline-block;padding:15px 30px;font-family:${FONT};font-size:16px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;border-radius:999px;">${esc(label)}&nbsp;&rarr;</a>
</td></tr></table>`;
}

/** The 6-digit code, big and spaced, on a lime tile (never transparent: readable in dark mode). */
function codeBox(code: string, caption: string): string {
  const digits = esc(code);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;border-collapse:separate;">
<tr><td align="center" bgcolor="${C.lime}" style="background-color:${C.lime};border:1.5px solid ${C.ink};border-radius:18px;padding:16px 26px;">
<div class="pk-code" style="font-family:'SFMono-Regular',Menlo,Consolas,'Courier New',monospace;font-size:36px;line-height:1;font-weight:700;letter-spacing:12px;white-space:nowrap;color:${C.ink};margin-right:-12px;">${digits}</div>
</td></tr></table>
${p(esc(caption), { muted: true, size: 14, top: 10 })}`;
}

function steps(items: { icon: string; title: string; body: string; bg: string }[]): string {
  const rows = items
    .map(
      (s, i) => `<tr><td valign="top" width="52" style="padding:${i === 0 ? 0 : 14}px 14px 0 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" valign="middle" width="44" height="44" bgcolor="${s.bg}" style="width:44px;height:44px;background-color:${s.bg};border:1.5px solid ${C.ink};border-radius:14px;font-size:20px;line-height:44px;">${s.icon}</td></tr></table>
</td><td valign="top" style="padding:${i === 0 ? 0 : 14}px 0 0;">
<div class="pk-ink" style="font-family:${FONT};font-size:16px;font-weight:700;line-height:1.35;color:${C.ink};">${i + 1}. ${esc(s.title)}</div>
<div class="pk-muted" style="font-family:${FONT};font-size:14px;line-height:1.5;color:${C.muted};margin-top:2px;">${esc(s.body)}</div>
</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;">${rows}</table>`;
}

function details(rows: [string, string][]): string {
  const body = rows
    .map(
      ([k, v], i) => `<tr>
<td class="pk-muted" style="padding:10px 0;${i ? `border-top:1px solid ${C.line};` : ""}font-family:${FONT};font-size:14px;color:${C.muted};">${esc(k)}</td>
<td class="pk-ink" align="right" style="padding:10px 0;${i ? `border-top:1px solid ${C.line};` : ""}font-family:${FONT};font-size:14px;font-weight:600;color:${C.ink};word-break:break-word;">${esc(v)}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.paper}" class="pk-panel" style="margin:22px 0 0;background-color:${C.paper};border:1.5px solid ${C.line};border-radius:16px;border-collapse:separate;">
<tr><td style="padding:6px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${body}</table></td></tr></table>`;
}

function note(html: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 0;border-collapse:separate;">
<tr><td class="pk-panel pk-muted" bgcolor="${C.band}" style="background-color:${C.band};border-radius:16px;padding:14px 18px;font-family:${FONT};font-size:14px;line-height:1.55;color:${C.muted};">${html}</td></tr></table>`;
}

function fallbackLink(href: string): string {
  return p(`Button not working? Paste this link into your browser:<br><a href="${esc(href)}" style="color:${C.violet};word-break:break-all;">${esc(href)}</a>`, { muted: true, size: 13, top: 18 });
}

function postalLine(): string {
  const addr = process.env.EMAIL_POSTAL_ADDRESS?.trim();
  return addr ? `${BRAND.company} &middot; ${esc(addr)}` : esc(BRAND.company);
}

function layout(opts: { subject: string; preheader: string; art: Art; body: string; footerNote?: string; unsubscribeUrl?: string }): string {
  const pad = "&#8199;&#65279;&#847; ".repeat(40);
  const unsub = opts.unsubscribeUrl
    ? ` &middot; <a href="${esc(opts.unsubscribeUrl)}" style="color:${C.muted};text-decoration:underline;">Unsubscribe</a>`
    : "";
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(opts.subject)}</title>
<!--[if !mso]><!--><link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&display=swap" rel="stylesheet"><!--<![endif]-->
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><style>td,th,div,p,a,h1{font-family:'Segoe UI',Arial,sans-serif !important;}</style><![endif]-->
<style>
:root{color-scheme:light dark;supported-color-schemes:light dark;}
body{margin:0;padding:0;width:100% !important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
img{-ms-interpolation-mode:bicubic;}
a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;}
@media only screen and (max-width:600px){
  .pk-card-pad{padding:24px 20px 28px !important;}
  .pk-outer{padding:20px 12px !important;}
  .pk-code{font-size:30px !important;letter-spacing:8px !important;margin-right:-8px !important;}
}
@media (prefers-color-scheme:dark){
  .pk-bg{background-color:#15101f !important;}
  .pk-card{background-color:#1f1830 !important;border-color:#352c4a !important;}
  .pk-panel{background-color:#2a2140 !important;border-color:#3b3155 !important;}
  .pk-ink,.pk-brand{color:#f7f3ff !important;}
  .pk-ink2{color:#e4def2 !important;}
  .pk-muted{color:#bdb4d3 !important;}
  .pk-btn{background-color:${C.lime} !important;}
  .pk-btn-a{color:${C.ink} !important;}
}
[data-ogsc] .pk-ink,[data-ogsc] .pk-brand{color:#f7f3ff !important;}
[data-ogsc] .pk-ink2{color:#e4def2 !important;}
[data-ogsc] .pk-muted{color:#bdb4d3 !important;}
[data-ogsb] .pk-bg{background-color:#15101f !important;}
[data-ogsb] .pk-card{background-color:#1f1830 !important;}
[data-ogsb] .pk-btn{background-color:${C.lime} !important;}
[data-ogsc] .pk-btn-a{color:${C.ink} !important;}
</style>
</head>
<body class="pk-bg" style="margin:0;padding:0;background-color:${C.paper};">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${esc(opts.preheader)}${pad}</div>
<table role="presentation" class="pk-bg" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.paper}" style="background-color:${C.paper};">
<tr><td class="pk-outer" align="center" style="padding:32px 16px;">
<!--[if mso]><table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
<tr><td style="padding:0 6px 18px;">
<a href="${esc(siteUrl())}" style="text-decoration:none;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="padding-right:8px;"><img src="${asset("mark.png")}" width="32" height="32" alt="" style="display:block;width:32px;height:32px;border:0;"></td>
<td valign="middle" class="pk-brand" style="font-family:${FONT};font-size:24px;font-weight:700;letter-spacing:-1px;color:${C.ink};">poskoo<span style="color:${C.coral};">.</span></td>
</tr></table></a>
</td></tr>
<tr><td class="pk-card pk-card-pad" bgcolor="${C.card}" style="background-color:${C.card};border:1.5px solid ${C.line};border-radius:26px;padding:28px 32px 34px;">
${artBand(opts.art)}
${opts.body}
</td></tr>
<tr><td align="center" style="padding:22px 16px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.muted};" class="pk-muted">
${opts.footerNote ? `${opts.footerNote}<br>` : ""}Questions? Just reply or write to <a href="mailto:${BRAND.supportEmail}" style="color:${C.muted};text-decoration:underline;">${BRAND.supportEmail}</a><br>
${postalLine()}${unsub}
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body>
</html>`;
}

function textFooter(): string {
  const addr = process.env.EMAIL_POSTAL_ADDRESS?.trim();
  return `\n\n--\nPoskoo · ${siteUrl()}\nQuestions? Reply or write to ${BRAND.supportEmail}\n${BRAND.company}${addr ? ` · ${addr}` : ""}`;
}

function greet(name?: string | null): string {
  const n = name?.trim();
  return n ? `Hi ${n.split(/\s+/)[0]},` : "Hi there,";
}

export const CODE_TTL_MINUTES = 15;

// ---- Templates ------------------------------------------------------------------------------

export function welcomeEmail(d: { name?: string | null }): RenderedEmail {
  const subject = "Welcome to Poskoo";
  const preheader = "Connect a channel, schedule your first post and turn on your first auto-DM.";
  const dash = absoluteUrl("/app");
  const s = [
    { icon: "🔗", title: "Connect your channels", body: "Instagram, Facebook, Threads and YouTube, in one place.", bg: C.lilac },
    { icon: "🗓️", title: "Schedule your first post", body: "Drop it on the calendar. Poskoo publishes it on time.", bg: C.peach },
    { icon: "💬", title: "Create your first automation", body: "Auto-DM everyone who comments a keyword, and capture leads.", bg: C.mint },
  ];
  const html = layout({
    subject,
    preheader,
    art: ART.welcome,
    body: `${h1(`Welcome to <span style="background-color:${C.lime};color:${C.ink};padding:0 6px;border-radius:6px;">Poskoo.</span>`)}
${p(`${esc(greet(d.name))} Poskoo plans and auto-publishes your social posts, and automatically DMs everyone who comments, so you grow while you sleep.`)}
${p("Three steps to get going:")}
${steps(s)}
${button("Open your dashboard", dash)}`,
  });
  const text = `${greet(d.name)}

Welcome to Poskoo. Poskoo plans and auto-publishes your social posts, and automatically DMs everyone who comments.

Three steps to get going:
${s.map((x, i) => `${i + 1}. ${x.title}: ${x.body}`).join("\n")}

Open your dashboard: ${dash}${textFooter()}`;
  return { subject, preheader, html, text };
}

export function verifyEmail(d: { name?: string | null; code: string; link: string }): RenderedEmail {
  const subject = "Verify your email for Poskoo";
  const preheader = `Your verification code expires in ${CODE_TTL_MINUTES} minutes.`;
  const html = layout({
    subject,
    preheader,
    art: ART.verify,
    body: `${h1("Confirm it’s you.")}
${p(`${esc(greet(d.name))} enter this code in Poskoo to verify your email address:`)}
${codeBox(d.code, `Expires in ${CODE_TTL_MINUTES} minutes.`)}
${p("Or verify with one click (you need to be logged in to Poskoo in this browser):")}
${button("Verify email", d.link)}
${fallbackLink(d.link)}
${note("Didn’t create a Poskoo account? Ignore this email; nothing happens without the code.")}`,
  });
  const text = `${greet(d.name)}

Your Poskoo verification code: ${d.code}
It expires in ${CODE_TTL_MINUTES} minutes.

Or verify with one click (log in to Poskoo first): ${d.link}

Didn't create a Poskoo account? Ignore this email.${textFooter()}`;
  return { subject, preheader, html, text };
}

export function passwordResetEmail(d: { name?: string | null; code: string; link: string }): RenderedEmail {
  const subject = "Reset your Poskoo password";
  const preheader = `Use this code to reset your password. It expires in ${CODE_TTL_MINUTES} minutes.`;
  const html = layout({
    subject,
    preheader,
    art: ART.security,
    body: `${h1("Reset your password.")}
${p(`${esc(greet(d.name))} we got a request to reset your Poskoo password. Enter this code on the reset page:`)}
${codeBox(d.code, `Expires in ${CODE_TTL_MINUTES} minutes. Never share this code.`)}
${p("Or skip the code and choose a new password here:")}
${button("Reset password", d.link)}
${fallbackLink(d.link)}
${note("<strong>Didn’t request this?</strong> You can safely ignore this email. Your password stays the same until someone uses this code.")}`,
  });
  const text = `${greet(d.name)}

We got a request to reset your Poskoo password.

Your reset code: ${d.code}
It expires in ${CODE_TTL_MINUTES} minutes. Never share this code.

Or choose a new password here: ${d.link}

Didn't request this? Ignore this email. Your password stays the same.${textFooter()}`;
  return { subject, preheader, html, text };
}

export function googleAccountResetEmail(d: { name?: string | null }): RenderedEmail {
  const subject = "Signing in to Poskoo";
  const preheader = "Your account uses Google sign-in, so there is no password to reset.";
  const login = absoluteUrl("/login");
  const html = layout({
    subject,
    preheader,
    art: ART.security,
    body: `${h1("You sign in with Google.")}
${p(`${esc(greet(d.name))} someone asked to reset the password for this email. Your Poskoo account was created with Google, so it has no password.`)}
${p("Open the login page and press <strong>Continue with Google</strong>.")}
${button("Go to login", login)}
${note("Didn’t request this? Ignore this email. Nothing changed.")}`,
  });
  const text = `${greet(d.name)}

Someone asked to reset the password for this email. Your Poskoo account was created with Google, so it has no password.
Open ${login} and press "Continue with Google".

Didn't request this? Ignore this email. Nothing changed.${textFooter()}`;
  return { subject, preheader, html, text };
}

export function passwordChangedEmail(d: { name?: string | null; when: Date }): RenderedEmail {
  const subject = "Your Poskoo password was changed";
  const preheader = "If this was you, you’re all set. If not, reset your password now.";
  const when = d.when.toUTCString();
  const forgot = absoluteUrl("/forgot-password");
  const html = layout({
    subject,
    preheader,
    art: ART.security,
    body: `${h1("Password changed.")}
${p(`${esc(greet(d.name))} the password for your Poskoo account was changed on <strong>${esc(when)}</strong>. For your safety we signed you out on every device.`)}
${button("Log in", absoluteUrl("/login"))}
${note(`<strong>Wasn’t you?</strong> <a href="${esc(forgot)}" style="color:${C.violet};">Reset your password</a> right away and write to ${BRAND.supportEmail}.`)}`,
  });
  const text = `${greet(d.name)}

The password for your Poskoo account was changed on ${when}. We signed you out on every device.

Log in: ${absoluteUrl("/login")}

Wasn't you? Reset your password right away: ${forgot} and write to ${BRAND.supportEmail}.${textFooter()}`;
  return { subject, preheader, html, text };
}

export function newDeviceEmail(d: { name?: string | null; device: string; when: Date }): RenderedEmail {
  const subject = "New login to your Poskoo account";
  const preheader = "We noticed a login from a device we haven’t seen before.";
  const forgot = absoluteUrl("/forgot-password");
  const html = layout({
    subject,
    preheader,
    art: ART.device,
    body: `${h1("New login spotted.")}
${p(`${esc(greet(d.name))} your Poskoo account was just used to log in from a new device.`)}
${details([
  ["Device", d.device],
  ["Time", d.when.toUTCString()],
])}
${p("If this was you, there’s nothing to do.", { muted: true })}
${note(`<strong>Wasn’t you?</strong> <a href="${esc(forgot)}" style="color:${C.violet};">Reset your password</a> now; that signs everyone else out.`)}`,
  });
  const text = `${greet(d.name)}

Your Poskoo account was just used to log in from a new device.
Device: ${d.device}
Time: ${d.when.toUTCString()}

If this was you, there's nothing to do. Wasn't you? Reset your password: ${forgot}${textFooter()}`;
  return { subject, preheader, html, text };
}

export function referralBonusEmail(d: { name?: string | null; bonusDms: number; friend?: string | null }): RenderedEmail {
  const subject = `You earned +${d.bonusDms} automated DMs`;
  const preheader = "A friend you invited just connected their account. Your bonus is live.";
  const link = absoluteUrl("/app/referrals");
  const who = d.friend ? `<strong>${esc(d.friend)}</strong>` : "A friend you invited";
  const html = layout({
    subject,
    preheader,
    art: ART.referral,
    body: `${h1(`<span style="background-color:${C.lime};color:${C.ink};padding:0 6px;border-radius:6px;">+${d.bonusDms}</span> DMs, on us.`)}
${p(`${esc(greet(d.name))} ${who} joined Poskoo with your link and connected a social account. You now get <strong>${d.bonusDms} extra automated DMs every month</strong>.`)}
${p("Keep sharing your link: every friend who connects an account adds another bonus.")}
${button("See your referrals", link)}`,
  });
  const text = `${greet(d.name)}

${d.friend ?? "A friend you invited"} joined Poskoo with your link and connected a social account. You now get ${d.bonusDms} extra automated DMs every month.

See your referrals: ${link}${textFooter()}`;
  return { subject, preheader, html, text };
}

export function formatMoney(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export function newOrderEmail(d: { name?: string | null; buyerEmail: string | null; product: string; amountCents: number; feeCents: number; currency: string }): RenderedEmail {
  const amount = formatMoney(d.amountCents, d.currency);
  const fee = formatMoney(d.feeCents, d.currency);
  const subject = `New order: ${d.product} (${amount})`;
  const preheader = `${d.buyerEmail ?? "Someone"} just bought ${d.product}.`;
  const link = absoluteUrl("/app/orders");
  const html = layout({
    subject,
    preheader,
    art: ART.order,
    body: `${h1("Cha-ching! New order.")}
${p(`${esc(greet(d.name))} you just made a sale. The buyer already got their download link.`)}
${details([
  ["Product", d.product],
  ["Buyer", d.buyerEmail ?? "Not provided"],
  ["Amount", amount],
  ["Poskoo fee", fee],
])}
${p("Stripe’s processing fee is shown in your Stripe dashboard. Payouts follow your Stripe schedule.", { muted: true, size: 13 })}
${button("View orders", link)}`,
  });
  const text = `${greet(d.name)}

You just made a sale.
Product: ${d.product}
Buyer: ${d.buyerEmail ?? "Not provided"}
Amount: ${amount}
Poskoo fee: ${fee}

View orders: ${link}${textFooter()}`;
  return { subject, preheader, html, text };
}

export function buyerReceiptEmail(d: { product: string; amountCents: number; currency: string; accessUrl: string; delivery: "file" | "link"; seller?: string | null }): RenderedEmail {
  const amount = formatMoney(d.amountCents, d.currency);
  const verb = d.delivery === "file" ? "Download" : "Open";
  const subject = `Your receipt: ${d.product}`;
  const preheader = `Thanks for your purchase. ${verb} ${d.product} any time from this email.`;
  const html = layout({
    subject,
    preheader,
    art: ART.receipt,
    body: `${h1("Thanks for your purchase!")}
${p(`Your payment went through${d.seller ? ` and <strong>${esc(d.seller)}</strong> says thank you` : ""}. Keep this email: the button below always gets you back to your ${d.delivery === "file" ? "download" : "link"}.`)}
${details([
  ["Product", d.product],
  ["Paid", amount],
])}
${button(`${verb} ${d.product}`, d.accessUrl)}
${fallbackLink(d.accessUrl)}
${note("Payments are processed by Stripe; your card statement shows the seller. Questions about the product? Reply to the seller’s message or write to us.")}`,
    footerNote: "You got this receipt because you bought a product sold with Poskoo.",
  });
  const text = `Thanks for your purchase!

Product: ${d.product}
Paid: ${amount}

${verb} it here (keep this email): ${d.accessUrl}${textFooter()}`;
  return { subject, preheader, html, text };
}

export function postFailedEmail(d: { name?: string | null; platform: string; caption: string; error: string; scheduledFor?: Date | null }): RenderedEmail {
  const subject = `A scheduled ${d.platform} post didn’t publish`;
  const preheader = "Open your calendar to see why and retry it in one click.";
  const link = absoluteUrl("/app/calendar");
  const caption = d.caption.trim() ? (d.caption.length > 90 ? `${d.caption.slice(0, 90).trimEnd()}…` : d.caption) : "(no caption)";
  const rows: [string, string][] = [
    ["Channel", d.platform],
    ["Post", caption],
  ];
  if (d.scheduledFor) rows.push(["Scheduled for", d.scheduledFor.toUTCString()]);
  rows.push(["Reason", d.error.slice(0, 200)]);
  const html = layout({
    subject,
    preheader,
    art: ART.postFailed,
    body: `${h1("A post didn’t go out.")}
${p(`${esc(greet(d.name))} Poskoo tried to publish one of your scheduled posts, but ${esc(d.platform)} said no.`)}
${details(rows)}
${p("Fix the reason above (often a reconnect or a media format), then press Retry on the post.")}
${button("Open calendar", link)}`,
    footerNote: "We send at most one alert per post.",
  });
  const text = `${greet(d.name)}

Poskoo tried to publish one of your scheduled posts, but ${d.platform} said no.
${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}

Fix the reason, then press Retry on the post: ${link}${textFooter()}`;
  return { subject, preheader, html, text };
}

// ---- Poskoo subscription billing (Pro / Agency) ------------------------------------------------

function longDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function subscriptionStartedEmail(d: { name?: string | null; plan: string; interval: "month" | "year"; amountCents: number | null; currency: string | null; renewsOn: Date | null }): RenderedEmail {
  const amount = d.amountCents !== null ? formatMoney(d.amountCents, d.currency ?? "usd") : null;
  const subject = `You're on Poskoo ${d.plan}`;
  const preheader = `Your ${d.plan} plan is active. Here is your summary.`;
  const link = absoluteUrl("/app/settings/billing");
  const rows: [string, string][] = [
    ["Plan", `${d.plan} (${d.interval === "year" ? "yearly" : "monthly"})`],
  ];
  if (amount) rows.push(["Paid", `${amount} / ${d.interval}`]);
  if (d.renewsOn) rows.push(["Renews on", longDate(d.renewsOn)]);
  const html = layout({
    subject,
    preheader,
    art: ART.receipt,
    body: `${h1(`Welcome to ${esc(d.plan)}!`)}
${p(`${esc(greet(d.name))} thanks for upgrading. Your bigger limits are on right now.`)}
${details(rows)}
${p("Stripe e-mails the full receipt and invoice separately. Switch plans, change your card or cancel any time from Plan &amp; billing.", { muted: true, size: 13 })}
${button("Open Plan & billing", link)}`,
    footerNote: "You got this e-mail because you started a Poskoo subscription.",
  });
  const text = `${greet(d.name)}

Thanks for upgrading. Your ${d.plan} limits are on right now.
${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}

Stripe e-mails the full receipt separately. Manage your plan: ${link}${textFooter()}`;
  return { subject, preheader, html, text };
}

export function subscriptionPaymentFailedEmail(d: { name?: string | null; plan: string | null; amountCents: number | null; currency: string | null; graceEnds: Date | null }): RenderedEmail {
  const amount = d.amountCents !== null ? formatMoney(d.amountCents, d.currency ?? "usd") : null;
  const subject = "Your Poskoo payment didn’t go through";
  const preheader = "Update your card to keep your plan. Nothing else changes.";
  const link = absoluteUrl("/app/settings/billing");
  const keep = d.plan ? `your ${esc(d.plan)} plan` : "your plan";
  const html = layout({
    subject,
    preheader,
    art: ART.postFailed,
    body: `${h1("A payment didn’t go through.")}
${p(`${esc(greet(d.name))} we couldn’t charge your card${amount ? ` for <strong>${esc(amount)}</strong>` : ""}. Stripe will try again automatically.`)}
${p(d.graceEnds ? `Update your card by <strong>${esc(longDate(d.graceEnds))}</strong> to keep ${keep}. After that your account moves to the Free plan; nothing is deleted.` : `Update your card to keep ${keep}. Nothing is deleted.`)}
${button("Update payment method", link)}`,
    footerNote: "You got this e-mail because a Poskoo subscription payment failed.",
  });
  const text = `${greet(d.name)}

We couldn't charge your card${amount ? ` for ${amount}` : ""}. Stripe will try again automatically.
${d.graceEnds ? `Update your card by ${longDate(d.graceEnds)} to keep your plan. After that your account moves to Free; nothing is deleted.` : "Update your card to keep your plan."}

Update payment method: ${link}${textFooter()}`;
  return { subject, preheader, html, text };
}

export function subscriptionCanceledEmail(d: { name?: string | null; plan: string | null; endsOn: Date | null; ended: boolean }): RenderedEmail {
  const plan = d.plan ?? "paid";
  const subject = d.ended ? `Your Poskoo ${plan} plan has ended` : `Your Poskoo ${plan} plan is canceled`;
  const preheader = d.ended ? "You are on the Free plan now. Everything you made is still here." : "You keep every feature until the end of the period you paid for.";
  const link = absoluteUrl("/app/settings/billing");
  const when = d.endsOn ? longDate(d.endsOn) : null;
  const body = d.ended
    ? `${p(`${esc(greet(d.name))} your ${esc(plan)} subscription has ended and your account is on the Free plan.`)}
${p("Nothing was deleted: posts already scheduled still publish and your connected accounts keep working. New items above the Free limits are paused until you upgrade again.")}`
    : `${p(`${esc(greet(d.name))} your ${esc(plan)} plan is canceled${when ? ` and stays active until <strong>${esc(when)}</strong>` : ""}. You won’t be charged again.`)}
${p("Changed your mind? Renew with one click from Plan &amp; billing before then.")}`;
  const html = layout({
    subject,
    preheader,
    art: ART.welcome,
    body: `${h1(d.ended ? "Your plan has ended." : "Sorry to see you go.")}
${body}
${button(d.ended ? "See plans" : "Keep my plan", link)}`,
    footerNote: "You got this e-mail because your Poskoo subscription changed.",
  });
  const text = `${greet(d.name)}

${d.ended ? `Your ${plan} subscription has ended and your account is on the Free plan. Nothing was deleted.` : `Your ${plan} plan is canceled${when ? ` and stays active until ${when}` : ""}. You won't be charged again.`}

${link}${textFooter()}`;
  return { subject, preheader, html, text };
}

/** Sample data for the dev preview route. */
export const PREVIEWS: Record<string, () => RenderedEmail> = {
  welcome: () => welcomeEmail({ name: "Jamie Rivera" }),
  verify: () => verifyEmail({ name: "Jamie", code: "482913", link: absoluteUrl("/verify-email?token=sample-token") }),
  reset: () => passwordResetEmail({ name: "Jamie", code: "305718", link: absoluteUrl("/reset-password?token=sample-token") }),
  "reset-google": () => googleAccountResetEmail({ name: "Jamie" }),
  "password-changed": () => passwordChangedEmail({ name: "Jamie", when: new Date("2026-11-11T17:42:00Z") }),
  "new-device": () => newDeviceEmail({ name: "Jamie", device: "Chrome on macOS", when: new Date("2026-11-11T17:42:00Z") }),
  referral: () => referralBonusEmail({ name: "Jamie", bonusDms: 500, friend: "sa***@gmail.com" }),
  "new-order": () => newOrderEmail({ name: "Jamie", buyerEmail: "buyer@example.com", product: "Reels Hook Guide", amountCents: 1900, feeCents: 57, currency: "usd" }),
  receipt: () => buyerReceiptEmail({ product: "Reels Hook Guide", amountCents: 1900, currency: "usd", accessUrl: absoluteUrl("/p/reels-hook-guide/success?session_id=cs_test_sample"), delivery: "file", seller: "Jamie Rivera" }),
  "subscription-started": () => subscriptionStartedEmail({ name: "Jamie", plan: "Pro", interval: "month", amountCents: 1700, currency: "usd", renewsOn: new Date("2026-12-11T00:00:00Z") }),
  "subscription-payment-failed": () => subscriptionPaymentFailedEmail({ name: "Jamie", plan: "Pro", amountCents: 1700, currency: "usd", graceEnds: new Date("2026-12-18T00:00:00Z") }),
  "subscription-canceled": () => subscriptionCanceledEmail({ name: "Jamie", plan: "Pro", endsOn: new Date("2026-12-11T00:00:00Z"), ended: false }),
  "subscription-ended": () => subscriptionCanceledEmail({ name: "Jamie", plan: "Pro", endsOn: null, ended: true }),
  "post-failed": () =>
    postFailedEmail({ name: "Jamie", platform: "Instagram", caption: "5 hooks that doubled my reel views this month (save this!)", error: "Instagram needs an image or video", scheduledFor: new Date("2026-11-12T15:00:00Z") }),
};
