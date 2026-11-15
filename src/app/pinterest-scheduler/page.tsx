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

const PATH = "/pinterest-scheduler";
const title = `Pinterest Scheduler: Schedule Pins to Your Boards | ${BRAND.name}`;
const description = "Schedule Pinterest Pins to any board with the official API. Add a title and destination link, upload a JPG or PNG image, and choose the publishing time.";

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: new URL(PATH, BRAND.canonicalUrl).toString() },
  openGraph: { title, description, url: new URL(PATH, BRAND.canonicalUrl).toString() },
  twitter: { card: "summary_large_image", title, description },
});

const features = [
  {
    no: "01 / Board",
    title: "Choose the board for each Pin",
    text: "Connect your Pinterest account, load the boards you can pin to, and pick the destination board in the composer. Every scheduled Pin needs a board.",
  },
  {
    no: "02 / Pin details",
    title: "Add a title and description",
    text: "Write an optional Pin title of up to 100 characters and a description of up to 500 characters. Your copy is sent with the Pin when the scheduled time arrives.",
  },
  {
    no: "03 / Destination",
    title: "Link readers to your website",
    text: "Add an optional destination link as a full http:// or https:// web address. Use it to send Pin readers to the product, article or page behind your image.",
  },
  {
    no: "04 / Images",
    title: "Schedule image Pins within clear limits",
    text: "Use JPG or PNG images up to 20 MB per file. Schedule one image, or create an image carousel with up to five images. Pinterest publishing currently supports images only, not video Pins.",
  },
];

const steps = [
  {
    n: "1",
    title: "Connect Pinterest with the official login",
    text: "Sign in on Pinterest's official screen and approve access to read your boards and create Pins. Poskoo never asks for your Pinterest password.",
  },
  {
    n: "2",
    title: "Create your Pin",
    text: "Pick a board, add a JPG or PNG image, write the title and description, and include a destination link when you want the Pin to send readers to your site.",
  },
  {
    n: "3",
    title: "Choose a time and let the queue publish",
    text: "Pick the date and time. Poskoo creates the Pin through the official Pinterest API when it is due, then shows a published or failed status so you can retry if needed.",
  },
];

const faqs = [
  {
    q: "Can I schedule Pinterest Pins with Poskoo?",
    a: "Yes. Connect your Pinterest account, choose a board, add an image and Pin details, and pick a publishing time. Poskoo creates the Pin through the official Pinterest API when it is due.",
  },
  {
    q: "Do I need to give Poskoo my Pinterest password?",
    a: "No. You sign in through Pinterest's official login and approve the requested access. Poskoo never asks for, stores or scrapes your Pinterest password.",
  },
  {
    q: "What images can I schedule for a Pinterest Pin?",
    a: "Pinterest targets accept JPG or PNG images up to 20 MB per file. A Pin needs at least one image, and multiple images can publish as a carousel with up to five images. Poskoo currently supports image Pins only, not video Pins.",
  },
  {
    q: "Can I add a title and destination link to a scheduled Pin?",
    a: "Yes. Add an optional title of up to 100 characters, a description of up to 500 characters and an optional destination link. The link must be a complete http:// or https:// web address.",
  },
  {
    q: "Can I edit or reschedule a Pinterest Pin before it publishes?",
    a: "Yes. You can edit, reschedule or delete a scheduled post from the queue before it publishes. If publishing fails, the queue shows the error and lets you retry after fixing the issue.",
  },
];

const appJsonLd = {
  ...toolSoftwareJsonLd({
    name: `${BRAND.name} Pinterest scheduler`,
    description,
    url: `${BRAND.canonicalUrl}${PATH}`,
  }),
  featureList: [
    "Pinterest board selection",
    "Pin titles up to 100 characters and descriptions up to 500 characters",
    "Optional destination links",
    "JPG and PNG image Pins up to 20 MB per file",
    "Week and month content calendar",
    "Publishing status and retries",
  ],
  // Paid offers only once Pro/Agency checkout is live, matching /pricing.
  offers: softwareOffers(planReadiness()),
};

export default function PinterestSchedulerPage() {
  return (
    <PublicShell className={s.sched} breadcrumbs={[{ name: "Pinterest scheduler", path: PATH }]}>
      {[appJsonLd, faqJsonLd(faqs)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">
        <div className={s.heroText}>
        <span className="pill">Official Pinterest API · No password needed</span>
        <p className="eyebrow">Pinterest scheduler</p>
        <h1>
          Schedule Pinterest Pins <em className="s mark">to any board</em>
        </h1>
        <p className="lede">
          Poskoo schedules Pinterest Pins through the official Pinterest API: connect your account, pick a board, add a
          destination link and image, and choose the publishing time. Your Pin joins the same calendar and publishing
          queue as your other social posts.
        </p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/signup">Start scheduling Pins <span aria-hidden="true">→</span></Link>
          <Link className="btn btn-line" href="/signup">Create your free account</Link>
        </div>
        <p className="small">Free plan included. No credit card needed.</p>
        </div>
        <div className="hero-art"><AnimArt name="multichannel" label="A creator at a laptop sends a scheduled Pin to a board alongside posts for other social channels" /></div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Pinterest scheduling features</p>
            <h2>What you can <em className="s">schedule on Pinterest.</em></h2>
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

      <section id="how-it-works" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">How Pinterest scheduling works</p>
              <h2>Schedule your first <em className="s mark">Pinterest Pin.</em></h2>
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
                alt="A creator adds a scheduled Pinterest Pin to a weekly calendar next to a friendly alarm clock"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">A destination for every idea</p>
              <h2>Drive traffic with a <em className="s">link on every Pin.</em></h2>
              <p>
                Give each scheduled Pin a useful next step by adding the full web address of the page it represents.
                Send readers to a product, recipe, article or landing page, then keep the title and description aligned
                with what they will find when they click.
              </p>
              <p>
                The destination link is optional, but when you add one Poskoo validates that it is a complete http://
                or https:// address before the Pin can be scheduled.
              </p>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/card-leads.webp"
                width={900}
                height={900}
                loading="lazy"
                alt="Two friends celebrate beside a task board and a rising chart after publishing linked Pins"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">One content calendar</p>
            <h2>Plan Pinterest next to <em className="s">Instagram on one calendar.</em></h2>
            <p>
              Select Pinterest and Instagram in the same composer, tailor the copy for each channel, and review the
              week or month without switching between separate planning tools. Scheduled posts stay in one queue where
              you can edit, reschedule or delete them before they go live.
            </p>
          </div>
          <div className="cards">
            <article className="pcard">
              <span className="no">01 / Instagram</span>
              <h3>Publish Instagram content on schedule</h3>
              <p>Use the <Link className={s.vlink} href="/instagram-scheduler">Instagram scheduler for feed posts, Reels and carousels</Link> alongside your Pinterest plan.</p>
            </article>
            <article className="pcard">
              <span className="no">02 / Planning</span>
              <h3>Turn an idea into a complete post</h3>
              <p>Follow the <Link className={s.vlink} href="/instagram-content-planner">step-by-step Instagram content planner</Link> to prepare the copy and visuals for your calendar.</p>
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
            <p className="eyebrow">Pinterest scheduler FAQs</p>
            <h2>Boards, image limits and publishing</h2>
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
            <Link className={s.vlink} href="/help/schedule-pinterest-posts">how to schedule Pinterest Pins</Link> or check your{" "}
            <Link className={s.vlink} href="/tools/pinterest-character-counter">free Pinterest character counter</Link> limits before you publish.
            Check the image with the free <Link className={s.vlink} href="/tools/pinterest-pin-size-checker">Pinterest pin size checker</Link>.
            Write the text with the free{" "}
            <Link className={s.vlink} href="/tools/pinterest-description-generator">Pinterest description generator</Link>.
            Add a few tags with the{" "}
            <Link className={s.vlink} href="/tools/pinterest-hashtag-generator">free Pinterest hashtag generator</Link>.
            Not sure when to pin? Try the free{" "}
            <Link className={s.vlink} href="/tools/best-time-to-post-on-pinterest">best time to post on Pinterest</Link> finder.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Put your next Pinterest Pin <em className="s">on the calendar.</em></h2>
              <p>Start free, connect through Pinterest, and schedule image Pins beside your Instagram content.</p>
              <Link className="btn" href="/signup">Start scheduling Pins free <span aria-hidden="true">→</span></Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-schedule.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="A creator schedules a Pinterest Pin on a calendar beside a friendly alarm clock"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
