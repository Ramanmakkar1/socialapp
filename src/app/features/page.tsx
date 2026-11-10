import type { Metadata } from "next";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { CompareAlternativesNav } from "@/components/CompareAlternativesNav";
import CompareHeroIllustration from "@/components/CompareHeroIllustration";
import { SchedulerHeroIllustration } from "@/components/SchedulerHeroIllustration";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import ToolsHeroIllustration from "@/components/ToolsHeroIllustration";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: { absolute: "Poskoo Features: Scheduling, Auto-DM & AI DM Replies" },
  description:
    "Explore every Poskoo feature in one place: schedule Instagram, Facebook and Threads posts, auto-DM commenters, capture leads and use free Instagram tools.",
  alternates: { canonical: "/features" },
};

const schedulerBullets = [
  "Plan feed posts, reels, carousels and stories on a week or month calendar.",
  "Auto-publish on Instagram, Facebook Pages and Threads from one queue.",
  "Pick suggested times from your own followers' activity, not generic guesses.",
];

const autoDmBullets = [
  "Send your link automatically to everyone who comments a keyword.",
  "Capture an email or phone number before the link goes out.",
  "Add a follow gate, story replies and click tracking to every campaign.",
];

const aiBullets = [
  "Let AI answer questions in your voice when people reply to a DM.",
  "Collect contact details and share your booking link inside the chat.",
  "Keep the conversation going without writing every reply yourself.",
];

const toolsBullets = [
  "Count characters, build hashtag sets and generate captions.",
  "Test comment keywords before you turn on auto-DM rules.",
  "No sign-up and no credit card needed for the free tools.",
];

function AiRepliesIllustration() {
  return (
    <svg
      viewBox="0 0 480 360"
      role="img"
      aria-label="A direct message chat where AI writes a friendly reply and collects a contact detail"
      className="h-auto w-full max-w-full"
      fontFamily="inherit"
    >
      <defs>
        <linearGradient id="features-ai-blob" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="var(--brand)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--brand-2)" stopOpacity="0.16" />
        </linearGradient>
      </defs>
      <ellipse cx="240" cy="180" rx="190" ry="140" fill="url(#features-ai-blob)" />
      <rect x="76" y="56" width="250" height="248" rx="22" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
      <circle cx="104" cy="84" r="10" fill="var(--brand)" opacity="0.8" />
      <rect x="122" y="78" width="86" height="11" rx="5.5" fill="var(--ink-2)" opacity="0.7" />
      <rect x="98" y="112" width="150" height="42" rx="14" fill="var(--surface-2)" />
      <rect x="110" y="124" width="96" height="8" rx="4" fill="var(--ink-2)" opacity="0.5" />
      <rect x="110" y="138" width="66" height="8" rx="4" fill="var(--ink-2)" opacity="0.35" />
      <rect x="150" y="170" width="158" height="58" rx="14" fill="var(--brand)" opacity="0.9" />
      <rect x="164" y="184" width="112" height="8" rx="4" fill="#fff" opacity="0.9" />
      <rect x="164" y="198" width="128" height="8" rx="4" fill="#fff" opacity="0.7" />
      <rect x="164" y="212" width="84" height="8" rx="4" fill="#fff" opacity="0.55" />
      <rect x="98" y="244" width="132" height="40" rx="12" fill="var(--surface-2)" stroke="var(--line)" />
      <text x="114" y="269" fontSize="12" fill="var(--ink-2)" fontWeight="600">you@email.com</text>
      <g fill="var(--brand-2)">
        <path d="M350 92l4 11 11 4-11 4-4 11-4-11-11-4 11-4Z" />
        <path d="M386 148l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" opacity="0.7" />
      </g>
      <rect x="330" y="196" width="96" height="52" rx="16" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" />
      <circle cx="354" cy="222" r="12" fill="var(--brand)" />
      <path d="M349 222l4 4 7-8" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="374" y="212" width="38" height="7" rx="3.5" fill="var(--ink-2)" opacity="0.7" />
      <rect x="374" y="226" width="30" height="7" rx="3.5" fill="var(--line)" />
    </svg>
  );
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": BRAND.url + "/features#webpage",
      url: BRAND.url + "/features",
      name: "Everything Poskoo does, in one place.",
      inLanguage: "en",
      isPartOf: { "@id": BRAND.url + "#website" },
    },
  ],
};

export default function FeaturesPage() {
  return (
    <PublicShell breadcrumbs={[{ name: "Features", path: "/features" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="hero">
        <span className="pill"><span>ALL-IN-ONE</span>Schedule · Auto-DM · AI replies · Free tools</span>
        <p className="eyebrow">Features</p>
        <h1>
          Everything Poskoo does, <em className="s mark">in one place.</em>
        </h1>
        <p className="lede">
          Poskoo is one app for planning posts, publishing on Instagram, Facebook and Threads, and turning
          comments into leads with automatic DMs and AI replies.
        </p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
          <Link className="btn btn-line" href="/pricing">View pricing</Link>
        </div>
        <p className="small">Free plan. No credit card needed.</p>
        <SchedulerHeroIllustration />
      </header>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Scheduler</p>
              <h2>Plan once, <em className="s">publish everywhere.</em></h2>
              <p>
                Build your week on a drag-and-drop calendar, then let Poskoo publish each post at the time you
                choose.
              </p>
              <ul>
                {schedulerBullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className="btn btn-line" href="/instagram-scheduler">
                Explore the Instagram scheduler <span aria-hidden="true">→</span>
              </Link>
              <p className="small">
                Also see the <Link className={s.vlink} href="/facebook-scheduler">Facebook Page scheduler</Link>{" "}
                and the <Link className={s.vlink} href="/instagram-content-planner">Instagram content planner</Link>.
              </p>
            </div>
            <div className="art">
              <SchedulerHeroIllustration />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Auto-DM</p>
              <h2>Every comment can become <em className="s mark">a lead.</em></h2>
              <p>
                Set a keyword such as GUIDE or LINK. When someone comments it, Poskoo sends them your message in
                a DM within seconds.
              </p>
              <ul>
                {autoDmBullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className="btn btn-line" href="/instagram-auto-dm">
                See how Instagram auto-DM works <span aria-hidden="true">→</span>
              </Link>
              <p className="small">
                Ready-made messages: <Link className={s.vlink} href="/instagram-auto-dm/templates">browse auto-DM templates</Link>.
              </p>
            </div>
            <div className="art">
              <HelpGuideIllustration variant="autodm" />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">AI DM replies</p>
              <h2>Replies that keep <em className="s">the chat going.</em></h2>
              <p>
                When someone answers your DM with a question, AI replies in your voice, collects their contact
                details and shares your booking link.
              </p>
              <ul>
                {aiBullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className="btn btn-line" href="/pricing">
                See what the Pro plan includes <span aria-hidden="true">→</span>
              </Link>
              <p className="small">AI replies are part of the Pro plan. Start on the free plan to try scheduling and auto-DM.</p>
            </div>
            <div className="art">
              <AiRepliesIllustration />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Free tools</p>
              <h2>Useful helpers, <em className="s mark">free forever.</em></h2>
              <p>
                Caption and hashtag helpers, a keyword tester and more. They run in your browser with no sign-up,
                so you can check your post before you schedule it.
              </p>
              <ul>
                {toolsBullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className="btn btn-line" href="/tools">
                Browse all free Instagram tools <span aria-hidden="true">→</span>
              </Link>
              <p className="small">
                Popular tools:{" "}
                <Link className={s.vlink} href="/tools/instagram-caption-generator">caption generator</Link>,{" "}
                <Link className={s.vlink} href="/tools/instagram-hashtag-generator">hashtag generator</Link> and{" "}
                <Link className={s.vlink} href="/tools/instagram-comment-keyword-tester">comment keyword tester</Link>.
              </p>
            </div>
            <div className="art">
              <ToolsHeroIllustration />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Compare</p>
              <h2>One app instead of <em className="s">two or three.</em></h2>
              <p>
                Poskoo combines scheduling and comment-to-DM automation in one place. See how it compares with the
                tools you may already know.
              </p>
              <ul>
                <li>Scheduling and auto-DM in one plan, not separate subscriptions.</li>
                <li>Official Meta API with no password sharing.</li>
                <li>Free plan to test the workflow before you upgrade.</li>
              </ul>
            </div>
            <div className="art">
              <CompareHeroIllustration />
            </div>
          </div>
          <CompareAlternativesNav />
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Ready to put your social media <em className="s">on autopilot?</em></h2>
              <p>Start free, connect Instagram and schedule your first post in minutes.</p>
              <Link className="btn" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
