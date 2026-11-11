import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import CalendarTemplate from "./CalendarTemplate";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/tools/social-media-content-calendar";
const description =
  "Plan a week of posts in a free social media content calendar template. Edit the day, platform, format and post idea, then download CSV for Sheets or Excel.";
export const metadata: Metadata = {
  title: { absolute: "Free Social Media Content Calendar Template + CSV Download" },
  description,
  alternates: { canonical: PATH },
};

const faqs = [
  {
    q: "What is a social media content calendar template?",
    a: "It is a weekly planner that lists what you will post each day, on which platform, in which format and with what idea. This one starts with a sample week you can edit, then download as a CSV.",
  },
  {
    q: "Is this content calendar template free?",
    a: "Yes. The planner runs entirely in your browser, needs no account and uploads nothing. Edit the rows and download the CSV as often as you like.",
  },
  {
    q: "How do I download the calendar as a CSV?",
    a: "Click Download CSV. Your browser saves a file named social-media-content-calendar.csv with the columns Day, Platform, Format and Post idea, ready to open in Google Sheets, Excel or Numbers.",
  },
  {
    q: "Can I change the sample week?",
    a: "Yes. Every day, platform, format and post idea is editable, and you can add or remove rows. Replace the sample posts with your own plan before you download.",
  },
  {
    q: "How do I schedule the posts after planning them?",
    a: "Connect your Instagram, Facebook Page or Threads account in Poskoo, then add each planned post to the calendar with its date, time and media. Poskoo publishes it at the scheduled time and shows whether it went live or failed.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({
  name: "Social Media Content Calendar Template",
  description,
  url: `${BRAND.url}${PATH}`,
});

export default function SocialMediaContentCalendarPage() {
  return (
    <PublicShell
      breadcrumbs={[{ name: "Free Instagram tools", path: "/tools" }, { name: "Content calendar template", path: PATH }]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free / runs in your browser / nothing is uploaded</span>
        <h1>
          Social media content <em className="s mark">calendar template</em>
        </h1>
        <p className="lede">
          A social media content calendar template is a weekly plan of what you post each day, on which platform, in
          which format and with what idea. Start from the sample week below, edit it for your brand, then download a CSV
          for Google Sheets or Excel.
        </p>
        <div className="hero-art"><AnimArt name="card-schedule" label="A creator pins post cards onto a weekly calendar next to a smiling alarm clock" /></div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <CalendarTemplate />
      </div>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">How to use it</p>
              <h2>Plan the week in four steps</h2>
            </div>
            <div className="pains">
              <div className="pain">
                <b>1. Pick your days</b>
                <span>Decide how many times you will post this week and which days. Consistency matters more than volume.</span>
              </div>
              <div className="pain">
                <b>2. Choose platform and format</b>
                <span>Match each idea to where your audience is: a Reel on Instagram, a link post on Facebook, a short text post on Threads.</span>
              </div>
              <div className="pain">
                <b>3. Write the post idea</b>
                <span>One clear sentence is enough. A hook, a tip, a question or a behind-the-scenes moment all work.</span>
              </div>
              <div className="pain">
                <b>4. Download and schedule</b>
                <span>Download the CSV, then add each post to the Poskoo calendar with its date, time and media.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Content calendar FAQ</h2>
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
              <h2>Turn the plan into scheduled posts</h2>
              <p>
                Add your posts to the{" "}
                <Link className={s.vlink} href="/app/calendar">
                  Poskoo calendar
                </Link>{" "}
                and publish on time. Planning for one channel? See the{" "}
                <Link className={s.vlink} href="/instagram-scheduler">
                  Instagram scheduler
                </Link>
                ,{" "}
                <Link className={s.vlink} href="/facebook-scheduler">
                  Facebook Page scheduler
                </Link>{" "}
                or{" "}
                <Link className={s.vlink} href="/threads-scheduler">
                  Threads scheduler
                </Link>
                .
              </p>
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
              alt="A week of social posts planned on the Poskoo calendar"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
