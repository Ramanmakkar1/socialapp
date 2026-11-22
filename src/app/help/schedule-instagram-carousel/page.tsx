import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { publisherRef } from "@/lib/tool-schema";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

export const metadata: Metadata = withSocial({
  title: { absolute: "How to Schedule Instagram Carousel Posts (Free) | Poskoo" },
  description:
    "Schedule Instagram carousel posts: paste 2-10 image links, write one caption, pick a time and Poskoo publishes it. Specs, tips and fixes for failed posts.",
  alternates: { canonical: `${BRAND.canonicalUrl}/help/schedule-instagram-carousel` },
});

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to schedule an Instagram carousel post",
  description: metadata.description,
  image: `${BRAND.canonicalUrl}/landing/hero.webp`,
  dateModified: "2026-11-07",
  author: { "@type": "Organization", name: BRAND.company },
  publisher: publisherRef(),
  mainEntityOfPage: `${BRAND.canonicalUrl}/help/schedule-instagram-carousel`,
};

const steps = [
  {
    name: "Connect a professional Instagram account",
    body: (
      <>
        Carousels publish to an Instagram professional account (Business or Creator). Connect it in{" "}
        <Link className={s.vlink} href="/app/settings">
          Settings
        </Link>{" "}
        through Meta&apos;s official login, or follow the{" "}
        <Link className={s.vlink} href="/help/getting-started">
          getting started guide
        </Link>{" "}
        if you haven&apos;t done this yet.
      </>
    ),
  },
  {
    name: "Open the Calendar and start a new post",
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
    name: "Paste 2 to 10 public image links in slide order",
    body: (
      <>
        Paste a public <code>https</code> link to a .jpg or .png image in each media field — one link per slide, in the
        order you want them to appear. Two or more image links make a carousel post.
      </>
    ),
  },
  {
    name: "Write one caption",
    body: (
      <>
        Write a single caption. It shows on the whole carousel, not on each slide, so use it for the story, the call to
        action and any comment keyword.
      </>
    ),
  },
  {
    name: "Pick a date and time",
    body: (
      <>
        Choose the date and time in your own time zone — the composer shows your time zone under the field, so the post
        publishes when you expect it to.
      </>
    ),
  },
  {
    name: "Schedule and watch the queue",
    body: (
      <>
        Press <strong>Schedule</strong>, then watch the post&apos;s status in the Calendar queue. It changes to{" "}
        <strong>published</strong> when the carousel goes live, or <strong>failed</strong> if publishing hits a problem
        — failed posts can be retried.
      </>
    ),
  },
];

const faqs = [
  {
    q: "How many images can I put in an Instagram carousel?",
    a: "From 2 to 10 image links, pasted one per media field. Instagram posts them as a single carousel in the order you add them.",
  },
  {
    q: "Can I schedule a carousel with video slides?",
    a: "No. Carousels support image links only in Poskoo right now — video slides in a carousel are not supported yet. To post a video, schedule a single .mp4 as a Reel instead.",
  },
  {
    q: "Does the caption apply to every slide?",
    a: "Yes. You write one caption and it appears on the whole carousel, not per slide. Put your comment keyword or call to action in that caption.",
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
  { href: "/help/schedule-instagram-posts", label: "Schedule Instagram posts" },
  { href: "/help/schedule-instagram-reels", label: "Schedule Instagram Reels" },
  { href: "/help/schedule-instagram-stories", label: "Schedule Instagram Stories" },
  { href: "/instagram-scheduler", label: "Instagram scheduler" },
  { href: "/tools/instagram-image-size", label: "Instagram image size guide" },
  { href: "/help/getting-started", label: "Getting started" },
  { href: "/guides/how-to-schedule-instagram-posts", label: "How to schedule Instagram posts in 2026 (full guide)" },
];

export default function ScheduleInstagramCarouselHelpPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Help center", path: "/help" },
        { name: "Schedule Instagram carousels", path: "/help/schedule-instagram-carousel" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="hero">
        <div className={s.heroText}>
          <p className="eyebrow">Guide</p>
          <h1>
              How to schedule an Instagram <em className="s">carousel post</em>
            </h1>
          <p className="lede">
            Yes — you can schedule an Instagram carousel by pasting 2 to 10 public image links, writing one caption, and
            picking a time. Connect your Instagram account, then open the Calendar to paste the links and schedule it.
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
                official login.
              </li>
              <li>
                Public <code>https</code> links to 2–10 image files (.jpg or .png) — from your website, cloud storage
                or any public host.
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
            <h2>Carousel image specs</h2>
            <p>
              Carousels take image links only — video slides in a carousel are not supported yet. Use the same aspect
              ratio on every slide so the carousel does not jump as people swipe, for example 1080 × 1350 px (4:5) or
              1080 × 1080 px (1:1).
            </p>
            <p>
              Check your export sizes with the{" "}
              <Link className={s.vlink} href="/tools/instagram-image-size">
                Instagram image size guide
              </Link>{" "}
              and plan the slide order with the{" "}
              <Link className={s.vlink} href="/tools/instagram-carousel-maker">
                Instagram carousel maker
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Why a carousel failed and how to fix it</h2>
            <p>
              If the post shows as <strong>failed</strong> in the Calendar, read the error message on the post first,
              then check these common causes before you retry:
            </p>
            <ul>
              <li>
                <strong>An image link is not public or not https.</strong> Each link must open the image file directly,
                with no login or download page, over <code>https</code>.
              </li>
              <li>
                <strong>Fewer than 2 images.</strong> A carousel needs at least two image links; one image is a single
                feed post.
              </li>
              <li>
                <strong>One slide fails.</strong> If you see a <strong>Carousel slide failed</strong> error, one of the
                image links is broken or blocked — replace that slide&apos;s link and retry.
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
