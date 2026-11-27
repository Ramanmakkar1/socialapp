import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import { networkAvailability, availabilityPhrase } from "@/components/ChannelStatusNote";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

export const metadata: Metadata = withSocial({
  title: { absolute: "Schedule Pinterest Pins in Poskoo: Step-by-Step Help" },
  description:
    "Step-by-step help for scheduling Pinterest Pins in Poskoo: connect Pinterest, pick a board, add an image, title and link, then choose a time.",
  alternates: { canonical: new URL("/help/schedule-pinterest-posts", BRAND.canonicalUrl).toString() },
});

const steps = [
  {
    name: "Connect Pinterest with the official login",
    text: "Connect Pinterest in Settings through Pinterest's official login. You approve access on Pinterest's own screen, and you never share your password with Poskoo.",
    body: (
      <>
        Connect Pinterest in{" "}
        <Link className={s.vlink} href="/app/settings">
          Settings
        </Link>{" "}
        through Pinterest&apos;s official <strong>login</strong>. You approve access on Pinterest&apos;s own screen,
        and you never share your password with {BRAND.name}.
      </>
    ),
  },
  {
    name: "Load your boards and pick a destination board",
    text: "Poskoo loads the boards you can pin to. Pick the board each Pin goes to, because every Pin needs a board before it can be scheduled.",
    body: (
      <>
        {BRAND.name} loads the boards you can pin to. Pick the board each Pin goes to, because every Pin needs a{" "}
        <strong>board</strong> before it can be scheduled.
      </>
    ),
  },
  {
    name: "Add a title, description and destination link",
    text: "Write a Pin title and description, then add an optional destination link as a full http:// or https:// web address.",
    body: (
      <>
        Write a Pin <strong>title</strong> and <Link className={s.vlink} href="/tools/pinterest-description-generator"><strong>description</strong></Link>, then add an optional destination link as a
        full http:// or https:// web address so the Pin can send readers to your product, article or page.
      </>
    ),
  },
  {
    name: "Upload a JPG or PNG image",
    text: "Add one image or a carousel of up to five images. Each file can be a JPG or PNG up to 20 MB. Poskoo schedules image Pins only, not video Pins.",
    body: (
      <>
        Add <Link className={s.vlink} href="/tools/pinterest-pin-size-checker">one image</Link> or a <strong>carousel of up to five images</strong>. Each file can be a JPG or PNG up to 20 MB.
        Pinterest publishing currently supports image Pins only, not video Pins.
      </>
    ),
  },
  {
    name: "Pick a date and time",
    text: "Choose when the Pin should go out. Times are shown in your browser's time zone, so the Pin publishes when you expect it to.",
    body: (
      <>
        Choose <Link className={s.vlink} href="/tools/best-time-to-post-on-pinterest">when the Pin should go out</Link>. Times are shown in your browser&apos;s time zone, so the Pin publishes when
        you expect it to.
      </>
    ),
  },
  {
    name: "Check the queue and the publishing status",
    text: "The scheduled Pin appears in the queue. You can edit or reschedule it before it publishes, then see a published or failed status after it goes out, with a retry if it fails.",
    body: (
      <>
        The scheduled Pin appears in the queue. You can edit or reschedule it before it publishes. After publishing you
        see a <strong>published</strong> or <strong>failed</strong> status, and you can retry the same Pin if it fails.
      </>
    ),
  },
];

const faqs = [
  {
    q: "Can I schedule Pinterest Pins with Poskoo?",
    a: "Yes. Connect your Pinterest account, load your boards and pick a destination board, add an image and Pin details, then choose a publishing time. Poskoo creates the Pin through the official Pinterest API when it is due.",
  },
  {
    q: "Do I need to give Poskoo my Pinterest password?",
    a: "No. You sign in through Pinterest's official login and approve the requested access. Poskoo never asks for your Pinterest password.",
  },
  {
    q: "What images can I schedule for a Pinterest Pin?",
    a: "Use JPG or PNG images up to 20 MB per file. Schedule one image, or create a carousel with up to five images. Poskoo currently supports image Pins only, not video Pins.",
  },
  {
    q: "Can I edit or reschedule a Pinterest Pin before it publishes?",
    a: "Yes. You can edit or reschedule a scheduled Pin before it publishes. If publishing fails, the queue shows the error and lets you retry after fixing the issue.",
  },
];

const faqJsonLdFor = (list: typeof faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: list.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to schedule Pinterest Pins",
  description: metadata.description,
  image: `${BRAND.canonicalUrl}/landing/hero.webp`,
  totalTime: "PT5M",
  step: steps.map((st, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: st.name,
    text: st.text,
    url: `${BRAND.canonicalUrl}/help/schedule-pinterest-posts#step-${i + 1}`,
  })),
};

const related = [
  { href: "/pinterest-scheduler", label: "Pinterest scheduler" },
  { href: "/instagram-scheduler", label: "Instagram scheduler" },
  { href: "/help/getting-started", label: "Getting started guide" },
];

export default function SchedulePinterestPostsHelpPage() {
  const state = networkAvailability("pinterest");
  const pageFaqs =
    state === "live"
      ? faqs
      : faqs.map((f) =>
          f.q === "Can I schedule Pinterest Pins with Poskoo?"
            ? {
                ...f,
                a: `Not yet. Pinterest publishing in Poskoo is ${availabilityPhrase(
                  state,
                  "Pinterest"
                )}. Once it is switched on, connect Pinterest, pick a board, add an image and Pin details, then choose a publishing time.`,
              }
            : f
        );
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Help center", path: "/help" },
        { name: "Schedule Pinterest Pins", path: "/help/schedule-pinterest-posts" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLdFor(pageFaqs)).replace(/</g, "\\u003c") }}
      />
      <header className="hero">
        <div className={s.heroText}>
          <p className="eyebrow">Guide</p>
            <h1>
              How to schedule Pinterest <em className="s">Pins</em>
            </h1>
          <p className="lede">
            To schedule a Pinterest Pin, connect Pinterest with its official login in {BRAND.name}, pick a destination
            board, add an image, title and link, then choose a date and time. {state === "live" ? (
              <>
                {BRAND.name} creates the Pin through the official Pinterest API at that moment.
              </>
            ) : (
              <>
                Pinterest publishing in {BRAND.name} is {availabilityPhrase(state, "Pinterest")}, so these steps work
                once it is switched on.
              </>
            )} Here is exactly how it works, step by step.
          </p>
        </div>
        <HelpGuideIllustration variant="schedule" className="hero-art" />
      </header>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>What you need</h2>
            <ul>
              <li>
                A Pinterest account connected to {BRAND.name} through Pinterest&apos;s official login with permission to
                read your boards and create Pins.
              </li>
              <li>
                A destination board, plus one JPG or PNG image of up to 20 MB (or up to five images for a carousel).
              </li>
              <li>A Pin title and description, and an optional destination link for the page behind the image.</li>
            </ul>
            <p>
              Prefer the product page? See the{" "}
              <Link className={s.vlink} href="/pinterest-scheduler">
                Pinterest scheduler
              </Link>{" "}
              for boards, image limits and publishing on one calendar.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Step by step</h2>
            {steps.map((st, i) => (
              <div key={st.name} id={`step-${i + 1}`}>
                <h3>
                  Step {i + 1}: {st.name}
                </h3>
                <p>{st.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>What you can schedule on Pinterest</h2>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.th} scope="col">Type</th>
                    <th className={s.th} scope="col">Limit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={s.td}>Image format</td>
                    <td className={s.td}>JPG or PNG</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Image size</td>
                    <td className={s.td}>up to 20 MB per file</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Images per Pin</td>
                    <td className={s.td}>one image, or a carousel of up to five</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Pin types</td>
                    <td className={s.td}>image Pins only, no video Pins yet</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Pin details</td>
                    <td className={s.td}>title, description and optional destination link</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Scheduling</td>
                    <td className={s.td}>date, time and time zone in one queue</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>FAQ</h2>
          </div>
          <div className="faq">
            {pageFaqs.map((f) => (
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
          <div className={s.prose}>
            <h2>Related guides</h2>
            <ul>
              {related.map((r) => (
                <li key={r.href}>
                  <Link className={s.vlink} href={r.href}>
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <p className="small" style={{ textAlign: "center", marginTop: "20px" }}>
        New to {BRAND.name}?{" "}
        <Link className={s.vlink} href="/signup">Create a free account</Link>{" "}
        or email{" "}
        <a className={s.vlink} href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>.
      </p>
    </PublicShell>
  );
}
