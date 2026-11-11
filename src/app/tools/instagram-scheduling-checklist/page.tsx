import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import SchedulingChecklist from "./SchedulingChecklist";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/tools/instagram-scheduling-checklist";
const description =
  "Preflight checklist before you schedule: caption limits, media format, channel, time and timezone, connected account, publishing status. Free.";
export const metadata: Metadata = {
  title: { absolute: "Instagram Scheduling Checklist: Preflight Before You Post" },
  description,
  alternates: { canonical: PATH },
};

const tips = [
  <>
    Tick the six preflight items above, then open the{" "}
    <Link className={s.vlink} href="/app/calendar#new">
      Calendar
    </Link>{" "}
    and schedule — the composer checks the same things while you fill it in.
  </>,
  <>
    Format decides the post type: one image is a feed post, one .mp4 is a Reel, 2–10 images make a carousel and one
    image or video makes a Story. Read the{" "}
    <Link className={s.vlink} href="/help/schedule-instagram-reels">
      Reels guide
    </Link>
    ,{" "}
    <Link className={s.vlink} href="/help/schedule-instagram-carousel">
      carousel guide
    </Link>{" "}
    or{" "}
    <Link className={s.vlink} href="/help/schedule-instagram-stories">
      Stories guide
    </Link>{" "}
    for the exact steps.
  </>,
  <>
    After the scheduled time, the post’s status in the Calendar changes to <strong>published</strong> or{" "}
    <strong>failed</strong> — failed posts show the error and can be retried.
  </>,
];

const faqs = [
  {
    q: "Is this scheduling checklist free?",
    a: "Yes. The checklist runs entirely in your browser — tick the items, copy the list, and go schedule your post. Nothing is uploaded and no account is needed.",
  },
  {
    q: "What caption limit should I check before scheduling?",
    a: "Instagram allows 2,200 characters and 30 hashtags per caption, Threads 500 characters, and a Facebook Page 63,206. The caption counter tool checks your text against the Instagram limit as you type.",
  },
  {
    q: "Which media formats can I schedule on Instagram?",
    a: "Public https links to .jpg or .png images and .mp4 videos. One image posts as a feed post, one .mp4 as a Reel, 2–10 images as a carousel, and one image or video as a Story. Carousels are images only.",
  },
  {
    q: "How does the scheduled time and timezone work?",
    a: "You pick the date and time in your own time zone — the composer shows your time zone under the field — and the post publishes at that local time, at least one minute in the future.",
  },
  {
    q: "How do I know if my scheduled post actually published?",
    a: "Open the Calendar after the scheduled time: the post shows as published when it went live, or failed with the error message and a Retry option if publishing hit a problem.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({
  name: "Instagram Scheduling Checklist",
  description,
  url: `${BRAND.url}${PATH}`,
});

export default function InstagramSchedulingChecklistPage() {
  return (
    <PublicShell
      breadcrumbs={[{ name: "Free Instagram tools", path: "/tools" }, { name: "Scheduling checklist", path: PATH }]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free / runs in your browser / nothing is uploaded</span>
        <h1>
          Instagram scheduling <em className="s mark">checklist</em>
        </h1>
        <p className="lede">
          Tick off the preflight before you schedule: caption limits, media format, channel selection, the scheduled time
          in your timezone, the connected account and the publishing status — then queue the post in {BRAND.name}.
        </p>
        <div className="hero-art"><AnimArt name="card-schedule" label="A creator pins post cards onto a weekly calendar next to a smiling alarm clock" /></div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <SchedulingChecklist />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-caption-counter">
          Caption counter
        </Link>
        {" / "}
        <Link className={s.vlink} href="/tools/instagram-image-size">
          Image size guide
        </Link>
        {" / "}
        <Link className={s.vlink} href="/tools/instagram-post-preview">
          Post preview
        </Link>
      </p>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Before you schedule</p>
              <h2>Six things to confirm</h2>
            </div>
            <div className="pains">
              {tips.map((tip, i) => (
                <div key={i} className="pain">
                  <b>Tip {i + 1}</b>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Scheduling checklist FAQ</h2>
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
          <div className="cta">
            <div>
              <h2>Schedule the post once the checklist is green</h2>
              <p>{BRAND.tagline}</p>
              <Link className="btn" href="/signup">
                Start free <span aria-hidden="true">→</span>
              </Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-schedule.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="A week of Instagram posts planned on the Poskoo calendar"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
