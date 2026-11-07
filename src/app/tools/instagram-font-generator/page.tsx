import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import FontTool from "./FontTool";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

const PATH = "/tools/instagram-font-generator";
const description =
  "Create Instagram bio fonts and captions in bold, italic, script and more. Copy and paste Unicode text for free in your browser.";
export const metadata: Metadata = {
  title: { absolute: "Instagram Font Generator: Copy & Paste Bio Fonts (Free)" },
  description,
  alternates: { canonical: PATH },
};
const steps = ["Type or paste your text into the box.", "Choose a font style from the previews and click Copy.", "Paste the text into your Instagram bio or caption."];
const faqs = [
  { q: "Do these fonts work in bios, captions and usernames?", a: "You can use these Unicode styles in Instagram bios and captions, but not in usernames." },
  { q: "Are these fonts searchable and accessible?", a: "Styled characters may not match ordinary search terms, and screen readers may read them badly. Keep important keywords in plain text." },
  { q: "Do fonts count toward the 150-character bio limit?", a: "Yes. Styled characters count toward the limit, and some count as two characters." },
  { q: "Are these fonts safe?", a: "Yes. They are plain Unicode characters that you can copy and paste." },
];
const toolJsonLd = toolSoftwareJsonLd({ name: "Instagram Font Generator", description, url: `${BRAND.url}${PATH}` });

export default function InstagramFontGeneratorPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free / runs in your browser / nothing is uploaded</span>
        <h1>
          Instagram font <em className="s mark">generator</em>
        </h1>
        <p className="lede">Turn your text into bold, italic, script and more. Copy a style for your Instagram bio or caption.</p>
        <div className="hero-art">
          <Image
            sizes="(max-width: 1140px) 100vw, 1060px"
            src="/landing/multichannel.webp"
            width={1400}
            height={933}
            loading="lazy"
            alt="A creator at a laptop sends one post that splits to several phones and screens"
          />
        </div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <FontTool />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-caption-counter">
          Caption counter
        </Link>
        {" / "}
        <Link className={s.vlink} href="/tools/instagram-line-break-generator">
          Line break generator
        </Link>
      </p>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Step by step</p>
              <h2>How to use this tool</h2>
            </div>
            <div className="pains">
              {steps.map((step, i) => (
                <div key={step} className="pain">
                  <b>Step {i + 1}</b>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram font FAQ</h2>
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
