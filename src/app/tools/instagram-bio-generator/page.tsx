import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import BioTool from "./BioTool";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

const PATH = "/tools/instagram-bio-generator";
const description =
  "Free Instagram bio generator with niche templates, optional styled names, and a live 150-character counter. Copy ideas for creators, coaches, and brands.";
export const metadata: Metadata = {
  title: { absolute: "Instagram Bio Generator: Free Bio Ideas You Can Copy" },
  description,
  alternates: { canonical: PATH },
};
const steps = [
  "Enter your name, what you do, and a call to action.",
  "Pick a niche to see four bio templates you can customize.",
  "Copy a bio, then paste it into Instagram. Use our line break tool if spacing looks off.",
];
const faqs = [
  {
    q: "What is the Instagram bio character limit?",
    a: "Instagram bios allow up to 150 characters. Emojis and styled Unicode letters each count toward that limit.",
  },
  {
    q: "How do I add line breaks to my Instagram bio?",
    a: "Type your bio with line breaks in Notes or our line break generator, copy the text, then paste into Edit profile > Bio on Instagram.",
  },
  {
    q: "Are fancy fonts safe to use in my bio?",
    a: "Yes. Styled names use standard Unicode characters you copy and paste. Keep important keywords in plain text for search and accessibility.",
  },
  {
    q: "What should I put in a bio call to action?",
    a: "Tell people the one action you want: DM a keyword, tap the link, book a call, or shop. Keep it short and match what you actually offer.",
  },
];
const toolJsonLd = toolSoftwareJsonLd({ name: "Instagram Bio Generator", description, url: `${BRAND.url}${PATH}` });

export default function InstagramBioGeneratorPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free / runs in your browser / nothing is uploaded</span>
        <h1>
          Instagram bio <em className="s mark">generator</em>
        </h1>
        <p className="lede">
          Get niche bio templates with emojis and line breaks, optional styled names, and a live 150-character counter.
        </p>
        <div className="hero-art" style={{ maxWidth: 520 }}>
          <Image
            sizes="(max-width: 520px) 100vw, 520px"
            src="/landing/card-leads.webp"
            width={900}
            height={900}
            loading="lazy"
            alt="Two friends high-five next to a board of contacts with check marks and a rising chart"
          />
        </div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <BioTool />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-font-generator">
          Font generator
        </Link>
        {" / "}
        <Link className={s.vlink} href="/tools/instagram-line-break-generator">
          Line break generator
        </Link>
        {" / "}
        <Link className={s.vlink} href="/tools/instagram-username-generator">
          Instagram username generator
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
            <h2>Instagram bio FAQ</h2>
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
