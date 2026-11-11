import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import HashtagGenerator from "./HashtagGenerator";
import { breadcrumbJsonLd, faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/tools/instagram-hashtag-generator";
const title = "Instagram Hashtag Generator: Free Niche Hashtag Sets";
const description = "Build a free Instagram hashtag set from 15 hand-curated niches. Mix broad and specific tags, add your keyword and copy up to 30 hashtags.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
};

const faqs = [
  {
    q: "How does this Instagram hashtag generator work?",
    a: "Choose one of 15 niches, a count and a mix. The tool selects from hand-curated broad, mid-level and specific tag sets in a repeatable order. You can add an optional keyword and copy the finished set.",
  },
  {
    q: "How many hashtags should I use on an Instagram post?",
    a: "Use only tags that describe your post; 30 is a limit, not a target. This generator lets you choose and copy between 5 and 30 hashtags at once, so you can start with a smaller, relevant set instead of filling every slot.",
  },
  {
    q: "Are my hashtags generated and copied in the browser?",
    a: "Yes. The generator builds your set and copies it in your browser without uploading your keyword, using AI or scraping Instagram. Choose Copy all to copy the full set, or select the plain text if clipboard access is unavailable.",
  },
  {
    q: "How should I group broad, niche and branded hashtags?",
    a: "Use broad tags for general topics, specific tags for your niche and a branded or location keyword when it fits. Choose Balanced, More broad or More specific, then use Extra keyword to add your brand or city. Review the finished set for relevance before posting.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({ name: "Instagram Hashtag Generator", description, url: `${BRAND.url}${PATH}` });
const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", url: BRAND.url },
  { name: "Free tools", url: `${BRAND.url}/tools` },
  { name: "Hashtag generator", url: `${BRAND.url}${PATH}` },
]);

export default function InstagramHashtagGeneratorPage() {
  return (
    <PublicShell>
      {[toolJsonLd, crumbsJsonLd, faqJsonLd(faqs)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <Link href="/tools">Free Instagram tools</Link> / Hashtag generator
      </nav>
      <header className="hero">
        <span className="pill">Free · no signup · no AI or scraping</span>
        <h1>
          Instagram hashtag generator: <em className="s mark">free hashtag sets</em> by niche
        </h1>
        <p className="lede">
          Pick your niche, find a useful mix and copy a set for your next post. Hand-curated suggestions, generated entirely in your browser.
        </p>
        <div className="hero-art"><AnimArt name="hashtag" label="A creator juggles colourful hashtag balloons above a phone post" /></div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <HashtagGenerator />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-caption-counter">
          Caption counter
        </Link>
        {" · "}
        <Link className={s.vlink} href="/tools/instagram-bio-generator">
          Bio generator
        </Link>
      </p>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Relevance first</p>
              <h2>Choose relevance over a full caption</h2>
            </div>
            <div className="pains">
              <div className="pain">
                <b>Mix, don&apos;t stuff</b>
                <span>
                  Instagram allows up to 30 hashtags. It is better to mix broad and specific tags than to stuff them into every post. Start with a smaller set, remove anything unrelated, and add a city, product or brand keyword when it fits.
                </span>
              </div>
              <div className="pain">
                <b>Editorial tiers</b>
                <span>
                  Broad, mid-level and specific describe how focused a topic is. They are editorial categories, not measured search volumes. These sets do not check trends or whether a hashtag is restricted.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram hashtag questions</h2>
          </div>
          <div className="faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Your hashtags, ready for your next post</h2>
              <p>Copy your favorites, then save them to a scheduled post with {BRAND.name}.</p>
              <Link className="btn" href="/signup">
                Start free <span aria-hidden="true">→</span>
              </Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-leads.webp"
              width={1024}
              height={1024}
              loading="lazy"
              alt="Two friends high-five next to a board of new leads"
            />
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link className={s.vlink} href="/instagram-scheduler">
              Save them to a scheduled post
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
