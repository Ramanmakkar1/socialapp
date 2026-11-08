import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import HookGenerator from "./HookGenerator";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

const PATH = "/tools/instagram-hook-generator";
const description =
  "Free Instagram Reel hook generator. Pick a hook style, get ready-to-copy first lines that stop the scroll, then schedule your Reel in Poskoo.";
export const metadata: Metadata = {
  title: { absolute: "Instagram Hook Generator: Free Reel Hook Ideas" },
  description,
  alternates: { canonical: PATH },
};
const tips = [
  <>
    Name the Reel in two or three words (meal prep, cold outreach, puppy training), pick a style and copy the hook that sounds like you.
  </>,
  <>
    Put the hook in the first line of the caption and on screen in the first second of the Reel. The rest of the Reel has to deliver on it, so keep the promise small and specific.
  </>,
  <>
    Queue the Reel once it is filmed. Plan it on your Poskoo calendar with our{" "}
    <Link className={s.vlink} href="/help/schedule-instagram-reels">
      Reels scheduling guide
    </Link>{" "}
    so it publishes at your best time.
  </>,
];
const faqs = [
  {
    q: "Is this Instagram hook generator free?",
    a: "Yes. The tool runs entirely in your browser: pick a style, copy a hook and go. Nothing is uploaded, no account is needed and there is no AI call behind it.",
  },
  {
    q: "How do I use a hook in a Reel?",
    a: "Put the hook in the first line of your caption and say it or show it on screen in the first second. The hook is a promise; the Reel is the part that keeps it.",
  },
  {
    q: "Which hook style works best for Reels?",
    a: "Curiosity, mistake and how-to hooks are the safest first Reels because they promise a clear payoff. Try All to see every style side by side, then switch styles between posts so your feed does not sound repetitive.",
  },
  {
    q: "Can I schedule the Reel once I have a hook?",
    a: "Yes. Poskoo schedules Instagram Reels from a calendar, so you can write the hook, film the Reel and queue it for your next best posting time.",
  },
];
const toolJsonLd = toolSoftwareJsonLd({ name: "Instagram Hook Generator", description, url: `${BRAND.url}${PATH}` });

export default function InstagramHookGeneratorPage() {
  return (
    <PublicShell breadcrumbs={[{ name: "Free Instagram tools", path: "/tools" }, { name: "Hook generator", path: PATH }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free / runs in your browser / nothing is uploaded</span>
        <h1>
          Instagram Reel hook <em className="s mark">generator</em>
        </h1>
        <p className="lede">
          Get ready-to-copy first lines for any Reel topic across eight hook styles — curiosity, mistake, how-to, myth, story, list, contrarian and result. Pick one, film it, then schedule the Reel in Poskoo.
        </p>
        <div className="hero-art" style={{ maxWidth: 520 }}>
          <Image
            sizes="(max-width: 520px) 100vw, 520px"
            src="/landing/card-schedule.webp"
            width={900}
            height={900}
            loading="lazy"
            alt="A calendar of scheduled social posts with a phone showing a published post"
          />
        </div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <HookGenerator />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-caption-generator">
          Caption generator
        </Link>
        {" / "}
        <Link className={s.vlink} href="/tools/instagram-reel-cover-maker">
          Reel cover maker
        </Link>
        {" / "}
        <Link className={s.vlink} href="/tools/instagram-post-ideas-generator">
          Post ideas generator
        </Link>
      </p>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Step by step</p>
              <h2>How to use a hook</h2>
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
            <h2>Instagram Reel hook FAQ</h2>
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
              <h2>Turn one hook into a week of Reels</h2>
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
