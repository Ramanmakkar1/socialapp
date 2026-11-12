import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { SOFTWARE_APPLICATION_OFFERS } from "@/lib/plans";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/mastodon-scheduler";
const title = `Mastodon Scheduler: Schedule Toots on Any Server | ${BRAND.name}`;
const description = "Schedule Mastodon posts on any server with OAuth. Write up to 500 characters or your server's limit, add images or video, and pick a time with Poskoo.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: new URL(PATH, BRAND.url).toString() },
  openGraph: { title, description, url: new URL(PATH, BRAND.url).toString() },
  twitter: { card: "summary_large_image", title, description },
};

const features = [
  {
    no: "01 / Connect",
    title: "Connect any Mastodon server with OAuth",
    text: "Type your server, for example mastodon.social, and approve Poskoo on your server. No app password is needed, and Poskoo never asks for your Mastodon password.",
  },
  {
    no: "02 / Post",
    title: "Write up to 500 characters—or your server's limit",
    text: "Mastodon's default limit is 500 characters, but servers can raise it. Poskoo reads the limit for your connected account and checks your post against it before publishing.",
  },
  {
    no: "03 / Media",
    title: "Add images or an MP4 or MOV video",
    text: "Attach up to 4 images, each up to 16 MB, or one MP4 or MOV video up to 99 MB. Poskoo checks the media limits before your post is scheduled.",
  },
  {
    no: "04 / Status",
    title: "See a published or failed status",
    text: "Every scheduled post shows a published or failed status in the queue. Poskoo publishes your Mastodon posts as public at the date and time you choose.",
  },
];

const steps = [
  {
    n: "1",
    title: "Enter your Mastodon server",
    text: "Type the server where your account lives, for example mastodon.social. Poskoo works with any Mastodon server, so there is no fixed list of instances to choose from.",
  },
  {
    n: "2",
    title: "Approve Poskoo with OAuth",
    text: "Approve Poskoo on your Mastodon server to connect your account. This secure OAuth flow needs no app password, developer app or Mastodon password in Poskoo.",
  },
  {
    n: "3",
    title: "Write, add media and pick a time",
    text: "Write your post, add images or a video, and choose the date and time. Poskoo publishes it publicly and shows a published or failed status.",
  },
];

const faqs = [
  {
    q: "Can I schedule Mastodon posts?",
    a: "Yes. Connect your Mastodon account, write the post, add images or a video and pick a time. Poskoo publishes it publicly for you and shows a published or failed status.",
  },
  {
    q: "Which Mastodon servers work?",
    a: "Poskoo works with any Mastodon server. Type your server name, for example mastodon.social, then approve Poskoo on that server with OAuth. No app password or developer app is needed.",
  },
  {
    q: "What is the character limit?",
    a: "Mastodon's default limit is 500 characters, but your server can raise it. Poskoo reads the character limit for each connected account and uses that limit when you write a post.",
  },
  {
    q: "Can I schedule images and videos?",
    a: "Yes. Add up to 4 images, each up to 16 MB, or one MP4 or MOV video up to 99 MB. Poskoo uploads the media and publishes it with your post at the scheduled time.",
  },
];

const appJsonLd = {
  ...toolSoftwareJsonLd({
    name: `${BRAND.name} Mastodon scheduler`,
    description,
    url: `${BRAND.url}${PATH}`,
  }),
  featureList: [
    "Mastodon OAuth connection on any server",
    "Public posts with a 500-character default limit",
    "Account-specific server character limits",
    "Up to 4 images, each up to 16 MB",
    "One MP4 or MOV video up to 99 MB",
    "Published or failed status for each post",
  ],
  offers: SOFTWARE_APPLICATION_OFFERS,
};

export default function MastodonSchedulerPage() {
  return (
    <PublicShell breadcrumbs={[{ name: "Mastodon scheduler", path: PATH }]}>
      {[appJsonLd, faqJsonLd(faqs)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">
        <span className="pill">Official Mastodon OAuth · No app password</span>
        <p className="eyebrow">Mastodon scheduler</p>
        <h1>
          Schedule Mastodon posts <em className="s mark">on any server</em>
        </h1>
        <p className="lede">
          Poskoo schedules Mastodon posts on any server: connect your account, write up to 500 characters (or your server&apos;s limit), add images or a video, pick a time and Poskoo publishes it for you.
          Your post joins the same calendar and publishing queue as your other social channels.
        </p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/signup">Start scheduling Mastodon posts <span aria-hidden="true">→</span></Link>
          <Link className="btn btn-line" href="/signup">Create your free account</Link>
        </div>
        <p className="small">Free plan included. No credit card needed.</p>
        <div className="hero-art"><AnimArt name="multichannel" label="A creator at a laptop sends a scheduled Mastodon post to a calendar alongside posts for other social channels" /></div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Mastodon scheduling features</p>
            <h2>What you can <em className="s">schedule on Mastodon.</em></h2>
          </div>
          <div className="cards">
            {features.map((feature) => (
              <article key={feature.title} className="pcard">
                <span className="no">{feature.no}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">How Mastodon scheduling works</p>
              <h2>Schedule your first <em className="s mark">Mastodon post.</em></h2>
              <div className="pains">
                {steps.map((step) => (
                  <div key={step.n} className="pain">
                    <b>{step.n}. {step.title}</b>
                    <span>{step.text}</span>
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
                alt="A creator adds a scheduled Mastodon post to a weekly calendar next to a friendly alarm clock"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">OAuth, not an app password</p>
              <h2>How do I connect my <em className="s">Mastodon server?</em></h2>
              <p>
                Type your Mastodon server, for example mastodon.social, and approve Poskoo on your server. Poskoo uses
                OAuth to connect your account, so you do not need to create an app password or a developer app.
              </p>
              <p>
                Your Mastodon password stays with your server. Once you approve the connection, return to Poskoo to write
                your post, add media and choose a publishing time.
              </p>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/card-leads.webp"
                width={900}
                height={900}
                loading="lazy"
                alt="Two friends celebrate beside a task board and a rising chart after connecting a Mastodon account safely"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">One content calendar</p>
            <h2>Plan Mastodon next to <em className="s">your other channels.</em></h2>
            <p>
              Select Mastodon and your other channels in the same composer, tailor the copy for each one, and review the
              week or month without switching between separate planning tools. Scheduled posts stay in one queue where
              you can edit, reschedule or delete them before they go live.
            </p>
          </div>
          <div className="cards">
            <article className="pcard">
              <span className="no">01 / Text</span>
              <h3>Write to your server&apos;s character limit</h3>
              <p>Use Mastodon&apos;s 500-character default or the higher limit set by your server, which Poskoo reads for your connected account.</p>
            </article>
            <article className="pcard">
              <span className="no">02 / Media</span>
              <h3>Schedule images and video</h3>
              <p>Add up to 4 images of 16 MB each, or one MP4 or MOV video up to 99 MB, with your public Mastodon post.</p>
            </article>
            <article className="pcard">
              <span className="no">03 / Compare</span>
              <h3>Choose the right scheduling setup</h3>
              <p>Read the <Link className={s.vlink} href="/social-media-scheduler-comparison">social media scheduler comparison</Link> to review supported channels, publishing and planning features.</p>
            </article>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Mastodon scheduler FAQs</p>
            <h2>Servers, character limits and media</h2>
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
            Need more detail? Visit the{" "}
            <Link className={s.vlink} href="/help">Poskoo Help Center for scheduling guides</Link>.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Put your next Mastodon post <em className="s">on the calendar.</em></h2>
              <p>Start free, connect your server with OAuth, and schedule public text, image and video posts beside your other channels.</p>
              <Link className="btn" href="/signup">Start scheduling Mastodon posts free <span aria-hidden="true">→</span></Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-schedule.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="A creator schedules a Mastodon post on a calendar beside a friendly alarm clock"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
