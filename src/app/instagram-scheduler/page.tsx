import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import CompareHeroIllustration from "@/components/CompareHeroIllustration";
import s from "@/components/site.module.css";

export const metadata: Metadata = {
  title: { absolute: "Instagram Scheduler: Plan & Auto-Publish Posts and Reels" },
  description:
    "Schedule Instagram posts, reels, carousels and stories, see the best time to post, and auto-DM everyone who comments. Free plan available.",
  alternates: { canonical: "/instagram-scheduler" },
};

const capabilities = [
  {
    feature: "Schedule & auto-publish",
    feed: "Yes",
    reels: "Yes",
    carousel: "Yes",
    stories: "Yes",
    helpHref: null,
  },
  {
    feature: "Best-time suggestions",
    feed: "Yes",
    reels: "Yes",
    carousel: "Yes",
    stories: "Yes",
    helpHref: null,
  },
  {
    feature: "First comment (hashtags / CTA)",
    feed: "Yes",
    reels: "Yes",
    carousel: "Yes",
    stories: "No — API limit",
    helpHref: null,
  },
  {
    feature: "AI caption assistant",
    feed: "Yes",
    reels: "Yes",
    carousel: "Yes",
    stories: "Yes",
    helpHref: null,
  },
  {
    feature: "Comment-to-DM automation",
    feed: "Yes",
    reels: "Yes",
    carousel: "Yes",
    stories: "Via Story replies",
    helpHref: "/help/instagram-story-reply-auto-dm",
  },
  {
    feature: "Media type",
    feed: "Image",
    reels: "Video (.mp4)",
    carousel: "2–10 images",
    stories: "Image or video",
    helpHref: null,
  },
  {
    feature: "Aspect ratio",
    feed: "1:1, 4:5, 1.91:1",
    reels: "9:16 (1080×1920)",
    carousel: "Match all slides",
    stories: "9:16 (1080×1920)",
    helpHref: null,
  },
  {
    feature: "Step-by-step guide",
    feed: null,
    reels: "Guide",
    carousel: "Guide",
    stories: "Guide",
    helpHref: null,
    guideLinks: {
      reels: "/help/schedule-instagram-reels",
      carousel: "/help/schedule-instagram-carousel",
      stories: "/help/schedule-instagram-stories",
    },
  },
];

const benefits = [
  {
    no: "01 / Calendar",
    title: "Week and month calendar",
    text: "Drag and drop posts across a week or month view so you can plan your feed at a glance.",
  },
  {
    no: "02 / Formats",
    title: "Posts, reels, carousels and stories",
    text: "Schedule feed posts, reels, multi-image carousels and stories from one composer.",
  },
  {
    no: "03 / Timing",
    title: "Best times to post",
    text: "See suggested publish times based on your own followers' activity, not generic guesses.",
  },
  {
    no: "04 / First comment",
    title: "First comment with hashtags",
    text: "Queue a first comment with your hashtags so your caption stays clean while tags still go live.",
  },
  {
    no: "05 / AI",
    title: "Write with AI",
    text: "Draft captions in your brand voice with AI, then tweak and schedule in the same flow.",
  },
  {
    no: "06 / Automation",
    title: "Auto-DM when the post goes live",
    text: "Attach a comment-to-DM rule to a scheduled post so automation switches on the moment it publishes.",
  },
];

const steps = [
  {
    n: "1",
    title: "Connect Instagram",
    text: "Sign in with Meta's official login for Business or Creator accounts. We never ask for your password.",
  },
  {
    n: "2",
    title: "Write the post and pick a time",
    text: "Compose your caption yourself or with AI, add media, set a first comment if you want, and choose when to publish.",
  },
  {
    n: "3",
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
    a: `There is no one-size-fits-all answer. ${BRAND.name} shows suggested times from your own followers' activity so you can schedule when your audience is most likely online.`,
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

export default function InstagramScheduler() {
  return (
    <PublicShell breadcrumbs={[{ name: "Instagram scheduler", path: "/instagram-scheduler" }]}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="hero">
        <span className="pill"><span>NEW</span>Schedule posts · auto-DM on publish</span>
        <p className="eyebrow">Instagram scheduler</p>
        <h1>
          Plan your posts. <em className="s">Auto-DM every comment.</em>
        </h1>
        <p className="lede">
          Plan and auto-publish posts, reels, carousels and stories, pick the best time from your own audience data,
          and attach comment-to-DM automation when each post goes live.
        </p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
          <Link className="btn btn-line" href="#how">How it works</Link>
        </div>
        <CompareHeroIllustration className="mx-auto mt-10 w-full max-w-xl" />
        <div className="hero-art" style={{ maxWidth: 720 }}>
          <Image
            sizes="(max-width: 960px) 100vw, 720px"
            src="/landing/hero.webp"
            width={1400}
            height={933}
            alt="A big phone shows a scheduled Instagram post while a paper plane carries a DM with a link to a commenter"
          />
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Features</p>
            <h2>Everything you need to <em className="s">schedule Instagram.</em></h2>
          </div>
          <div className="cards">
            {benefits.slice(0, 3).map((b) => (
              <article key={b.title} className="pcard">
                <span className="no">{b.no}</span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </article>
            ))}
          </div>
          <div className="cards" style={{ marginTop: 26 }}>
            {benefits.slice(3).map((b) => (
              <article key={b.title} className="pcard">
                <span className="no">{b.no}</span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="capabilities" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Capability matrix</p>
            <h2>What you can schedule for each <em className="s">Instagram format.</em></h2>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.th} scope="col">Capability</th>
                  <th className={s.th} scope="col">Feed posts</th>
                  <th className={s.th} scope="col">Reels</th>
                  <th className={s.th} scope="col">Carousels</th>
                  <th className={s.th} scope="col">Stories</th>
                </tr>
              </thead>
              <tbody>
                {capabilities.map((cap, i) => (
                  <tr key={cap.feature} className={i === capabilities.length - 1 ? "guide-row" : ""}>
                    <td className={s.td} style={{ fontWeight: 600 }}>
                      {cap.feature}
                    </td>
                    <td className={s.td}>{cap.feed ?? "—"}</td>
                    <td className={s.td}>
                      {cap.guideLinks?.reels ? (
                        <Link className={s.vlink} href={cap.guideLinks.reels}>
                          {cap.reels}
                        </Link>
                      ) : (
                        cap.reels
                      )}
                    </td>
                    <td className={s.td}>
                      {cap.guideLinks?.carousel ? (
                        <Link className={s.vlink} href={cap.guideLinks.carousel}>
                          {cap.carousel}
                        </Link>
                      ) : (
                        cap.carousel
                      )}
                    </td>
                    <td className={s.td}>
                      {cap.helpHref ? (
                        <Link className={s.vlink} href={cap.helpHref}>
                          {cap.stories}
                        </Link>
                      ) : cap.guideLinks?.stories ? (
                        <Link className={s.vlink} href={cap.guideLinks.stories}>
                          {cap.stories}
                        </Link>
                      ) : (
                        cap.stories
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small" style={{ marginTop: 16, textAlign: "center" }}>
            Ready to schedule? <Link className={s.vlink} href="/signup">Start free</Link> — no credit card,
            2 accounts and 10 posts/month included.
          </p>
        </div>
      </section>

      <section id="how" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">How it works</p>
              <h2>Three steps to your <em className="s mark">first scheduled post.</em></h2>
              <div className="pains">
                {steps.map((st) => (
                  <div key={st.n} className="pain">
                    <b>{st.n}. {st.title}</b>
                    <span>{st.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/card-schedule.webp"
                width={900}
                height={900}
                loading="lazy"
                alt="A creator pins post cards onto a weekly calendar next to a smiling alarm clock"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <p className="small" style={{ textAlign: "center" }}>
            Pair scheduling with{" "}
            <Link href="/instagram-auto-dm" className={s.vlink}>Instagram auto DM</Link>
            , compare us to{" "}
            <Link href="/buffer-alternative" className={s.vlink}>Buffer</Link>
            {" "}and{" "}
            <Link href="/later-alternative" className={s.vlink}>Later</Link>
            , check <Link href="/instagram-scheduler/pricing" className={s.vlink}>Instagram scheduler pricing and plan limits</Link>
            , or try free{" "}
            <Link href="/tools" className={s.vlink}>Instagram tools</Link>.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
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

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Schedule your next post <em className="s">in minutes.</em></h2>
              <p>Start free. No credit card. Connect Instagram in one tap.</p>
              <Link className="btn" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            </div>
            <Image sizes="(max-width: 960px) 100vw, 50vw" src="/landing/card-leads.webp" width={900} height={900} loading="lazy" alt="Two friends high-five next to a board of new leads" />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
