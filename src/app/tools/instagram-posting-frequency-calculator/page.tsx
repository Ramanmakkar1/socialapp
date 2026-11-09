import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import FrequencyCalculator from "./FrequencyCalculator";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

const PATH = "/tools/instagram-posting-frequency-calculator";
const description =
  "Free Instagram posting frequency calculator: choose your weekly time budget and content formats to see a realistic weekly posting range and a sample plan.";

export const metadata: Metadata = {
  title: { absolute: `Instagram Posting Frequency Calculator | ${BRAND.name}` },
  description,
  alternates: { canonical: PATH },
};

function CalendarWeekIllustration() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const posts: Record<number, number> = { 0: 1, 1: 2, 3: 1, 4: 2, 6: 1 };
  return (
    <svg
      viewBox="0 0 340 170"
      aria-hidden="true"
      focusable="false"
      style={{ width: "100%", maxWidth: 480, display: "block", marginInline: "auto" }}
    >
      <ellipse cx="170" cy="158" rx="160" ry="8" fill="var(--poskoo-violet)" opacity=".08" />
      <rect x="14" y="18" width="240" height="132" rx="16" fill="var(--poskoo-card)" stroke="var(--poskoo-line)" />
      <rect x="14" y="18" width="240" height="30" rx="14" fill="var(--poskoo-violet)" opacity=".14" />
      <rect x="30" y="27" width="90" height="7" rx="3.5" fill="var(--poskoo-violet)" />
      {days.map((d, i) => (
        <g key={i}>
          <rect
            x={26 + i * 32}
            y="58"
            width="26"
            height="80"
            rx="8"
            fill="var(--poskoo-paper)"
            stroke="var(--poskoo-line)"
          />
          <text
            x={39 + i * 32}
            y="72"
            textAnchor="middle"
            fill="#3d3450"
            opacity=".55"
            fontSize="10"
            fontWeight="600"
          >
            {d}
          </text>
          {(posts[i] ?? 0) > 0 &&
            Array.from({ length: posts[i] }).map((_, j) => (
              <rect
                key={j}
                x={30 + i * 32}
                y={82 + j * 16}
                width="18"
                height="10"
                rx="5"
                fill={j === 0 ? "var(--poskoo-violet)" : "var(--poskoo-coral)"}
                opacity={j === 0 ? ".85" : ".7"}
              />
            ))}
        </g>
      ))}
      <circle cx="288" cy="52" r="30" fill="var(--poskoo-card)" stroke="var(--poskoo-line)" strokeWidth="2" />
      <circle cx="288" cy="52" r="24" fill="var(--poskoo-band)" />
      <path d="M288 40v12l8 6" fill="none" stroke="var(--poskoo-violet)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="262" y="96" width="52" height="34" rx="10" fill="var(--poskoo-ink)" />
      <rect x="268" y="104" width="40" height="5" rx="2.5" fill="var(--poskoo-card)" />
      <rect x="268" y="114" width="26" height="5" rx="2.5" fill="var(--poskoo-card)" opacity=".6" />
      <path d="m306 132 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="var(--poskoo-coral)" />
    </svg>
  );
}

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
        <div className="hero-art" style={{ maxWidth: 480 }}>
          <CalendarWeekIllustration />
        </div>
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
