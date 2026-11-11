// Dev-only preview of every transactional e-mail with sample data. 404 in production.
//   /api/dev/email-preview                      -> index
//   /api/dev/email-preview?template=reset       -> HTML
//   /api/dev/email-preview?template=reset&format=text -> plain-text part
import { BRAND } from "@/lib/brand";
import { PREVIEWS } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

export function GET(request: Request) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  const url = new URL(request.url);
  const name = url.searchParams.get("template");
  if (!name) {
    const rows = Object.keys(PREVIEWS)
      .map((k) => {
        const m = PREVIEWS[k]();
        return `<li><a href="?template=${k}">${k}</a> — ${esc(m.subject)} · <a href="?template=${k}&format=text">text</a></li>`;
      })
      .join("");
    return new Response(`<!doctype html><meta charset="utf-8"><title>Email previews</title><body style="font:16px/1.7 system-ui;padding:32px;background:#fffcf6;color:#1e1631"><h1>Poskoo email previews</h1><ul>${rows}</ul></body>`, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
  const render = Object.hasOwn(PREVIEWS, name) ? PREVIEWS[name] : null;
  if (!render) return new Response("Unknown template", { status: 404 });
  const mail = render();
  if (url.searchParams.get("format") === "text") {
    return new Response(`Subject: ${mail.subject}\nPreheader: ${mail.preheader}\n\n${mail.text}`, { headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  // Images load from this dev server (the live site may not have /email/*.png yet).
  return new Response(mail.html.replaceAll(`${BRAND.url}/email/`, `${url.origin}/email/`), { headers: { "content-type": "text/html; charset=utf-8" } });
}
