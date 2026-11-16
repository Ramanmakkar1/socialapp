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
import { featureReadiness, planReadiness } from "@/lib/featureReadiness";
import { isFeatureReadyNow } from "@/lib/featureReadinessNow";
import { softwareOffers } from "@/lib/plans";
import { SoonBadge } from "@/components/PlanCta";
import { canonicalUrl } from "@/lib/canonical";
import { LIVE_PLATFORM_COUNT_TEXT, LIVE_PLATFORMS_TEXT, PLATFORMS_ANSWER } from "@/lib/platform-support";

// Payment copy follows the RUNTIME env (src/lib/featureReadiness.ts; the Docker build has no env):
// the page stays static and regenerates in the background at most every 10 minutes.
export const revalidate = 600;

// Title and description only mention AI once it is switched on (isFeatureReadyNow("ai")).
export async function generateMetadata(): Promise<Metadata> {
  const aiReady = await isFeatureReadyNow("ai");
  return withSocial({
    title: {
      absolute: aiReady
        ? "Social Media Scheduler Features: Auto-DM & AI | Poskoo"
        : "Social Media Scheduler Features: Auto-DM & Leads | Poskoo",
    },
    description: aiReady
      ? "See Poskoo features: schedule social posts, auto-DM Instagram commenters, capture leads, draft AI captions and use free tools, all in one app."
      : "See Poskoo features: schedule social posts, auto-DM Instagram commenters, capture leads, share a link-in-bio page and use free tools, all in one app.",
    alternates: { canonical: "/features" },
  });
}

const schedulerBullets = [
  "Plan feed posts, reels, carousels and stories on a week or month calendar.",
  `Auto-publish to ${LIVE_PLATFORMS_TEXT} from one queue.`,
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

const growBullets = (cardPaymentsReady: boolean) => [
  "Lead magnets: hand out a free file or link once someone gives their email in the DM.",
  cardPaymentsReady
    ? "Digital products: sell downloads from your own product page with Stripe card checkout, or take Direct UPI payments if you're in India."
    : "Digital products: sell downloads from your own product page. Direct UPI works today for eligible sellers in India; Stripe card checkout opens once card payments are switched on.",
  "Refer and earn: get 500 bonus auto-DMs a month for each friend who signs up and connects an account.",
];

const toolsBullets = [
  "Count characters, build hashtag sets and generate captions.",
  "Test comment keywords before you turn on auto-DM rules.",
  "No sign-up and no credit card needed for the free tools.",
];

const featuresFaqs = (aiReady: boolean) => [
  {
    q: "What does Poskoo do?",
    a: "Poskoo is one app that schedules social posts, sends automatic DMs to people who comment on Instagram, captures leads and tracks results.",
  },
  {
    q: "Which social networks can I schedule?",
    a: PLATFORMS_ANSWER,
  },
  {
    q: "How does Instagram comment-to-DM work?",
    a: "Set a keyword such as GUIDE or LINK, and Poskoo sends your message in a DM to everyone who comments it, usually within a minute. You can capture an email first, add a follow gate and track clicks.",
  },
  {
    q: "Does Poskoo include AI captions?",
    a: aiReady
      ? "Yes. AI caption ideas, per-network caption rewrites, campaign drafts from a brief and DM message ideas are switched on. Everything AI writes lands as a suggestion or a draft, and you review it before anything is scheduled or sent."
      : "Not yet. AI caption and DM message ideas aren't switched on yet, but you can still write and schedule everything yourself.",
  },
];

const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

const jsonLd = (aiReady: boolean) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": canonicalUrl("/features") + "#webpage",
      url: canonicalUrl("/features"),
      name: "Everything Poskoo does, in one place.",
      inLanguage: "en",
      isPartOf: { "@id": BRAND.canonicalUrl + "#website" },
      mainEntity: { "@id": BRAND.canonicalUrl + "#app" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": BRAND.canonicalUrl + "#app",
      name: BRAND.name,
      description: BRAND.description,
      url: canonicalUrl("/features"),
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      isPartOf: { "@id": BRAND.canonicalUrl + "#website" },
      featureList: [
        `Schedule and auto-publish to ${LIVE_PLATFORM_COUNT_TEXT}`,
        "Week and month content calendar",
        "Instagram comment-to-DM automation",
        ...(aiReady ? ["AI captions and DM message ideas"] : []),
        "Lead capture from DMs",
        "Free Instagram tools",
      ],
      offers: softwareOffers(planReadiness(process.env)),
      publisher: publisherRef(),
      subjectOf: [
        {
          "@type": "WebPage",
          "@id": BRAND.canonicalUrl + "/instagram-scheduler#webpage",
          url: BRAND.canonicalUrl + "/instagram-scheduler",
          name: "Instagram scheduler",
        },
        {
          "@type": "WebPage",
          "@id": BRAND.canonicalUrl + "/instagram-auto-dm#webpage",
          url: BRAND.canonicalUrl + "/instagram-auto-dm",
          name: "Instagram auto-DM",
        },
        {
          "@type": "WebPage",
          "@id": BRAND.canonicalUrl + "/instagram-link-in-bio#webpage",
          url: BRAND.canonicalUrl + "/instagram-link-in-bio",
          name: "Instagram link in bio",
        },
        {
          "@type": "WebPage",
          "@id": BRAND.canonicalUrl + "/pricing#webpage",
          url: BRAND.canonicalUrl + "/pricing",
          name: "Poskoo pricing and plans",
        },
      ],
    },
  ],
});

export default async function FeaturesPage() {
  const cardPaymentsReady = featureReadiness("card_payments", process.env).ready;
  const aiReady = await isFeatureReadyNow("ai");
  const faqs = featuresFaqs(aiReady);
  return (
    <PublicShell className={`${s.sched} ${s.pub}`} breadcrumbs={[{ name: "Features", path: "/features" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(aiReady)).replace(/</g, "\\u003c") }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)).replace(/</g, "\\u003c") }}
      />
      <header className="hero">
        <div className={s.heroText}>
          <span className="pill"><span>ALL-IN-ONE</span>{aiReady ? <>Schedule &middot; Auto-DM &middot; AI captions &middot; Free tools</> : <>Schedule &middot; Auto-DM &middot; Link in bio &middot; Free tools</>}</span>
          <p className="eyebrow">Features</p>
          <h1>
            Everything Poskoo does, <em className="s mark">in one place</em>
          </h1>
          <p className="lede">
            Poskoo combines social scheduling, Instagram comment-to-DM automation, lead capture and analytics in
            one app.
          </p>
          <p>
            Poskoo is one app for planning posts, publishing to {LIVE_PLATFORMS_TEXT}, and
            turning comments into leads with automatic DMs.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">Start free <span aria-hidden="true">&rarr;</span></Link>
            <Link className="btn btn-line" href="/pricing">View pricing</Link>
          </div>
          <p className="small">Free plan. No credit card needed.</p>
        </div>
        <div className="hero-art"><AnimArt name="features" label="A creator points at an open toolbox of calendar, chat, mail, chart and link tools" /></div>
      </header>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Explore Poskoo</p>
            <h2>Go straight to what you need</h2>
          </div>
          <div className="cards">
            <article className="pcard">
              <h3>Instagram scheduler</h3>
              <p>Plan feed posts, Reels and carousels on a calendar and auto-publish them.</p>
              <Link className="go" href="/instagram-scheduler">See the Instagram scheduler <span aria-hidden="true">&rarr;</span></Link>
            </article>
            <article className="pcard">
              <h3>Instagram auto-DM</h3>
              <p>Send your link automatically to everyone who comments your keyword.</p>
              <Link className="go" href="/instagram-auto-dm">See how Instagram auto-DM works <span aria-hidden="true">&rarr;</span></Link>
            </article>
            <article className="pcard">
              <h3>Instagram DM automation</h3>
              <p>Capture emails, add a follow gate and track clicks on every auto-DM.</p>
              <Link className="go" href="/instagram-dm-automation">Explore Instagram DM automation <span aria-hidden="true">&rarr;</span></Link>
            </article>
            <article className="pcard">
              <h3>Instagram link in bio</h3>
              <p>Turn one bio link into a page of links with click tracking.</p>
              <Link className="go" href="/instagram-link-in-bio">Build your Instagram link in bio <span aria-hidden="true">&rarr;</span></Link>
            </article>
            <article className="pcard">
              <h3>Pricing</h3>
              <p>Compare the Free, Pro and Agency plans and what each one includes.</p>
              <Link className="go" href="/pricing">See Poskoo pricing and plans <span aria-hidden="true">&rarr;</span></Link>
            </article>
          </div>
        </div>
      </section>

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
                Explore the Instagram scheduler <span aria-hidden="true">&rarr;</span>
              </Link>
              <p className="small">
                Also see the <Link className={s.vlink} href="/facebook-scheduler">Facebook Page scheduler</Link>,{" "}
                the <Link className={s.vlink} href="/threads-scheduler">Threads scheduler</Link>,{" "}
                the <Link className={s.vlink} href="/youtube-scheduler">YouTube video scheduler</Link>,{" "}
                the <Link className={s.vlink} href="/linkedin-scheduler">LinkedIn scheduler</Link>,{" "}
                the <Link className={s.vlink} href="/bluesky-scheduler">Bluesky scheduler</Link>,{" "}
                the <Link className={s.vlink} href="/mastodon-scheduler">Mastodon scheduler</Link>,{" "}
                the <Link className={s.vlink} href="/google-business-profile-scheduler">Google Business Profile scheduler</Link>{" "}
                and the <Link className={s.vlink} href="/instagram-content-planner">Instagram content planner</Link>.
                Running a small business? See the{" "}
                <Link className={s.vlink} href="/social-media-scheduler">
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
                See how Instagram auto-DM works <span aria-hidden="true">&rarr;</span>
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
              <p className="eyebrow">AI captions{aiReady ? null : <> <SoonBadge /></>}</p>
              <h2>{aiReady ? <>Captions in <em className="s">your brand voice</em></> : <>AI captions, <em className="s">coming soon</em></>}</h2>
              <p>
                {aiReady
                  ? "Ask AI for caption ideas and DM message ideas that follow the brand voice you save. You review and edit every idea before anything is scheduled or sent."
                  : "AI caption and DM message ideas aren't switched on yet. When they are, you'll ask for ideas that follow the brand voice you save, and review every idea before anything is scheduled or sent."}
              </p>
              <ul>
                {aiBullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className="btn btn-line" href="/signup">
                {aiReady ? "Try AI captions free" : "Start free, write captions yourself"} <span aria-hidden="true">&rarr;</span>
              </Link>
              {aiReady ? <p className="small">AI replies are not available in Poskoo yet; current AI features generate captions and DM message ideas for your review.</p> : null}
              <p className="small">See how it fits together on the <Link className={s.vlink} href="/ai-social-media-manager">AI social media manager</Link> page, reply from one <Link className={s.vlink} href="/social-media-inbox">social media inbox</Link> and track results with <Link className={s.vlink} href="/social-media-analytics">social media analytics</Link>.</p>
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
                {growBullets(cardPaymentsReady).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className="btn btn-line" href="/signup">
                Start free and set one up <span aria-hidden="true">&rarr;</span>
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
                Browse all free Instagram tools <span aria-hidden="true">&rarr;</span>
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
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Poskoo features FAQs</h2>
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
              <h2>Ready to put your social media <em className="s">on autopilot?</em></h2>
              <p>Start free, connect Instagram and schedule your first post in minutes.</p>
              <Link className="btn" href="/signup">Start free <span aria-hidden="true">&rarr;</span></Link>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
