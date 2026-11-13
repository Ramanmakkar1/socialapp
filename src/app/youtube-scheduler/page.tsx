import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/youtube-scheduler";
const title = `YouTube Scheduler: Schedule Videos & Shorts | ${BRAND.name}`;
const description = "Schedule YouTube videos and Shorts with titles, descriptions, tags and privacy settings. Poskoo uploads at your chosen time and shows clear status.";

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: new URL(PATH, BRAND.url).toString() },
  openGraph: { title, description, url: new URL(PATH, BRAND.url).toString() },
  twitter: { card: "summary_large_image", title, description },
});

const features = [
  {
    no: "01 / Connect",
    title: "Connect your channel with Google sign-in",
    text: "Grant publishing access through Google's official OAuth flow and YouTube Data API. Poskoo never sees or asks for your Google password, and you stay in control of the connection.",
  },
  {
    no: "02 / Video details",
    title: "Add your video, title, description and tags",
    text: "Upload one video per YouTube post, then add its title, description and tags. Poskoo sends these details with your video when the scheduled upload begins.",
  },
  {
    no: "03 / Privacy and Shorts",
    title: "Choose who can watch and mark Shorts",
    text: "Set each upload to public, unlisted or private. Turn on the Short option to add the #Short marker to your description when it is not already there.",
  },
  {
    no: "04 / Publishing",
    title: "Get a clear status and automatic retries",
    text: "Poskoo uses resumable uploads and retries with a fresh upload session when needed. Your queue shows whether the YouTube upload published or failed.",
  },
];

const steps = [
  {
    n: "1",
    title: "Connect your channel with Google sign-in",
    text: "Approve Poskoo on Google's official sign-in screen. The connection uses the YouTube Data API, and Poskoo never sees your password.",
  },
  {
    n: "2",
    title: "Add the video and its details",
    text: "Upload your video, then write the title and description and add any tags you want to include with the upload.",
  },
  {
    n: "3",
    title: "Choose privacy and Short settings",
    text: "Pick public, unlisted or private visibility. If the video is a Short, turn on the Short option before scheduling it.",
  },
  {
    n: "4",
    title: "Pick a time and let Poskoo upload",
    text: "Choose the date and time. Poskoo uploads the video when it is due, retries when needed, and shows a clear published or failed status.",
  },
];

const faqs = [
  {
    q: "Can you schedule YouTube videos with Poskoo?",
    a: "Yes. Connect your channel with Google sign-in, add a video with its title, description and tags, choose privacy and pick a time. Poskoo uploads it through the official YouTube Data API and shows the result in your queue.",
  },
  {
    q: "Can you schedule YouTube Shorts?",
    a: "Yes. Choose the Short option while composing your YouTube post. Poskoo adds the #Short marker to the description if it is not already present, then uploads the video with your chosen details, privacy setting and publishing time.",
  },
  {
    q: "Is it safe to connect my YouTube channel?",
    a: "Yes. You connect through Google's official OAuth sign-in and approve access for the YouTube Data API. Poskoo never sees or asks for your Google password, and you can revoke the connection from your Google account.",
  },
  {
    q: "Can I schedule unlisted or private videos?",
    a: "Yes. Every scheduled YouTube upload can be public, unlisted or private. Choose the visibility you need before picking the publishing time.",
  },
  {
    q: "Can I post the same video to TikTok and Instagram Reels too?",
    a: "Yes. Select YouTube, TikTok and Instagram in the same composer and tailor the details for each channel before scheduling. TikTok video and Instagram Reels scheduling are both available in Poskoo.",
  },
  {
    q: "What happens if a YouTube upload fails?",
    a: "Poskoo retries the upload with a fresh resumable session when needed. If it still cannot publish, the queue shows a failed status and a clear reason so you can fix the issue and try again.",
  },
];

const appJsonLd = {
  ...toolSoftwareJsonLd({
    name: `${BRAND.name} YouTube scheduler`,
    description,
    url: `${BRAND.url}${PATH}`,
  }),
  featureList: [
    "YouTube channel connection with Google OAuth",
    "Video titles, descriptions and tags",
    "Public, unlisted and private privacy settings",
    "YouTube Shorts option",
    "Scheduled resumable video uploads",
    "Published or failed status with retries",
  ],
  // Paid offers only once Pro/Agency checkout is live, matching /pricing.
  offers: softwareOffers(planReadiness()),
};

export default function YouTubeSchedulerPage() {
  return (
    <PublicShell className={s.sched} breadcrumbs={[{ name: "YouTube scheduler", path: PATH }]}>
      {[appJsonLd, faqJsonLd(faqs)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">
        <div className={s.heroText}>
        <span className="pill">Official YouTube Data API · No password needed</span>
        <p className="eyebrow">YouTube scheduler</p>
        <h1>
          Schedule YouTube videos and <em className="s mark">Shorts</em>
        </h1>
        <p className="lede">
          Poskoo schedules YouTube videos and Shorts through Google&apos;s official YouTube Data API. Connect your channel,
          add your video and details, choose a time, and Poskoo uploads it with a clear success or failure status.
        </p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/signup">Start scheduling YouTube videos <span aria-hidden="true">→</span></Link>
          <Link className="btn btn-line" href="/signup">Create your free account</Link>
        </div>
        <p className="small">Free plan included. No credit card needed. <Link className={s.vlink} href="/pricing">Compare scheduler plans</Link>.</p>
        </div>
        <div className="hero-art"><AnimArt name="multichannel" label="A creator at a laptop sends a scheduled YouTube video to a calendar alongside posts for other social channels" /></div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">YouTube scheduling features</p>
            <h2>What you can <em className="s">schedule on YouTube.</em></h2>
          </div>
          <div className="cards">
            {features.map((feature) => (
              <article key={feature.title} className="pcard">
                <span className="no">{feature.no}</span>
                <h3>{feature.title.replace(/-/g, "\u2011")}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
          <p className="small" style={{ marginTop: 20, textAlign: "center" }}>
            Get title ideas with the <Link className={s.vlink} href="/tools/youtube-title-generator">free YouTube title generator</Link>, check the title, description and combined tag limits with the <Link className={s.vlink} href="/tools/youtube-title-counter">free YouTube title and description counter</Link>, then build tags with the <Link className={s.vlink} href="/tools/youtube-tag-generator">free YouTube tag generator</Link>, add hashtags with the <Link className={s.vlink} href="/tools/youtube-hashtag-generator">YouTube hashtag generator</Link>, then write the description with the <Link className={s.vlink} href="/tools/youtube-description-generator">free YouTube description generator</Link>. Not sure when to publish? Find the{" "}
            <Link className={s.vlink} href="/tools/best-time-to-post-on-youtube">best time to post on YouTube</Link>. Starting a channel? Get @handle ideas with our{" "}<Link className={s.vlink} href="/tools/youtube-handle-generator">free YouTube handle generator</Link>.
          </p>
        </div>
      </section>

      <section id="how-it-works" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">How YouTube scheduling works</p>
              <h2>Schedule your first <em className="s mark">YouTube video.</em></h2>
              <ol className={s.steps}>
                {steps.map((step) => (
                  <li key={step.n}>
                    <span className={s.stepNo} aria-hidden="true">{step.n}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/card-schedule.webp"
                width={900}
                height={900}
                loading="lazy"
                alt="A creator adds a scheduled YouTube video to a weekly calendar next to a friendly alarm clock"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">Official Google sign-in, never your password</p>
              <h2>How do I connect my <em className="s">YouTube channel safely?</em></h2>
              <p>
                Connect your channel through Google&apos;s official OAuth sign-in and approve publishing access for the
                YouTube Data API. You sign in with Google, so Poskoo never sees or asks for your Google password.
              </p>
              <p>
                You stay in control of the connection and can revoke Poskoo&apos;s access from your Google account at any time.
              </p>
              <p>
                New to Poskoo? Follow the <Link className={s.vlink} href="/help/getting-started">step-by-step getting started guide</Link> to
                set up your workspace and schedule your first post.
              </p>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/card-leads.webp"
                width={900}
                height={900}
                loading="lazy"
                alt="Two friends celebrate beside a task board and a rising chart after connecting a YouTube channel safely"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">One content calendar</p>
            <h2>Plan YouTube next to <em className="s">your other channels.</em></h2>
            <p>
              Select YouTube and your other channels in the same composer, tailor the details for each one, and review the
              week or month without switching between separate planning tools. Scheduled posts stay in one queue where
              you can edit, reschedule or delete them before they go live.
            </p>
          </div>
          <div className="cards">
            <article className="pcard">
              <span className="no">01 / Shorts</span>
              <h3>Schedule videos and Shorts together</h3>
              <p>Plan standard YouTube uploads and Shorts on the same calendar. Turn on the Short option for each Short you want to publish.</p>
            </article>
            <article className="pcard">
              <span className="no">02 / Privacy</span>
              <h3>Control every upload&apos;s visibility</h3>
              <p>Choose public for a launch, unlisted for anyone with the link, or private for a restricted audience before you schedule.</p>
            </article>
            <article className="pcard">
              <span className="no">03 / More channels</span>
              <h3>Reuse your video across social channels</h3>
              <p>Schedule the same idea with the <Link className={s.vlink} href="/tiktok-scheduler">TikTok video scheduler</Link> and <Link className={s.vlink} href="/instagram-scheduler">Instagram Reels scheduler</Link>, with details tailored to each channel.</p>
            </article>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">YouTube scheduler FAQs</p>
            <h2>Shorts, privacy and publishing</h2>
          </div>
          <div className="faq">
            {faqs.map((faq, index) => (
              <details key={faq.q} open={index === 0}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
          <p className="small" style={{ marginTop: 20, textAlign: "center" }}>
            New to it? Read{" "}
            <Link className={s.vlink} href="/help/schedule-youtube-videos">how to schedule YouTube videos and Shorts</Link>.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Put your next YouTube video <em className="s">on the calendar.</em></h2>
              <p>Start free, connect with Google sign-in, and schedule videos and Shorts beside your other channels.</p>
              <Link className="btn" href="/signup">Start scheduling YouTube videos free <span aria-hidden="true">→</span></Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-schedule.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="A creator schedules a YouTube video on a calendar beside a friendly alarm clock"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
