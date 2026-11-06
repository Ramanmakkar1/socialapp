import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import CommentPicker from "./CommentPicker";

const PATH = "/tools/instagram-comment-picker";

export const metadata: Metadata = {
  title: { absolute: "Instagram Comment Picker: Free Random Giveaway Winner" },
  description:
    "Paste your Instagram comments and pick a random giveaway winner for free. Filter by keyword and tagged friends, one entry per person. No login needed.",
  alternates: { canonical: PATH },
};

const steps = [
  {
    title: "Write clear rules and copy the comments",
    body: "Say in the caption what counts as an entry (for example: comment WIN and tag two friends) and when the giveaway ends. After it closes, copy the comments and paste them here, one per line.",
  },
  {
    title: "Apply the same filters to everyone",
    body: "Set the keyword and the minimum number of tagged friends from your rules, and tick one entry per person so people who commented many times get no extra chances.",
  },
  {
    title: "Pick, record and announce",
    body: "Press Pick winner, copy the result and keep it with a screen recording of the draw. Announce the winner in the post or Stories and contact them from your own account.",
  },
];

const faqs = [
  {
    q: "Is this Instagram comment picker free?",
    a: "Yes. The comment picker is completely free, has no sign-up and no limit on how many comments you paste or how many times you pick.",
  },
  {
    q: "Do you need my Instagram password?",
    a: "No. We never ask for your password and the tool does not connect to Instagram at all. You paste the comments yourself, and they never leave your browser.",
  },
  {
    q: "How do I copy comments from an Instagram post?",
    a: "Open the post on a computer, expand all comments with the plus button, then select and copy the comment list and paste it into the box. Each line can be '@username: comment', 'username comment' or just the comment text. Remove lines that are not comments, such as times or 'Reply'.",
  },
  {
    q: "Can it filter comments by keyword?",
    a: "Yes. Type a keyword such as 'win' and only comments that contain that word (any capitals) count as entries. You can also require a minimum number of tagged friends and allow only one entry per person.",
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

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Instagram Comment Picker",
  url: `${BRAND.url}${PATH}`,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: BRAND.company },
};

const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

export default function InstagramCommentPickerPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(appJsonLd) }} />
      <header className="hero">
        <span className="pill">Free · no login · comments never leave your browser</span>
        <h1>
          Instagram comment <em className="s mark">picker</em>
        </h1>
        <p className="lede">
          Paste the comments from your giveaway post, filter by keyword and tagged friends, and pick a random winner
          in seconds.
        </p>
        <div className="hero-art" style={{ maxWidth: 520 }}>
          <Image
            sizes="(max-width: 520px) 100vw, 520px"
            src="/landing/problem.webp"
            width={900}
            height={900}
            loading="lazy"
            alt="A tired creator at night buried under phones and chat-bubble notifications"
          />
        </div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <CommentPicker />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 16 }}>
        You paste the comments yourself. This tool does not use the Instagram API, does not scrape Instagram and makes
        no network calls with your comments: everything runs in your browser.
      </p>
      <p className="small" style={{ textAlign: "center", marginTop: 12 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-comment-keyword-tester">
          Comment keyword tester
        </Link>
        {" · "}
        <Link className={s.vlink} href="/tools/instagram-engagement-rate-calculator">
          Engagement rate calculator
        </Link>
      </p>

      {/* How to run a fair giveaway */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Giveaways</p>
            <h2>How to run a fair giveaway</h2>
          </div>
          <div className="cards">
            {steps.map((st, i) => (
              <article key={st.title} className="pcard">
                <span className="no">Step {i + 1}</span>
                <h3>{st.title}</h3>
                <p>{st.body}</p>
              </article>
            ))}
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            Instagram requires that promotions follow its{" "}
            <a
              href="https://help.instagram.com/179379842258600"
              target="_blank"
              rel="noopener noreferrer"
              className={s.vlink}
            >
              promotion guidelines
            </a>
            , including official rules and a note that Instagram does not sponsor the giveaway.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram comment picker questions</h2>
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

      {/* CTA */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Auto-DM everyone who comments your giveaway keyword</h2>
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
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link className={s.vlink} href="/instagram-auto-dm">
              How Instagram auto DM works
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
