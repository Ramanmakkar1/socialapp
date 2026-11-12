// "Mark as posted" from a reminder e-mail (Instagram personal / Facebook Group channels).
// GET shows a one-button confirm page (mail scanners prefetch links, so GET never changes
// anything); POST checks the signed token and marks the target as published.
import { isDbConfigured } from "@/lib/db";
import { esc } from "@/lib/emailTemplates";
import { reminderSecret, verifyReminderToken } from "@/lib/networks/reminderToken";
import { markReminderPosted } from "@/lib/networks/reminderSend";
import { refreshPostStatus } from "@/lib/publisher";

function page(title: string, body: string, status = 200): Response {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)} · Poskoo</title>
<style>
:root{--paper:#fffcf6;--card:#fff;--ink:#1e1631;--muted:#5f5873;--line:#ece6da;--lime:#ddf46b}
@media (prefers-color-scheme:dark){:root{--paper:#14101f;--card:#1e1830;--ink:#f4f0ff;--muted:#b8b0cc;--line:#2e2645}}
body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--paper);color:var(--ink);font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:16px;box-sizing:border-box}
main{width:100%;max-width:420px;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:28px 24px;text-align:center}
h1{margin:0 0 8px;font-size:1.4rem;letter-spacing:-.02em}p{margin:0 0 18px;color:var(--muted)}
button,a.btn{display:inline-block;min-height:44px;border:0;border-radius:999px;background:var(--ink);color:var(--card);padding:12px 26px;font:600 1rem inherit;text-decoration:none;cursor:pointer}
a{color:inherit}
</style></head><body><main>${body}</main></body></html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
}

const INVALID = () =>
  page("Link expired", `<h1>This link has expired</h1><p>Open your Poskoo calendar to see the post.</p><a class="btn" href="/app/calendar?view=list">Open calendar</a>`, 400);

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t") ?? "";
  if (!verifyReminderToken(token, reminderSecret())) return INVALID();
  return page(
    "Mark as posted",
    `<h1>Did you post it?</h1><p>Mark it as posted and your Poskoo calendar shows it as published. Its uploaded files are then cleaned up.</p>
<form method="post"><input type="hidden" name="t" value="${esc(token)}"><button type="submit">Yes, mark as posted</button></form>`,
  );
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const token = String(form?.get("t") ?? "");
  const targetId = verifyReminderToken(token, reminderSecret());
  if (!targetId || !isDbConfigured()) return INVALID();
  try {
    const r = await markReminderPosted(targetId);
    if (!r) return page("Not found", `<h1>We couldn't find that post</h1><p>It may have been deleted or retried.</p><a class="btn" href="/app/calendar?view=list">Open calendar</a>`, 404);
    await refreshPostStatus(r.postId);
    return page("Marked as posted", `<h1>${r.already ? "Already marked as posted" : "Marked as posted"} ✓</h1><p>Nice work. Your calendar now shows it as published.</p><a class="btn" href="/app/calendar?view=list">Open calendar</a>`);
  } catch (err) {
    console.error("reminder mark-as-posted failed", err instanceof Error ? err.message : err);
    return page("Try again", `<h1>Something went wrong</h1><p>Please try the link again in a minute.</p>`, 500);
  }
}
