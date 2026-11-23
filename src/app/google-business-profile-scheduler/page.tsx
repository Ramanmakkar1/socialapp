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

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const PATH = "/google-business-profile-scheduler";
const title = `Google Business Profile Scheduler: Schedule Posts | ${BRAND.name}`;
const description = "Schedule Google Business Profile posts, offers and events to your locations with the official API. Add a photo and a button like Book or Call. Free plan.";

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: new URL(PATH, BRAND.canonicalUrl).toString() },
  openGraph: { title, description, url: new URL(PATH, BRAND.canonicalUrl).toString() },
  twitter: { card: "summary_large_image", title, description },
});

const features = [
  {
    no: "01 / Post types",
    title: "Schedule updates, offers and events",
    text: "Publish a What's new update, an offer with a coupon code and redeem link, or an event with start and end dates. Each post type is sent to Google with the fields it needs.",
  },
  {
    no: "02 / Call to action",
    title: "Add a Book, Order or Call button",
    text: "Choose a call-to-action button such as Book, Order online, Buy, Learn more, Sign up or Call now. Updates and events can carry a button with its own web address.",
  },
  {
    no: "03 / Text",
    title: "Write up to 1,500 characters",
    text: "Google Business Profile posts allow a summary of up to 1,500 characters. Write the update, offer details or event description and Poskoo sends the text with the post.",
  },
  {
    no: "04 / Locations",
    title: "Post to the locations you manage",
    text: "Connect your Google account and pick the business location for each post. If you manage several locations, schedule the right post to each one.",
  },
  {
    no: "05 / Status",
    title: "See published or failed, then retry",
    text: "Every scheduled post shows whether it published or failed. If Google returns an error, the queue shows the message so you can fix the post and retry.",
  },
];

const steps = [
  {
    n: "1",
    title: "Connect with Google sign-in",
    text: "Sign in with Google and approve the business.manage permission. Poskoo never asks for your Google password.",
  },
  {
    n: "2",
    title: "Pick your business location",
    text: "Choose the Google Business Profile location the post should appear on, from the locations your Google account can manage.",
  },
  {
    n: "3",
    title: "Write the post and add a photo",
    text: "Add the summary, choose the post type and call-to-action button, and attach one JPG or PNG photo.",
  },
  {
    n: "4",
    title: "Pick a time and let the queue publish",
    text: "Choose the date and time. Poskoo creates the local post through Google's official Business Profile API when it is due, then shows a published or failed status.",
  },
];

const faqs = [
  {
    q: "Can I schedule Google Business Profile posts?",
    a: "Yes. Poskoo schedules Google Business Profile posts through Google's official Business Profile API. Connect your Google account, pick a location, write the post and choose a publishing time. Posting is built and waiting for Google's app-by-app API approval, so you can sign up now and connect as soon as it is switched on.",
  },
  {
    q: "Which post types can I schedule?",
    a: "You can schedule a What's new update, an offer with a coupon code and redeem link, or an event with start and end dates. Offers and events also take a title, and events can include start and end times.",
  },
  {
    q: "How long can a Google Business Profile post be?",
    a: "A Google Business Profile post summary can be up to 1,500 characters. Poskoo sends the text you write with the post, so keep the key message in the first lines where it is most visible.",
  },
  {
    q: "Can I add a Book or Call button to a post?",
    a: "Yes. Updates and events can carry a call-to-action button such as Book, Order online, Buy, Learn more, Sign up or Call now. Buttons that link somewhere need a full https:// web address; the Call button uses your location's phone number.",
  },
  {
    q: "Do you need my Google password?",
    a: "No. You connect through Google's official sign-in and approve the business.manage permission. Poskoo never asks for, stores or scrapes your Google password.",
  },
];

const appJsonLd = {
  ...toolSoftwareJsonLd({
    name: `${BRAND.name} Google Business Profile scheduler`,
    description,
    url: `${BRAND.canonicalUrl}${PATH}`,
  }),
  featureList: [
    "Google Business Profile updates, offers and events",
    "Call-to-action buttons such as Book, Order and Call",
    "Post summaries up to 1,500 characters",
    "Multiple business locations",
    "One JPG or PNG photo per post",
    "Week and month content calendar",
    "Publishing status and retries",
  ],
  // Paid offers only once Pro/Agency checkout is live, matching /pricing.
  offers: softwareOffers(planReadiness()),
};

export default function GoogleBusinessProfileSchedulerPage() {
  return (
    <PublicShell className={s.sched} breadcrumbs={[{ name: "Google Business Profile scheduler", path: PATH }]}>
      {[appJsonLd, faqJsonLd(faqs)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">
        <div className={s.heroText}>
        <span className="pill">Official Google Business Profile API · No password needed</span>
        <p className="eyebrow">Google Business Profile scheduler</p>
        <h1>
          Google Business Profile <em className="s mark">scheduler</em>
        </h1>
        <p className="lede">
          Yes, you can schedule Google Business Profile posts: connect your business with Google&apos;s official sign-in, write an update, offer or event post, pick a location and time, and Poskoo publishes it through the Business Profile API. The Free plan is $0 with no credit card.
        </p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/signup">Start scheduling GBP posts <span aria-hidden="true">→</span></Link>
          <Link className="btn btn-line" href="/pricing">See plans and pricing</Link>
        </div>
        <p className="small">Free plan included. No credit card needed.</p>
        </div>
        <div className="hero-art"><AnimArt name="multichannel" label="A business owner schedules a Google Business Profile post to a local listing alongside posts for other social channels" /></div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Google Business Profile scheduling features</p>
            <h2>What you can <em className="s">schedule on Google.</em></h2>
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
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band" style={{ alignItems: "center" }}>
            <div className="copy">
              <p className="eyebrow">Before you connect</p>
              <h2>Built and <em className="s mark">waiting for Google&apos;s approval.</em></h2>
              <p>
                Google approves Business Profile API access app by app. Posting to your locations is built and waiting
                for Google&apos;s approval; you can sign up now and connect as soon as it&apos;s switched on.
              </p>
              <p>
                Nothing is published to your listing until Google grants access. When it does, your scheduled posts go
                out through the official API with the same status and retry handling as your other channels.
              </p>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/card-schedule.webp"
                width={900}
                height={900}
                loading="lazy"
                alt="A business owner waits beside a calendar while a Google Business Profile post is prepared for publishing"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">How Google Business Profile scheduling works</p>
              <h2>Schedule your first <em className="s mark">Google post.</em></h2>
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
                alt="A creator adds a scheduled Google Business Profile post to a weekly calendar next to a friendly alarm clock"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">One content calendar</p>
            <h2>Plan Google posts next to <em className="s">your other channels.</em></h2>
            <p>
              Schedule Google Business Profile posts in the same calendar as Instagram, Facebook, Pinterest and the rest
              of your channels. Review the week or month, then edit, reschedule or delete a post before it goes live.
            </p>
          </div>
          <div className="cards">
            <article className="pcard">
              <span className="no">01 / Instagram</span>
              <h3>Publish Instagram content on schedule</h3>
              <p>Use the <Link className={s.vlink} href="/instagram-scheduler">Instagram scheduler for feed posts, Reels and carousels</Link> alongside your Google posts.</p>
            </article>
            <article className="pcard">
              <span className="no">02 / Pinterest</span>
              <h3>Schedule Pins to your boards</h3>
              <p>Plan image Pins with the <Link className={s.vlink} href="/pinterest-scheduler">Pinterest scheduler</Link> and keep every channel in one queue.</p>
            </article>
            <article className="pcard">
              <span className="no">03 / Facebook</span>
              <h3>Schedule Facebook Page posts</h3>
              <p>Add your Page content with the <Link className={s.vlink} href="/facebook-scheduler">Facebook scheduler</Link> and compare plans on the <Link className={s.vlink} href="/pricing">pricing page</Link>.</p>
            </article>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Google Business Profile scheduler FAQs</p>
            <h2>Post types, limits and publishing</h2>
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
            Need a hand? Browse the <Link className={s.vlink} href="/tools">free social media tools</Link> or read the{" "}
            <Link className={s.vlink} href="/social-media-scheduler-comparison">social media scheduler comparison</Link> before you{" "}
            <Link className={s.vlink} href="/signup">create your free account</Link>. See{" "}
            <Link className={s.vlink} href="/features">all Poskoo features</Link> and{" "}
            <Link className={s.vlink} href="/pricing">pricing and $0 Free plan</Link>.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Put your next Google post <em className="s">on the calendar.</em></h2>
              <p>Start free, connect through Google, and schedule updates, offers and events beside your other channels.</p>
              <Link className="btn" href="/signup">Start scheduling free <span aria-hidden="true">→</span></Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-schedule.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="A business owner schedules a Google Business Profile post on a calendar beside a friendly alarm clock"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
