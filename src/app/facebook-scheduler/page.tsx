import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { publisherRef } from "@/lib/tool-schema";
import { softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/facebook-scheduler";
const title = `Facebook Page Scheduler: Plan & Auto-Publish | ${BRAND.name}`;
const description = `Schedule Facebook Page posts with text, photos or video through Meta's official login. Plan Instagram and Threads content on the same calendar with ${BRAND.name}.`;

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
});

const benefits = [
  {
    no: "01 / Composer",
    title: "Text, photos and video",
    text: "Write a text update, add one photo, build an album with 2–10 photos, or publish one video to your Facebook Page.",
  },
  {
    no: "02 / Calendar",
    title: "Plan the week or month",
    text: "Choose a publish time, move scheduled posts on the calendar, and keep drafts and upcoming posts easy to find.",
  },
  {
    no: "03 / Channels",
    title: "One multi-channel workflow",
    text: "Select Facebook, Instagram and Threads in the same composer, customize captions per channel, and filter one publishing queue by account.",
  },
];

const steps = [
  {
    n: "1",
    title: "Connect through Meta",
    text: "Use Meta’s official login, share your Facebook Page and allow the Manage Page posts permission. Poskoo never asks for your Facebook password.",
  },
  {
    n: "2",
    title: "Compose and schedule",
    text: "Write your caption, add public HTTPS image links or an .mp4 video link if needed, select Facebook, and choose the date and time.",
  },
  {
    n: "3",
    title: "Track publishing",
    text: "Poskoo publishes the due post through the Meta Graph API. Check its status, see any publishing error, and retry after fixing the issue.",
  },
];

const faqs = [
  {
    q: "Which Facebook accounts can I use?",
    a: "Poskoo publishes to Facebook Pages, not personal profiles or groups. The current Meta connection flow also requires an Instagram professional account linked to your Page.",
  },
  {
    q: "Do I need to give Poskoo my Facebook password?",
    a: "No. You sign in on Meta’s official login screen and choose which Pages and permissions to share. Poskoo uses the official Meta Graph API and never asks for your Facebook password.",
  },
  {
    q: "What kinds of Facebook Page posts can I schedule?",
    a: "You can schedule a text-only post, one photo, an album of 2–10 photos, or one video. Use public HTTPS image or .mp4 links; a Facebook post can contain photos or one video, not both.",
  },
  {
    q: "Will Poskoo publish the post automatically?",
    a: "Yes. The publishing worker sends due Page posts through the Graph API and records a published or failed status. Failed posts show an error and can be retried after you fix the connection or content issue.",
  },
  {
    q: "Can I manage Instagram and Threads alongside Facebook?",
    a: "Yes. Connect each supported account, select the channels you want in the composer, and manage the posts in one calendar and queue. You can customize the caption for each channel before scheduling.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. Every account starts on the $0 Free plan, which includes 2 social accounts and 10 scheduled posts per month. No credit card is needed to sign up.",
  },
];

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND.name,
  url: `${BRAND.url}${PATH}`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description,
  featureList: [
    "Facebook Page post scheduling",
    "Text, photo and video publishing",
    "Instagram and Threads scheduling",
    "Week and month calendar",
    "Publishing status and retries",
  ],
  // Paid offers only once Pro/Agency checkout is live, matching /pricing.
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

const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

export default function FacebookSchedulerPage() {
  return (
    <PublicShell className={s.sched} breadcrumbs={[{ name: "Facebook Page scheduler", path: PATH }]}>
      {[appJsonLd, faqJsonLd].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ld(data) }}
        />
      ))}

      <header className="hero">
        <div className={s.heroText}>
        <span className="pill">Official Meta login · Facebook Pages</span>
        <h1>
          Facebook Page scheduler for <em className="s mark">consistent publishing</em>
        </h1>
        <p className="lede">
          Compose and auto-publish Facebook Page posts from a clear calendar. Connect securely through Meta,
          then plan Facebook, Instagram and Threads content together in {BRAND.name}.
        </p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
          <Link className="btn btn-line" href="/pricing">View pricing</Link>
        </div>
        <p className="small">Free plan included. No credit card needed.</p>
        </div>
        <div className="hero-art"><AnimArt name="multichannel" label="A creator at a laptop sends one post that splits to several phones and screens" /></div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">A simpler Page workflow</p>
            <h2>From draft to published, <em className="s">without the tab juggling</em></h2>
          </div>
          <div className="cards">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="pcard">
                <span className="no">{benefit.no}</span>
                <h3>{benefit.title.replace(/-/g, "\u2011")}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
          <p className="small" style={{ marginTop: 20, textAlign: "center" }}>
            Also planning Instagram or Threads? See the{" "}
            <Link className={s.vlink} href="/instagram-scheduler">Instagram scheduler</Link>, the{" "}
            <Link className={s.vlink} href="/threads-scheduler">Threads scheduler</Link>
            {" "}or prepare your content with our{" "}
            <Link className={s.vlink} href="/tools">free Instagram tools</Link>. Check your draft with our{" "}
            <Link className={s.vlink} href="/tools/facebook-character-counter">Facebook character counter</Link> before scheduling. See how your draft will look in the feed with our{" "}
            <Link className={s.vlink} href="/tools/facebook-post-preview">Facebook post preview</Link>. Add a few relevant tags with our{" "}
            <Link className={s.vlink} href="/tools/facebook-hashtag-generator">Facebook hashtag generator</Link>. Write the post with our{" "}
            <Link className={s.vlink} href="/tools/facebook-caption-generator">Facebook caption generator</Link>. Style a headline with our{" "}
            <Link className={s.vlink} href="/tools/facebook-font-generator">Facebook font generator</Link>.{" "}
            Need a profile line? Try the free <Link className={s.vlink} href="/tools/facebook-bio-generator">Facebook bio generator</Link>. Check your header image with our{" "}
            <Link className={s.vlink} href="/tools/facebook-cover-photo-size-checker">Facebook cover photo size checker</Link>. Not sure when to post? Find the{" "}
            <Link className={s.vlink} href="/tools/best-time-to-post-on-facebook">best time to post on Facebook</Link>.
          </p>
        </div>
      </section>

      <section id="how-it-works" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">Setup in three steps</p>
              <h2>Schedule your first <em className="s mark">Facebook Page post</em></h2>
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
              <p className="small" style={{ marginTop: 16 }}>
                Want every detail? Read the step-by-step guide on{" "}
                <Link className={s.vlink} href="/help/schedule-facebook-posts">how to schedule Facebook Page posts</Link>.
              </p>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/card-schedule.webp"
                width={900}
                height={900}
                loading="lazy"
                alt="A creator pins scheduled post cards to a weekly calendar beside a friendly alarm clock"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Facebook scheduling FAQs</p>
            <h2>Accounts, permissions and publishing</h2>
          </div>
          <div className="faq">
            {faqs.map((faq, index) => (
              <details key={faq.q} open={index === 0}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Put your next Facebook Page post <em className="s">on the calendar</em></h2>
              <p>Start free, connect with Meta, and manage your Facebook, Instagram and Threads queue together.</p>
              <Link className="btn" href="/signup">Start scheduling free <span aria-hidden="true">→</span></Link>
              {" "}
              <Link className="btn" href="/pricing">Compare plans</Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-leads.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="Two friends celebrate beside a board of completed tasks and a rising chart"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
