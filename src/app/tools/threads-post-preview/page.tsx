import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import ThreadsPostPreview from "./ThreadsPostPreview";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

const PATH = "/tools/threads-post-preview";
const MAX = 500;
const description =
  "Preview your Threads post in a mobile mockup, count characters against the 500-character limit, and copy or reset your text before you publish.";

export const metadata: Metadata = {
  title: { absolute: `Threads Post Preview & 500-Character Counter | ${BRAND.name}` },
  description,
  alternates: { canonical: `${BRAND.url}${PATH}` },
};

const faqs = [
  {
    q: "How many characters can a Threads post have?",
    a: `A Threads post can be up to ${MAX} characters. Emoji, spaces and line breaks all count toward the limit. The counter above shows your total and how many characters you have left as you type.`,
  },
  {
    q: "What happens if I go over 500 characters?",
    a: `The counter turns red and tells you how many characters you are over. Threads will not publish a post longer than ${MAX} characters, so trim the text until the remaining count is zero or higher.`,
  },
  {
    q: "Is this Threads preview the real app?",
    a: "No. It is a simple mobile mockup that shows how your text reads on a phone. Fonts, line wrapping and spacing can differ slightly in the real Threads app, so check the final post there before publishing.",
  },
  {
    q: "Does this tool post to Threads for me?",
    a: "No. This free tool only counts characters, previews your text and copies it to your clipboard. To schedule Threads posts, connect your account in Poskoo and add the post to your calendar.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({
  name: "Threads Post Preview & Character Counter",
  description,
  url: `${BRAND.url}${PATH}`,
});

export default function ThreadsPostPreviewPage() {
  return (
    <PublicShell breadcrumbs={[{ name: "Free tools", path: "/tools" }, { name: "Threads post preview", path: PATH }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Threads post <em className="s mark">preview &amp; counter</em>
        </h1>
        <p className="lede">
          Write your Threads post, watch the {MAX}-character count in real time and see how it looks on a phone before
          you publish.
        </p>
        <div className="hero-art"><AnimArt name="visual" label="A creator measures a photo frame with a ruler next to phone screens of different shapes" /></div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <ThreadsPostPreview />
      </div>

      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        Ready to plan ahead?{" "}
        <Link className={s.vlink} href="/threads-scheduler">
          Schedule Threads posts
        </Link>
        {" · "}
        <Link className={s.vlink} href="/social-media-scheduler-comparison">
          Compare social media schedulers
        </Link>
      </p>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">The limit</p>
            <h2>How the Threads character limit works</h2>
          </div>
          <div className={s.tile} style={{ padding: 24, maxWidth: 760, marginInline: "auto" }}>
            <p>
              A Threads post can be up to <strong>{MAX} characters</strong>. That includes letters, numbers, spaces,
              line breaks, emoji and hashtags. The counter above updates as you type and shows the number of characters
              you have left, so you can keep your post inside the limit before you copy it.
            </p>
            <p style={{ marginTop: 12 }}>
              If you paste a longer draft, the counter turns red and shows how far over you are. Trim the text until the
              remaining count is zero or higher, then copy the finished post into Threads or your scheduler.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Threads post questions</h2>
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
              <h2>Schedule Threads posts and auto-DM everyone who comments</h2>
              <p>{BRAND.tagline}</p>
              <Link className="btn" href="/signup">
                Start free <span aria-hidden="true">→</span>
              </Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-leads.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="Two friends high-five next to a board of new leads"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
