import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { softwareOffers } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";
import { getPlatformCopy, pendingNetworksText } from "@/lib/platform-support";
import { AnimArt } from "@/components/AnimArt";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

const PATH = "/social-media-scheduler-for-real-estate";
const title = `Social Media Scheduler for Real Estate Agents | ${BRAND.name}`;
const description =
  "Schedule property listings, open houses and market updates in one calendar, then auto-DM commenters and capture real estate leads with Poskoo.";

export const metadata: Metadata = withSocial({
  title: { absolute: title },
  description,
  alternates: { canonical: new URL(PATH, BRAND.canonicalUrl).toString() },
  openGraph: { title, description, url: new URL(PATH, BRAND.canonicalUrl).toString() },
  twitter: { card: "summary_large_image", title, description },
});

const contentTypes = [
  {
    n: "1",
    title: "Listing posts",
    text: "Post a new listing with photos, the address, price and a clear next step. Write the caption once, add the photos and schedule it to go out when buyers are browsing.",
  },
  {
    n: "2",
    title: "Open house reminders",
    text: "Schedule a reminder the day before and the morning of each open house, with the time, address and a link to directions or a booking page.",
  },
  {
    n: "3",
    title: "Market updates",
    text: "Share a short local market update each week or month: median price, days on market and what it means for buyers and sellers in your area.",
  },
  {
    n: "4",
    title: "Just sold and just listed",
    text: "Turn each closing into a post and keep your profile active, so people who are thinking about selling can see that you are working right now.",
  },
];

const workflow = [
  {
    n: "1",
    title: "Plan listings on one calendar",
    text: "Open the week or month view and drop in a post for each listing, open house and market update. Save drafts and come back to them later.",
  },
  {
    n: "2",
    title: "Write once, adapt per channel",
    text: "Add the caption, photos and link, then choose the channels and the time each post should go out. Adjust the wording where a channel needs it.",
  },
  {
    n: "3",
    title: "Let the queue publish",
    text: "Poskoo publishes each post through the platform's official API at the time you picked, then shows a published or failed status with a retry.",
  },
  {
    n: "4",
    title: "Turn comments into leads",
    text: "Set a keyword such as TOUR. When someone comments it on Instagram, Poskoo sends your DM, captures the email and tracks the link click.",
  },
];

const platforms = [
  { name: "Instagram", text: "Listing photos, Reels, carousels and Stories through Meta's official API." },
  { name: "Facebook Pages", text: "Listing and open house posts with text, images or a video link, in the same calendar." },
  { name: "Threads", text: "Short market updates and listing teasers up to 500 characters, published through Meta." },
  { name: "LinkedIn", text: "Profile posts for referrals, neighbourhood guides and market commentary." },
  { name: "YouTube", text: "Listing walkthroughs and Shorts with title, description, tags and privacy settings." },
  { name: "Bluesky and Mastodon", text: "Text posts with images, connected with an app password or OAuth." },
  ...(() => {
    const pending = pendingNetworksText(["tiktok", "pinterest", "x", "gbp"]);
    return pending ? [{ name: "TikTok, Pinterest, X and Google Business Profile", text: `${pending} Connect each as soon as it is switched on.` }] : [];
  })(),
];

const comparison = [
  { task: "Posting each listing", manual: "Post by hand on every app when you remember, usually between showings.", poskoo: "Add the listing once to the calendar and the queue publishes it on time." },
  { task: "Open house reminders", manual: "A phone reminder that only you see.", poskoo: "A scheduled post the day before and the morning of the open house." },
  { task: "Market updates", manual: "Skip them in a busy week, so the profile goes quiet.", poskoo: "Plan a month of updates in one sitting and let them publish." },
  { task: "Answering comments", manual: "Reply by hand and send the same link to every person.", poskoo: "Keyword rules send the DM and capture the email automatically." },
  { task: "Knowing what worked", manual: "Check each app's insights separately.", poskoo: "Clicks and leads sit next to the post that produced them." },
];

const faqs = [
  {
    q: "Can I schedule property listings on Instagram and Facebook?",
    a: "Yes. Add the listing photos, caption and link, then schedule the post for Instagram, Facebook Pages, Threads, LinkedIn, YouTube, Bluesky or Mastodon. Poskoo publishes through each platform's official API at the time you set, and shows a published or failed status so you know what went out.",
  },
  {
    q: "How does comment-to-DM lead capture work for real estate?",
    a: "Write a post that asks people to comment a keyword such as TOUR or PRICE. When someone comments it, Poskoo sends the DM you wrote, can ask for an email before it sends the link, and records the click. You can pause the rule at any time without deleting it.",
  },
  {
    q: "Can I capture emails before sending the listing link?",
    a: "Yes, on the Pro and Agency plans. The auto-DM asks for an email first, then delivers the link. Every lead is stored with the post and the keyword that produced it, and you can export the list as a CSV.",
  },
  {
    q: "Which platforms can I schedule to?",
    a: "Instagram, Facebook Pages, Threads, LinkedIn, YouTube, Bluesky and Mastodon publish today. TikTok, Pinterest, X and Google Business Profile are built and waiting for each platform's API approval, so you can connect them as soon as they are switched on.",
  },
  {
    q: "Do I need a credit card to start?",
    a: "No. Every account starts on the Free plan with 2 social accounts, 10 scheduled posts a month and 500 auto-DMs a month. You only add payment details if you choose to upgrade to Pro or Agency, and you can cancel any time.",
  },
];

const appJsonLd = {
  ...toolSoftwareJsonLd({
    name: `${BRAND.name} social media scheduler for real estate`,
    description,
    url: `${BRAND.canonicalUrl}${PATH}`,
  }),
  featureList: [
    "Week and month content calendar",
    "Schedule listing posts and open house reminders",
    "Schedule market updates across supported platforms",
    "Instagram comment-to-DM automation",
    "Email lead capture in DMs",
    "Click and lead tracking",
    "Publishing status and retries",
  ],
  offers: softwareOffers(planReadiness()),
};

export default function SocialMediaSchedulerForRealEstatePage() {
  const faqList = faqs.map((f) => f.q === "Which platforms can I schedule to?" ? { ...f, a: getPlatformCopy().answer } : f);
  return (
    <PublicShell
      className={s.sched}
      breadcrumbs={[{ name: "Social media scheduler for real estate", path: PATH }]}
    >
      {[appJsonLd, faqJsonLd(faqList)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Free plan · No credit card needed</span>
          <p className="eyebrow">Social media scheduler for real estate</p>
          <h1>
            Social media scheduler for <em className="s mark">real estate</em>
          </h1>
          <p className="lede">
            Poskoo is a social media scheduler for real estate agents and teams. Plan listing posts, open house
            reminders and market updates in one calendar, then auto-DM Instagram commenters to capture leads.
          </p>
          <div className="ctas">
            <Link className="btn btn-dark" href="/signup">
              Start scheduling free <span aria-hidden="true">→</span>
            </Link>
            <Link className="btn btn-line" href="/pricing">
              See plans and pricing
            </Link>
          </div>
          <p className="small">Free plan included. No credit card needed.</p>
        </div>
        <div className="hero-art">
          <AnimArt
            name="multichannel"
            label="A real estate agent schedules listing posts for several social platforms from one calendar"
          />
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">What to post</p>
            <h2>Four post types that keep your calendar full.</h2>
            <p>
              Real estate content does not need a big production. A steady mix of listings, open houses, market
              updates and recent wins is enough to stay visible between showings.
            </p>
          </div>
          <div className="cards">
            {contentTypes.map((item) => (
              <article key={item.n} className="pcard">
                <span className="no">{item.n}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">The weekly workflow</p>
              <h2>Plan once, <em className="s mark">publish all week.</em></h2>
              <p>
                Add each listing and open house to the calendar when you get it, then let the queue handle the
                posting while you are out on showings.
              </p>
              <ul>
                {workflow.map((step) => (
                  <li key={step.n}>
                    <strong>{step.title}:</strong> {step.text}
                  </li>
                ))}
              </ul>
              <p className="small">
                Ready to start with one channel? Use the{" "}
                <Link className={s.vlink} href="/instagram-scheduler">
                  Instagram scheduler
                </Link>{" "}
                and add the rest as you grow.
              </p>
            </div>
            <div className="art">
              <AnimArt
                name="demo-schedule"
                label="A weekly calendar fills with listing posts, open house reminders and market updates"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Comment-to-DM lead capture</p>
              <h2>Turn listing comments into <em className="s">real leads.</em></h2>
              <p>
                A listing post can ask people to comment a keyword. When they do, Poskoo sends the DM you wrote,
                asks for an email before the link, and records the click so you can see which listing brought it
                in. See the{" "}
                <Link className={s.vlink} href="/instagram-dm-lead-generation">
                  Instagram DM lead generation
                </Link>{" "}
                workflow for the full picture.
              </p>
              <ul>
                <li>Keyword rules for comments, Story replies and DMs.</li>
                <li>Email gate before the listing link or booking page is sent.</li>
                <li>Pause a rule at any time without losing it.</li>
                <li>Click and lead counts next to each listing post.</li>
              </ul>
              <p className="small">
                Learn how{" "}
                <Link className={s.vlink} href="/instagram-auto-dm">
                  Instagram auto-DM
                </Link>{" "}
                works, or add a{" "}
                <Link className={s.vlink} href="/instagram-link-in-bio">
                  link-in-bio page
                </Link>{" "}
                for the links in your profile.
              </p>
            </div>
            <div className="art">
              <AnimArt
                name="card-dm"
                label="A comment with a keyword becomes an automatic DM that captures an email lead for a listing"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Supported platforms and link tracking</p>
              <h2>Publish everywhere and <em className="s">see what gets clicks.</em></h2>
              <p>
                Short links in your posts and DMs show how many people tapped through. Add UTMs to the same link
                to separate traffic from each channel in your own analytics, then compare listings and market
                updates side by side.
              </p>
              <ul>
                {platforms.map((platform) => (
                  <li key={platform.name}>
                    <strong>{platform.name}:</strong> {platform.text}
                  </li>
                ))}
              </ul>
              <p className="small">
                Not sure which link to use? Build one with the free{" "}
                <Link className={s.vlink} href="/tools/instagram-utm-builder">
                  UTM builder
                </Link>{" "}
                before you schedule the post.
              </p>
            </div>
            <div className="art">
              <AnimArt
                name="card-leads"
                label="An illustrated dashboard shows clicks and leads coming from real estate listing posts"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Manual vs one scheduler</p>
            <h2>Doing it by hand vs <em className="s">one scheduler.</em></h2>
            <p>
              Both work. The difference is how much of a busy week you spend remembering, rewriting and replying.
            </p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Task</th>
                  <th scope="col" className={s.th}>Doing it manually</th>
                  <th scope="col" className={s.th}>With Poskoo</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.task} className={s.tr}>
                    <th scope="row" className={s.td}>{row.task}</th>
                    <td className={s.td}>{row.manual}</td>
                    <td className={s.td}>{row.poskoo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="band">
            <div className="copy">
              <p className="eyebrow">Free plan</p>
              <h2>Start free, <em className="s mark">upgrade when you grow.</em></h2>
              <p>
                The Free plan includes 2 social accounts, 10 scheduled posts a month, 500 auto-DMs a month and a
                link-in-bio page with 5 links. No card is needed to start.
              </p>
              <p>
                Pro and Agency add more accounts, unlimited scheduling, more auto-DMs, email capture and click
                and lead analytics. Compare every limit on the{" "}
                <Link className={s.vlink} href="/pricing">
                  pricing page
                </Link>
                .
              </p>
              <Link className="btn btn-dark" href="/signup">
                Create your free account <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="art">
              <AnimArt
                name="feat-calendar"
                label="A friendly calendar illustration shows a week of scheduled real estate posts"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Real estate scheduler FAQs</p>
            <h2>Listings, leads and limits</h2>
          </div>
          <div className="faq">
            {faqList.map((faq, index) => (
              <details key={faq.q} open={index === 0}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
          <p className="small" style={{ marginTop: 20, textAlign: "center" }}>
            Need a hand? Browse the{" "}
            <Link className={s.vlink} href="/tools">
              free social media tools
            </Link>
            , see the{" "}
            <Link className={s.vlink} href="/free-social-media-scheduler">
              free social media scheduler
            </Link>{" "}
            or read the{" "}
            <Link className={s.vlink} href="/social-media-scheduler-comparison">
              social media scheduler comparison
            </Link>{" "}
            before you{" "}
            <Link className={s.vlink} href="/signup">
              create your free account
            </Link>
            .
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Put your next listing <em className="s">on the calendar.</em></h2>
              <p>Start free, connect your accounts and schedule your first posts in a few minutes.</p>
              <Link className="btn" href="/signup">
                Start scheduling free <span aria-hidden="true">→</span>
              </Link>
            </div>
            <AnimArt
              name="feat-linkbio"
              label="An illustrated profile page with listing links ready to share"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
