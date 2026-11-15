import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { publisherRef } from "@/lib/tool-schema";
import { softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { ArrowRight } from "lucide-react";
import { AnimArt, ANIM_LABELS, type AnimName } from "@/components/AnimArt";
import { LandingDemo } from "@/app/LandingDemo";

const description = "Schedule Instagram posts, reels, carousels and stories, see suggested posting times, and auto-DM everyone who comments. Free plan, no credit card.";

export const metadata: Metadata = withSocial({
  title: { absolute: "Instagram Scheduler: Plan & Auto-Publish Posts and Reels" },
  description,
  alternates: { canonical: "/instagram-scheduler" },
});

type Mark = boolean | string;

// One card per Instagram format: shape preview + what Poskoo can do with it.
const formats: { name: string; ratio: string; shape: [number, number]; media: string; rows: [string, Mark][]; guide?: string }[] = [
  { name: "Feed post", ratio: "1:1, 4:5 or 1.91:1", shape: [4, 5], media: "Image", rows: [["Schedule & auto-publish", true], ["Suggested times", true], ["First comment", true], ["AI captions", true], ["Comment-to-DM", true]], guide: "/help/schedule-instagram-posts" },
  { name: "Reel", ratio: "9:16 (1080×1920)", shape: [9, 16], media: "Video (.mp4)", rows: [["Schedule & auto-publish", true], ["Suggested times", true], ["First comment", true], ["AI captions", true], ["Comment-to-DM", true]], guide: "/help/schedule-instagram-reels" },
  { name: "Carousel", ratio: "same ratio on every slide", shape: [1, 1], media: "2–10 images", rows: [["Schedule & auto-publish", true], ["Suggested times", true], ["First comment", true], ["AI captions", true], ["Comment-to-DM", true]], guide: "/help/schedule-instagram-carousel" },
  { name: "Story", ratio: "9:16 (1080×1920)", shape: [9, 16], media: "Image or video", rows: [["Schedule & auto-publish", true], ["Suggested times", true], ["First comment", "Not on Stories (API limit)"], ["AI captions", "No captions on Stories (API limit)"], ["Comment-to-DM", "Via story replies"]], guide: "/help/schedule-instagram-stories" },
];

const benefits: { title: string; text: string; art: AnimName }[] = [
  { title: "Week and month calendar", text: "Drag and drop posts across a week or month view so you can plan your feed at a glance.", art: "feat-calendar" },
  { title: "Posts, reels, carousels and stories", text: "Schedule feed posts, reels, multi-image carousels and stories from one composer.", art: "visual" },
  { title: "Suggested times to post", text: "See suggested publish times based on when your audience engaged with your auto-DMs, not generic guesses.", art: "analytics" },
  { title: "First comment with hashtags", text: "Queue a first comment with your hashtags so your caption stays clean while tags still go live.", art: "hashtag" },
  { title: "Write with AI", text: "Draft captions in your brand voice with AI, then tweak and schedule in the same flow.", art: "feat-ai" },
  { title: "Auto-DM when the post goes live", text: "Attach a comment-to-DM rule to a scheduled post so automation switches on the moment it publishes.", art: "feat-dm" },
];

const steps = [
  {
    n: "1",
    art: "/landing/step-connect.webp",
    title: "Connect Instagram",
    text: "Sign in with Meta's official login for Business or Creator accounts. We never ask for your password.",
  },
  {
    n: "2",
    art: "/landing/step-schedule.webp",
    title: "Write the post and pick a time",
    text: "Compose your caption yourself or with AI, add media, set a first comment if you want, and choose when to publish.",
  },
  {
    n: "3",
    art: "/landing/step-dm.webp",
    title: "Publish and DM commenters",
    text: `${BRAND.name} publishes at the scheduled time. If you added an auto-DM rule, commenters get your message in their DMs.`,
  },
];

const faqs = [
  {
    q: "Can I schedule Instagram reels and stories?",
    a: `Yes. ${BRAND.name} lets you schedule feed posts, reels, carousels and stories to go live at the time you pick.`,
  },
  {
    q: "Is it safe? Do you need my password?",
    a: `No password needed. You connect through Meta's official login and API, the same way Meta expects third-party apps to work. We never scrape or store your Instagram password.`,
  },
  {
    q: "What is the best time to post on Instagram?",
    a: `There is no one-size-fits-all answer. ${BRAND.name} suggests times based on your own engagement history: the hours when people triggered your auto-DMs over the last 30 days. Use them as a starting point and test what works for you.`,
  },
  {
    q: "Can I add a first comment?",
    a: "Yes. You can schedule a first comment with your hashtags or a call to action so it posts right after the main post goes live.",
  },
  {
    q: "Is there a free plan?",
    a: `Yes. The Free plan is $0 forever and includes 2 social accounts, 10 scheduled posts per month and 500 auto-DMs per month.`,
  },
  {
    q: "Can I combine scheduling with Instagram auto DM?",
    a: `Yes. Add a comment-to-DM rule when you schedule a post so everyone who comments a keyword gets your link in their DMs after publish. See our ${BRAND.name} auto-DM page for details.`,
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${BRAND.url}/instagram-scheduler#webpage`,
  url: `${BRAND.url}/instagram-scheduler`,
  name: "Instagram scheduler that auto-DMs every comment",
  description,
  isPartOf: { "@id": `${BRAND.url}#website` },
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND.name,
  url: `${BRAND.url}/instagram-scheduler`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description,
  featureList: [
    "Instagram post, reel, carousel and story scheduling",
    "Week and month calendar",
    "Suggested posting times",
    "First comment with hashtags",
    "AI caption writing",
    "Comment-to-DM automation on publish",
  ],
  offers: softwareOffers(planReadiness()),
  publisher: publisherRef(),
};

export default function InstagramScheduler() {
  return (
    <PublicShell className={s.sched} breadcrumbs={[{ name: "Instagram scheduler", path: "/instagram-scheduler" }]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="hero">
        <div className={s.heroText}>
        <span className="pill"><span>NEW</span>Schedule posts · auto-DM on publish</span>
        <h1>Instagram scheduler that <em className="s mark">auto-DMs every comment</em></h1>
        <p className="lede">
          {BRAND.name} is an Instagram scheduler: plan posts, reels, carousels and stories on a calendar and it publishes them for you at the time you pick. Add a comment-to-DM rule and everyone who comments gets your link in their DMs.
        </p>
        <form className="glassBar glass schedBar" action="/signup" method="get">
          <label className="sr-only" htmlFor="sched-email">Email</label>
          <input id="sched-email" name="email" type="email" placeholder="Enter your email..." autoComplete="email" required />
          <button type="submit">Get started free <ArrowRight size={18} aria-hidden="true" /></button>
        </form>
        <p className="heroFine schedFine"><svg width="16" height="16" aria-hidden="true"><use href="#sched-ok" /></svg>Free plan · 10 scheduled posts a month · no credit card</p>
        </div>
        <div className="hero-art">
          <AnimArt name="demo-schedule" label="A creator relaxes in a beanbag with a coffee while a weekly calendar of posts publishes on its own" />
          <div className="demoChip chipA" aria-hidden="true"><span className="dot" style={{ background: "var(--violet)" }} />Scheduled · Thu 9:00 AM</div>
          <div className="demoChip chipB" aria-hidden="true"><svg width="15" height="15"><use href="#sched-ok" /></svg>Posted to Instagram</div>
        </div>
      </header>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true"><defs>
        <symbol id="sched-ok" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="var(--green)" /><path d="M5 9.3l2.6 2.5L13 6.4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></symbol>
      </defs></svg>

      <section id="features">
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Features</p>
            <h2>Everything you need to <em className="s">schedule Instagram</em></h2>
          </div>
          <div className="bento">
            {benefits.map((b) => (
              <article key={b.title} className="bentoCard">
                <div className="bentoArt"><AnimArt name={b.art} label={ANIM_LABELS[b.art]} /></div>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="howSection">
        <div className="wrap">
          <div className="head"><p className="eyebrow">How it works</p><h2>Three steps to your <em className="s mark">first scheduled post</em></h2></div>
          <div className="howGrid">
            {steps.map((st) => (
              <article key={st.n} className="howStep">
                <div className="howArt"><Image src={st.art} width={640} height={600} sizes="(max-width: 960px) 80vw, 320px" loading="lazy" alt="" /></div>
                <span className="howNo">Step {st.n}</span>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="capabilities">
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Every format</p>
            <h2>What you can schedule for each <em className="s">Instagram format</em></h2>
          </div>
          <div className="formatGrid">
            {formats.map((f) => (
              <article key={f.name} className="formatCard">
                <div className="formatTop">
                  <span className="formatShape" style={{ aspectRatio: `${f.shape[0]} / ${f.shape[1]}` }} aria-hidden="true"><i /></span>
                  <div><h3>{f.name}</h3><p>{f.media} · {f.ratio}</p></div>
                </div>
                <ul>
                  {f.rows.map(([label, v]) => (
                    <li key={label} className={v === true ? "yes" : "part"}>
                      <span aria-hidden="true">{v === true ? "✓" : "–"}</span>
                      {label}{v !== true && <em>{v}</em>}
                    </li>
                  ))}
                </ul>
                {f.guide && <Link className="go" href={f.guide}>Step-by-step guide <span aria-hidden="true">→</span></Link>}
              </article>
            ))}
          </div>
          <p className="small" style={{ marginTop: 20, textAlign: "center" }}>
            Check your files before you schedule: the free <Link className={s.vlink} href="/tools/instagram-reels-size-checker">Instagram Reels size checker</Link>, <Link className={s.vlink} href="/tools/instagram-story-size-checker">Instagram Story size checker</Link> and <Link className={s.vlink} href="/tools/instagram-image-size">Instagram image size guide</Link>. Write the post with the <Link className={s.vlink} href="/tools/instagram-caption-generator">free Instagram caption generator</Link> and <Link className={s.vlink} href="/tools/instagram-hashtag-generator">Instagram hashtag generator</Link>, split a wide image with the <Link className={s.vlink} href="/tools/instagram-carousel-splitter">carousel splitter</Link>, and pick a slot with the <Link className={s.vlink} href="/tools/best-time-to-post-on-instagram">best time to post on Instagram</Link> finder.
          </p>
          <p className="small" style={{ marginTop: 12, textAlign: "center" }}>
            Polish your profile and grid with the free <Link className={s.vlink} href="/tools/instagram-font-generator">Instagram font generator</Link>, <Link className={s.vlink} href="/tools/instagram-bio-generator">Instagram bio generator</Link>, <Link className={s.vlink} href="/tools/instagram-grid-maker">Instagram grid maker</Link>, <Link className={s.vlink} href="/tools/instagram-carousel-maker">Instagram carousel maker</Link>, <Link className={s.vlink} href="/tools/instagram-post-preview">Instagram post preview</Link> and <Link className={s.vlink} href="/tools/instagram-line-break-generator">Instagram line break generator</Link>, browse <Link className={s.vlink} href="/tools/instagram-tools">all free Instagram tools</Link>, or see <Link className={s.vlink} href="/tools">all free social media tools</Link>.
          </p>
        </div>
      </section>

      <section id="demo">
        <div className="wrap">
          <LandingDemo hideLink="/instagram-scheduler" />
        </div>
      </section>

      <section>
        <div className="wrap">
          <nav className="relChips" aria-label="Related pages">
            <span>Keep exploring</span>
            <Link href="/instagram-auto-dm">Instagram auto DM</Link>
            <Link href="/instagram-scheduler/pricing">Scheduler pricing &amp; limits</Link>
            <Link href="/buffer-alternative">Poskoo vs Buffer</Link>
            <Link href="/later-alternative">Poskoo vs Later</Link>
            <Link href="/tools">Free Instagram tools</Link>
          </nav>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram scheduler questions</h2>
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

      <section>
        <div className="wrap">
          <div className="cta">
            <div className="ctaCopy">
              <p className="ctaEyebrow">Ready when you are</p>
              <h2>Schedule your next post <em className="s">in minutes</em></h2>
              <p>Connect Instagram in one tap, drop your posts on the calendar and let Poskoo publish them, then DM everyone who comments.</p>
              <form className="glassBar ctaBar" action="/signup" method="get">
                <label className="sr-only" htmlFor="sched-cta-email">Email</label>
                <input id="sched-cta-email" name="email" type="email" placeholder="Enter your email..." autoComplete="email" required />
                <button type="submit">Get started free <ArrowRight size={18} aria-hidden="true" /></button>
              </form>
              <ul className="ctaChecks">
                <li><svg width="18" height="18" aria-hidden="true"><use href="#sched-ok" /></svg>Free plan</li>
                <li><svg width="18" height="18" aria-hidden="true"><use href="#sched-ok" /></svg>No credit card</li>
                <li><svg width="18" height="18" aria-hidden="true"><use href="#sched-ok" /></svg>Official Meta API</li>
              </ul>
            </div>
            <AnimArt name="card-schedule" label="A creator pins post cards onto a weekly calendar next to a smiling alarm clock" />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
