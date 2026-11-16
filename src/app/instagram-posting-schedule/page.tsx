import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { faqJsonLd, ldJson } from "@/lib/tool-schema";
import { howToJsonLd } from "@/components/tools/seo";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/instagram-posting-schedule";
const PAGE_TITLE = "Instagram Posting Schedule: A Simple Weekly Plan | Poskoo";
const PAGE_DESCRIPTION =
  "Follow a simple weekly Instagram posting schedule: when to post Reels, carousels, Stories and engagement posts, plus a free scheduler to plan the week.";

export const metadata: Metadata = withSocial({
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PATH },
});

const schedule = [
  {
    day: "Monday",
    format: "Reel",
    idea: "A 15–30 second tip, myth-buster or quick win for your niche.",
    why: "Reels reach people who do not follow you yet, so start the week with discovery.",
  },
  {
    day: "Tuesday",
    format: "Carousel",
    idea: "A step-by-step guide, checklist or before/after in 5–8 slides.",
    why: "Carousels earn saves and shares, which keep a post working for weeks.",
  },
  {
    day: "Wednesday",
    format: "Stories",
    idea: "A poll, question sticker or behind-the-scenes clip with a reply prompt.",
    why: "Stories are where your existing followers reply, vote and start DMs.",
  },
  {
    day: "Thursday",
    format: "Engagement post",
    idea: "A question, this-or-that or a strong opinion people want to answer.",
    why: "Comments on Thursday feed the algorithm before the weekend.",
  },
  {
    day: "Friday",
    format: "Reel",
    idea: "A result, customer story or behind-the-scenes look at how you work.",
    why: "Friday and the weekend are when people browse and share the most.",
  },
  {
    day: "Saturday",
    format: "Carousel",
    idea: "A weekly recap, resource list or a saveable mini-guide.",
    why: "Weekend saves build a library of posts people return to.",
  },
  {
    day: "Sunday",
    format: "Stories",
    idea: "A plan-the-week post with a link sticker to your offer or lead magnet.",
    why: "A soft Sunday CTA sends traffic without another feed post.",
  },
];

const steps = [
  {
    title: "Pick your weekly cadence",
    text: "Decide how many Reels, carousels, Stories and engagement posts you can make each week. Use the posting frequency calculator if you are unsure.",
  },
  {
    title: "Map each format to a day",
    text: "Put Reels on your two discovery days, carousels on your saveable days, Stories on the days you want replies, and one engagement post midweek.",
  },
  {
    title: "Batch the content",
    text: "Write hooks and captions, check image sizes and preview the posts in one sitting so the week is ready before it starts.",
  },
  {
    title: "Schedule the week",
    text: "Add every post to the calendar at the times your audience is online, then let Poskoo publish them and track the results.",
  },
];

const faqs = [
  {
    q: "How often should I post on Instagram?",
    a: "Most accounts do well with three to five feed posts a week plus Stories on most days. Start with what you can repeat, then add a post only when the quality holds up.",
  },
  {
    q: "What is the best day to post a Reel?",
    a: "There is no single best day. Reels tend to do well early in the week and at the weekend, but your own audience data beats any general rule. Check your insights after two to three weeks.",
  },
  {
    q: "Should I post carousels or Reels more often?",
    a: "Use both. Reels bring new people in, while carousels get saved and shared by people who already follow you. A 2:1 split between Reels and carousels is a simple starting point.",
  },
  {
    q: "How many Stories should I post a day?",
    a: "Two to five Story frames a day is plenty for most accounts. One clear idea per day, with a poll or question sticker, works better than a long unplanned series.",
  },
  {
    q: "Can I schedule all of this in advance?",
    a: `Yes. In ${BRAND.name} you can queue Reels, carousels and single-image posts on a weekly calendar, and Poskoo publishes them at the times you choose. Stories are planned in the same calendar.`,
  },
];

const faq = faqJsonLd(faqs);
const howTo = howToJsonLd({
  name: "How to build a weekly Instagram posting schedule",
  path: PATH,
  steps,
});

const pageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${BRAND.canonicalUrl}${PATH}#webpage`,
      url: `${BRAND.canonicalUrl}${PATH}`,
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      inLanguage: "en",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${BRAND.canonicalUrl}#website`,
        name: BRAND.name,
        url: BRAND.canonicalUrl,
      },
    },
    { "@type": howTo["@type"], name: howTo.name, step: howTo.step },
    { "@type": faq["@type"], mainEntity: faq.mainEntity },
  ],
};

export default function InstagramPostingSchedulePage() {
  return (
    <PublicShell
      className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Tools", path: "/tools" },
        { name: "Instagram posting schedule", path: PATH },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(pageJsonLd) }}
      />
      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Free weekly plan</span>
          <p className="eyebrow">Instagram posting schedule</p>
          <h1>
            A simple weekly <em className="s mark">Instagram posting schedule</em>
          </h1>
          <p className="lede">
            Post Reels on Monday and Friday, a carousel on Tuesday and Saturday, Stories on
            Wednesday and Sunday, and one engagement post on Thursday. That is a repeatable week
            that covers reach, saves, replies and comments without posting every day.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/instagram-scheduler">
              Schedule your week <span aria-hidden="true">→</span>
            </Link>
            <Link className="btn btn-line" href="#schedule">
              See the schedule
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <AnimArt
            name="card-schedule"
            label="A creator pins post cards onto a weekly calendar next to a smiling alarm clock"
          />
        </div>
      </header>

      <section id="schedule" style={{ paddingTop: 20, scrollMarginTop: 24 }}>
        <div className="head">
          <p className="eyebrow">The weekly plan</p>
          <h2>
            What to post <em className="s">each day</em>
          </h2>
        </div>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.th}>Day</th>
                <th className={s.th}>Format</th>
                <th className={s.th}>What to post</th>
                <th className={s.th} style={{ textAlign: "left" }}>
                  Why it works
                </th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.day} className={s.tr}>
                  <td className={s.td}>
                    <strong>{row.day}</strong>
                  </td>
                  <td className={s.td}>{row.format}</td>
                  <td className={s.td}>{row.idea}</td>
                  <td className={s.td} style={{ textAlign: "left" }}>
                    {row.why}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small" style={{ textAlign: "center", marginTop: 26 }}>
          Not sure how many posts your account can handle?{" "}
          <Link className={s.vlink} href="/tools/instagram-posting-frequency-calculator">
            Use the Instagram posting frequency calculator →
          </Link>
        </p>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">How to run it</p>
            <h2>
              Build the week in <em className="s">four steps</em>
            </h2>
          </div>
          <div className="cards">
            {steps.map((st, i) => (
              <article key={st.title} className="pcard">
                <span className="no">{`0${i + 1}`}</span>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
              </article>
            ))}
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 26 }}>
            Pick the exact times with the{" "}
            <Link className={s.vlink} href="/tools/best-time-to-post-on-instagram">
              best time to post on Instagram guide →
            </Link>
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Plan the content</p>
            <h2>
              Turn the schedule into <em className="s">finished posts</em>
            </h2>
          </div>
          <div className="cards">
            <article className="pcard">
              <span className="no">Plan</span>
              <h3>Plan each post</h3>
              <p>
                Draft the hook, caption and image for every slot before the week starts, so you
                are never writing on the day.
              </p>
              <Link className="go" href="/instagram-content-planner">
                Open the Instagram content planner <span aria-hidden="true">→</span>
              </Link>
            </article>
            <article className="pcard">
              <span className="no">Schedule</span>
              <h3>Queue the week</h3>
              <p>
                Drop each finished post onto the calendar, set the time, and let Poskoo publish it
                while you answer comments and DMs.
              </p>
              <Link className="go" href="/instagram-scheduler">
                Open the Instagram scheduler <span aria-hidden="true">→</span>
              </Link>
            </article>
            <article className="pcard">
              <span className="no">Repeat</span>
              <h3>Review and repeat</h3>
              <p>
                After two weeks, keep the days that got saves, replies and profile visits, and
                move the rest to a better slot.
              </p>
              <Link className="go" href="/tools/instagram-posting-frequency-calculator">
                Check your posting frequency <span aria-hidden="true">→</span>
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram posting schedule FAQs</h2>
          </div>
          <div className="faq">
            {faqs.map((f, index) => (
              <details key={f.q} open={index === 0}>
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
              <h2>
                Ready to run the week? <em className="s">Schedule it</em>
              </h2>
              <p>
                Add your Reels, carousels and Stories to one calendar and {BRAND.name} publishes
                them at the times you pick.
              </p>
              <Link className="btn" href="/instagram-scheduler">
                Open the Instagram scheduler <span aria-hidden="true">→</span>
              </Link>
            </div>
            <AnimArt
              name="feat-calendar"
              label="A creator plans posts on a weekly calendar"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
