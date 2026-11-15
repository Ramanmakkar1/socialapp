import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { AnimArt } from "@/components/AnimArt";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const PATH = "/instagram-auto-reply";
const title = `Instagram Auto-Reply FAQ: Comments, Keywords & DMs | ${BRAND.name}`;
const description =
  "Instagram auto-reply sends a DM when someone comments your keyword or replies to a Story. See keyword rules, email gates, pauses and use cases.";

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
});

const faqs = [
  {
    q: "What is an Instagram auto-reply?",
    a: "An Instagram auto-reply is a DM that is sent automatically when someone comments a keyword on your post, replies to your Story with a keyword, or sends you a keyword in a DM. In Poskoo you write the message once and choose which posts, Stories or keyword DMs trigger it.",
  },
  {
    q: "How fast does an Instagram auto-reply send?",
    a: "A matching comment or Story reply is queued right away, then delivered by a background worker with retries and per-account send budgeting. Most DMs go out within a few minutes, not the second the comment is posted, especially when earlier sends are still in the queue.",
  },
  {
    q: "Do I need an Instagram Business or Creator account?",
    a: "Yes. Instagram only allows automated DMs for professional accounts, so connect a Business or Creator account through Meta's official Instagram login. Switching an account is free in the Instagram app, and Poskoo never asks for your password.",
  },
  {
    q: "Can I use more than one keyword in a rule?",
    a: "Yes. Add up to 10 keywords to one rule, separated by commas. A comment that matches any of them triggers the same DM, so you can cover GUIDE and GUIDES or LINK and LINKS in a single automation.",
  },
  {
    q: "What is the difference between exact and contains keyword matching?",
    a: "Exact match fires only when the whole comment equals the keyword, for example a comment that is just GUIDE. Contains match fires when the keyword appears as its own word, for example I want the GUIDE please, but not GUIDE123. Contains is the safer default for normal conversation.",
  },
  {
    q: "Can an Instagram auto-reply collect emails?",
    a: "Yes. Turn on Ask for email first and the first DM asks the person to reply with their email before the link is sent. Poskoo extracts the address from the DM thread, saves it in Leads with the post and keyword that started it, and you can export the list as CSV.",
  },
  {
    q: "How do I pause an Instagram auto-reply rule?",
    a: "Open Auto-DM and use Pause on the rule. A paused rule stops matching new comments and queued DMs wait until you resume it. If a paused rule is attached to a post that is scheduled in the calendar, it switches on automatically when that post publishes.",
  },
  {
    q: "Will Instagram auto-replies get my account banned?",
    a: "Not when they use the official Meta API and follow Meta's rules. Poskoo never asks for your password or scrapes your account, only messages people who commented or replied first, respects rate limits and the 24-hour messaging window, and sends at most one DM per comment.",
  },
  {
    q: "Can I auto-reply to Story replies and DM keywords too?",
    a: "Yes. A rule can listen to comments on your posts, replies to your Stories, or both. Poskoo also replies to a keyword sent in a DM, once per conversation, so the same message and link can work across comments, Stories and direct messages.",
  },
  {
    q: "Can I see which post and keyword produced a lead?",
    a: "Yes. Captured contacts are saved with the post and keyword that triggered the conversation, and link clicks, DMs sent and leads collected are counted per rule and per post. Poskoo also offers CSV export so you can review the list outside the app.",
  },
];

const appJsonLd = {
  ...toolSoftwareJsonLd({
    name: `${BRAND.name} Instagram auto-reply`,
    description,
    url: `${BRAND.canonicalUrl}${PATH}`,
  }),
  "@id": `${BRAND.canonicalUrl}${PATH}#software`,
  featureList: [
    "Automatic replies to Instagram comment keywords",
    "Story reply and DM keyword triggers",
    "Exact and contains keyword matching with up to 10 keywords per rule",
    "DM messages with username and link tokens",
    "Optional email and follow gates",
    "Rule pause and resume",
    "Lead capture with CSV export",
  ],
  offers: softwareOffers(planReadiness()),
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BRAND.canonicalUrl}#org`,
  name: BRAND.name,
  legalName: BRAND.company,
  url: BRAND.canonicalUrl,
  email: BRAND.supportEmail,
  sameAs: BRAND.social,
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${BRAND.canonicalUrl}${PATH}#webpage`,
  url: `${BRAND.canonicalUrl}${PATH}`,
  name: title,
  description,
  isPartOf: { "@id": `${BRAND.canonicalUrl}#website` },
  about: { "@id": `${BRAND.canonicalUrl}${PATH}#software` },
};

const workflows = [
  {
    audience: "Creators",
    art: "feat-dm" as const,
    title: "Turn a Reel comment into a freebie download",
    intro: "A creator gives away a guide from one Reel and keeps every opt-in.",
    steps: [
      "Say “Comment GUIDE” in the Reel caption and on-screen.",
      "Create a rule with the keyword GUIDE, a DM that greets {{username}} and includes {{link}}, and paste the guide URL as Link URL.",
      "Turn on Ask for email first so the link is sent after the email arrives, then review the contacts in Leads.",
    ],
    result: "Each comment becomes a tracked DM and, with the gate on, a lead saved with that Reel and keyword.",
  },
  {
    audience: "Agencies",
    art: "analytics" as const,
    title: "Run one keyword campaign per client account",
    intro: "An agency keeps comment replies consistent across the accounts it manages.",
    steps: [
      "Connect the client Instagram accounts to the workspace; the Agency plan holds up to 25 social accounts.",
      "Give each client a distinct keyword such as CLIENTGUIDE and its own Link URL and DM copy.",
      "Pause a rule when the campaign ends, then export that client's captured leads as CSV.",
    ],
    result: "Rules and leads stay separated by account, and a paused campaign stops sending without deleting its history.",
  },
  {
    audience: "Local businesses",
    art: "card-leads" as const,
    title: "Answer menu, booking and opening-hours questions",
    intro: "A local business covers the same questions in comments and Story replies.",
    steps: [
      "Add keywords such as MENU, BOOK or HOURS (up to 10 per rule) with the right link for each rule.",
      "Choose comments on posts, replies to Stories, or both, so a Story question gets the same answer.",
      "Use contain matching for natural phrases, then check Activity and the per-post lead counts each week.",
    ],
    result: "People get the link in a DM without staff watching the inbox, and the business sees which post drove the questions.",
  },
];

export default function InstagramAutoReplyPage() {
  return (
    <PublicShell
      className={s.sched}
      breadcrumbs={[{ name: "Instagram auto-reply", path: PATH }]}
    >
      {[appJsonLd, orgJsonLd, webPageJsonLd, faqJsonLd(faqs)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Official Meta API · No password needed</span>
          <p className="eyebrow">Instagram auto-reply</p>
          <h1>Instagram auto-reply that answers comments, Stories and DMs</h1>
          <p className="lede">
            An Instagram auto-reply is an automatic DM sent when someone comments your keyword, replies
            to your Story or messages you a keyword. {BRAND.name} sends it through Meta&apos;s official
            API, usually within a few minutes, and saves the lead with the post that started it.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">
              Start free <span aria-hidden="true">→</span>
            </Link>
            <Link className="btn btn-line" href="/instagram-auto-dm">
              See comment-to-DM
            </Link>
          </div>
          <p className="small">Free plan included. No credit card. Business or Creator account required.</p>
        </div>
        <div className="hero-art">
          <AnimArt
            name="card-dm"
            label="A creator relaxes while automatic replies and DM links fly from a phone to followers"
          />
        </div>
      </header>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Comment replies</p>
              <h2>How do Instagram comment replies work?</h2>
              <p>
                You pick a post or Reel, add a keyword and write the DM. When a comment matches, the
                reply is queued immediately and sent in the background. A rule can listen to comments
                on your posts, replies to your Stories, or both, so the same automation covers a
                comment and a Story reply.
              </p>
              <p>
                Each comment is queued at most once, which stops duplicate DMs when someone comments
                twice. Delivery uses retries and per-account send budgeting, so a busy post does not
                turn into a burst of messages.
              </p>
            </div>
            <div className="art">
              <AnimArt
                name="feat-dm"
                label="A phone sends an automatic reply to a follower who commented a keyword"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Keyword rules</p>
            <h2>How do keyword rules decide who gets a reply?</h2>
            <p>
              A rule holds up to 10 keywords, the message, an optional link and the gates you choose.
              Matching is either exact or contains, and the whole comment is normalised first, so
              mentions and punctuation do not get in the way.
            </p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.th} scope="col">Match type</th>
                  <th className={s.th} scope="col">Fires when</th>
                  <th className={s.th} scope="col">Example with keyword GUIDE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={s.td} style={{ fontWeight: 600 }}>Exact</td>
                  <td className={s.td}>The whole comment equals the keyword.</td>
                  <td className={s.td}>&ldquo;guide&rdquo; matches; &ldquo;send me the guide&rdquo; does not.</td>
                </tr>
                <tr>
                  <td className={s.td} style={{ fontWeight: 600 }}>Contains</td>
                  <td className={s.td}>The keyword appears as its own word.</td>
                  <td className={s.td}>&ldquo;Need the GUIDE please&rdquo; matches; &ldquo;GUIDE123&rdquo; does not.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="small" style={{ marginTop: 14 }}>
            If several active rules share a keyword, the oldest rule wins. Use distinct keywords when
            you run separate automations. <Link className={s.vlink} href="/tools/instagram-comment-keyword-tester">Test your keywords free</Link>.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="art">
              <AnimArt
                name="card-leads"
                label="A follower receives a DM link and is saved as a new lead with a check mark"
              />
            </div>
            <div className="copy">
              <p className="eyebrow">DM links</p>
              <h2>How do DM links work?</h2>
              <p>
                Write up to 1,000 characters in the DM message and use the {"{{username}}"} token to
                greet the person by name. Put the {"{{link}}"} token where the URL should appear, then
                paste the destination into Link URL. A preview shows how the message will look before
                you save the rule.
              </p>
              <p>
                Link clicks are counted per rule and per post, alongside DMs sent and leads collected,
                so you can tell which post sent traffic and which one brought contacts.
              </p>
              <p className="small">
                <Link className={s.vlink} href="/instagram-auto-dm">
                  See the full comment-to-DM page
                </Link>{" "}
                for a step-by-step setup and a live simulation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Email gates</p>
            <h2>How do email gates work?</h2>
            <p>
              An email gate turns a link request into a lead. Turn on <strong>Ask for email first</strong>{" "}
              and the first DM asks the person to reply with their address. Poskoo reads the address
              from the DM thread, then queues the link message.
            </p>
          </div>
          <div className="cards">
            <article className="pcard">
              <span className="no">01 / Collect</span>
              <h3>Ask before you send</h3>
              <p>
                The link is only sent after a valid email arrives in the conversation, so every
                download has a contact behind it.
              </p>
            </article>
            <article className="pcard">
              <span className="no">02 / Save</span>
              <h3>Keep the source</h3>
              <p>
                Each contact is saved in Leads with the post and keyword that started the
                conversation, so you know what earned the opt-in.
              </p>
            </article>
            <article className="pcard">
              <span className="no">03 / Export</span>
              <h3>Take the list with you</h3>
              <p>
                Review contacts in the app or export the list as CSV for your CRM, newsletter or
                client report.
              </p>
            </article>
          </div>
          <p className="small" style={{ marginTop: 18 }}>
            You can also turn on <strong>Require follow</strong> so the link is sent only after the
            person follows you. With either gate on, a Link URL is required.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="prose">
            <p className="eyebrow">Pauses</p>
            <h2>How do pauses work?</h2>
            <p>
              Every rule shows a status of Live or Paused. Pause stops the rule from matching new
              comments, and queued DMs wait with the reason <em>Auto-DM is paused</em> until you
              resume. Nothing is deleted, so you can restart the campaign without rebuilding it.
            </p>
            <p>
              A paused rule that is attached to a post scheduled in the calendar switches on
              automatically when that post publishes. That lets you prepare a campaign early without
              replying to an old post. Separately, an account cooldown or an expired Instagram
              connection can hold sends; the queue shows the reason, and reconnecting in Settings lets
              it continue.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Compliance</p>
              <h2>Is Instagram auto-reply compliant?</h2>
              <p>
                Yes, when it runs on Meta&apos;s official API and follows Meta&apos;s messaging rules.
                {" "}{BRAND.name} connects through the login Meta provides, never asks for your
                Instagram password and never scrapes your account.
              </p>
              <p>
                Replies only go to people who commented or messaged first. Sends respect Meta&apos;s
                rate limits and the 24-hour messaging window: Poskoo replies while the conversation is
                open, not as cold outreach. Each comment gets at most one DM, follow reminders are
                capped per contact and rule, and gated links send once per contact and rule.
              </p>
              <p className="small">
                Read the <Link className={s.vlink} href="/privacy">privacy policy</Link> and{" "}
                <Link className={s.vlink} href="/data-deletion">data deletion</Link> page, or see the{" "}
                <Link className={s.vlink} href="/help/instagram-auto-dm-not-working">
                  auto-DM troubleshooting checklist
                </Link>.
              </p>
            </div>
            <div className="art">
              <AnimArt
                name="feat-leads"
                label="A creator reviews saved leads next to a shield and a check mark"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Use cases</p>
            <h2>Three Instagram auto-reply workflows</h2>
            <p>
              The same rule builder fits a solo creator, an agency and a local business. Each workflow
              below uses only features that are live in {BRAND.name} today.
            </p>
          </div>
          <div className="cards">
            {workflows.map((flow) => (
              <article key={flow.audience} className="pcard">
                <div style={{ marginBottom: 10 }}>
                  <AnimArt name={flow.art} label={flow.title} />
                </div>
                <span className="no">{flow.audience}</span>
                <h3>{flow.title}</h3>
                <p>{flow.intro}</p>
                <ol style={{ margin: "12px 0 0", paddingLeft: 20, display: "grid", gap: 8 }}>
                  {flow.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="small" style={{ marginTop: 12 }}>{flow.result}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram auto-reply FAQs</h2>
          </div>
          <div className="faq">
            {faqs.map((faq, index) => (
              <details key={faq.q} open={index === 0}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <nav className="relChips" aria-label="Related Poskoo pages">
            <span>Keep going</span>
            <Link href="/instagram-auto-dm">Comment-to-DM automation</Link>
            <Link href="/instagram-dm-automation">Instagram DM automation</Link>
            <Link href="/instagram-dm-lead-generation">DM lead generation</Link>
            <Link href="/pricing">Plans and pricing</Link>
          </nav>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Set up your first <em className="s">auto-reply</em> in minutes</h2>
              <p>
                Start free, connect Instagram through Meta and reply to every keyword comment, Story
                reply and DM.
              </p>
              <Link className="btn" href="/signup">
                Start free <span aria-hidden="true">→</span>
              </Link>{" "}
              <Link className="btn" href="/pricing">
                Compare plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
