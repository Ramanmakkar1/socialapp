import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardPaste, Filter, ShieldCheck, Trophy } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
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
    icon: ClipboardPaste,
    title: "Write clear rules and copy the comments",
    body: "Say in the caption what counts as an entry (for example: comment WIN and tag two friends) and when the giveaway ends. After it closes, copy the comments and paste them here, one per line.",
  },
  {
    icon: Filter,
    title: "Apply the same filters to everyone",
    body: "Set the keyword and the minimum number of tagged friends from your rules, and tick one entry per person so people who commented many times get no extra chances.",
  },
  {
    icon: Trophy,
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
                <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Free · no login · comments never leave your browser
              </span>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">
                Instagram comment <span className="gradient-text">picker</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-ink-2">
                Paste the comments from your giveaway post, filter by keyword and tagged friends, and pick a random winner
                in seconds.
              </p>
            </div>
            <div className="mt-8">
              <CommentPicker />
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-center text-xs text-muted">
              You paste the comments yourself. This tool does not use the Instagram API, does not scrape Instagram and makes
              no network calls with your comments: everything runs in your browser.
            </p>
            <p className="mt-6 text-center text-sm text-ink-2">
              More free Instagram tools:{" "}
              <Link href="/tools/instagram-comment-keyword-tester" className="font-medium text-brand underline underline-offset-2">
                Comment keyword tester
              </Link>
              {" · "}
              <Link href="/tools/instagram-engagement-rate-calculator" className="font-medium text-brand underline underline-offset-2">
                Engagement rate calculator
              </Link>
            </p>
          </div>
        </section>

        <section className="border-y border-line bg-surface px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-semibold tracking-tight">How to run a fair giveaway</h2>
            <ol className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title} className="rounded-2xl border border-line bg-bg p-6">
                  <div className="flex items-center gap-3">
                    <span className="btn-primary inline-flex h-10 w-10 items-center justify-center rounded-xl">
                      <s.icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-muted">Step {i + 1}</span>
                  </div>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.body}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-center text-xs text-muted">
              Instagram requires that promotions follow its{" "}
              <a
                href="https://help.instagram.com/179379842258600"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-ink"
              >
                promotion guidelines
              </a>
              , including official rules and a note that Instagram does not sponsor the giveaway.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Instagram comment picker questions</h2>
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
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Auto-DM everyone who comments your giveaway keyword
            </h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">{BRAND.tagline}</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#0d0d14]">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/instagram-auto-dm" className="font-medium underline underline-offset-4">
                How Instagram auto DM works
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
