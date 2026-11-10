import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import CaptionFormatter from "./CaptionFormatter";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

const PATH = "/tools/instagram-caption-formatter";
const igMax = 2200;
const description =
  "Free Instagram caption formatter: keep blank lines and spacing, check character and hashtag counts, then copy caption. Browser-only, nothing uploaded.";

export const metadata: Metadata = {
  title: { absolute: `Instagram Caption Formatter: Keep Line Breaks & Spacing` },
  description,
  alternates: { canonical: PATH },
};

const faqs = [
  {
    q: "Does this formatter change my caption?",
    a: "No. It shows your caption exactly as you typed it, with blank lines and spacing preserved, so you can copy it into Instagram or your scheduler without losing paragraph breaks.",
  },
  {
    q: "Will Instagram collapse my blank lines?",
    a: "Instagram can drop trailing spaces and empty lines when you save a caption. This formatter displays your text exactly as typed so you can check the spacing before you copy it into the caption field.",
  },
  {
    q: "How are characters and hashtags counted?",
    a: `Every letter, emoji, space and line break counts as a character. Hashtags are words starting with # that contain at least one letter. Instagram allows up to ${igMax} characters and 30 hashtags per post.`,
  },
  {
    q: "Can I schedule this caption?",
    a: "Yes. Copy the formatted text and paste it into Instagram or Poskoo when you schedule your post. Use the caption counter alongside it to stay within the character limit.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({
  name: "Instagram Caption Formatter",
  description,
  url: `${BRAND.url}${PATH}`,
});

export default function InstagramCaptionFormatterPage() {
  return (
    <PublicShell
      breadcrumbs={[
        { name: "Free Instagram tools", path: "/tools" },
        { name: "Instagram caption formatter", path: PATH },
      ]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Instagram caption <em className="mark">formatter</em>
        </h1>
        <p className="lede">
          Paste your caption and keep blank lines and spacing. See character and hashtag counts live, then copy the result to post or schedule.
        </p>
        <div className="hero-art" style={{ maxWidth: 520 }}>
          <Image
            sizes="(max-width: 520px) 100vw, 520px"
            src="/landing/card-schedule.webp"
            width={900}
            height={900}
            loading="lazy"
            alt="A creator pins post cards onto a weekly calendar next to a smiling alarm clock"
          />
        </div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <CaptionFormatter />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        Copy your finished caption above, then paste it into Instagram or a new post in the{" "}
        <Link className={s.vlink} href="/instagram-scheduler">
          Instagram scheduler
        </Link>
        .
      </p>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-caption-counter">
          Caption counter
        </Link>
        {" · "}
        <Link className={s.vlink} href="/tools/instagram-line-break-generator">
          Line break generator
        </Link>
        {" · "}
        <Link className={s.vlink} href="/tools/instagram-post-preview">
          Post preview
        </Link>
      </p>

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram caption formatter FAQ</h2>
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

      {/* CTA */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Schedule this caption and auto-DM everyone who comments</h2>
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
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link className={s.vlink} href="/instagram-scheduler">
              Instagram scheduler
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
