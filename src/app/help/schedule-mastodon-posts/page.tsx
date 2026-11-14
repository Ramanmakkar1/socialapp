import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

export const metadata: Metadata = withSocial({
  title: { absolute: "How to Schedule Mastodon Posts (Step by Step) | Poskoo" },
  description:
    "Schedule Mastodon posts on any server: connect with OAuth, write to your server's limit, add images or video, pick a time and track the publishing status.",
  alternates: { canonical: new URL("/help/schedule-mastodon-posts", BRAND.url).toString() },
});

const steps = [
  {
    name: "Connect Mastodon in Channels",
    text: "In Poskoo Settings, open Channels, choose Connect and select Mastodon.",
    body: (
      <>
        In {BRAND.name}{" "}
        <Link className={s.vlink} href="/app/settings">
          Settings
        </Link>
        , open <strong>Channels</strong>, choose <strong>Connect</strong> and select <strong>Mastodon</strong>.
      </>
    ),
  },
  {
    name: "Enter only your Mastodon server",
    text: "Type only the server where your account lives: the part after the second @ in your handle, for example mastodon.social.",
    body: (
      <>
        Type only the server where your account lives: the part after the <strong>second @</strong> in your handle. For
        example, if your handle is @you@<strong>mastodon.social</strong>, enter <strong>mastodon.social</strong>.
      </>
    ),
  },
  {
    name: "Approve Poskoo on your server",
    text: "Approve Poskoo on your Mastodon server. After the secure OAuth connection, you return to Poskoo with your account connected.",
    body: (
      <>
        Approve {BRAND.name} on your Mastodon server. After the secure <strong>OAuth</strong> connection, you come back
        to {BRAND.name} with your account connected.
      </>
    ),
  },
  {
    name: "Write your post",
    text: "Open the calendar composer, select Mastodon and write your post. The default limit is 500 characters; some servers allow more, and Poskoo reads your server's limit.",
    body: (
      <>
        Open the{" "}
        <Link className={s.vlink} href="/app/calendar">
          calendar composer
        </Link>
        , select Mastodon and write your post. The default limit is <strong>500 characters</strong>; some servers allow
        more, and {BRAND.name} reads your server&apos;s limit.
      </>
    ),
  },
  {
    name: "Add media and pick a time",
    text: "Add up to 4 images of 16 MB each or one MP4 or MOV video up to 99 MB, then choose the date and time for your post.",
    body: (
      <>
        Add up to <strong>4 images</strong>, each up to <strong>16 MB</strong>, or one <strong>MP4 or MOV video</strong>{" "}
        up to <strong>99 MB</strong>. Then pick the date and time. Times are shown in your browser&apos;s time zone.
      </>
    ),
  },
  {
    name: "Check the public post in the queue",
    text: "Poskoo publishes the post as public at the scheduled time. Find it in the queue to see its published or failed status.",
    body: (
      <>
        {BRAND.name} publishes the post as <strong>public</strong> at the scheduled time. Find it in the{" "}
        <strong>queue</strong> to see its <strong>published</strong> or <strong>failed</strong> status. You can edit or
        reschedule it before publishing.
      </>
    ),
  },
];

const faqs = [
  {
    q: "How do I connect a Mastodon account to Poskoo?",
    a: "Open Settings → Channels in Poskoo, choose Connect → Mastodon, enter your server and approve Poskoo on that server. You then return to Poskoo with the account connected.",
  },
  {
    q: "What should I enter as my Mastodon server?",
    a: "Enter only the part after the second @ in your handle. For example, the server for @you@mastodon.social is mastodon.social.",
  },
  {
    q: "What are the Mastodon text and media limits?",
    a: "The default text limit is 500 characters, but Poskoo reads your server's limit if it allows more. Add up to 4 images of 16 MB each or one MP4 or MOV video up to 99 MB.",
  },
  {
    q: "Are scheduled Mastodon posts public?",
    a: "Yes. Poskoo publishes scheduled Mastodon posts as public. You can see each post's published or failed status in the queue.",
  },
  {
    q: "Why can't Poskoo connect to my Mastodon server?",
    a: "Check that you entered only the server address, such as mastodon.social. Poskoo reports whether the address is not valid or the server cannot be reached, so you can correct it and try again.",
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
  name: "How to schedule Mastodon posts",
  description: metadata.description,
  totalTime: "PT5M",
  step: steps.map((st, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: st.name,
    text: st.text,
    url: `${BRAND.url}/help/schedule-mastodon-posts#step-${i + 1}`,
  })),
};

const related = [
  { href: "/mastodon-scheduler", label: "Mastodon scheduler" },
  { href: "/tools/mastodon-character-counter", label: "Mastodon character counter (500 limit)" },
  { href: "/help/schedule-threads-posts", label: "Schedule Threads posts" },
  { href: "/help/getting-started", label: "Getting started guide" },
];

export default function ScheduleMastodonPostsHelpPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Help center", path: "/help" },
        { name: "Schedule Mastodon Posts", path: "/help/schedule-mastodon-posts" },
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
              How to schedule Mastodon <em className="s">posts</em>
            </h1>
          <p className="lede">
            To schedule a Mastodon post, connect your server in {BRAND.name} Settings → Channels, write your post, add
            images or a video if needed and pick a time. {BRAND.name} publishes it as public and shows its status in the
            queue.
          </p>
        </div>
        <HelpGuideIllustration variant="schedule" className="hero-art" />
      </header>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>What you need</h2>
            <ul>
              <li>A Mastodon account and the server name from the part after the second @ in your handle.</li>
              <li>Your Mastodon account connected through OAuth in {BRAND.name} Settings → Channels.</li>
              <li>Post text within your server&apos;s character limit, with optional images or one video.</li>
            </ul>
            <p>
              Prefer the product page? See the{" "}
              <Link className={s.vlink} href="/mastodon-scheduler">
                Mastodon scheduler
              </Link>{" "}
              for server connections, media limits and publishing on one calendar.
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
            <h2>What you can schedule on Mastodon</h2>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.th} scope="col">Type</th>
                    <th className={s.th} scope="col">Limit or behaviour</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={s.td}>Post text</td>
                    <td className={s.td}>500 characters by default, or your server&apos;s limit when it allows more</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Images</td>
                    <td className={s.td}>up to 4 images, each up to 16 MB</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Video</td>
                    <td className={s.td}>one MP4 or MOV video up to 99 MB</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Visibility</td>
                    <td className={s.td}>public</td>
                  </tr>
                  <tr>
                    <td className={s.td}>Scheduling</td>
                    <td className={s.td}>date, time and time zone in one queue with published or failed status</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Troubleshooting: why won&apos;t my Mastodon server connect?</h2>
            <h3>The server address is not valid</h3>
            <p>
              If {BRAND.name} shows <strong>&quot;That doesn&apos;t look like a Mastodon server address. Type just the
              server, e.g. mastodon.social.&quot;</strong>, remove your username and any extra text. Enter only the part
              after the second @ in your handle.
            </p>
            <h3>The server can&apos;t be reached</h3>
            <p>
              If {BRAND.name} shows <strong>&quot;We couldn&apos;t reach that Mastodon server, or it isn&apos;t a
              Mastodon server. Check the address and try again.&quot;</strong>, check the spelling and confirm that the
              server is online, then try connecting again.
            </p>
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
