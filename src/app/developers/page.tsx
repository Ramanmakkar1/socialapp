import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { ldJson } from "@/lib/tool-schema";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";
import { isFeatureReady } from "@/lib/featureReadiness";

const description =
  "Connect Claude, ChatGPT and other AI assistants to Poskoo with the MCP server at /api/mcp. Draft and schedule posts, manage Auto-DMs and read analytics.";

// The AI campaign tool is listed as available only when AI is switched on (runtime env, so the
// page regenerates in the background like the home page's pricing cards).
export const revalidate = 600;

export const metadata: Metadata = withSocial({
  title: { absolute: "Poskoo API and MCP Server: Let AI Assistants Schedule Posts" },
  description,
  alternates: { canonical: "/developers" },
});

const MCP_URL = `${BRAND.url}/api/mcp`;

const tools = [
  {
    name: "list_channels",
    text: "The channels connected to your account (Instagram, Facebook, Threads, YouTube, LinkedIn, X, Bluesky, Mastodon and more) and their status.",
  },
  {
    name: "list_posts",
    text: "Your drafts, scheduled and published posts, newest first, with an optional status filter.",
  },
  {
    name: "create_post",
    text: "Create a post for one or more channels: caption, per-network captions, up to 10 image or video links (carousels), and a time or “next slot” from your channel schedules.",
  },
  {
    name: "update_post",
    text: "Change the caption, channels, media or time of a post that hasn't started publishing. With a publishing key it can also approve (schedule) a draft.",
  },
  {
    name: "delete_post",
    text: "Delete a draft, scheduled or failed post. Published posts are never deleted.",
  },
  {
    name: "get_post_status",
    text: "Where a post stands on each network: pending, publishing, published or failed, with the error message if one failed.",
  },
  {
    name: "add_idea",
    text: "Save a post idea to your Poskoo ideas board.",
  },
  {
    name: "list_contacts",
    text: "The people your Auto-DMs captured: username, email or phone if they shared it, and which automation found them.",
  },
  {
    name: "create_dm_rule",
    text: "Set up a comment-to-DM automation: keywords, the DM text, a link, and optional email or follow gates.",
  },
  {
    name: "create_campaign_from_brief",
    text: "Give a goal, offer, dates and channels; Poskoo's AI drafts the whole campaign on your calendar at good times, with captions tailored per network.",
    ai: true,
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
  const aiReady = isFeatureReady("ai");
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
            can draft and schedule posts, set up Auto-DMs and read your analytics — with the same checks the Poskoo app uses.
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
          <p className="lede" style={{ maxWidth: 720 }}>
            New keys are <strong>draft-only</strong>: the assistant can prepare posts and Auto-DMs, and you approve
            them in Poskoo. Tick “Allow publishing” when you create a key if you want the assistant to schedule posts
            and switch Auto-DMs on by itself.
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
            Then ask your assistant things like “draft a post for Instagram and LinkedIn tomorrow at 9am with this
            caption”, “did yesterday’s post publish everywhere?” or “what did my last 30 days of posts perform like?”
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">What the assistant can do</p>
            <h2>{tools.length} tools</h2>
          </div>
          <div className="cards">
            {tools.map((t) => (
              <article key={t.name} className="pcard">
                <h3 style={{ fontFamily: "ui-monospace, monospace", fontSize: "1rem" }}>{t.name}</h3>
                <p>{t.text}</p>
                {t.ai && !aiReady && <p className="small">Not available yet: AI isn&apos;t switched on in Poskoo. The tool replies with a short explanation until it is.</p>}
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
              <b>Drafts until you approve</b>
              <span>With a draft-only key, everything the assistant makes lands as a draft or a paused Auto-DM. Nothing is posted or sent until you schedule it or switch it on.</span>
            </div>
            <div className="pain">
              <b>Revoke any time</b>
              <span>Keys are stored hashed and can be revoked in Settings the moment you no longer need them.</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Step-by-step guides</p>
            <h2>Setup for your assistant</h2>
          </div>
          <p className="lede" style={{ maxWidth: 720 }}>
            <Link className={s.vlink} href="/schedule-posts-with-chatgpt">Schedule posts with ChatGPT</Link>
            {" · "}
            <Link className={s.vlink} href="/schedule-posts-with-claude">Schedule posts with Claude</Link>
            {" · "}
            <Link className={s.vlink} href="/schedule-posts-with-claude-code">Schedule posts with Claude Code</Link>
            {" · "}
            <Link className={s.vlink} href="/schedule-posts-with-cursor">Schedule posts with Cursor</Link>
          </p>
        </div>
      </section>

      <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
        Questions? Email {BRAND.supportEmail} and we will help you connect your assistant.
      </p>
    </PublicShell>
  );
}
