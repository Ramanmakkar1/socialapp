import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import TimeZoneConverter from "./TimeZoneConverter";
import { breadcrumbJsonLd, faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/tools/instagram-time-zone-converter";
const description =
  "Convert an Instagram posting time between any two time zones, with daylight saving handled. See the exact local date and time before you schedule a post.";

export const metadata: Metadata = {
  title: { absolute: "Instagram Time Zone Converter: Convert Post Times" },
  description,
  alternates: { canonical: PATH },
};

const faqs = [
  {
    q: "How do I convert an Instagram post time to another time zone?",
    a: "Enter the date and time you want to post, choose your time zone under From and the audience’s time zone under To, and the converter shows the matching local time straight away.",
  },
  {
    q: "Does the converter handle daylight saving time?",
    a: "Yes. It reads the time zone rules from your browser, so it uses the offset in force on that date. A 9 AM post in New York is 2 PM in London for most of the year, and the gap shifts by an hour for a few weeks when the two cities change clocks on different dates.",
  },
  {
    q: "What if the time I enter doesn’t exist because the clocks spring forward?",
    a: "Clocks skip an hour on the spring-forward night, so some times never happen. The converter flags that gap and shows the result using the offset from before the jump, which can be an hour earlier; pick a time after the jump for an exact answer.",
  },
  {
    q: "Which time zone should I use when scheduling an Instagram post?",
    a: "Schedule in the time zone you actually think in, and check the target time here first. Poskoo’s scheduler publishes at the local time you pick and shows your time zone under the field, so you don’t have to work out UTC yourself.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({ name: "Instagram Time Zone Converter", description, url: `${BRAND.url}${PATH}` });
const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", url: BRAND.url },
  { name: "Free tools", url: `${BRAND.url}/tools` },
  { name: "Instagram time zone converter", url: `${BRAND.url}${PATH}` },
]);

export default function InstagramTimeZoneConverterPage() {
  return (
    <PublicShell
      breadcrumbs={[
        { name: "Free Instagram tools", path: "/tools" },
        { name: "Time zone converter", path: PATH },
      ]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(crumbsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is saved</span>
        <h1>
          Instagram <em className="s mark">time zone converter</em>
        </h1>
        <p className="lede">
          Planning a post for followers in another country? Enter the date and time, pick both time zones, and see the
          exact local time — with daylight saving handled on that date.
        </p>
        <div className="hero-art"><AnimArt name="card-schedule" label="A creator pins post cards onto a weekly calendar next to a smiling alarm clock" /></div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <TimeZoneConverter />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-scheduling-checklist">
          Scheduling checklist
        </Link>
        {" · "}
        <Link className={s.vlink} href="/tools/instagram-caption-counter">
          Caption counter
        </Link>
      </p>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Why posting times need a second look</h2>
            <p>
              Instagram shows each post with a timestamp in the viewer’s own time zone, so the same scheduled moment is
              morning for one follower and late evening for another. If your audience is spread across countries, check
              the target clock before you commit: a 9 AM post in New York reaches London at 2 PM, while a 9 AM post in
              Los Angeles reaches Sydney the next morning.
            </p>
            <p>
              The converter uses the IANA time zone rules built into your browser. That means it follows the actual
              daylight saving dates for each region instead of a fixed offset, including regions that change clocks on
              different weekends or not at all.
            </p>

            <h2>From a time check to a scheduled post</h2>
            <p>
              Once the time looks right, run the{" "}
              <Link className={s.vlink} href="/tools/instagram-scheduling-checklist">
                Instagram scheduling checklist
              </Link>{" "}
              for caption, media and account checks, then schedule it in the{" "}
              <Link className={s.vlink} href="/instagram-scheduler">
                Instagram scheduler
              </Link>
              . You pick the date and time in your own time zone and {BRAND.name} publishes at that local time.
            </p>
            <p>
              If a time falls in a spring-forward gap, pick a time after the jump. Clocks skip that hour, so the clock
              never reaches it on that date and the converter flags it instead of pretending the time exists.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram time zone FAQ</h2>
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
              <h2>Schedule the post at the time you just worked out</h2>
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
