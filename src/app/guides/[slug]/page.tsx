import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicShell from "@/components/PublicShell";
import site from "@/components/site.module.css";
import PoskooMark from "@/components/PoskooMark";
import { RelatedTools, ToolCta } from "@/components/tools/ToolPageTemplate";
import { Takeaways } from "@/components/guides/GuideBlocks";
import { ShareLinks } from "@/components/guides/ShareLinks";
import g from "@/components/guides/guides.module.css";
import t from "@/components/tools/tools.module.css";
import { BRAND } from "@/lib/brand";
import { faqJsonLd, ldJson } from "@/lib/tool-schema";
import { GUIDES, categoryLabel, guideBySlug, guidePath, readingMinutes } from "@/content/guides/registry";
import { GUIDE_BODIES } from "@/content/guides/bodies";

// Only the slugs in the registry exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = guideBySlug((await params).slug);
  if (!guide) return {};
  const path = guidePath(guide.slug);
  const image = { url: guide.cover.src, width: guide.cover.width, height: guide.cover.height, alt: guide.cover.alt };
  return {
    title: { absolute: guide.title },
    description: guide.description,
    alternates: { canonical: path },
    authors: [{ name: guide.author, url: BRAND.url }],
    openGraph: {
      type: "article",
      siteName: BRAND.name,
      title: guide.title,
      description: guide.description,
      url: path,
      publishedTime: guide.published,
      modifiedTime: guide.updated,
      authors: [guide.author],
      section: categoryLabel(guide.category),
      images: [image, { url: "/opengraph-image", width: 1200, height: 630, alt: `${BRAND.name} guides` }],
    },
    twitter: { card: "summary_large_image", title: guide.title, description: guide.description, images: [guide.cover.src] },
  };
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`)
  );

// Help articles that round out "Keep reading" while the guide library is small.
const FURTHER_READING = [
  { href: "/help/schedule-instagram-reels", label: "Help article", title: "How to schedule Instagram Reels", text: "Paste a video link, write the caption and pick a time." },
  { href: "/help/auto-dm-instagram-comments", label: "Help article", title: "Auto-DM everyone who comments a keyword", text: "Set up a comment-to-DM rule step by step." },
  { href: "/instagram-content-planner", label: "Planner", title: "Plan an Instagram post step by step", text: "Hook, caption, image size, preview, then schedule." },
];

export default async function GuidePage({ params }: Props) {
  const guide = guideBySlug((await params).slug);
  const body = guide ? GUIDE_BODIES[guide.slug] : undefined;
  if (!guide || !body) notFound();

  const path = guidePath(guide.slug);
  const url = `${BRAND.url}${path}`;
  const minutes = readingMinutes(guide);
  const toc = [
    ...body.sections.map((s) => ({ id: s.id, title: s.title })),
    { id: "faq", title: "FAQ" },
    { id: "sources", title: "Sources" },
  ];

  const relatedGuides = (guide.related ?? [])
    .map(guideBySlug)
    .filter((x) => x !== undefined)
    .map((r) => ({ href: guidePath(r.slug), label: categoryLabel(r.category), title: r.crumb, text: r.excerpt }));
  const keepReading = [...relatedGuides, ...FURTHER_READING].slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: guide.h1,
    description: guide.description,
    image: [`${BRAND.url}${guide.cover.src}`],
    datePublished: guide.published,
    dateModified: guide.updated,
    author: { "@type": "Organization", name: guide.author, url: BRAND.url },
    publisher: {
      "@type": "Organization",
      name: BRAND.name,
      url: BRAND.url,
      logo: { "@type": "ImageObject", url: `${BRAND.url}/apple-icon` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    articleSection: categoryLabel(guide.category),
    wordCount: guide.wordCount,
    inLanguage: "en",
  };

  const tocList = (
    <ol>
      {toc.map((s) => (
        <li key={s.id}>
          <a href={`#${s.id}`}>{s.title}</a>
        </li>
      ))}
    </ol>
  );

  return (
    <PublicShell className={site.wide}
      breadcrumbs={[
        { name: "Guides", path: "/guides" },
        { name: guide.crumb, path },
      ]}
    >
      {[articleJsonLd, faqJsonLd(guide.faqs)].map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(data) }} />
      ))}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <symbol id="tool-ok" viewBox="0 0 18 18">
            <circle cx="9" cy="9" r="9" fill="var(--green)" />
            <path d="M5 9.3l2.6 2.5L13 6.4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </symbol>
        </defs>
      </svg>
      <div className={`${t.page} ${g.page}`}>
        <header className={g.articleHero}>
          <div className={g.heroCopy}>
            <Link className={g.chip} href="/guides">{categoryLabel(guide.category)}</Link>
            <h1>{guide.h1}</h1>
            <p className={g.subtitle}>{guide.subtitle}</p>
            <div className={g.byline}>
              <span className={g.avatar} aria-hidden="true"><PoskooMark size={26} animated={false} /></span>
              <div>
                <b>By {guide.author}</b>
                <p className={g.meta}>
                  <span>Published <time dateTime={guide.published}>{formatDate(guide.published)}</time></span>
                  <span>Updated <time dateTime={guide.updated}>{formatDate(guide.updated)}</time></span>
                  <span>{minutes} min read</span>
                </p>
              </div>
            </div>
          </div>
          <figure className={g.cover}>
            <Image
              src={guide.cover.src}
              width={guide.cover.width}
              height={guide.cover.height}
              alt={guide.cover.alt}
              priority
              sizes="(max-width: 899px) 92vw, 520px"
            />
          </figure>
        </header>

        <div className={g.layout}>
          <aside className={g.toc} aria-label="Table of contents">
            <details className={g.tocMobile}>
              <summary><span className="eyebrow">On this page</span></summary>
              {tocList}
            </details>
            <nav className={g.tocDesktop} aria-label="On this page">
              <p className="eyebrow">On this page</p>
              {tocList}
            </nav>
            <ShareLinks url={url} title={guide.title} className={g.tocShare} />
          </aside>

          <article className={g.prose}>
            <Takeaways items={guide.takeaways} />
            <div className={g.lead}>{body.intro}</div>
            {body.sections.map((s) => (
              <section key={s.id} aria-labelledby={s.id}>
                <h2 id={s.id}>{s.title}</h2>
                {s.body}
              </section>
            ))}
            <section aria-labelledby="faq">
              <h2 id="faq">Frequently asked questions</h2>
              <div className="faq">
                {guide.faqs.map((f) => (
                  <details key={f.q}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
            <section aria-labelledby="sources" className={g.sources}>
              <h2 id="sources">Sources</h2>
              <ul>
                {body.sources.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener">{s.label}</a>
                  </li>
                ))}
              </ul>
            </section>
            <div className={g.shareEnd}>
              <p>Found this useful? Send it to someone picking a niche.</p>
              <ShareLinks url={url} title={guide.title} />
            </div>
          </article>
        </div>

        <section className={t.section} aria-labelledby="keep-reading">
          <div className={g.relHead}>
            <div>
              <p className="eyebrow">Keep reading</p>
              <h2 id="keep-reading">More guides and how-tos</h2>
            </div>
            <Link href="/guides" className={g.textLink}>All guides <span aria-hidden="true">→</span></Link>
          </div>
          <ul className={g.grid}>
            {keepReading.map((r) => (
              <li key={r.href}>
                <Link className={g.card} href={r.href}>
                  <span className={g.chip}>{r.label}</span>
                  <b>{r.title}</b>
                  <p>{r.text}</p>
                  <span className={g.go}>Read <span aria-hidden="true">→</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <RelatedTools hrefs={guide.tools} self={path} />
        <ToolCta
          cta={{
            title: guide.category === "auto-dm" ? "Ready to automate?" : guide.category === "money" ? "Ready to earn?" : guide.category === "growth" ? "Found your niche?" : "Ready to grow?",
            mark: guide.category === "auto-dm" ? "Send your link to every commenter." : "Now post it on schedule.",
            text: `Plan a week of posts in ${BRAND.name}, publish them automatically and DM everyone who comments your keyword.`,
            art: "card-schedule",
          }}
        />
      </div>
    </PublicShell>
  );
}
