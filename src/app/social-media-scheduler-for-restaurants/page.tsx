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

const PATH = "/social-media-scheduler-for-restaurants";
const title = `Social Media Scheduler for Restaurants | ${BRAND.name}`;
const description =
  "Schedule weekly menus, specials and event posts in one calendar, then auto-DM Instagram commenters your menu or booking link and capture leads.";

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
    title: "Weekly menu posts",
    text: "Post the new menu or the dish of the week with a photo, the price and a clear next step. Write it once, add the image and schedule it for the lunch and dinner rush.",
  },
  {
    n: "2",
    title: "Daily and weekly specials",
    text: "Plan specials a week ahead: happy hour, two-for-one Tuesdays, a seasonal dessert. Schedule each one to go out the morning it starts, not after the rush is over.",
  },
  {
    n: "3",
    title: "Events and live nights",
    text: "Promote quiz nights, live music, tasting menus and holiday dinners with a reminder the day before and a post on the day, including the time and how to book.",
  },
  {
    n: "4",
    title: "Behind the counter",
    text: "Share the kitchen, the team and the regulars. These posts build the local following that turns into bookings, and they are easy to batch on a quiet Monday.",
  },
];

const workflow = [
  {
    n: "1",
    title: "Plan the week on one calendar",
    text: "Open the week or month view and drop in a post for each menu change, special and event. Save drafts and come back to them between services.",
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
    title: "Turn comments into bookings",
    text: "Set a keyword such as MENU or BOOK. When someone comments it on Instagram, Poskoo sends your DM with the menu or booking link and can capture their email.",
  },
];

const platforms = [
  { name: "Instagram", text: "Menu photos, Reels, carousels and Stories through Meta's official API." },
  { name: "Facebook Pages", text: "Specials, events and opening-hours updates with text, images or a video link." },
  { name: "Threads", text: "Short specials and event reminders up to 500 characters, published through Meta." },
  { name: "LinkedIn", text: "Profile posts for hiring, supplier stories and neighbourhood updates." },
  { name: "YouTube", text: "Kitchen tours and Shorts with title, description, tags and privacy settings." },
  { name: "Bluesky and Mastodon", text: "Text posts with images, connected with an app password or OAuth." },
];

const comparison = [
  { task: "Posting the weekly menu", manual: "Post by hand on every app between services, or skip it on a busy week.", poskoo: "Add the menu once to the calendar and the queue publishes it on time." },
  { task: "Daily specials", manual: "A quick Story when someone remembers.", poskoo: "A week of specials planned in one sitting, each sent the morning it starts." },
  { task: "Event reminders", manual: "One post and hope people saw it.", poskoo: "A reminder the day before and a post on the day, scheduled in advance." },
  { task: "Answering menu questions", manual: "Reply by hand and send the same link to every person.", poskoo: "Keyword rules send the menu or booking link and capture the email automatically." },
  { task: "Knowing what worked", manual: "Check each app's insights separately.", poskoo: "Clicks and leads sit next to the post that produced them." },
];

const faqs = [
  {
    q: "Can I schedule menu and specials posts for my restaurant?",
    a: "Yes. Add the photos, caption and link, then schedule the post for Instagram, Facebook Pages, Threads, LinkedIn, YouTube, Bluesky or Mastodon. Poskoo publishes through each platform's official API at the time you set, and shows a published or failed status so you know what went out.",
  },
  {
    q: "How does the Instagram keyword DM for a menu or booking link work?",
    a: "Write a post that asks people to comment a keyword such as MENU or BOOK. When someone comments it, Poskoo sends the DM you wrote with your menu or booking link, can ask for an email first, and records the click. You can pause the rule at any time without deleting it.",
  },
  {
    q: "Can I capture emails before sending the booking link?",
    a: "Yes, on the Pro and Agency plans. The auto-DM asks for an email first, then delivers the menu or booking link. Every lead is stored with the post and the keyword that produced it, and you can export the list as a CSV.",
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
    name: `${BRAND.name} social media scheduler for restaurants`,
    description,
    url: `${BRAND.canonicalUrl}${PATH}`,
  }),
  featureList: [
    "Week and month content calendar",
    "Schedule weekly menu and specials posts",
    "Schedule event and live night reminders",
    "Instagram comment-to-DM automation",
    "Menu and booking link delivery by DM",
    "Email lead capture in DMs",
    "Click and lead tracking",
    "Publishing status and retries",
  ],
  offers: softwareOffers(planReadiness()),
};

export default function SocialMediaSchedulerForRestaurantsPage() {
  return (
    <PublicShell
      className={s.sched}
      breadcrumbs={[{ name: "Social media scheduler for restaurants", path: PATH }]}
    >
      {[appJsonLd, faqJsonLd(faqs)].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ldJson(data) }}
        />
      ))}

      <header className="hero">
        <div className={s.heroText}>
          <span className="pill">Free plan · No credit card needed</span>
          <p className="eyebrow">Social media scheduler for restaurants</p>
          <h1>
            Social media scheduler for <em className="s mark">restaurants</em>
          </h1>
          <p className="lede">
            Poskoo is a social media scheduler for restaurants, cafés and bars. Plan weekly menus, specials and
            event posts in one calendar, then auto-DM Instagram commenters your menu or booking link and capture
            leads.
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
            label="A restaurant owner schedules menu, specials and event posts for several social platforms from one calendar"
          />
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">What to post</p>
            <h2>Four post types that keep your calendar full.</h2>
            <p>
              Restaurant content does not need a big production. A steady mix of menus, specials, events and
              behind-the-counter posts is enough to stay visible between services.
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
                Add each menu change, special and event to the calendar when you plan the week, then let the
                queue handle the posting while you are on the floor.
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
                <Link className={s.vlink} href="/social-media-scheduler">
                  social media scheduler
                </Link>{" "}
                and add the rest as you grow.
              </p>
            </div>
            <div className="art">
              <AnimArt
                name="demo-schedule"
                label="A weekly calendar fills with menu posts, specials and event reminders for a restaurant"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Comment-to-DM for menus and bookings</p>
              <h2>Turn menu comments into <em className="s">bookings.</em></h2>
              <p>
                A menu or event post can ask people to comment a keyword. When they do, Poskoo sends the DM you
                wrote with your menu or booking link, asks for an email before the link, and records the click so
                you can see which post brought it in. See the{" "}
                <Link className={s.vlink} href="/instagram-auto-dm">
                  Instagram auto-DM
                </Link>{" "}
                workflow for the full picture.
              </p>
              <ul>
                <li>Keyword rules for comments, Story replies and DMs.</li>
                <li>Email gate before the menu or booking link is sent.</li>
                <li>Pause a rule at any time without losing it.</li>
                <li>Click and lead counts next to each menu or event post.</li>
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
                for the menu and booking links in your profile.
              </p>
            </div>
            <div className="art">
              <AnimArt
                name="card-dm"
                label="A comment with a keyword becomes an automatic DM that sends a restaurant menu and captures an email lead"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Supported channels</p>
            <h2>Where restaurants can <em className="s">publish today.</em></h2>
            <p>
              These are the channels Poskoo publishes to right now, through each platform&apos;s official API.
              Pick the ones your guests already use and add more later.
            </p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr className={s.tr}>
                  <th scope="col" className={s.th}>Channel</th>
                  <th scope="col" className={s.th}>What restaurants post</th>
                  <th scope="col" className={s.th}>How it works</th>
                </tr>
              </thead>
              <tbody>
                {platforms.map((row) => (
                  <tr key={row.name} className={s.tr}>
                    <th scope="row" className={s.td}>{row.name}</th>
                    <td className={s.td}>{row.text}</td>
                    <td className={s.td}>Scheduled in Poskoo and published automatically at the time you set.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small" style={{ marginTop: 16 }}>
            TikTok, Pinterest, X and Google Business Profile are built and waiting for each platform&apos;s API
            approval. They are not listed as available until they are switched on.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Manual vs one scheduler</p>
            <h2>Doing it by hand vs <em className="s">one scheduler.</em></h2>
            <p>
              Both work. The difference is how much of a busy service you spend remembering, rewriting and
              replying.
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
                label="A friendly calendar illustration shows a week of scheduled restaurant posts"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Restaurant scheduler FAQs</p>
            <h2>Menus, bookings and limits</h2>
          </div>
          <div className="faq">
            {faqs.map((faq, index) => (
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
            <Link className={s.vlink} href="/social-media-scheduler">
              social media scheduler
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
              <h2>Put your next menu <em className="s">on the calendar.</em></h2>
              <p>Start free, connect your accounts and schedule your first posts in a few minutes.</p>
              <Link className="btn" href="/signup">
                Start scheduling free <span aria-hidden="true">→</span>
              </Link>
            </div>
            <AnimArt
              name="feat-linkbio"
              label="An illustrated profile page with menu and booking links ready to share"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
