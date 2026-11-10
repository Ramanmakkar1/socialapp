import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import HashtagStrategyWorksheet from "./HashtagStrategyWorksheet";
import { breadcrumbJsonLd, faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

const PATH = "/tools/instagram-hashtag-strategy";
const title = "Instagram Hashtag Strategy Worksheet: Plan Tag Sets";
const description =
  "Plan Instagram hashtags in broad, niche and branded sets. Save named sets in your browser, copy a set, and see how many hashtags to use.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
};

const faqs = [
  {
    q: "How many hashtags should I use on Instagram?",
    a: "Start with 3 to 5 highly relevant hashtags per post, then add a few niche or branded tags if they genuinely describe the post. Instagram allows up to 30 hashtags, but that is a ceiling, not a target. A smaller, focused set is easier to review and keeps the caption readable.",
  },
  {
    q: "How should I organize Instagram hashtag sets?",
    a: "Group tags into three tiers: broad tags for the general topic, niche tags for your specific audience or location, and branded tags for your own campaign or community. Save each mix as a named set so you can reuse it, then swap a few tags for each new post instead of starting from scratch.",
  },
  {
    q: "Does this worksheet guarantee hashtag reach?",
    a: "No. Hashtag reach is not guaranteed. Tags help people who follow or search a topic find a post, but Instagram decides what to show based on relevance, engagement and other signals. Review every tag for relevance and check it in Instagram before posting.",
  },
  {
    q: "Where are my saved hashtag sets stored?",
    a: "Saved sets are stored in your browser's local storage on this device. They are not uploaded to a server and are not shared with anyone. Clearing your browser's site data removes them, so copy any set you want to keep.",
  },
  {
    q: "Can I copy a saved set into a caption?",
    a: "Yes. Select a saved set and use Copy selected to put the tags on your clipboard, then paste them into your caption. If clipboard access is blocked, the tags are shown on screen so you can select and copy them manually.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({ name: "Instagram Hashtag Strategy Worksheet", description, url: `${BRAND.url}${PATH}` });
const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", url: BRAND.url },
  { name: "Free tools", url: `${BRAND.url}/tools` },
  { name: "Hashtag strategy worksheet", url: `${BRAND.url}${PATH}` },
]);

export default function InstagramHashtagStrategyPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(crumbsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <nav aria-label="Breadcrumb" className={s.crumbs}>
        <Link href="/tools">Free Instagram tools</Link> / Hashtag strategy worksheet
      </nav>
      <header className="hero">
        <span className="pill">Free · no signup · saved in your browser</span>
        <h1>
          Instagram hashtag strategy worksheet: <em className="s mark">plan broad, niche and branded sets</em>
        </h1>
        <p className="lede">
          Use 3 to 5 highly relevant hashtags per post, then add niche and branded tags that genuinely describe it.
          Group your tags into three sets, save each mix by name, and copy a set when you are ready to post.
        </p>
        <div className="hero-art">
          <Image
            sizes="(max-width: 1140px) 100vw, 1060px"
            src="/landing/multichannel.webp"
            width={1536}
            height={1024}
            alt="A creator at a laptop plans a post that splits to several phones and screens"
          />
        </div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <HashtagStrategyWorksheet />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        Need tags to start with?{" "}
        <Link className={s.vlink} href="/tools/instagram-hashtag-generator">
          Build a set with the hashtag generator
        </Link>
        {" · "}
        <Link className={s.vlink} href="/tools/instagram-caption-formatter">
          Format the caption
        </Link>
      </p>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">A simple system</p>
              <h2>Three tiers, one reusable set</h2>
            </div>
            <div className="pains">
              <div className="pain">
                <b>Broad tags</b>
                <span>
                  General topic tags such as #fitness or #smallbusiness. They describe the subject, but they are crowded,
                  so keep them few and relevant.
                </span>
              </div>
              <div className="pain">
                <b>Niche tags</b>
                <span>
                  Specific audience, location or product tags such as #denverpersonaltrainer. These are usually the most
                  useful part of a set because they match what a smaller audience searches.
                </span>
              </div>
              <div className="pain">
                <b>Branded tags</b>
                <span>
                  Your own campaign or community tags. Use them to collect user posts and track a launch, not to chase
                  reach on their own.
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
            <h2>Instagram hashtag strategy questions</h2>
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
              <h2>Plan the tags, then schedule the post</h2>
              <p>Copy your chosen set, write the caption, and put the post on your calendar with {BRAND.name}.</p>
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
              Schedule the post with your hashtags
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
