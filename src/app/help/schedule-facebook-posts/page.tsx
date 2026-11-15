import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

export const metadata: Metadata = withSocial({
  title: { absolute: "Schedule Facebook Page Posts in Poskoo: Help Guide" },
  description:
    `Step-by-step help for scheduling Facebook Page posts in ${BRAND.name}: connect your Page with Meta login, add text and media, pick a time and publish.`,
  alternates: { canonical: new URL("/help/schedule-facebook-posts", BRAND.url).toString() },
});

const steps = [
  {
    name: "Connect your Facebook Page",
    text: "Connect your Facebook Page in Settings through Meta's official login. You need to be an admin of the Page, and you never share your password with Poskoo.",
    body: (
      <>
        Connect your Facebook Page in{" "}
        <Link className={s.vlink} href="/app/settings">
          Settings
        </Link>{" "}
        through Meta&apos;s official login. You need to be an admin of the Page, and you never share your password with{" "}
        {BRAND.name}. Approve the &quot;Manage Page posts&quot; permission on Meta&apos;s screen so {BRAND.name} can
        publish for you.
      </>
    ),
  },
  {
    name: "Write your post and add media",
    text: "Write the post text, then optionally add one public image link, up to 10 public image links for an album, or one public video link. Photos and video cannot be mixed in one post.",
    body: (
      <>
        Write the post text, then optionally add one public image link, up to 10 public image links for an album, or one
        public video link. Photos and video cannot be mixed in one post.
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
    name: "What happens if a post fails",
    text: "If publishing fails, the post shows a failed status with the error. Fix the connection or content issue, then retry the same post from the queue.",
    body: (
      <>
        If publishing fails, the post shows a <strong>failed</strong> status with the error. Fix the connection or
        content issue, then retry the same post from the queue.
      </>
    ),
  },
];

const faqs = [
  {
    q: "Can I schedule to a personal Facebook profile?",
    a: "No. Poskoo publishes to Facebook Pages only, through Meta's official Page API. Personal profiles and Facebook groups are not supported.",
  },
  {
    q: "Can I schedule to Facebook and Instagram at once?",
    a: "Yes. Add both channels to the same post in the composer and Poskoo publishes to each one at the scheduled time. Facebook needs a Page connected with Facebook login and the Manage Page posts permission.",
  },
  {
    q: "What time zone is used?",
    a: "Times are shown in your browser's time zone. Pick the date and time you want in that zone and Poskoo publishes the post at that moment.",
  },
  {
    q: "Is scheduling Facebook Page posts free?",
    a: "Yes. You can start on the Free plan with no credit card, schedule posts and upgrade to Pro or Agency only when you need more accounts or posts.",
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
  name: "How to schedule Facebook Page posts",
  description: metadata.description,
  totalTime: "PT5M",
  step: steps.map((st, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: st.name,
    text: st.text,
    url: `${BRAND.url}/help/schedule-facebook-posts#step-${i + 1}`,
  })),
};

const related = [
  { href: "/guides/how-to-schedule-facebook-posts", label: "How to schedule Facebook posts in 2026 (full guide)" },
  { href: "/facebook-scheduler", label: "Facebook post scheduler" },
  { href: "/tools/facebook-character-counter", label: "Facebook character counter" },
  { href: "/help/getting-started", label: "Getting started guide" },
  { href: "/help", label: "All help guides" },
];

export default function ScheduleFacebookPostsHelpPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Help center", path: "/help" },
        { name: "Schedule Facebook Posts", path: "/help/schedule-facebook-posts" },
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
              How to schedule Facebook Page <em className="s">posts</em>
            </h1>
          <p className="lede">
            Connect your Facebook Page through Meta&apos;s official login in {BRAND.name}, write the post, add an image or
            video link, pick a date and time, and {BRAND.name} publishes it to the Page at that time. Here is exactly how
            it works, step by step.
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
                A Facebook Page you are an admin of, connected to {BRAND.name} through Meta&apos;s official login with
                the &quot;Manage Page posts&quot; permission.
              </li>
              <li>
                Your post text, and optionally one public image link, up to 10 public image links, or one public video
                link.
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
            <h2>What you can post to a Facebook Page</h2>
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
                    <td className={s.td}>a caption on its own</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Photo</td>
                    <td className={s.td}>one public image link</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Album</td>
                    <td className={s.td}>2 to 10 public image links</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Video</td>
                    <td className={s.td}>one public video link</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Photos + video together</td>
                    <td className={s.td}>not supported</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Personal profile or group</td>
                    <td className={s.td}>not supported</td>
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
