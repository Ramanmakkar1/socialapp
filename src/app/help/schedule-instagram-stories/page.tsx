import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { breadcrumbJsonLd, ldJson } from "@/lib/tool-schema";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

export const metadata: Metadata = withSocial({
  title: { absolute: `Schedule Instagram Stories: Complete Guide | ${BRAND.name}` },
  description:
    `Schedule Instagram Stories: pick the Story format, paste one public image or video link, choose a time and ${BRAND.name} publishes it for you.`,
  alternates: { canonical: "/help/schedule-instagram-stories" },
});

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", url: `${BRAND.url}/` },
  { name: "Help", url: `${BRAND.url}/help` },
  { name: "Schedule Instagram Stories", url: `${BRAND.url}/help/schedule-instagram-stories` },
]);

const steps = [
  {
    name: "Open the Calendar and click New post",
    text: "Open the Calendar at /app/calendar and click New post. The composer opens with Instagram selected by default.",
    body: (
      <>
        Open the{" "}
        <Link className={s.vlink} href="/app/calendar#new">
          Calendar
        </Link>{" "}
        and click <strong>New post</strong>. The composer opens with Instagram selected by default.
      </>
    ),
  },
  {
    name: "Turn on Instagram",
    text: "Make sure Instagram is switched on in the composer. It is selected by default, so switch it on if you turned it off.",
    body: (
      <>
        Make sure <strong>Instagram</strong> is switched on in the composer. It is selected by default, so switch it
        on if you turned it off.
      </>
    ),
  },
  {
    name: "Choose the Story format",
    text: "Under Instagram format, choose Story, the option next to Post.",
    body: (
      <>
        Keep Instagram selected and, under <strong>Instagram format</strong>, choose <strong>Story</strong> — the
        option next to <strong>Post</strong>.
      </>
    ),
  },
  {
    name: "Paste one public image or video link",
    text: "Paste exactly one public https link to a .jpg, .png or .mp4 file. A Story takes one image or video; if you add more, the composer shows: A Story takes one image or video.",
    body: (
      <>
        Paste exactly one public <code>https</code> link to a .jpg, .png or .mp4 file. A Story takes one image or
        video — if you add more, the composer shows &quot;A Story takes one image or video.&quot;
      </>
    ),
  },
  {
    name: "Pick a date and time in your time zone",
    text: "Choose the date and time in your own time zone. The composer shows your time zone under the field.",
    body: (
      <>
        Choose the date and time in your own time zone — the composer shows your time zone under the field, so the
        Story publishes when you expect it to.
      </>
    ),
  },
  {
    name: "Press Schedule and watch the queue",
    text: "Press Schedule. The Calendar shows published when the Story goes live, or failed if publishing hits a problem. Failed posts can be retried.",
    body: (
      <>
        Press <strong>Schedule</strong>, then watch the post&apos;s status in the Calendar queue. It changes to{" "}
        <strong>published</strong> when the Story goes live, or <strong>failed</strong> if publishing hits a problem
        — failed posts can be retried.
      </>
    ),
  },
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to schedule Instagram Stories",
  description: metadata.description,
  image: `${BRAND.canonicalUrl}/landing/hero.webp`,
  url: `${BRAND.canonicalUrl}/help/schedule-instagram-stories`,
  step: steps.map((st, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: st.name,
    text: st.text,
  })),
};

const faqs = [
  {
    q: "Can I schedule more than one photo in a Story?",
    a: "No. A Story post takes exactly one image or video — if you add more, the composer shows “A Story takes one image or video.” To publish several Stories, schedule each one as its own post at its own time.",
  },
  {
    q: "Does the caption show on a Story?",
    a: "No. Instagram Stories show the image or video only; the caption is not shown. If you need text on the Story, put it in the image or video itself before you schedule it.",
  },
  {
    q: "Can I schedule Story videos?",
    a: "Yes. Paste a public https link to a .mp4 file. Poskoo publishes it as a Story with Meta's official API and waits until Instagram finishes processing the video before it goes live.",
  },
  {
    q: "Is Story scheduling free?",
    a: "Yes. The Free plan includes 10 scheduled posts a month, and a Story counts as one post, like a feed post. No credit card is needed to start.",
  },
  {
    q: "Can I add link stickers, polls, music or mentions stickers to a scheduled Story?",
    a: "No. The official Instagram API publishes the image or video only, so interactive stickers can't be added through the scheduler. If you need them, create that Story in the Instagram app instead.",
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

const related = [
  { href: "/help/schedule-instagram-reels", label: "Schedule Instagram Reels" },
  { href: "/help/schedule-instagram-carousel", label: "Schedule Instagram carousels" },
  { href: "/help/instagram-story-reply-auto-dm", label: "Auto-DM Instagram Story replies" },
  { href: "/instagram-scheduler", label: "Instagram scheduler" },
  { href: "/tools/instagram-image-size", label: "Instagram image size guide" },
  { href: "/help/getting-started", label: "Getting started" },
  { href: "/guides/how-to-schedule-instagram-posts", label: "How to schedule Instagram posts in 2026 (full guide)" },
];

export default function ScheduleInstagramStoriesHelpPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Help center", path: "/help" },
        { name: "Schedule Instagram Stories", path: "/help/schedule-instagram-stories" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(crumbsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd) }}
      />
      <header className="hero">
        <div className={s.heroText}>
          <p className="eyebrow">Guide</p>
          <h1>
              How to schedule Instagram <em className="s">Stories</em>
            </h1>
          <p className="lede">
            Yes — you can schedule an Instagram Story by pasting one public image or video link, choosing the Story
            format, and picking a time. Connect your account, then open the Calendar to create your first Story.
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
                An Instagram professional account (Business or Creator) connected to {BRAND.name} through Meta&apos;s
                official login. Follow the{" "}
                <Link className={s.vlink} href="/help/getting-started">
                  getting started guide
                </Link>{" "}
                or connect it in{" "}
                <Link className={s.vlink} href="/app/settings">
                  Settings
                </Link>{" "}
                if you haven&apos;t done this yet.
              </li>
              <li>
                One public <code>https</code> link to a .jpg or .png image, or to a .mp4 video. The link must open the
                file directly, with no login or download page in the way.
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
              <div key={st.name}>
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
            <h2>Story sizes</h2>
            <p>
              Use 9:16 vertical, 1080 × 1920 px recommended. Keep text and key details out of the top and bottom edges
              where the Instagram interface sits — check your layout with the{" "}
              <Link className={s.vlink} href="/tools/instagram-safe-zone-checker">
                Story safe zone checker
              </Link>{" "}
              and the{" "}
              <Link className={s.vlink} href="/tools/instagram-image-size">
                Instagram image size guide
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Why your caption doesn&apos;t show on a Story</h2>
            <p>
              Instagram Stories show the image or video only — the caption is not shown. The composer says this when
              you choose Story, so you don&apos;t need to write one for the Story itself. There is also no first comment
              field for Stories; that option only applies to feed posts. If the Story needs words, put the text in the
              image or video itself before you paste the link.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>If a Story fails</h2>
            <p>
              If the post shows as <strong>failed</strong> in the Calendar, read the error message on the post first,
              then check these common causes before you retry:
            </p>
            <ul>
              <li>
                <strong>The link is not public or not https.</strong> The link must open the image or .mp4 file
                directly, over <code>https</code>, with no login or download page.
              </li>
              <li>
                <strong>More than one media link.</strong> A Story takes one image or video. Remove the extra links
                and retry.
              </li>
              <li>
                <strong>Instagram is still processing the video.</strong> {BRAND.name} waits until Instagram finishes
                processing, but if it takes too long, wait a few minutes and press <strong>Retry</strong>.
              </li>
              <li>
                <strong>Expired Instagram connection.</strong> If the error says your access expired, reconnect
                Instagram in{" "}
                <Link className={s.vlink} href="/app/settings">
                  Settings
                </Link>
                , then retry the post.
              </li>
            </ul>
            <p>
              For more checks, read{" "}
              <Link className={s.vlink} href="/help/schedule-instagram-reels">
                what to do when a scheduled post did not publish
              </Link>
              . Still stuck?{" "}
              <Link className={s.vlink} href="/contact">
                Contact support
              </Link>{" "}
              with the error message and we will help.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Turn Story replies into leads</h2>
            <p>
              A Story can ask people to reply with a keyword, and {BRAND.name} can send them a DM with your link
              automatically. Set it up in the{" "}
              <Link className={s.vlink} href="/help/instagram-story-reply-auto-dm">
                Story reply auto-DM guide
              </Link>
              , then use the same calendar to plan the Story that starts the conversation.
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
