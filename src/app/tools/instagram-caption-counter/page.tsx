import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { PLATFORM_LIMITS } from "@/lib/captionLimits";
import CaptionCounter from "./CaptionCounter";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

const PATH = "/tools/instagram-caption-counter";
const ig = PLATFORM_LIMITS.instagram;
const threads = PLATFORM_LIMITS.threads;
const n = (v: number | null) => (v === null ? "No published limit" : v.toLocaleString("en-US"));
const description = `Free Instagram caption counter: count characters, hashtags and @mentions as you type, check the ${n(ig.max)} limit and preview the feed cut-off.`;

export const metadata: Metadata = {
  // Absolute so the layout's "| brand" suffix does not push it past 60 characters.
  title: { absolute: `Instagram Caption Counter (${n(ig.max)} Limit) + Hashtag Checker` },
  description,
  alternates: { canonical: PATH },
};

const limitRows: [string, string][] = [
  ["Caption length", `${n(ig.max)} characters`],
  ["Hashtags per post", n(ig.hashtags)],
  ["@mentions per caption", n(ig.mentions)],
  ["Feed cut-off (\"more\")", `About ${n(ig.foldAt)} characters or two lines`],
];

const faqs = [
  {
    q: "How long can an Instagram caption be?",
    a: `An Instagram caption can be up to ${n(ig.max)} characters. Emoji, spaces and line breaks all count. Paste your caption into the counter above to see how many characters you have left.`,
  },
  {
    q: "How many hashtags can you use on Instagram?",
    a: `You can add up to ${n(ig.hashtags)} hashtags to one Instagram post. The counter lists every hashtag it finds and warns you when you go over ${n(ig.hashtags)}. Tags made only of numbers, like #123, are not counted.`,
  },
  {
    q: "Does the first line of an Instagram caption matter?",
    a: `Yes. In the feed, Instagram shows only about the first ${n(ig.foldAt)} characters or two lines, then hides the rest behind "more". Put your hook or call to action there. The preview above shows roughly where the cut falls; the exact point varies by device.`,
  },
  {
    q: "What is the difference between Threads and Instagram caption limits?",
    a: `A Threads post can be up to ${n(threads.max)} characters, while an Instagram caption can be up to ${n(ig.max)}. Switch to the Threads tab in the counter to check a post against the ${n(threads.max)}-character limit.`,
  },
];

const toolJsonLd = toolSoftwareJsonLd({
  name: "Instagram Caption Character Counter",
  description,
  url: `${BRAND.url}${PATH}`,
});

export default function InstagramCaptionCounterPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Instagram caption <em className="s mark">character counter</em>
        </h1>
        <p className="lede">
          Count characters, hashtags and @mentions as you type, check the {n(ig.max)}-character limit and see where Instagram cuts your caption with &quot;more&quot;.
        </p>
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
        <CaptionCounter />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-line-break-generator">
          Line break generator
        </Link>
        {" · "}
        <Link className={s.vlink} href="/tools/instagram-image-size">
          Image size guide
        </Link>
      </p>

      {/* Limits table */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">The limits</p>
            <h2>Instagram caption limits</h2>
          </div>
          <div className={s.tableWrap} style={{ maxWidth: 760, marginInline: "auto" }}>
            <table className={s.table}>
              <tbody>
                {limitRows.map(([label, value]) => (
                  <tr key={label} className={s.tr}>
                    <th scope="row" className={s.th}>{label}</th>
                    <td className={s.td}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 16 }}>
            Length, hashtag and mention limits:{" "}
            <a href={ig.source} target="_blank" rel="noopener noreferrer" className={s.vlink}>
              Meta Instagram API docs
            </a>
            . The feed cut-off is an estimate and varies by device.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram caption questions</h2>
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
            <Link className={s.vlink} href="/instagram-auto-dm">
              How Instagram auto DM works
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
