import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";

const PATH = "/tools";

export const metadata: Metadata = {
  title: { absolute: "Free Instagram Tools: Captions, Bios, Fonts & Image Sizes" },
  description:
    "Free Instagram tools: count caption characters, keep line breaks, write a bio, make fonts, check image sizes and work out your engagement rate.",
  alternates: { canonical: PATH },
};

const tools = [
  {
    href: "/tools/instagram-hashtag-generator",
    title: "Instagram hashtag generator",
    description: "Build a hand-curated hashtag set for your niche, mix broad and specific tags, and copy up to 30 at once.",
  },
  {
    href: "/tools/instagram-post-preview",
    title: "Instagram post preview",
    description: "Preview a local photo and caption in a feed mockup, compare square and portrait crops, and copy your caption.",
  },
  {
    href: "/tools/instagram-caption-counter",
    title: "Instagram caption counter",
    description: "Count characters and hashtags as you type and see how close your caption is to the Instagram limit.",
  },
  {
    href: "/tools/instagram-comment-keyword-tester",
    title: "Instagram comment keyword tester",
    description: "Try comment keywords and contains vs exact match before you turn on Instagram auto-DM rules.",
  },
  {
    href: "/tools/instagram-dm-link-generator",
    title: "Instagram DM link generator",
    description: "Create an ig.me link that opens a direct message with your account—copy it for bio, Stories and email.",
  },
  {
    href: "/tools/instagram-utm-builder",
    title: "Instagram UTM builder",
    description: "Tag links for your bio, Story stickers and auto-DMs with UTM campaign fields so your website analytics shows what Instagram sent.",
  },
  {
    href: "/tools/instagram-line-break-generator",
    title: "Instagram line break generator",
    description: "Keep blank lines and paragraph spacing in your captions so they don’t collapse into one block of text.",
  },
  {
    href: "/tools/instagram-image-size",
    title: "Instagram image size guide",
    description: "Check the right sizes for posts, portraits and Stories, preview and reposition the 1:1, 4:5, 3:4 and 9:16 crops of your photo, then download a JPG.",
  },
  {
    href: "/tools/instagram-font-generator",
    title: "Instagram font generator",
    description: "Create and copy Unicode font styles for your Instagram bio and captions.",
  },
  {
    href: "/tools/instagram-bio-generator",
    title: "Instagram bio generator",
    description: "Get ready-to-copy Instagram bio ideas for your niche, with emojis, line breaks and a clear call to action.",
  },
  {
    href: "/tools/instagram-engagement-rate-calculator",
    title: "Instagram engagement rate calculator",
    description: "Calculate engagement rate by followers or reach from likes, comments, saves and shares.",
  },
  {
    href: "/tools/instagram-comment-picker",
    title: "Instagram comment picker",
    description: "Paste giveaway comments, filter by keyword and tagged friends, and pick a random winner. Nothing leaves your browser.",
  },
  {
    href: "/tools/instagram-safe-zone-checker",
    title: "Instagram Reels & Story safe zone checker",
    description: "Load an image or video frame and see what the Reels caption, buttons and Story bars cover. Download a free 1080×1920 template.",
  },
];

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Free Instagram tools",
  itemListElement: tools.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.title,
    url: `${BRAND.url}${t.href}`,
  })),
};

// One .cards grid per 3 tools so the pcard tilt/colors (nth-child 1-3) work.
const groups = [tools.slice(0, 3), tools.slice(3, 6), tools.slice(6, 9), tools.slice(9, 12), tools.slice(12)];

export default function ToolsPage() {
  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="hero">
        <span className="pill">Free · no signup needed</span>
        <h1>
          Free <em className="s mark">Instagram tools</em>
        </h1>
        <p className="lede">
          Small, fast tools for getting a post ready: check your caption length and hashtags, keep the spacing you
          typed, and pick the right image size before you post or schedule with {BRAND.name}.
        </p>
        <div className="hero-art" style={{ maxWidth: 820 }}>
          <Image
            sizes="(max-width: 860px) 100vw, 820px"
            src="/illustrations/free-tools.webp"
            width={1536}
            height={1024}
            priority
            alt="A creator lifts a paintbrush out of an open toolbox full of a ruler, scissors, a hashtag, a magnifying glass and photos, with a happy dog in the flowers."
          />
        </div>
      </header>

      <section style={{ paddingTop: 20 }}>
        <div className="head">
          <p className="eyebrow">All free tools</p>
          <h2>
            Pick a tool and <em className="s">get the post ready.</em>
          </h2>
        </div>
        {groups.map((group, gi) => (
          <div key={group[0].href} className="cards" style={gi > 0 ? { marginTop: 26 } : undefined}>
            {group.map((t) => (
              <article
                key={t.href}
                className="pcard"
                style={group.length === 1 ? { gridColumn: "1 / -1", width: "100%", maxWidth: 460, marginInline: "auto" } : undefined}
              >
                <span className="no">{String(tools.indexOf(t) + 1).padStart(2, "0")} / Free tool</span>
                <h3>{t.title}</h3>
                <p>{t.description}</p>
                <Link className="go" href={t.href}>
                  Open the tool <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        ))}
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Schedule posts and auto-DM everyone who comments</h2>
              <p>{BRAND.tagline}</p>
              <Link className="btn" href="/signup">
                Start free <span aria-hidden="true">→</span>
              </Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-leads.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="Two friends high-five next to a board of new leads"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
