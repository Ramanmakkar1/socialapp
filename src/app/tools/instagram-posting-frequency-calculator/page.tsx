import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import FrequencyCalculator from "./FrequencyCalculator";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/tools/instagram-posting-frequency-calculator";
const description =
  "Free Instagram posting frequency calculator: choose your weekly time budget and content formats to see a realistic weekly posting range and a sample plan.";

export const metadata: Metadata = {
  title: { absolute: `Instagram Posting Frequency Calculator | ${BRAND.name}` },
  description,
  alternates: { canonical: PATH },
};

const faqs = [
  {
    q: "How often should I post on Instagram?",
    a: "There is no universal ideal frequency. A cadence you can sustain beats a burst you abandon: most accounts do well anywhere from 3 to 7 feed posts or Reels per week plus regular Stories, but the right number depends on how much time you have and how your audience responds. Use the calculator above to turn your weekly time budget into a range you can actually keep.",
  },
  {
    q: "Does posting more often guarantee more growth?",
    a: "No. Instagram does not reward volume on its own. Consistency, content quality and how people respond (saves, shares, comments, follows from the post) matter more than hitting a magic number. Watch your Insights and adjust the mix and frequency to what your audience actually engages with.",
  },
  {
    q: "Which formats should I mix each week?",
    a: "A common starting mix is Reels for reach, carousels or feed posts for saves, and Stories for daily presence. Pick the formats in the calculator that match the time you really have — the sample week shows one balanced split of your budget.",
  },
  {
    q: "How do I keep a posting schedule without doing it every day?",
    a: "Batch-create content once a week, then put it on a calendar. The Poskoo Instagram scheduler publishes posts, Reels, carousels and Stories at the times you pick, and the content planner walks you through drafting each post with free tools.",
    linked: [
      { href: "/instagram-scheduler", label: "Instagram scheduler" },
      { href: "/instagram-content-planner", label: "content planner" },
    ],
  },
];

const faqItems = faqs.map((f) => ({
  q: f.q,
  a:
    "linked" in f && f.linked
      ? `${f.a} ${f.linked.map((l) => `${BRAND.url}${l.href}`).join(" and ")}`
      : f.a,
}));
const toolJsonLd = toolSoftwareJsonLd({
  name: "Instagram Posting Frequency Calculator",
  description,
  url: `${BRAND.url}${PATH}`,
});

export default function InstagramPostingFrequencyCalculatorPage() {
  return (
    <PublicShell
      breadcrumbs={[{ name: "Free Instagram tools", path: "/tools" }, { name: "Posting frequency calculator", path: PATH }]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Instagram posting frequency <em className="s mark">calculator</em>
        </h1>
        <p className="lede">
          Pick a weekly time budget and the content formats you make. The calculator turns them into a realistic
          weekly posting range and a sample week — an estimate of what fits your time, not a promise of growth.
        </p>
        <div className="hero-art"><AnimArt name="analytics" label="A creator waters a growing bar chart while hearts float up" /></div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <FrequencyCalculator />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-scheduling-checklist">
          Scheduling checklist
        </Link>
        {" · "}
        <Link className={s.vlink} href="/tools/instagram-engagement-rate-calculator">
          Engagement rate calculator
        </Link>
      </p>

      {/* Guidance */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Consistency beats a universal “ideal” frequency</h2>
            <p>
              There is no single posting frequency that works for every account. What matters is a cadence you can
              sustain week after week and content your audience actually responds to — saves, shares, comments and
              follows, visible in Instagram Insights. Posting daily and burning out in a month loses to three
              strong posts a week you can keep up.
            </p>
            <p>
              Use the range above as a planning ceiling based on your real time budget, then watch how each format
              performs and shift time toward what your audience engages with most. When the plan is set,{" "}
              <Link className={s.vlink} href="/instagram-scheduler">
                schedule the week in the Instagram scheduler
              </Link>{" "}
              or draft each post step by step with the{" "}
              <Link className={s.vlink} href="/instagram-content-planner">
                Instagram content planner
              </Link>
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
            <h2>Posting frequency questions</h2>
          </div>
          <div className="faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                {"linked" in f && f.linked ? (
                  <p>
                    {f.a}{" "}
                    {f.linked.map((l, i) => (
                      <span key={l.href}>
                        {i > 0 ? " " : ""}
                        <Link className={s.vlink} href={l.href}>
                          {l.label}
                        </Link>
                        {i === 0 ? " or " : "."}
                      </span>
                    ))}
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
              <h2>Plan the week, then let it publish itself</h2>
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
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link className={s.vlink} href="/instagram-scheduler">
              Instagram scheduler
            </Link>{" "}
            ·{" "}
            <Link className={s.vlink} href="/instagram-content-planner">
              Instagram content planner
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
