import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import { CompareAlternativesNav } from "@/components/CompareAlternativesNav";
import { AnimArt } from "@/components/AnimArt";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import ToolsHeroIllustration from "@/components/ToolsHeroIllustration";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { publisherRef } from "@/lib/tool-schema";

export const metadata: Metadata = withSocial({
  title: { absolute: "Poskoo Features: Scheduling, Auto-DM & AI Captions" },
  description:
    "Explore every Poskoo feature in one place: schedule Instagram, Facebook, Threads and YouTube posts, auto-DM commenters, capture leads and use free Instagram tools.",
  alternates: { canonical: "/features" },
});

const schedulerBullets = [
  "Plan feed posts, reels, carousels and stories on a week or month calendar.",
  "Auto-publish on Instagram, Facebook Pages, Threads and YouTube from one queue.",
  "See suggested times based on when your audience engaged with your auto-DMs.",
];

const autoDmBullets = [
  "Send your link automatically to everyone who comments a keyword.",
  "Capture an email before the link goes out.",
  "Add a follow gate, Story-reply and DM-keyword triggers and click tracking.",
];

const aiBullets = [
  "Get caption ideas with hashtags from a short topic, then edit and schedule.",
  "Get DM message ideas for your auto-DM rules.",
  "Save your brand voice once in settings and every idea follows it.",
];

const growBullets = [
  "Lead magnets: hand out a free file or link once someone gives their email in the DM.",
  "Digital products: sell downloads from your own product page. Stripe card checkout is available when configured, and UPI is available for eligible sellers in India.",
  "Refer and earn: get 500 bonus auto-DMs a month for each friend who signs up and connects an account.",
];

const toolsBullets = [
  "Count characters, build hashtag sets and generate captions.",
  "Test comment keywords before you turn on auto-DM rules.",
  "No sign-up and no credit card needed for the free tools.",
];

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
      mainEntity: { "@id": BRAND.url + "#app" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": BRAND.url + "#app",
      name: BRAND.name,
      description: BRAND.description,
      url: BRAND.url + "/features",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      featureList: [
        "Schedule and auto-publish to Instagram, Facebook Pages, Threads and YouTube",
        "Week and month content calendar",
        "Instagram comment-to-DM automation",
        "AI captions and DM message ideas",
        "Lead capture from DMs",
        "Free Instagram tools",
      ],
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: publisherRef(),
    },
  ],
};

export default function FeaturesPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`} breadcrumbs={[{ name: "Features", path: "/features" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="hero">
        <div className={s.heroText}>
          <span className="pill"><span>ALL-IN-ONE</span>Schedule · Auto-DM · AI captions · Free tools</span>
          <p className="eyebrow">Features</p>
          <h1>
            Everything Poskoo does, <em className="s mark">in one place</em>
          </h1>
          <p className="lede">
            Poskoo is one app for planning posts, publishing on Instagram, Facebook, Threads and YouTube, and
            turning comments into leads with automatic DMs.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">→</span></Link>
            <Link className="btn btn-line" href="/pricing">View pricing</Link>
          </div>
          <p className="small">Free plan. No credit card needed.</p>
        </div>
        <div className="hero-art"><AnimArt name="features" label="A creator points at an open toolbox of calendar, chat, mail, chart and link tools" /></div>
      </header>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Scheduler</p>
              <h2>Plan once, <em className="s">publish everywhere</em></h2>
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
                Also see the <Link className={s.vlink} href="/facebook-scheduler">Facebook Page scheduler</Link>,{" "}
                the <Link className={s.vlink} href="/google-business-profile-scheduler">Google Business Profile scheduler</Link>{" "}
                and the <Link className={s.vlink} href="/instagram-content-planner">Instagram content planner</Link>.
                Running a small business? See the{" "}
                <Link className={s.vlink} href="/social-media-scheduler-for-small-business">
                  social media scheduler for small business
                </Link>
                .
              </p>
            </div>
            <div className="art">
              <AnimArt name="demo-schedule" label="A creator relaxes in a beanbag with a coffee while a weekly calendar of posts publishes on its own" />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Auto-DM</p>
              <h2>Every comment can become <em className="s mark">a lead</em></h2>
              <p>
                Set a keyword such as GUIDE or LINK. When someone comments it, Poskoo sends them your message in
                a DM, usually within a minute.
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
              <p className="eyebrow">AI captions</p>
              <h2>Captions in <em className="s">your brand voice</em></h2>
              <p>
                Ask AI for caption ideas and DM message ideas that follow the brand voice you save. You review and
                edit every idea before anything is scheduled or sent.
              </p>
              <ul>
                {aiBullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className="btn btn-line" href="/signup">
                Try AI captions free <span aria-hidden="true">→</span>
              </Link>
              <p className="small">AI replies are not available in Poskoo yet; current AI features generate captions and DM message ideas for your review.</p>
            </div>
            <div className="art">
              <AnimArt name="feat-ai" label="An AI helper drafts a caption idea" />
            </div>
          </div>
        </div>
      </section>

      <section id="sell-and-grow" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split rev">
            <div className="copy">
              <p className="eyebrow">Sell and grow</p>
              <h2>Turn DMs into <em className="s mark">sales and sign-ups</em></h2>
              <p>
                Attach a lead magnet or a digital product to an auto-DM rule, and share your referral link to earn
                more DMs. All three are in the app today.
              </p>
              <ul>
                {growBullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className="btn btn-line" href="/signup">
                Start free and set one up <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="art">
              <AnimArt name="card-leads" label="Two friends high-five next to a board of contacts with check marks and a rising chart" />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Free tools</p>
              <h2>Useful helpers, <em className="s mark">free forever</em></h2>
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
              <h2>One app instead of <em className="s">two or three</em></h2>
              <p>
                Poskoo combines scheduling and comment-to-DM automation in one place. See how it compares with the
                tools you may already know.
              </p>
              <ul>
                <li>Scheduling and auto-DM in one plan, not separate subscriptions.</li>
                <li>Official Meta API with no password sharing.</li>
                <li>Free plan to test the whole workflow, then Pro or Agency when you grow.</li>
              </ul>
            </div>
            <div className="art">
              <AnimArt name="compare" label="Someone tips a pile of messy app windows into a recycling bin and holds up one phone that does it all" />
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
