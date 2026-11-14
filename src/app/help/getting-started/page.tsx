import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { publisherRef } from "@/lib/tool-schema";
import { DM_TEMPLATES } from "@/lib/dmTemplates";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

export const metadata: Metadata = withSocial({
  title: { absolute: "Getting Started: Set Up Instagram Auto-DMs in 3 Minutes" },
  description:
    `Connect Instagram, create your first comment-to-DM rule from a template, and schedule a post in ${BRAND.name} — the same three steps as the dashboard checklist.`,
  alternates: { canonical: "/help/getting-started" },
});

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
  publisher: publisherRef(),
  mainEntityOfPage: `${BRAND.url}/help/getting-started`,
};

export default function GettingStartedHelpPage() {
  return (
    <PublicShell
      className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Help center", path: "/help" },
        { name: "Getting started", path: "/help/getting-started" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="hero">
        <div className={s.heroText}>
          <p className="eyebrow">Guide</p>
          <h1>
              Getting started in <em className="s">3 minutes</em>
            </h1>
          <p className="lede">
            Getting started takes about three minutes: connect Instagram, create an auto-DM rule from a template, and
            schedule your first post. Sign in, then follow the three steps below in order.
          </p>
        </div>
        <HelpGuideIllustration variant="start" className="hero-art" />
      </header>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">The three steps</p>
              <h2>Connect, automate, schedule</h2>
              <div className="pains">
                <div className="pain"><b>Step 1</b><span>Connect Instagram</span></div>
                <div className="pain"><b>Step 2</b><span>Create your first auto-DM rule from a template</span></div>
                <div className="pain"><b>Step 3</b><span>Schedule your first post in the calendar</span></div>
              </div>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/card-schedule.webp"
                width={900}
                height={900}
                loading="lazy"
                alt="A creator pins post cards onto a weekly calendar next to a smiling alarm clock"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Connect Instagram</h2>
            <p>
              Use a free Instagram Business or Creator account. In {BRAND.name}, open{" "}
              <Link className={s.vlink} href="/app/settings">
                Settings
              </Link>{" "}
              and tap <strong>Connect Instagram</strong>. You sign in through Meta&apos;s official login — we never ask for
              your Instagram password.
            </p>

            <h2>Create your first <span className={s.nowrap}>auto-DM</span> rule from a template</h2>
            <p>
              Pick a template below. It opens{" "}
              <Link className={s.vlink} href="/app/auto-dm">
                Auto-DM
              </Link>{" "}
              with keywords and message text filled in. Add your link, set the rule to Active, and put the same keyword in
              your post caption so commenters know what to type.
            </p>
            <ul>
              {starterTemplates.map((t) => (
                <li key={t.slug}>
                  <Link className={s.vlink} href={`/app/auto-dm?template=${t.slug}`}>
                    {t.title}
                  </Link>
                  {" "}— keyword example: {t.keywords.join(", ")}
                </li>
              ))}
            </ul>
            <p>
              <Link className={s.vlink} href="/instagram-auto-dm/templates">
                Browse all templates <span aria-hidden="true">→</span>
              </Link>
            </p>

            <h2>Schedule your first post in the calendar</h2>
            <p>
              Open the{" "}
              <Link className={s.vlink} href="/app/calendar#new">
                calendar
              </Link>
              , write your caption (include your keyword), add media, and choose a time. Optionally attach an auto-DM rule
              to the post — when the post publishes, {BRAND.name} can switch that rule on automatically if you kept it
              paused until launch.
            </p>
          </div>
          <div className="pains" style={{ maxWidth: 760, margin: "32px auto 0" }}>
            <div className="pain">
              <b>Stuck?</b>
              <span>
                Need a fix-it checklist? See{" "}
                <Link className={s.vlink} href="/help/instagram-auto-dm-not-working">
                  Instagram auto DM not working
                </Link>
                .
              </span>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
