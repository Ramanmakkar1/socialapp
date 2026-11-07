import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import CaptionGeneratorTool from "./CaptionGeneratorTool";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

const PATH = "/tools/instagram-caption-generator";
const description =
  "Free Instagram caption generator. Craft engaging post captions with hooks, CTAs, and line breaks without AI keys or sign-up. 100% browser-based.";

export const metadata: Metadata = {
  title: { absolute: "Free Instagram Caption Generator (No Sign-Up) | Poskoo" },
  description,
  alternates: { canonical: `${BRAND.url}${PATH}` },
};

const steps = [
  "Enter your topic, product, or central theme for the Instagram post.",
  "Select your objective (engagement, sales, announcement, educate) and preferred tone of voice.",
  "Toggle emojis or add a comment-keyword call to action to boost engagement and auto-DMs.",
  "Copy your favorite caption card or click Regenerate to explore more template combinations.",
];

const faqs = [
  {
    q: "What is the Instagram caption character limit?",
    a: "Instagram allows up to 2,200 characters in a single post caption. Keep your key message and hook in the first 125 characters before Instagram truncates the preview.",
  },
  {
    q: "How many hashtags should I include in my caption?",
    a: "Instagram permits up to 30 hashtags per post, but 3 to 5 highly relevant, targeted hashtags often yield the best balance between reach and readability.",
  },
  {
    q: "How do I add clean line breaks to my Instagram captions?",
    a: "Our caption generator outputs real line breaks directly. You can also format any custom caption text with our free Instagram line break generator to prevent spacing collapse.",
  },
  {
    q: "How do I automatically DM followers who comment on my post?",
    a: "Pair comment-keyword CTAs with Poskoo's Instagram auto-DM feature. When followers comment a trigger word like GUIDE or LINK, Poskoo sends them an instant private message automatically.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({
  name: "Instagram Caption Generator",
  description,
  url: `${BRAND.url}${PATH}`,
});

export default function InstagramCaptionGeneratorPage() {
  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }}
      />

      <header className="hero">
        <span className="pill">Free / runs in your browser / no AI API keys</span>
        <h1>
          Instagram Caption <em className="s mark">Generator</em>
        </h1>
        <p className="lede">
          Generate high-converting Instagram captions tailored by goal and tone. Complete with attention-grabbing hooks, clean line breaks, and comment CTAs.
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
        <CaptionGeneratorTool />
      </div>

      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-caption-counter">
          Caption counter
        </Link>
        {" / "}
        <Link className={s.vlink} href="/tools/instagram-hashtag-generator">
          Hashtag generator
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
            <h2>Frequently asked questions</h2>
          </div>
          <div className="faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>
                  {f.q.includes("line break") ? (
                    <>
                      Our caption generator outputs real line breaks directly. You can also format any custom caption text with our free{" "}
                      <Link className={s.vlink} href="/tools/instagram-line-break-generator">
                        Instagram line break generator
                      </Link>{" "}
                      to prevent spacing collapse.
                    </>
                  ) : f.q.includes("auto-DM") ? (
                    <>
                      Pair comment-keyword CTAs with Poskoo’s{" "}
                      <Link className={s.vlink} href="/instagram-auto-dm">
                        Instagram auto-DM
                      </Link>{" "}
                      feature. When followers comment a trigger word like GUIDE or LINK, Poskoo sends them an instant private message automatically.
                    </>
                  ) : (
                    f.a
                  )}
                </p>
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
