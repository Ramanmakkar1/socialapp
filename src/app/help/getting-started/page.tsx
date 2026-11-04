import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Zap } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { DM_TEMPLATES } from "@/lib/dmTemplates";

export const metadata: Metadata = {
  title: "Getting started in 3 minutes",
  description:
    "Connect Instagram, create your first comment-to-DM rule from a template, and schedule a post in Postflow — the same three steps as the dashboard checklist.",
  alternates: { canonical: "/help/getting-started" },
};

const STARTER_SLUGS = ["free-guide", "email-checklist", "follow-bonus"] as const;

const starterTemplates = STARTER_SLUGS.map((slug) => DM_TEMPLATES.find((t) => t.slug === slug)).filter(
  (t): t is (typeof DM_TEMPLATES)[number] => Boolean(t),
);

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Getting started in 3 minutes",
  description: metadata.description,
  dateModified: "2026-11-04",
  author: { "@type": "Organization", name: BRAND.company },
  publisher: { "@type": "Organization", name: BRAND.company, url: BRAND.url },
  mainEntityOfPage: `${BRAND.url}/help/getting-started`,
};

export default function GettingStartedHelpPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="btn-primary grid h-8 w-8 place-items-center rounded-lg">
              <Zap className="h-4 w-4" />
            </span>
            {BRAND.name}
          </Link>
          <Link href="/signup" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">
            Start free
          </Link>
        </div>
      </header>
      <main className="flex-1 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Link href="/help" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Help center
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Getting started in 3 minutes</h1>
          <p className="mt-3 text-ink-2">
            These three steps match the checklist on your {BRAND.name} dashboard after you sign in.
          </p>

          <ol className="mt-10 space-y-10">
            <li className="rounded-2xl border border-line bg-surface p-6">
              <span className="btn-primary inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                1
              </span>
              <h2 className="mt-4 text-xl font-semibold">Connect Instagram</h2>
              <p className="mt-2 text-sm text-ink-2">
                Use a free Instagram Business or Creator account. In {BRAND.name}, open{" "}
                <Link href="/app/settings" className="font-medium text-brand hover:underline">
                  Settings
                </Link>{" "}
                and tap <strong className="font-medium text-ink">Connect Instagram</strong>. You sign in through Meta&apos;s
                official login — we never ask for your Instagram password.
              </p>
            </li>

            <li className="rounded-2xl border border-line bg-surface p-6">
              <span className="btn-primary inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                2
              </span>
              <h2 className="mt-4 text-xl font-semibold">Create your first auto-DM rule from a template</h2>
              <p className="mt-2 text-sm text-ink-2">
                Pick a template below. It opens{" "}
                <Link href="/app/auto-dm" className="font-medium text-brand hover:underline">
                  Auto-DM
                </Link>{" "}
                with keywords and message text filled in. Add your link, set the rule to Active, and put the same keyword in
                your post caption so commenters know what to type.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {starterTemplates.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/app/auto-dm?template=${t.slug}`}
                      className="font-medium text-brand hover:underline"
                    >
                      {t.title}
                    </Link>
                    <span className="text-ink-2"> — keyword example: {t.keywords.join(", ")}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/instagram-auto-dm/templates"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
              >
                Browse all templates <ArrowRight className="h-4 w-4" />
              </Link>
            </li>

            <li className="rounded-2xl border border-line bg-surface p-6">
              <span className="btn-primary inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                3
              </span>
              <h2 className="mt-4 text-xl font-semibold">Schedule your first post in the calendar</h2>
              <p className="mt-2 text-sm text-ink-2">
                Open the{" "}
                <Link href="/app/calendar#new" className="font-medium text-brand hover:underline">
                  calendar
                </Link>
                , write your caption (include your keyword), add media, and choose a time. Optionally attach an auto-DM rule
                to the post — when the post publishes, {BRAND.name} can switch that rule on automatically if you kept it
                paused until launch.
              </p>
            </li>
          </ol>

          <div className="mt-10 rounded-2xl border border-line bg-surface-2 p-5 text-sm text-ink-2">
            <p>
              Need a fix-it checklist? See{" "}
              <Link href="/help/instagram-auto-dm-not-working" className="font-medium text-brand hover:underline">
                Instagram auto DM not working
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
