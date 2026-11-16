import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { withSocial } from "@/lib/page-metadata";
import { BRAND } from "@/lib/brand";
import { publisherRef } from "@/lib/tool-schema";
import { softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

// Readiness / pricing copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const PATH = "/features/social-media-content-calendar";
const title = `Social Media Content Calendar: Week & Month | ${BRAND.name}`;
const description =
  "Plan posts on a social media content calendar with week and month views, a publishing queue, drag-to-reschedule, time zones and clear publish status.";

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
});

const steps = [
  {
    n: "1",
    title: "Connect your accounts",
    text: "Link Instagram, Facebook and Threads with each platform's own official login. Poskoo never asks for your password, and you can disconnect at any time.",
  },
  {
    n: "2",
    title: "Pick a week or month view",
    text: "Switch between a week grid for detailed planning and a month view for the big picture. Both show the same posts, so nothing is hidden when you zoom out.",
  },
  {
    n: "3",
    title: "Compose a post with media",
    text: "Write the caption, add an image, carousel or Reel, choose the account and set the publish time in your own time zone.",
  },
  {
    n: "4",
    title: "Queue it or drag to reschedule",
    text: "Add the post to the queue and Poskoo publishes it at the scheduled time. Drag a card to another day or time to reschedule it without retyping anything.",
  },
  {
    n: "5",
    title: "Watch the publish status",
    text: "Every post shows queued, publishing, published or failed. Failed posts retry automatically within each platform's limits, and you can retry by hand.",
  },
];

const benefits = [
  {
    no: "01 / Week view",
    title: "See the whole week at a glance",
    text: "A seven-day grid with one column per day and a chip for every post. Each chip shows the format, the account and the time, so you can spot gaps and clashes before they happen.",
  },
  {
    no: "02 / Month view",
    title: "Plan a month in one sitting",
    text: "Zoom out to a month calendar to balance campaigns, launches and evergreen posts. Click any day to add a post without leaving the calendar.",
  },
  {
    no: "03 / Queue",
    title: "Let the queue do the publishing",
    text: "Add posts to the queue and Poskoo publishes them at the time you chose. The queue view lists what goes out next, so you always know what is coming.",
  },
  {
    no: "04 / Reschedule",
    title: "Move a post in one drag",
    text: "Drag a post to a new day or time and the schedule updates instantly. Edit the caption, media or account from the same card.",
  },
  {
    no: "05 / Time zones",
    title: "Publish in the right time zone",
    text: "Set your account time zone once and every post is scheduled against it. The calendar shows local times, so a 9am post means 9am where you and your audience plan.",
  },
  {
    no: "06 / Status",
    title: "Know what actually published",
    text: "Each post carries a clear status: queued, publishing, published or failed. If a platform rejects a post, you see the reason and can fix it and retry.",
  },
];

const faqs = [
  {
    q: "What is a social media content calendar?",
    a: "A social media content calendar is a visual plan of what you will post, where and when. In Poskoo it is a week or month calendar where each post shows its format, account, time and publish status, and you can drag posts to reschedule them.",
  },
  {
    q: "Does Poskoo have week and month calendar views?",
    a: "Yes. Switch between a week grid for day-by-day planning and a month view for the big picture. Both views show the same scheduled posts, so nothing changes when you zoom out.",
  },
  {
    q: "Can I reschedule a post by dragging it?",
    a: "Yes. Drag a post card to another day or time and the schedule updates. You can also open the post to change the caption, media, account or exact time.",
  },
  {
    q: "How does the publishing queue work?",
    a: "When you add a post to the queue, Poskoo publishes it at the scheduled time through each platform's official API. The queue view lists what goes out next and shows the status of every post.",
  },
  {
    q: "How are time zones handled?",
    a: "You set your time zone once and the calendar shows every post in that local time. Poskoo converts the scheduled time to the platform's expected time when it publishes, so a 9am post goes out at 9am in your time zone.",
  },
  {
    q: "Can I schedule posts with images, carousels and Reels?",
    a: "Yes. Add a single image, a carousel of 2 to 10 images, or a Reel video to a scheduled post. Poskoo publishes the media with the caption at the time you chose and reports success or failure.",
  },
  {
    q: "What happens if a scheduled post fails?",
    a: "The post is marked failed with the reason from the platform. Poskoo retries automatically within the platform's limits, and you can fix the post and retry it by hand from the calendar.",
  },
  {
    q: "Is the content calendar free to try?",
    a: "Yes. The Free plan includes 2 social accounts and 10 scheduled posts a month, so you can plan a real week before upgrading. No card is needed to sign up.",
  },
];

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND.name,
  url: `${BRAND.canonicalUrl}${PATH}`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description,
  featureList: [
    "Week and month content calendar views",
    "Publishing queue",
    "Drag-to-reschedule posts",
    "Time zone aware scheduling",
    "Image, carousel and Reel posts",
    "Clear publish status and retries",
  ],
  offers: softwareOffers(planReadiness()),
  publisher: publisherRef(),
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BRAND.canonicalUrl },
    { "@type": "ListItem", position: 2, name: "Features", item: `${BRAND.canonicalUrl}/features` },
    { "@type": "ListItem", position: 3, name: "Social media content calendar", item: `${BRAND.canonicalUrl}${PATH}` },
  ],
};

const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

const mockCard: CSSProperties = {
  background: "var(--poskoo-card, #fff)",
  border: "1px solid rgba(24, 18, 40, 0.1)",
  borderRadius: 20,
  boxShadow: "0 18px 40px rgba(24, 18, 40, 0.12)",
  padding: 18,
};

const chipTones: Record<string, { bg: string; fg: string }> = {
  reel: { bg: "rgba(123, 92, 255, 0.14)", fg: "#5b3fd6" },
  carousel: { bg: "rgba(255, 138, 76, 0.16)", fg: "#b4531a" },
  image: { bg: "rgba(46, 160, 120, 0.16)", fg: "#1f7a58" },
  story: { bg: "rgba(225, 48, 108, 0.14)", fg: "#b02a58" },
};

/** A single post chip in the week grid. The label carries the format, account and time. */
function postChip(label: string, tone: keyof typeof chipTones): ReactNode {
  const colors = chipTones[tone];
  return (
    <span
      style={{
        display: "block",
        background: colors.bg,
        color: colors.fg,
        borderRadius: 8,
        padding: "5px 7px",
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.35,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {label}
    </span>
  );
}

const weekDays = [
  { day: "Mon", date: "12", chips: [postChip("Reel · @poskoo · 9:00", "reel")] },
  { day: "Tue", date: "13", chips: [postChip("Carousel · @poskoo · 12:30", "carousel")] },
  { day: "Wed", date: "14", chips: [postChip("Image · @poskoo · 8:00", "image")] },
  { day: "Thu", date: "15", chips: [postChip("Story · @poskoo · 18:00", "story")] },
  { day: "Fri", date: "16", chips: [postChip("Reel · @poskoo · 11:00", "reel")] },
  { day: "Sat", date: "17", chips: [] },
  { day: "Sun", date: "18", chips: [postChip("Carousel · @poskoo · 10:00", "carousel")] },
];

const statusRows = [
  { label: "Reel · @poskoo · 9:00", status: "Published", color: "var(--poskoo-green)" },
  { label: "Carousel · @poskoo · 12:30", status: "Queued", color: "#5b3fd6" },
  { label: "Image · @poskoo · 8:00", status: "Publishing", color: "#b4531a" },
  { label: "Story · @poskoo · 18:00", status: "Failed · retrying", color: "#c0392b" },
];

export default function SocialMediaContentCalendarFeaturePage() {
  return (
    <PublicShell
      className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Features", path: "/features" },
        { name: "Social media content calendar", path: PATH },
      ]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(appJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(breadcrumbJsonLd) }} />

      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Week &amp; month views &middot; drag to reschedule</span>
          <p className="eyebrow">Feature &middot; Content calendar</p>
          <h1>
            Social media content calendar <em className="s mark">for planning and publishing</em>
          </h1>
          <p className="lede">
            A social media content calendar shows what you will post, where and when. {BRAND.name} gives you week
            and month views, a publishing queue, drag-to-reschedule, time-zone aware scheduling and a clear status
            for every post.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">
              Plan your first week free <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link className="btn btn-line" href="/tools/social-media-content-calendar">
              Try the free calendar template
            </Link>
          </div>
          <p className="small">
            Already planning?{" "}
            <Link href="/app" className={s.vlink}>
              Open your calendar
            </Link>
            .
          </p>
        </div>
        <div className="hero-art">
          <div style={{ ...mockCard, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>
                  Content calendar
                </p>
                <strong style={{ fontSize: 15 }}>Week of May 12</strong>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 9px",
                    borderRadius: 999,
                    background: "rgba(123, 92, 255, 0.14)",
                    color: "#5b3fd6",
                  }}
                >
                  Week
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "5px 9px",
                    borderRadius: 999,
                    background: "rgba(24, 18, 40, 0.06)",
                    color: "var(--poskoo-muted)",
                  }}
                >
                  Month
                </span>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: 5,
                marginTop: 14,
              }}
            >
              {weekDays.map((d) => (
                <div key={d.day} style={{ minWidth: 0 }}>
                  <div style={{ textAlign: "center", fontSize: 10, opacity: 0.6, marginBottom: 4 }}>
                    {d.day}
                  </div>
                  <div
                    style={{
                      minHeight: 74,
                      borderRadius: 10,
                      border: "1px solid rgba(24, 18, 40, 0.08)",
                      background: "rgba(24, 18, 40, 0.02)",
                      padding: 4,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.55 }}>{d.date}</span>
                    {d.chips}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                color: "var(--poskoo-muted)",
              }}
            >
              <span
                aria-hidden="true"
                style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--poskoo-green)" }}
              />
              Time zone: Asia/Kolkata &middot; 6 posts queued
            </div>
          </div>
        </div>
      </header>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Inside the product</p>
            <h2>One calendar, <em className="s">every post and status</em></h2>
            <p>
              The calendar is the home of your schedule. Each chip shows the format, the account and the time, and
              the queue below shows what publishes next.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 18,
              alignItems: "stretch",
            }}
          >
            <div style={mockCard}>
              <p className="eyebrow" style={{ marginBottom: 10 }}>
                Month view
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      aspectRatio: "1 / 1",
                      borderRadius: 6,
                      background:
                        i === 8 || i === 15 || i === 22
                          ? "rgba(123, 92, 255, 0.16)"
                          : "rgba(24, 18, 40, 0.04)",
                      border: i === 15 ? "1px solid rgba(123, 92, 255, 0.5)" : "1px solid transparent",
                    }}
                  />
                ))}
              </div>
              <p style={{ margin: "12px 0 0", fontSize: 13, opacity: 0.75 }}>
                Click any day to add a post. Purple days already have something scheduled.
              </p>
            </div>

            <div style={mockCard}>
              <p className="eyebrow" style={{ marginBottom: 10 }}>
                Publishing queue
              </p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
                {statusRows.map((row) => (
                  <li
                    key={row.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      fontSize: 12,
                      padding: "8px 10px",
                      borderRadius: 10,
                      background: "rgba(24, 18, 40, 0.03)",
                    }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {row.label}
                    </span>
                    <span style={{ color: row.color, fontWeight: 700, flex: "0 0 auto" }}>{row.status}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={mockCard}>
              <p className="eyebrow" style={{ marginBottom: 10 }}>
                Post settings
              </p>
              <dl style={{ margin: 0, fontSize: 14, lineHeight: 1.9 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <dt style={{ opacity: 0.7 }}>Account</dt>
                  <dd style={{ margin: 0, fontWeight: 600 }}>@poskoo</dd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <dt style={{ opacity: 0.7 }}>Format</dt>
                  <dd style={{ margin: 0, fontWeight: 600 }}>Reel</dd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <dt style={{ opacity: 0.7 }}>Time zone</dt>
                  <dd style={{ margin: 0, fontWeight: 600 }}>Asia/Kolkata</dd>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <dt style={{ opacity: 0.7 }}>Status</dt>
                  <dd style={{ margin: 0, fontWeight: 600, color: "var(--poskoo-green)" }}>Queued</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">The workflow</p>
            <h2>How the calendar <em className="s">runs end to end</em></h2>
            <p>
              From connecting an account to seeing a post go live, the calendar keeps the whole path in one place.
            </p>
          </div>
          <div className="cards">
            {steps.map((st) => (
              <article key={st.n} className="pcard">
                <span className="no">Step {st.n}</span>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Calendar features</p>
            <h2>What you can do <em className="s">on the calendar</em></h2>
          </div>
          <div className="cards">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="pcard">
                <span className="no">{benefit.no}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Time zones &amp; media</p>
              <h2>Schedule once, <em className="s mark">publish in the right place</em></h2>
              <p>
                Set your time zone once and every post is scheduled against it. Add an image, a carousel or a Reel
                to the same calendar, and Poskoo publishes the media with the caption at the time you chose.
              </p>
              <ul>
                <li>Week and month views for the same schedule.</li>
                <li>Drag a post to reschedule it in one move.</li>
                <li>Images, carousels and Reels in one queue.</li>
                <li>Queued, publishing, published and failed status.</li>
              </ul>
              <Link className="btn btn-line" href="/signup">
                Start free and plan your week <span aria-hidden="true">&rarr;</span>
              </Link>
              <p className="small">
                Need to convert a time first?{" "}
                <Link className={s.vlink} href="/tools/instagram-time-zone-converter">
                  use the free Instagram time zone converter
                </Link>
                .
              </p>
            </div>
            <div className="art">
              <div style={{ ...mockCard, padding: 20 }}>
                <p className="eyebrow" style={{ marginBottom: 12 }}>
                  Reschedule
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: "rgba(123, 92, 255, 0.1)",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#5b3fd6",
                  }}
                >
                  <span aria-hidden="true">↔</span>
                  Reel moved from Mon 9:00 to Tue 9:00
                </div>
                <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
                  {["Mon 9:00", "Tue 9:00", "Wed 8:00"].map((slot, i) => (
                    <div
                      key={slot}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        padding: "8px 10px",
                        borderRadius: 10,
                        background: i === 1 ? "rgba(46, 160, 120, 0.12)" : "rgba(24, 18, 40, 0.03)",
                      }}
                    >
                      <span>{slot}</span>
                      <span style={{ opacity: 0.7 }}>{i === 1 ? "Reel · @poskoo" : "Carousel · @poskoo"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Social media content calendar FAQs</h2>
          </div>
          <div className="faq">
            {faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
          <p className="small" style={{ marginTop: 16 }}>
            Want a head start? Read the{" "}
            <Link className={s.vlink} href="/guides/social-media-content-calendar-guide">
              social media content calendar guide
            </Link>{" "}
            or open the{" "}
            <Link className={s.vlink} href="/instagram-posting-schedule">
              Instagram posting schedule hub
            </Link>
            .
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Plan the week <em className="s">and let it publish</em></h2>
              <p>Start free, connect an account and add your first post to the calendar in a few minutes.</p>
              <div className="ctas">
                <Link className="btn" href="/signup">
                  Start free <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link className="btn btn-line" href="/tools/social-media-content-calendar">
                  Open the free calendar template
                </Link>
              </div>
            </div>
            <div aria-hidden="true" style={{ display: "flex", justifyContent: "center" }}>
              <svg width="220" height="180" viewBox="0 0 220 180" role="img" aria-label="Illustration of a calendar with scheduled posts">
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7b5cff" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
                <rect x="30" y="30" width="160" height="130" rx="18" fill="#fff" stroke="rgba(24,18,40,0.1)" />
                <rect x="30" y="30" width="160" height="34" rx="18" fill="url(#calGrad)" />
                <rect x="30" y="52" width="160" height="12" fill="url(#calGrad)" />
                <circle cx="52" cy="47" r="4" fill="#fff" opacity="0.9" />
                <circle cx="168" cy="47" r="4" fill="#fff" opacity="0.9" />
                {[0, 1, 2, 3].map((row) =>
                  [0, 1, 2, 3, 4].map((col) => (
                    <rect
                      key={`${row}-${col}`}
                      x={44 + col * 28}
                      y={78 + row * 20}
                      width="20"
                      height="12"
                      rx="4"
                      fill={(row + col) % 3 === 0 ? "rgba(123,92,255,0.35)" : "rgba(24,18,40,0.08)"}
                    />
                  ))
                )}
                <circle cx="176" cy="140" r="22" fill="#2ea078" />
                <path d="M166 140l7 7 13-14" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
