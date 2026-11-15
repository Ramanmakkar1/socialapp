import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { faqJsonLd, ldJson } from "@/components/tools/seo";
import { withSocial } from "@/lib/page-metadata";

const PATH = "/tools/best-time-to-post-on-social-media";
const DESCRIPTION =
  "Use weekday late mornings and early evenings on Instagram, TikTok, LinkedIn, Facebook, X, Pinterest, Threads and YouTube, with a free finder for each.";

export const metadata: Metadata = withSocial({
  title: { absolute: "Best Time to Post on Social Media in 2026 (By Platform)" },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
});

const platforms = [
  {
    name: "Instagram",
    windows: "Weekdays 8 am, 12 pm and 6 pm; weekends 9 am, 12 pm and 6 pm (local audience)",
    href: "/tools/best-time-to-post-on-instagram",
  },
  {
    name: "LinkedIn",
    windows: "Weekdays 8 am, 10 am and 12 pm; weekends 10 am (B2B)",
    href: "/tools/best-time-to-post-on-linkedin",
  },
  {
    name: "TikTok",
    windows: "Weekdays 7 am, 12 pm and 7 pm; weekends 9 am and 7 pm (creators)",
    href: "/tools/best-time-to-post-on-tiktok",
  },
  {
    name: "Facebook",
    windows: "Weekdays 8 am, 1 pm and 7 pm; weekends 9 am and 11 am (local audience)",
    href: "/tools/best-time-to-post-on-facebook",
  },
  {
    name: "X",
    windows: "Weekdays 8 am, 12 pm and 5 pm; weekends 10 am (news)",
    href: "/tools/best-time-to-post-on-x",
  },
  {
    name: "Pinterest",
    windows: "Weekdays 2 pm and 8 pm; Saturday 8 am and 8 pm; Sunday 7 pm (home)",
    href: "/tools/best-time-to-post-on-pinterest",
  },
  {
    name: "Threads",
    windows: "Weekdays 7 am, 12 pm, 6 pm and 9 pm; weekends 9 am, 10 am and 11 am (creators)",
    href: "/tools/best-time-to-post-on-threads",
  },
  {
    name: "Bluesky",
    windows: "Weekdays 8–10 am, 12–1 pm and 7–9 pm; weekends 10 am (tech, journalism and creators)",
    href: "/tools/best-time-to-post-on-bluesky",
  },
  {
    name: "YouTube",
    windows: "Weekdays 2 pm, 4 pm and 6 pm; weekends 10 am and 2 pm (gaming)",
    href: "/tools/best-time-to-post-on-youtube",
  },
];

const faqs = [
  {
    q: "What is the best day to post on social media?",
    a: "There is no single best day for every account. Start with a weekday, then compare reach per post by day in each platform's analytics after a consistent two-week test.",
  },
  {
    q: "Does posting time still matter with algorithmic feeds?",
    a: "Yes. Algorithms decide what to show, but publishing when your audience is active can give a post more chances to earn early reach and engagement. Treat timing as one variable and keep testing your content and time slots together.",
  },
  {
    q: "Should I post at the same time on every platform?",
    a: "No. Each platform has a different audience and usage pattern, so use its starting windows and test them separately. A time that wins on LinkedIn may not win on TikTok or Pinterest.",
  },
  {
    q: "Which time zone should I use?",
    a: "Use the time zone where most of your audience lives, not automatically your own. If your audience spans countries, compare results before choosing one consistent publishing time.",
  },
];

export default function BestTimeToPostOnSocialMediaPage() {
  return (
    <PublicShell
      className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Free Instagram tools", path: "/tools" },
        { name: "Best time to post (all platforms)", path: PATH },
      ]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />

      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Free · eight platforms · no signup</span>
          <h1>Best time to post on social media</h1>
          <p className="lede">
            Most platforms do best on weekdays in the late morning and early evening in your audience&apos;s time zone,
            though each platform peaks a little differently (see the table below). Pick a starting slot and test it for
            2 weeks to see what works for your account.
          </p>
        </div>
        <div className="hero-art">
          <Image
            src="/landing/anim/card-schedule.webp"
            width={480}
            height={480}
            priority
            alt="A creator pins social media post cards onto a weekly calendar next to a smiling alarm clock"
          />
        </div>
      </header>

      <section id="best-times-by-platform">
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Starting points to test</p>
            <h2>Best times by platform</h2>
            <p>
              These are each finder&apos;s default audience windows in your audience&apos;s time zone, not guaranteed
              best times. Use them as a first test, then let your own analytics decide.
            </p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <caption className="sr-only">Default weekday and weekend starting post times by platform</caption>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Platform</th>
                  <th scope="col" className={s.th}>Good starting windows</th>
                  <th scope="col" className={s.th}>Free finder</th>
                </tr>
              </thead>
              <tbody>
                {platforms.map((platform) => (
                  <tr key={platform.href} className={s.tr}>
                    <td className={s.td}>{platform.name}</td>
                    <td className={s.td}>{platform.windows}</td>
                    <td className={s.td}>
                      <Link href={platform.href}>Best time to post on {platform.name}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="how-to-find-your-own-best-time">
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">A simple two-week test</p>
            <h2>How to find your own best time</h2>
          </div>
          <ol className="pains">
            <li className="pain">
              <b>1. Use your audience&apos;s time zone</b>
              <span>
                Pick the zone where most followers live. The <Link href="/tools/instagram-time-zone-converter">Instagram time zone converter</Link> handles the time difference and daylight saving.
              </span>
            </li>
            <li className="pain">
              <b>2. Test one slot for two weeks</b>
              <span>Choose a starting window and keep your posting days and content style as consistent as you can.</span>
            </li>
            <li className="pain">
              <b>3. Compare reach per post</b>
              <span>After two weeks, check the platform&apos;s analytics and compare this slot with your earlier posts.</span>
            </li>
            <li className="pain">
              <b>4. Keep the winner</b>
              <span>
                Save the best-performing slot in your <Link href="/tools/social-media-content-calendar">social media content calendar</Link>, then test another time when you are ready.
              </span>
            </li>
          </ol>
        </div>
      </section>

      <section id="faq">
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>FAQ</h2>
          </div>
          <div className="faq">
            {faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="cta">
            <div>
              <p className="ctaEyebrow">Free plan · no credit card</p>
              <h2>Schedule posts for your best times <em className="s">free</em></h2>
              <p>Turn your winning slots into a reliable publishing schedule, or compare schedulers before you choose.</p>
              <div className="ctas">
                <Link className="btn btn-dark" href="/signup">Schedule posts for your best times - free</Link>
                <Link className="btn btn-line" href="/social-media-scheduler-comparison">Compare social media schedulers</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
