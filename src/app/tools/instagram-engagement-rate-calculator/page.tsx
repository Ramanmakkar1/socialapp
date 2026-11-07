import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import EngagementCalculator from "./EngagementCalculator";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

const PATH = "/tools/instagram-engagement-rate-calculator";
const description =
  "Free Instagram engagement rate calculator: enter likes, comments, saves and shares, then divide by followers or reach to get your rate in seconds.";

export const metadata: Metadata = {
  title: { absolute: `Free Instagram Engagement Rate Calculator | ${BRAND.name}` },
  description,
  alternates: { canonical: PATH },
};

const faqs = [
  {
    q: "What is engagement rate on Instagram?",
    a: "Engagement rate is the share of your audience that interacted with a post. You add up likes, comments, saves and shares, divide by a base number (usually followers or reach), and multiply by 100 to get a percentage.",
  },
  {
    q: "How do you calculate engagement rate by reach?",
    a: "Add the post’s likes, comments, saves and shares, divide by how many accounts saw the post (reach), and multiply by 100. Reach-based rates often look higher than follower-based rates because reach is usually smaller than your follower count.",
  },
  {
    q: "Do saves and shares count?",
    a: "Yes. Saves and shares are strong signals that someone valued the post enough to keep or send it. Many calculators count only likes and comments; including saves and shares gives a fuller picture of how a post performed.",
  },
  {
    q: "How can I get more comments on Instagram?",
    a: "Ask a clear question in the caption, use a comment keyword in Stories or Reels, and reply quickly so the thread stays active. Comment-keyword auto-DMs send a link or resource when someone comments a word you choose.",
    linked: { href: "/instagram-auto-dm", label: "Instagram comment auto-DM" },
  },
];

const faqItems = faqs.map((f) => ({
  q: f.q,
  a: "linked" in f && f.linked ? `${f.a} ${BRAND.url}${f.linked.href}` : f.a,
}));
const toolJsonLd = toolSoftwareJsonLd({ name: "Instagram Engagement Rate Calculator", description, url: `${BRAND.url}${PATH}` });

export default function InstagramEngagementRateCalculatorPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Instagram engagement rate <em className="s mark">calculator</em>
        </h1>
        <p className="lede">
          Enter likes, comments, saves and shares for one post, choose followers or reach as the base, and get your
          engagement rate as a percentage.
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
        <EngagementCalculator />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-caption-counter">
          Caption counter
        </Link>
        {" · "}
        <Link className={s.vlink} href="/tools/instagram-line-break-generator">
          Line break generator
        </Link>
      </p>

      {/* How engagement rate is calculated */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>How engagement rate is calculated</h2>
            <p>
              <strong>By followers</strong> divides total interactions by your follower
              count. It answers: of everyone who follows you, what fraction engaged with this post? It is easy to compare
              across posts when your audience size is stable.
            </p>
            <p>
              <strong>By reach</strong> divides by how many unique accounts saw the post
              (from Instagram Insights). Reach is often lower than followers, so the same interactions produce a higher
              percentage. Use reach when you care about performance among people who actually saw the content.
            </p>
            <p>
              <strong>Saves and shares</strong> count toward the numerator because they
              show intent beyond a quick like. If you do not have save or share counts handy, leave those fields blank and
              the calculator treats them as zero.
            </p>
            <p className="small" style={{ marginTop: 4 }}>
              Interaction types follow what Instagram reports in Insights. For official metrics definitions, see{" "}
              <a
                href="https://business.facebook.com/business/help"
                target="_blank"
                rel="noopener noreferrer"
                className={s.vlink}
              >
                Meta Business Help Center
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram engagement rate questions</h2>
          </div>
          <div className="faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                {"linked" in f && f.linked ? (
                  <p>
                    {f.a}{" "}
                    <Link className={s.vlink} href={f.linked.href}>
                      {f.linked.label}
                    </Link>
                    .
                  </p>
                ) : (
                  <p>{f.a}</p>
                )}
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
