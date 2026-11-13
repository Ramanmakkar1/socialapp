import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { breadcrumbJsonLd, ldJson } from "@/lib/tool-schema";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

const PATH = "/help/schedule-x-posts";
const title = "How to Schedule X (Twitter) Posts: Step-by-Step | Poskoo";
const description =
  "Schedule X (Twitter) posts in Poskoo: connect your X account, write the post, add images or one video, pick a time and Poskoo publishes it for you.";

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: new URL(PATH, BRAND.url).toString() },
  openGraph: { title, description, url: new URL(PATH, BRAND.url).toString() },
});

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", url: `${BRAND.url}/` },
  { name: "Help", url: `${BRAND.url}/help` },
  { name: "Schedule X Posts", url: `${BRAND.url}${PATH}` },
]);

const steps = [
  {
    name: "Connect your X account with the official sign-in",
    text: "Connect X in Settings through X's official OAuth screen and approve access. You never share your X password with Poskoo.",
    body: (
      <>
        Connect X in{" "}
        <Link className={s.vlink} href="/app/settings">
          Settings
        </Link>{" "}
        through X&apos;s official <strong>OAuth</strong> screen and approve access. You approve access on X&apos;s own
        screen, and you never share your X password with {BRAND.name}.
      </>
    ),
  },
  {
    name: "Write your post",
    text: "Write the text for your X post. Standard X accounts have a 280-character limit.",
    body: (
      <>
        Write the text for your X post. Standard X accounts have a <strong>280-character limit</strong>.
      </>
    ),
  },
  {
    name: "Add images or one video",
    text: "Add up to 4 images, each up to 5 MB, or one video up to 512 MB. Poskoo uploads media through X's official v2 chunked upload before publishing.",
    body: (
      <>
        Add up to <strong>4 images</strong>, each up to 5 MB, or <strong>one video</strong> up to 512 MB. {BRAND.name}{" "}
        uploads the media through X&apos;s official v2 chunked upload and waits for processing before publishing.
      </>
    ),
  },
  {
    name: "Pick a date and time in your time zone",
    text: "Choose when the post should go out. Times are shown in your browser's time zone, so the post publishes when you expect it to.",
    body: (
      <>
        Choose when the post should go out. Times are shown in your browser&apos;s time zone, so the post publishes when
        you expect it to.
      </>
    ),
  },
  {
    name: "Check it in the calendar and queue",
    text: "Review the scheduled post in the week or month calendar and in the publishing queue before it goes live.",
    body: (
      <>
        Review the scheduled post in the <strong>week or month calendar</strong> and in the publishing queue before it
        goes live.
      </>
    ),
  },
  {
    name: "Edit, reschedule or delete it",
    text: "You can edit the post, move it to a new time or delete it from the queue before it publishes.",
    body: (
      <>
        You can <strong>edit, reschedule or delete</strong> the post from the queue before it publishes.
      </>
    ),
  },
  {
    name: "Check whether it published or failed",
    text: "After the scheduled time, the post shows a published or failed status. If X rate-limits it, the status says so and you can retry it later.",
    body: (
      <>
        After the scheduled time, the post shows a <strong>published</strong> or <strong>failed</strong> status. If X
        rate-limits it, the status says so and you can retry it later.
      </>
    ),
  },
];

const faqs = [
  {
    q: "Can you schedule X posts for free?",
    a: "Yes. Poskoo includes a free plan, and you can create a free account without a credit card. Compare the available plans on the pricing page.",
  },
  {
    q: "What is the character limit for an X post?",
    a: "Standard X accounts have a 280-character limit. You can also add up to 4 images or one video to the scheduled post.",
  },
  {
    q: "How many images or videos can one scheduled X post have?",
    a: "A post can have text plus up to 4 images, or one video. Images can be up to 5 MB each and video up to 512 MB.",
  },
  {
    q: "Why did my scheduled X post fail?",
    a: "The queue shows a published or failed status for every scheduled post. If X rate-limits the post, the status says so, and you can retry it later.",
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

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to schedule X (Twitter) posts",
  description: metadata.description,
  totalTime: "PT5M",
  step: steps.map((st, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: st.name,
    text: st.text,
    url: `${BRAND.url}${PATH}#step-${i + 1}`,
  })),
};

const related = [
  { href: "/x-scheduler", label: "X scheduler features and media limits" },
  { href: "/tools/x-character-counter", label: "X character counter (280-character check)" },
  { href: "/tools/best-time-to-post-on-x", label: "Best time to post on X" },
  { href: "/help/getting-started", label: "Getting started with Poskoo" },
  { href: "/pricing", label: "Poskoo pricing and free plan" },
];

export default function ScheduleXPostsHelpPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Help center", path: "/help" },
        { name: "Schedule X Posts", path: PATH },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(crumbsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="hero">
        <div className={s.heroText}>
          <p className="eyebrow">Guide</p>
            <h1>
              How to schedule X (Twitter) <em className="s">posts</em>
            </h1>
          <p className="lede">
            To schedule an X post, connect your X account through its official OAuth screen in {BRAND.name}, write the
            post, add images or one video, then choose a date and time. {BRAND.name} publishes it through X&apos;s
            official API at that moment. Here is exactly how it works, step by step.
          </p>
        </div>
        <HelpGuideIllustration variant="schedule" className="hero-art" />
      </header>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>What you need</h2>
            <ul>
              <li>An X account connected to {BRAND.name} through X&apos;s official OAuth sign-in.</li>
              <li>Your post text, up to 280 characters for standard X accounts.</li>
              <li>Optionally, up to 4 images of 5 MB each or one video of up to 512 MB.</li>
            </ul>
            <p>
              Prefer the product page? See the{" "}
              <Link className={s.vlink} href="/x-scheduler">
                X scheduler features and media limits
              </Link>{" "}
              for publishing through the official X API on one calendar.
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
            <h2>What you can schedule on X</h2>
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
                    <td className={s.td}>Post text</td>
                    <td className={s.td}>up to 280 characters for standard accounts</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Images</td>
                    <td className={s.td}>up to 4 images, each up to 5 MB</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Video</td>
                    <td className={s.td}>one video up to 512 MB instead of images</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Media upload</td>
                    <td className={s.td}>official X v2 chunked upload</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Scheduling</td>
                    <td className={s.td}>week and month calendar with one publishing queue</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Publishing status</td>
                    <td className={s.td}>published or failed, with retries</td>
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
