import type { Metadata } from "next";
import PublicShell from "@/components/PublicShell";
import site from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";
import { GuidesDirectory } from "@/components/guides/GuidesDirectory";
import { ToolCta } from "@/components/tools/ToolPageTemplate";
import g from "@/components/guides/guides.module.css";
import t from "@/components/tools/tools.module.css";
import { BRAND } from "@/lib/brand";
import { ldJson } from "@/lib/tool-schema";
import { PAGE_DESCRIPTIONS } from "@/lib/public-pages";
import { GUIDES_BY_DATE, guidePath } from "@/content/guides/registry";

const PATH = "/guides";
const TITLE = "Instagram Guides: Growth, Scheduling & Auto-DM Tips";
const description = PAGE_DESCRIPTIONS[PATH];
const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: `${BRAND.name} guides` };

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description,
  alternates: { canonical: PATH },
  openGraph: { type: "website", siteName: BRAND.name, title: TITLE, description, url: PATH, images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description, images: [OG_IMAGE.url] },
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${BRAND.name} guides`,
  numberOfItems: GUIDES_BY_DATE.length,
  itemListElement: GUIDES_BY_DATE.map((x, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: x.h1,
    url: `${BRAND.url}${guidePath(x.slug)}`,
  })),
};

export default function GuidesPage() {
  return (
    <PublicShell className={site.wide} breadcrumbs={[{ name: "Guides", path: PATH }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(itemListJsonLd) }} />
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
            Grow on Instagram with <em className="s mark">practical guides</em>
          </h1>
          <p className="lede">
            Plain-English guides on picking a niche, planning content, scheduling posts and turning comments into
            leads. Sourced, honest and written for beginners and small businesses.
          </p>
          <div className="hero-art">
            <AnimArt name="writing" label="A creator writes on a giant phone screen with a big pencil while a puppy watches" />
          </div>
        </header>

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
