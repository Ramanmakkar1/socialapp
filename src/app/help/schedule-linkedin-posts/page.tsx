import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { guideBySlug, guidePath } from "@/content/guides/registry";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

export const metadata: Metadata = withSocial({
  title: { absolute: "Schedule LinkedIn Posts in Poskoo: Step-by-Step Help" },
  description:
    `Step-by-step help for scheduling LinkedIn posts in ${BRAND.name}: connect your profile, write the post, add images, pick a time and ${BRAND.name} publishes it.`,
  alternates: { canonical: new URL("/help/schedule-linkedin-posts", BRAND.canonicalUrl).toString() },
});

const steps = [
  {
    name: "Connect your LinkedIn profile",
    text: "Connect your LinkedIn profile in Settings through LinkedIn's official Sign In with LinkedIn and Share on LinkedIn permissions. You never share your password, and posts go to your personal profile.",
    body: (
      <>
        Connect your LinkedIn profile in{" "}
        <Link className={s.vlink} href="/app/settings">
          Settings
        </Link>{" "}
        through LinkedIn&apos;s official <strong>Sign In with LinkedIn</strong> and{" "}
        <strong>Share on LinkedIn</strong> permissions. You never share your password with {BRAND.name}, and posts go
        to your personal profile.
      </>
    ),
  },
  {
    name: "Write your post and add media",
    text: "Write the post text, then add media. LinkedIn takes JPEG or PNG images up to 10 MB each, or one MP4/MOV video between 3 seconds and 30 minutes, up to 200 MB. Poskoo publishes text and images today.",
    body: (
      <>
        Write the post text, then add media. LinkedIn takes JPEG or PNG images up to 10 MB each, or one MP4/MOV video
        between 3 seconds and 30 minutes, up to 200 MB. {BRAND.name} publishes text and images today.
      </>
    ),
  },
  {
    name: "Pick a date, time and time zone",
    text: "Choose the date and time for the post. Times are shown in your browser's time zone, so the post goes out when you expect it to.",
    body: (
      <>
        Choose the date and time for the post. Times are shown in your browser&apos;s time zone, so the post goes out
        when you expect it to.
      </>
    ),
  },
  {
    name: "Check the queue and calendar",
    text: "Your scheduled post appears in the queue and on the calendar. You can edit, reschedule or delete it before it goes out.",
    body: (
      <>
        Your scheduled post appears in the queue and on the calendar. You can edit, reschedule or delete it before it
        goes out.
      </>
    ),
  },
  {
    name: "What happens after publishing",
    text: "When the post goes out it shows a success or failure status. If publishing fails, the error is shown and you can fix the issue and retry the same post from the queue.",
    body: (
      <>
        When the post goes out it shows a <strong>success</strong> or <strong>failure</strong> status. If publishing
        fails, the error is shown and you can fix the issue and retry the same post from the queue.
      </>
    ),
  },
];

const faqs = [
  {
    q: "Can I schedule posts to a LinkedIn company page?",
    a: "Not yet. Company pages need LinkedIn's Community Management API approval, which is a separate review. Today Poskoo publishes scheduled posts to your personal LinkedIn profile.",
  },
  {
    q: "What image and video sizes does LinkedIn accept?",
    a: "LinkedIn accepts JPEG or PNG images up to 10 MB each, and one MP4 or MOV video between 3 seconds and 30 minutes, up to 200 MB. Poskoo publishes text and images to LinkedIn today.",
  },
  {
    q: "Do I need to share my LinkedIn password?",
    a: "No. You connect with LinkedIn's official sign-in, so you never share your password with Poskoo. You approve the Sign In with LinkedIn and Share on LinkedIn permissions on LinkedIn's own screen.",
  },
  {
    q: "What happens if a post fails?",
    a: "The post shows a failed status with the error. Fix the connection or content issue, then retry the same post from the queue. Nothing is lost, so you can reschedule it instead of rewriting it.",
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
  name: "How to schedule LinkedIn posts",
  description: metadata.description,
  image: `${BRAND.canonicalUrl}/landing/hero.webp`,
  totalTime: "PT5M",
  step: steps.map((st, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: st.name,
    text: st.text,
    url: `${BRAND.canonicalUrl}/help/schedule-linkedin-posts#step-${i + 1}`,
  })),
};

const related = [
  ...(guideBySlug("how-to-schedule-linkedin-posts")
    ? [{ href: guidePath("how-to-schedule-linkedin-posts"), label: "How to schedule LinkedIn posts in 2026 (full guide)" }]
    : []),
  { href: "/linkedin-scheduler", label: "LinkedIn post scheduler" },
  { href: "/tools/linkedin-character-counter", label: "LinkedIn character counter" },
  { href: "/help/schedule-facebook-posts", label: "Schedule Facebook Page posts" },
  { href: "/help/getting-started", label: "Getting started guide" },
];

export default function ScheduleLinkedInPostsHelpPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Help center", path: "/help" },
        { name: "Schedule LinkedIn Posts", path: "/help/schedule-linkedin-posts" },
      ]}
    >
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
              How to schedule LinkedIn <em className="s">posts</em>
            </h1>
          <p className="lede">
            To schedule a LinkedIn post, connect your profile in {BRAND.name} with LinkedIn&apos;s official sign-in,
            write the post, add an image, and pick a date and time. {BRAND.name} then publishes it to your personal
            profile at that moment. Here is exactly how it works, step by step.
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
                A LinkedIn profile connected to {BRAND.name} through LinkedIn&apos;s official sign-in with the
                &quot;Sign In with LinkedIn&quot; and &quot;Share on LinkedIn&quot; permissions.
              </li>
              <li>
                Your post text, and optionally JPEG or PNG images up to 10 MB each. {BRAND.name} publishes text and
                images to LinkedIn today.
              </li>
            </ul>
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
            <h2>What you can post to LinkedIn</h2>
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
                    <td className={s.td}>Text</td>
                    <td className={s.td}>a post on its own</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Image</td>
                    <td className={s.td}>JPEG or PNG, up to 10 MB each</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Video</td>
                    <td className={s.td}>MP4 or MOV, 3 seconds to 30 minutes, up to 200 MB (LinkedIn&apos;s limit)</td>
                  </tr>
                  <tr>
                    <td className={s.td}>LinkedIn company page</td>
                    <td className={s.td}>not supported yet</td>
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
