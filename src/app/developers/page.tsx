import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { ldJson } from "@/lib/tool-schema";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";

const description =
  "Connect Claude, ChatGPT and other AI assistants to Poskoo with the MCP server at /api/mcp. Schedule posts, list channels and read analytics.";

export const metadata: Metadata = withSocial({
  title: { absolute: "Poskoo API and MCP Server: Let AI Assistants Schedule Posts" },
  description,
  alternates: { canonical: "/developers" },
});

const MCP_URL = `${BRAND.url}/api/mcp`;

const tools = [
  {
    name: "list_channels",
    text: "The channels connected to your account (Instagram, Facebook, Threads, YouTube) and their status.",
  },
  {
    name: "list_posts",
    text: "Your drafts, scheduled and published posts, newest first, with an optional status filter.",
  },
  {
    name: "create_post",
    text: "Schedule a post: caption, a public image or video link, a channel, and a time — or “next slot” to use your channel schedules.",
  },
  {
    name: "add_idea",
    text: "Save a post idea to your Poskoo ideas board.",
  },
  {
    name: "get_analytics_summary",
    text: "Reach, likes, comments and saves for your published posts over the last 7, 30 or 90 days.",
  },
];

const codeStyle: React.CSSProperties = {
  background: "var(--ink)",
  color: "var(--paper)",
  borderRadius: 12,
  padding: "16px 18px",
  overflowX: "auto",
  font: "13px/1.6 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  margin: "14px 0 0",
};

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Poskoo developers",
  url: `${BRAND.url}/developers`,
  description,
};

export default function DevelopersPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`} breadcrumbs={[{ name: "Developers", path: "/developers" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(collectionJsonLd) }} />
      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">MCP server · API keys · for builders</span>
          <h1>
            Let your <em className="s">AI</em> schedule posts
          </h1>
          <p className="lede">
            Poskoo speaks MCP, the model context protocol. Point Claude, ChatGPT or any other AI assistant at{" "}
            <code style={{ fontFamily: "ui-monospace, monospace" }}>{MCP_URL}</code> with your Poskoo API key, and it
            can schedule posts, list your channels and read your analytics — with the same checks the Poskoo app uses.
          </p>
        </div>
        <div className="hero-art"><AnimArt name="developers" label="A developer types code on a laptop while a plug connects to a socket and gears turn" /></div>
      </header>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Step 1</p>
            <h2>Get your API key</h2>
          </div>
          <p className="lede" style={{ maxWidth: 720 }}>
            Open <Link href="/app/settings" style={{ color: "inherit" }}>Poskoo Settings</Link> and go to the “API
            keys” section. Create a key, name it (for example “Claude”) and copy it right away — Poskoo stores only a
            hash, so the full key is shown once. You can revoke a key any time.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Step 2</p>
            <h2>Connect to Claude / ChatGPT</h2>
          </div>
          <p className="lede" style={{ maxWidth: 720 }}>
            The MCP server lives at <strong>{MCP_URL}</strong>. Add it to your assistant with your API key as a
            Bearer token:
          </p>
          <pre style={codeStyle} aria-label="MCP server URL">
            {MCP_URL}
          </pre>
          <p className="lede" style={{ maxWidth: 720, marginTop: 20 }}>
            Claude (claude.ai and Claude Code):
          </p>
          <pre style={codeStyle} aria-label="Claude Code MCP setup">
            {`claude mcp add --transport http poskoo ${MCP_URL} \\
  --header "Authorization: Bearer poskoo_YOUR_API_KEY"`}
          </pre>
          <p className="lede" style={{ maxWidth: 720, marginTop: 20 }}>
            ChatGPT (and other MCP clients) — custom connector:
          </p>
          <pre style={codeStyle} aria-label="Generic MCP client config">
            {JSON.stringify(
              {
                mcpServers: {
                  poskoo: {
                    url: MCP_URL,
                    headers: { Authorization: "Bearer poskoo_YOUR_API_KEY" },
                  },
                },
              },
              null,
              2,
            )}
          </pre>
          <p className="lede" style={{ maxWidth: 720, marginTop: 20 }}>
            Then ask your assistant things like “schedule a post to Instagram tomorrow at 9am with this caption” or
            “what did my last 30 days of posts perform like?”
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">What the assistant can do</p>
            <h2>Five tools</h2>
          </div>
          <div className="cards">
            {tools.map((t) => (
              <article key={t.name} className="pcard">
                <h3 style={{ fontFamily: "ui-monospace, monospace", fontSize: "1rem" }}>{t.name}</h3>
                <p>{t.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Your data</p>
            <h2>Only yours, only what you allow</h2>
          </div>
          <div className="pains">
            <div className="pain">
              <b>Scoped to your account</b>
              <span>Every request runs as the owner of the API key. One key can never read or change another user&apos;s posts, channels or ideas.</span>
            </div>
            <div className="pain">
              <b>Same rules as the app</b>
              <span>Posts created through MCP pass the exact same checks as the Poskoo calendar: caption limits, media links, connected channels and plan limits.</span>
            </div>
            <div className="pain">
              <b>Revoke any time</b>
              <span>Keys are stored hashed and can be revoked in Settings the moment you no longer need them.</span>
            </div>
          </div>
        </div>
      </section>

      <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
        Questions? Email {BRAND.supportEmail} and we will help you connect your assistant.
      </p>
    </PublicShell>
  );
}
