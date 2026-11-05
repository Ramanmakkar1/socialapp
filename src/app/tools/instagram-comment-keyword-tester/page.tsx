import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
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
    <svg viewBox="0 0 320 150" aria-hidden="true" focusable="false" className="mx-auto w-full max-w-md">
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
      <path
        d="M200 64h24"
        stroke="var(--brand-2)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="4 5"
        className="motion-safe:animate-pulse motion-reduce:animate-none"
      />
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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(appJsonLd) }} />
      <SiteHeader />
      <main className="flex-1 overflow-x-hidden">
        <section className="relative px-4 pt-10 pb-16 sm:pt-16">
          <div className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-96 max-w-3xl rounded-full bg-[radial-gradient(closest-side,var(--brand),transparent)] opacity-20 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-2">
                <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Free · runs in your browser · nothing is uploaded
              </span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
                Instagram comment <span className="gradient-text">keyword tester</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-ink-2">
                Preview which comments would trigger your auto-DM keyword rules before you publish. Uses the same matching logic as {BRAND.name}&apos;s in-app rule editor.
              </p>
            </div>
            <div className="mt-8 min-w-0">
              <KeywordTesterTool />
            </div>
            <p className="mt-6 text-center text-sm text-ink-2">
              Ready to automate?{" "}
              <Link href="/instagram-auto-dm" className="font-medium text-brand underline underline-offset-2">
                How Instagram auto DM works
              </Link>
              {" · "}
              <Link href="/instagram-auto-dm/templates" className="font-medium text-brand underline underline-offset-2">
                DM templates
              </Link>
            </p>
          </div>
        </section>

        <section className="border-y border-line bg-surface px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-semibold tracking-tight">How comment keywords trigger a DM</h2>
            <CommentDmFlowIllustration />
            <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink-2">
              <p>
                You ask followers to comment a single keyword on a post or reel. When Instagram sends that comment to{" "}
                {BRAND.name}, we normalize the text and compare it to the keywords on your active rule—the same steps as the tester above.
              </p>
              <p>
                <strong className="font-medium text-ink">Tips:</strong> use one short word like{" "}
                <span className="font-mono text-brand">GUIDE</span> instead of a sentence. Skip everyday words like{" "}
                <span className="font-mono">hi</span> or <span className="font-mono">thanks</span> that appear in normal conversation.
              </p>
              <ul className="list-inside list-disc space-y-2 pl-1">
                <li>
                  <span className="font-medium text-ink">Contains keyword</span> catches GUIDE inside longer comments (for example
                  &quot;send GUIDE please&quot;) but not GUIDE embedded in another word like guidebook.
                </li>
                <li>
                  <span className="font-medium text-ink">Exact match</span> only fires when the whole comment is that keyword after
                  normalization—great when you want people to comment just GUIDE.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Comment keyword questions</h2>
          <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-surface">
            {faqs.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="px-4 pb-24">
          <div className="btn-primary mx-auto max-w-5xl rounded-3xl px-6 py-14 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Turn matching comments into DMs automatically</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">{BRAND.tagline}</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/instagram-auto-dm" className="font-medium underline underline-offset-4">
                Instagram auto DM
              </Link>
              <Link href="/instagram-auto-dm/templates" className="font-medium underline underline-offset-4">
                DM templates
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
