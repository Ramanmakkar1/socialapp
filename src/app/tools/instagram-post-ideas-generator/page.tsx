import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import PostIdeasGenerator from "./PostIdeasGenerator";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/tools/instagram-post-ideas-generator";
const description =
  "48 free Instagram post ideas by niche. Copy hooks and caption starters for reels, carousels, stories and posts, then schedule them in Poskoo.";
export const metadata: Metadata = {
  title: { absolute: "Instagram Post Ideas Generator: 48 Ideas by Niche | Free" },
  description,
  alternates: { canonical: PATH },
};
const steps = [
  <>Pick your niche and a format, then tap <b>New ideas</b> until one sparks something.</>,
  <>
    Copy the idea. The hook is your first line; expand the caption starter in your own voice. Stuck on the wording? Try our{" "}
    <Link className={s.vlink} href="/tools/instagram-caption-generator">
      caption generator
    </Link>
    .
  </>,
  <>
    Schedule it. Plan the post on your Poskoo calendar with our{" "}
    <Link className={s.vlink} href="/instagram-scheduler">
      Instagram scheduler
    </Link>
    , and publish it at the time you pick.
  </>,
];
const faqs = [
  {
    q: "Is this Instagram post ideas generator free?",
    a: "Yes. The tool runs entirely in your browser. Pick a niche, get six post ideas with hooks and caption starters, and copy them. Nothing is uploaded and no account is needed.",
  },
  {
    q: "How do I use these post ideas?",
    a: "Pick your niche and a format, then copy the idea you like. Use the hook as your first line, expand the caption starter in your own voice, and schedule the post in Poskoo.",
  },
  {
    q: "Do the ideas work for my niche?",
    a: "The generator covers eight niches: coach, e-commerce, restaurant, fitness, beauty, real estate, creator and agency. If your niche is close to one of these, the formats and hooks transfer directly.",
  },
  {
    q: "Can I schedule these posts automatically?",
    a: "Yes. Poskoo lets you schedule Instagram posts from a calendar, so you can plan a week of content in one sitting and publish it on your schedule.",
  },
];
const toolJsonLd = toolSoftwareJsonLd({ name: "Instagram Post Ideas Generator", description, url: `${BRAND.url}${PATH}` });

export default function InstagramPostIdeasGeneratorPage() {
  return (
    <PublicShell breadcrumbs={[{ name: "Free Instagram tools", path: "/tools" }, { name: "Post ideas generator", path: PATH }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free / runs in your browser / nothing is uploaded</span>
        <h1>
          Instagram post ideas <em className="s mark">generator</em>
        </h1>
        <p className="lede">
          Get 48 ready-to-use post ideas for eight niches, each with a hook and a caption starter. Copy them, make them yours, and schedule the rest in Poskoo.
        </p>
        <div className="hero-art"><AnimArt name="writing" label="A creator writes with a giant pencil on a phone-shaped card full of lines and emoji" /></div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <PostIdeasGenerator />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-caption-generator">
          Caption generator
        </Link>
        {" / "}
        <Link className={s.vlink} href="/tools/instagram-hashtag-generator">
          Hashtag generator
        </Link>
        {" / "}
        <Link className={s.vlink} href="/tools/instagram-bio-generator">
          Bio generator
        </Link>
      </p>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Step by step</p>
              <h2>How to use these ideas</h2>
            </div>
            <div className="pains">
              {steps.map((step, i) => (
                <div key={i} className="pain">
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
            <h2>Instagram post ideas FAQ</h2>
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
              <h2>Turn these ideas into a content calendar</h2>
              <p>{BRAND.tagline}</p>
              <Link className="btn" href="/signup">
                Start free <span aria-hidden="true">→</span>
              </Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-schedule.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="A week of Instagram posts planned on the Poskoo calendar"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
