import type { Metadata } from "next";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import site from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";
import { GuidesDirectory } from "@/components/guides/GuidesDirectory";
import { ToolCta } from "@/components/tools/ToolPageTemplate";
import g from "@/components/guides/guides.module.css";
import t from "@/components/tools/tools.module.css";
import { BRAND } from "@/lib/brand";
import { ldJson } from "@/lib/tool-schema";
import { guidesHubJsonLd } from "@/lib/guide-schema";
import { PAGE_DESCRIPTIONS } from "@/lib/public-pages";

const PATH = "/guides";
const TITLE = "Social Media Guides: Growth, Scheduling & Auto-DM Tips";
const description = PAGE_DESCRIPTIONS[PATH];
const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: `${BRAND.name} guides` };

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description,
  alternates: { canonical: PATH },
  openGraph: { type: "website", siteName: BRAND.name, title: TITLE, description, url: PATH, images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description, images: [OG_IMAGE.url] },
};

const guidesJsonLd = guidesHubJsonLd({
  name: `${BRAND.name} guides`,
  description,
  url: `${BRAND.url}${PATH}`,
});

export default function GuidesPage() {
  return (
    <PublicShell className={site.wide} breadcrumbs={[{ name: "Guides", path: PATH }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(guidesJsonLd) }} />
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <symbol id="tool-ok" viewBox="0 0 18 18">
            <circle cx="9" cy="9" r="9" fill="var(--green)" />
            <path d="M5 9.3l2.6 2.5L13 6.4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </symbol>
        </defs>
      </svg>
      <div className={`${t.page} ${g.page}`}>
        <header className={`hero ${g.hubHero}`}>
          <span className="pill">Guides &amp; articles</span>
          <h1>
            Grow on social media with <em className="s mark">practical guides</em>
          </h1>
          <p className={g.answer}>
            {BRAND.name} helps you plan social posts on one calendar and automate Instagram comment-to-DM replies, so
            every comment can become a lead.
          </p>
          <p className="lede">
            These guides teach Instagram growth, content planning, scheduling and comment-to-lead automation, step by
            step. Plain-English walkthroughs on picking a niche, planning content, scheduling posts and turning
            comments into leads, sourced, honest and written for beginners and small businesses.
          </p>
          <div className="hero-art">
            <AnimArt name="writing" label="A creator writes on a giant phone screen with a big pencil while a puppy watches" />
          </div>
        </header>

        <nav className={g.hubLinks} aria-label="Poskoo product pages">
          <Link href="/instagram-scheduler">Instagram scheduler</Link>
          <Link href="/instagram-auto-dm">Instagram auto-DM</Link>
          <Link href="/pricing">Pricing and free plan</Link>
        </nav>

        <section className={t.section} aria-label="All guides">
          <GuidesDirectory />
        </section>

        <ToolCta
          cta={{
            title: "Turn what you learn",
            mark: "into scheduled posts.",
            text: `Plan your week, publish automatically and DM everyone who comments a keyword with ${BRAND.name}. Start on the free plan.`,
          }}
        />
      </div>
    </PublicShell>
  );
}
