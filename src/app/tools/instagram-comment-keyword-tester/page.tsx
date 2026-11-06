import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import KeywordTesterTool from "./KeywordTesterTool";

const PATH = "/tools/instagram-comment-keyword-tester";

export const metadata: Metadata = {
  title: { absolute: "Instagram Comment Keyword Tester for Auto-DM Rules" },
  description:
    "Free Instagram comment keyword tester: try GUIDE with contains or exact match before you publish auto-DM rules. Same logic as Poskoo—in your browser.",
  alternates: { canonical: PATH },
};

function CommentDmFlowIllustration() {
  return (
    <svg
      viewBox="0 0 320 150"
      aria-hidden="true"
      focusable="false"
      style={{ width: "100%", maxWidth: 480, display: "block", marginInline: "auto" }}
    >
      <ellipse cx="160" cy="140" rx="150" ry="8" fill="var(--brand)" opacity=".08" />
      <rect x="10" y="16" width="92" height="116" rx="14" fill="var(--surface)" stroke="var(--line)" />
      <rect x="20" y="26" width="72" height="54" rx="8" fill="var(--brand)" opacity=".18" />
      <circle cx="56" cy="48" r="11" fill="var(--brand-2)" />
      <path d="M40 80c0-14 32-14 32 0Z" fill="var(--brand)" />
      <rect x="20" y="90" width="52" height="6" rx="3" fill="var(--ink-2)" opacity=".4" />
      <rect x="20" y="102" width="36" height="6" rx="3" fill="var(--ink-2)" opacity=".25" />
      <path
        d="M122 46h62a10 10 0 0 1 10 10v14a10 10 0 0 1-10 10h-44l-12 9v-9a10 10 0 0 1-6-10V56a10 10 0 0 1 10-10Z"
        fill="var(--surface)"
        stroke="var(--line)"
      />
      <text x="158" y="68" textAnchor="middle" fill="var(--brand)" fontSize="13" fontWeight="700">
        GUIDE
      </text>
      <path d="M200 64h24" stroke="var(--brand-2)" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 5" />
      <path
        d="m222 58 8 6-8 6"
        fill="none"
        stroke="var(--brand-2)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="236" y="16" width="74" height="116" rx="14" fill="var(--ink)" />
      <rect x="242" y="26" width="62" height="96" rx="10" fill="var(--surface)" />
      <rect x="248" y="40" width="50" height="30" rx="8" fill="var(--brand)" opacity=".2" />
      <rect x="254" y="48" width="36" height="5" rx="2.5" fill="var(--brand)" />
      <rect x="254" y="58" width="24" height="5" rx="2.5" fill="var(--brand)" opacity=".6" />
      <path d="m292 92 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="var(--brand-2)" />
    </svg>
  );
}

const faqs = [
  {
    q: "What keyword should I use for Instagram comment auto DM?",
    a: "Pick one short, unique word followers can spell easily, such as GUIDE, LINK or PRICE. Avoid common words like hi, yes or thanks—they match too many comments and can trigger DMs you did not intend.",
  },
  {
    q: "What is the difference between contains and exact match?",
    a: "Contains matches when the normalized comment includes your keyword as a whole word or phrase anywhere (for example “send GUIDE please”). Exact match requires the whole comment to equal the keyword after normalization (GUIDE or guide! match; longer sentences do not).",
  },
  {
    q: "Does this tester send real DMs?",
    a: "No. Everything runs locally in your browser using the same keyword-matching code as Poskoo auto-DM rules. Nothing is saved, uploaded or sent to Instagram.",
  },
  {
    q: "How does a comment keyword trigger a DM in Poskoo?",
    a: "Connect Instagram, create a rule with keywords and a DM message, and choose which posts it applies to. When someone comments a matching keyword, Poskoo sends your DM through the official Meta API if the rule is active and delivery rules allow it.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Instagram Comment Keyword Tester",
  url: `${BRAND.url}${PATH}`,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: BRAND.company },
};

const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

export default function InstagramCommentKeywordTesterPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(appJsonLd) }} />
      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is uploaded</span>
        <h1>
          Instagram comment <em className="s mark">keyword tester</em>
        </h1>
        <p className="lede">
          Preview which comments would trigger your auto-DM keyword rules before you publish. Uses the same matching logic as {BRAND.name}&apos;s in-app rule editor.
        </p>
        <div className="hero-art" style={{ maxWidth: 520 }}>
          <Image
            sizes="(max-width: 520px) 100vw, 520px"
            src="/landing/card-dm.webp"
            width={900}
            height={900}
            loading="lazy"
            alt="A relaxed creator on a beanbag while DMs fly out of his phone to followers"
          />
        </div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <KeywordTesterTool />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        Ready to automate?{" "}
        <Link className={s.vlink} href="/instagram-auto-dm">
          How Instagram auto DM works
        </Link>
        {" · "}
        <Link className={s.vlink} href="/instagram-auto-dm/templates">
          DM templates
        </Link>
      </p>

      {/* How it works */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">How it works</p>
            <h2>How comment keywords trigger a DM</h2>
          </div>
          <CommentDmFlowIllustration />
          <div className={s.prose} style={{ marginTop: 28 }}>
            <p>
              You ask followers to comment a single keyword on a post or reel. When Instagram sends that comment to{" "}
              {BRAND.name}, we normalize the text and compare it to the keywords on your active rule—the same steps as the tester above.
            </p>
            <p>
              <strong>Tips:</strong> use one short word like <b>GUIDE</b> instead of a sentence. Skip everyday words like{" "}
              <b>hi</b> or <b>thanks</b> that appear in normal conversation.
            </p>
            <ul>
              <li>
                <strong>Contains keyword</strong> catches GUIDE inside longer comments (for example
                &quot;send GUIDE please&quot;) but not GUIDE embedded in another word like guidebook.
              </li>
              <li>
                <strong>Exact match</strong> only fires when the whole comment is that keyword after
                normalization—great when you want people to comment just GUIDE.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Comment keyword questions</h2>
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
              <h2>Turn matching comments into DMs automatically</h2>
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
              Instagram auto DM
            </Link>
            {" · "}
            <Link className={s.vlink} href="/instagram-auto-dm/templates">
              DM templates
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
