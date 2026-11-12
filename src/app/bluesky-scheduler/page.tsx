import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { SOFTWARE_APPLICATION_OFFERS } from "@/lib/plans";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/bluesky-scheduler";
const title = `Bluesky Scheduler: Schedule Bluesky Posts | ${BRAND.name}`;
const description = "Schedule Bluesky posts with your handle and an app password. Add text and up to 4 images, pick a time, and Poskoo publishes with a clear status.";

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
    title: "Connect with your handle and an app password",
    text: "Add your Bluesky handle and a Bluesky app password. This is Bluesky's official method for third-party apps, so you never give Poskoo your main password, and you can revoke the app password at any time.",
  },
  {
    no: "02 / Post",
    title: "Write text and add up to 4 images",
    text: "Compose your post text and attach up to 4 images. Images over Bluesky's 1 MB limit are shrunk automatically when possible, so more of your visuals publish without manual resizing.",
  },
  {
    no: "03 / Links",
    title: "Get a link preview and real facets",
    text: "Add a link and Bluesky shows a link-preview card. Mentions and links in your text become real facets, so they are clickable and point to the right profile or page.",
  },
  {
    no: "04 / Status",
    title: "See a published or failed status",
    text: "Every scheduled post shows a published or failed status in the queue. Bluesky video is not supported yet, so schedule text and image posts for now.",
  },
];

const steps = [
  {
    n: "1",
    title: "Create a Bluesky app password",
    text: "In Bluesky, open Settings → Privacy and security → App passwords and create a new app password. No developer app is needed.",
  },
  {
    n: "2",
    title: "Connect your handle",
    text: "Enter your Bluesky handle and the app password in Poskoo. Poskoo uses Bluesky's official method for third-party apps and never asks for your main password.",
  },
  {
    n: "3",
    title: "Write, add images and pick a time",
    text: "Write your post, add up to 4 images, and choose the date and time. Poskoo publishes it for you and shows a published or failed status.",
  },
];

const faqs = [
  {
    q: "Can I schedule Bluesky posts with Poskoo?",
    a: "Yes. Connect your Bluesky handle with an app password, write the post, add up to 4 images and pick a time. Poskoo publishes it for you and shows a published or failed status.",
  },
  {
    q: "Do I need a Bluesky developer app?",
    a: "No. You connect with your Bluesky handle and a Bluesky app password, which is Bluesky's official method for third-party apps. No developer app or extra setup is needed.",
  },
  {
    q: "How do I create a Bluesky app password?",
    a: "In Bluesky, go to Settings → Privacy and security → App passwords and create a new app password. Use that app password in Poskoo instead of your main password, and revoke it at any time.",
  },
  {
    q: "How many images can I add to a Bluesky post?",
    a: "You can add up to 4 images per post. Images over Bluesky's 1 MB limit are shrunk automatically when possible, so they fit within the limit.",
  },
  {
    q: "Does Poskoo support Bluesky video?",
    a: "Not yet. Bluesky video is not supported in Poskoo right now, so schedule text and image posts. Video support will be added when it is available.",
  },
  {
    q: "What happens if a Bluesky post fails?",
    a: "Each post shows a published or failed status. If publishing fails, the queue shows the failure so you can check the post and try again.",
  },
];

const appJsonLd = {
  ...toolSoftwareJsonLd({
    name: `${BRAND.name} Bluesky scheduler`,
    description,
    url: `${BRAND.url}${PATH}`,
  }),
  featureList: [
    "Bluesky handle and app password connection",
    "Text posts with up to 4 images",
    "Automatic image shrinking over the 1 MB limit",
    "Link preview cards",
    "Mentions and links as real facets",
    "Published or failed status for each post",
  ],
  offers: SOFTWARE_APPLICATION_OFFERS,
};

export default function BlueskySchedulerPage() {
  return (
    <PublicShell breadcrumbs={[{ name: "Bluesky scheduler", path: PATH }]}>
      {[appJsonLd, faqJsonLd(faqs)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">
        <span className="pill">Official Bluesky app password · No developer app</span>
        <p className="eyebrow">Bluesky scheduler</p>
        <h1>
          Schedule Bluesky posts <em className="s mark">on your own calendar</em>
        </h1>
        <p className="lede">
          Poskoo schedules Bluesky posts with an app password: connect your handle, write the post, add up to 4 images
          and pick a time. Your post joins the same calendar and publishing queue as your other social channels.
        </p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/signup">Start scheduling Bluesky posts <span aria-hidden="true">→</span></Link>
          <Link className="btn btn-line" href="/signup">Create your free account</Link>
        </div>
        <p className="small">Free plan included. No credit card needed.</p>
        <div className="hero-art"><AnimArt name="multichannel" label="A creator at a laptop sends a scheduled Bluesky post to a calendar alongside posts for other social channels" /></div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Bluesky scheduling features</p>
            <h2>What you can <em className="s">schedule on Bluesky.</em></h2>
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
              <p className="eyebrow">How Bluesky scheduling works</p>
              <h2>Schedule your first <em className="s mark">Bluesky post.</em></h2>
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
                alt="A creator adds a scheduled Bluesky post to a weekly calendar next to a friendly alarm clock"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">App passwords, not your main password</p>
              <h2>How do I create a <em className="s">Bluesky app password?</em></h2>
              <p>
                In Bluesky, open Settings → Privacy and security → App passwords and create a new app password. This is
                Bluesky&apos;s official method for third-party apps, so you never give Poskoo your main password, and you
                can revoke the app password at any time.
              </p>
              <p>
                No developer app is needed. Paste the app password into Poskoo with your handle, and you are ready to
                schedule posts.
              </p>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/card-leads.webp"
                width={900}
                height={900}
                loading="lazy"
                alt="Two friends celebrate beside a task board and a rising chart after connecting a Bluesky account safely"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">One content calendar</p>
            <h2>Plan Bluesky next to <em className="s">your other channels.</em></h2>
            <p>
              Select Bluesky and your other channels in the same composer, tailor the copy for each one, and review the
              week or month without switching between separate planning tools. Scheduled posts stay in one queue where
              you can edit, reschedule or delete them before they go live.
            </p>
          </div>
          <div className="cards">
            <article className="pcard">
              <span className="no">01 / Images</span>
              <h3>Add up to 4 images per post</h3>
              <p>Attach up to 4 images. Images over Bluesky&apos;s 1 MB limit are shrunk automatically when possible, so they fit within the limit.</p>
            </article>
            <article className="pcard">
              <span className="no">02 / Links</span>
              <h3>Link previews and real facets</h3>
              <p>Add a link to get a link-preview card. Mentions and links in your text become real facets, so they are clickable.</p>
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
            <p className="eyebrow">Bluesky scheduler FAQs</p>
            <h2>App passwords, images and publishing</h2>
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
            Need more detail? Read the{" "}
            <Link className={s.vlink} href="/help/schedule-bluesky-posts">step-by-step guide to scheduling Bluesky posts</Link>.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Put your next Bluesky post <em className="s">on the calendar.</em></h2>
              <p>Start free, connect with an app password, and schedule text and image posts beside your other channels.</p>
              <Link className="btn" href="/signup">Start scheduling Bluesky posts free <span aria-hidden="true">→</span></Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-schedule.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="A creator schedules a Bluesky post on a calendar beside a friendly alarm clock"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
