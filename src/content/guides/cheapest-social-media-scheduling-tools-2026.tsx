import Link from "next/link";
import { Callout, Ext, GuideTable, InlineCta, type GuideBody } from "@/components/guides/GuideBlocks";
import { POSKOO } from "./poskooFacts";

// Competitor facts come from each vendor's own pricing or help page, opened November 12, 2026.
const SRC = {
  buffer: "https://buffer.com/pricing",
  later: "https://later.com/pricing/",
  metricool: "https://metricool.com/pricing/",
  publer: "https://publer.com/help/en/article/what-are-publers-plans-and-pricing-15h4yqh/",
  planoly: "https://www.planoly.com/pricing",
  socialbee: "https://socialbee.com/pricing/",
  metaSuite: "https://www.facebook.com/business/tools/meta-business-suite",
};

/* ---------- Article ---------- */

export const body: GuideBody = {
  intro: (
    <>
      <p>
        A scheduler should save you time, not eat a big chunk of what a small account earns. The good news: in 2026
        you can schedule posts across several networks for free, or for less than the price of a lunch each month.
        The catch is that every tool counts differently. Some charge per channel, some per &quot;social set&quot;,
        some per brand, and free plans are capped in different ways.
      </p>
      <p>
        We compared eight cheap and free schedulers on what you actually pay for a typical setup.{" "}
        <strong>
          Short answer: Meta Business Suite is free if you only post to Facebook and Instagram, Buffer and Publer are
          the cheapest for one or two channels, and a flat plan like Poskoo Pro or Metricool Starter wins once you
          manage five or more accounts.
        </strong>{" "}
        Prices were checked in November 2026 and may change.
      </p>
      <Callout kind="warning" title="Disclosure: we make Poskoo">
        <p>
          Poskoo makes this guide and we list ourselves first. Here&apos;s how we compared: every price and limit for
          other tools comes from that vendor&apos;s own pricing or help page, we left out what we could not confirm,
          and we point out where another tool is cheaper than us. Our criteria are in{" "}
          <a href="#how-we-picked">How we picked</a>.
        </p>
      </Callout>
    </>
  ),
  sections: [
    {
      id: "quick-comparison",
      title: "Quick comparison",
      body: (
        <>
          <GuideTable
            caption="Cheap social media schedulers compared (prices checked November 2026)"
            head={["Tool", "Free plan", "Cheapest paid plan", "Pricing unit", "Best for"]}
            rows={[
              ["Poskoo", "2 accounts, 10 scheduled posts/mo", `${POSKOO.proPrice}, 5 accounts${POSKOO.soon}`, "Flat per plan", "Scheduling plus Instagram auto-DM"],
              ["Meta Business Suite", "Free", "None", "Free", "Facebook and Instagram only"],
              ["Buffer", "3 channels, 10 queued posts each", "Essentials $5/mo per channel (yearly)", "Per channel", "One or two channels"],
              ["Publer", "3 accounts, 10 queued posts each", "Professional from $5/mo", "Per account and member", "Cheap multi-network posting"],
              ["Metricool", "1 brand, 20 posts/mo", "Starter from $20/mo yearly", "Per brand tier", "Scheduling plus analytics"],
              ["Planoly", "Mobile app, 10 uploads/mo", "Starter $14/mo", "Per social set", "Visual Instagram planning"],
              ["Later", "None (14-day trial)", "Starter $18.75/mo yearly", "Per social set", "Instagram-first creators"],
              ["SocialBee", "None (14-day trial)", "Bootstrap $29/mo ($290/yr)", "Per plan", "Evergreen content categories"],
            ]}
          />
          <p>
            &quot;Yearly&quot; means the monthly rate when you pay for a year up front. Paying month to month usually
            costs more.
          </p>
        </>
      ),
    },
    {
      id: "how-we-picked",
      title: "How we picked",
      body: (
        <>
          <p>We focused on solo creators and small businesses, and scored each tool on:</p>
          <ul>
            <li><strong>Real monthly cost</strong> for one account, three accounts and five accounts, including per-channel fees.</li>
            <li><strong>Free plan limits</strong>: how many accounts and posts before you have to pay.</li>
            <li><strong>Networks that work today</strong>, not ones listed as coming soon.</li>
            <li><strong>Instagram support</strong>: feed posts, Reels, carousels and Stories, since that is where most small accounts start.</li>
            <li><strong>Hidden costs</strong>: post caps, paid add-ons for X, extra users or extra social sets.</li>
          </ul>
          <p>
            We left out enterprise suites such as Hootsuite and Sprout Social. They are good tools but not cheap; see
            our <Link href="/hootsuite-alternative">Hootsuite alternative</Link> and{" "}
            <Link href="/sprout-social-alternative">Sprout Social alternative</Link> pages if you are moving off one.
          </p>
        </>
      ),
    },
    {
      id: "the-tools",
      title: "The 8 cheapest social media schedulers",
      body: (
        <>
          <h3>1. Poskoo: flat price, scheduling and auto-DM together</h3>
          <p>
            Poskoo schedules posts to {POSKOO.socialNetworks} from one calendar. On Instagram that includes feed posts, Reels, carousels and Stories. It also sends{" "}
            <Link href="/instagram-auto-dm">automatic DMs to people who comment a keyword</Link>, which most cheap
            schedulers do not do.
          </p>
          <ul>
            <li><strong>Price:</strong> Free plan with 2 social accounts, 10 scheduled posts a month and 500 auto-DMs. {POSKOO.paidLead}{POSKOO.proPrice} for 5 accounts and unlimited scheduling. {POSKOO.agencyPrice} for 25 accounts. See <Link href="/pricing">pricing</Link>.</li>
            <li><strong>Why it is cheap:</strong> one flat price, not per channel. Five accounts on Pro cost the same as two.</li>
            <li><strong>Cons:</strong> the free plan has fewer posts than Buffer&apos;s or Publer&apos;s. {POSKOO.pendingSentence} Auto-DM is Instagram only.</li>
          </ul>
          <p><strong>Best for:</strong> creators and small businesses on 3 to 5 accounts who also want comment-to-DM.</p>

          <h3>2. Meta Business Suite: free for Facebook and Instagram</h3>
          <p>
            Meta&apos;s own <Ext href={SRC.metaSuite}>Business Suite</Ext> lets you create or schedule posts, Stories
            and ads for your Facebook Page and linked Instagram account, with no subscription fee.
          </p>
          <ul>
            <li><strong>Cons:</strong> only Meta&apos;s apps, so nothing for LinkedIn, YouTube, Bluesky or others. Planning across brands is clunky.</li>
          </ul>
          <p>
            <strong>Best for:</strong> a local business that only posts to Facebook and Instagram. Outgrowing it? See
            our <Link href="/meta-business-suite-alternative">Meta Business Suite alternative</Link>.
          </p>

          <h3>3. Buffer: cheapest for one or two channels</h3>
          <p>
            <Ext href={SRC.buffer}>Buffer</Ext> is simple, well known and supports 12 networks, including Instagram,
            Facebook, LinkedIn, Threads, Bluesky, Mastodon, TikTok, Pinterest, YouTube and X.
          </p>
          <ul>
            <li><strong>Price:</strong> Free covers up to 3 channels with 10 scheduled posts per channel at a time. Essentials is $5/mo per channel and Team is $10/mo per channel, billed yearly. Channels after the tenth cost less.</li>
            <li><strong>Pricing quirk:</strong> per-channel pricing is great for one or two accounts but adds up. Five channels on Essentials is $25/mo billed yearly.</li>
            <li><strong>Cons:</strong> no comment-to-DM automation.</li>
          </ul>
          <p>
            <strong>Best for:</strong> a solo creator with one or two channels. More in our{" "}
            <Link href="/buffer-alternative">Buffer alternative</Link> comparison.
          </p>

          <h3>4. Publer: low entry price, pay per account</h3>
          <p>
            <Ext href={SRC.publer}>Publer</Ext> has a free forever plan and paid plans that start very low and grow
            with each account and team member you add.
          </p>
          <ul>
            <li><strong>Price:</strong> Free covers up to 3 social accounts (X excluded), 10 scheduled posts at a time per account and 25 drafts. Professional starts at $5/mo and Business at $10/mo for one account. Yearly billing saves 20%, and every tenth account or member is free.</li>
            <li><strong>Pricing quirk:</strong> the final price depends on how many accounts and members you add, so use Publer&apos;s calculator before you compare.</li>
            <li><strong>Cons:</strong> the free plan only keeps 24 hours of published post history.</li>
          </ul>
          <p>
            <strong>Best for:</strong> budget users who want many networks and can live with a per-account bill. See{" "}
            <Link href="/publer-alternative">Publer alternative</Link>.
          </p>

          <h3>5. Metricool: scheduling with strong analytics</h3>
          <p>
            <Ext href={SRC.metricool}>Metricool</Ext> mixes scheduling, analytics, competitor tracking and ad reports.
            Its pricing is by brand, and each brand can hold several networks.
          </p>
          <ul>
            <li><strong>Price:</strong> Free covers 1 brand, 20 scheduled posts a month, 30 days of analytics and 5 competitor profiles. Starter is from $20/mo billed yearly ($25 monthly) for up to 5 brands. Advanced is from $53/mo yearly.</li>
            <li><strong>Cons:</strong> LinkedIn is not on the free plan, and X needs a paid add-on. Prices exclude VAT.</li>
          </ul>
          <p>
            <strong>Best for:</strong> freelancers and small agencies who report on results. See{" "}
            <Link href="/metricool-alternative">Metricool alternative</Link>.
          </p>

          <InlineCta
            title="Plan a month of posts for free"
            text="Map out what goes where with the free content calendar, then schedule it in any tool you like."
            tool={{ href: "/tools/social-media-content-calendar", label: "Open the content calendar" }}
          />

          <h3>6. Planoly: visual Instagram grid planning</h3>
          <p>
            <Ext href={SRC.planoly}>Planoly</Ext> started as a visual Instagram planner and now covers Instagram,
            TikTok, LinkedIn, Facebook, YouTube, Threads and Pinterest.
          </p>
          <ul>
            <li><strong>Price:</strong> a free plan on the mobile app includes 10 uploads a month. Starter is $14/mo for 1 social set and 1 user, Growth $24/mo, Pro $47/mo. Annual plans save up to 15%. Paid plans have a 14-day trial.</li>
            <li><strong>Pricing quirk:</strong> a social set is one account per network. Starter cannot add extra sets or users.</li>
          </ul>
          <p>
            <strong>Best for:</strong> creators who care most about how their grid looks. See{" "}
            <Link href="/planoly-alternative">Planoly alternative</Link>.
          </p>

          <h3>7. Later: Instagram-first, with post caps</h3>
          <p>
            <Ext href={SRC.later}>Later</Ext> supports Instagram, Facebook, Threads, Pinterest, TikTok, LinkedIn,
            YouTube and Snapchat, with a visual calendar and creator-friendly features.
          </p>
          <ul>
            <li><strong>Price:</strong> no free plan, but a 14-day trial. Starter is $18.75/mo billed yearly for 1 social set (8 profiles, one per platform), 1 user and up to 30 posts per profile. Growth is $37.50/mo and Scale $82.50/mo, billed yearly.</li>
            <li><strong>Cons:</strong> monthly billing costs more, and the Starter post cap can bite if you post daily.</li>
          </ul>
          <p>
            <strong>Best for:</strong> Instagram and TikTok creators who post a few times a week. See{" "}
            <Link href="/later-alternative">Later alternative</Link>.
          </p>

          <h3>8. SocialBee: content categories and recycling</h3>
          <p>
            <Ext href={SRC.socialbee}>SocialBee</Ext> sorts posts into categories and can recycle evergreen content,
            which suits small businesses that repeat tips and offers.
          </p>
          <ul>
            <li><strong>Price:</strong> Bootstrap is $29/mo or $290/yr for 5 profiles and 1 user. Accelerate is $49/mo or $490/yr for 10 profiles. A 14-day trial needs no card.</li>
            <li><strong>Cons:</strong> the priciest entry plan on this list, and no free plan.</li>
          </ul>
          <p><strong>Best for:</strong> businesses with an evergreen library to reuse.</p>
        </>
      ),
    },
    {
      id: "cost-by-setup",
      title: "What you'll pay for a typical setup",
      body: (
        <>
          <p>
            Here is the cheapest plan in each tool for a common case: <strong>5 accounts</strong> (say Instagram,
            Facebook, Threads, LinkedIn and YouTube), one user, billed yearly.
          </p>
          <GuideTable
            caption="Five accounts, one user, yearly billing (November 2026)"
            head={["Tool", "Plan", "About per month", "Notes"]}
            rows={[
              ["Poskoo", `Pro${POSKOO.soon}`, POSKOO.proYearly, "Unlimited scheduled posts, plus 2,500 auto-DMs"],
              ["Buffer", "Essentials x 5 channels", "$25", "$5 per channel"],
              ["Later", "Starter", "$18.75", "1 social set, up to 30 posts per profile"],
              ["Metricool", "Starter", "$20", "Up to 5 brands, LinkedIn included"],
              ["Planoly", "Starter", "Under $14", "$14 monthly, up to 15% off yearly"],
              ["SocialBee", "Bootstrap", "About $24", "$290 a year for 5 profiles"],
              ["Meta Business Suite", "Free", "$0", "Only Facebook and Instagram"],
            ]}
          />
          <p>
            Publer is left out because its price depends on its calculator, but with paid plans from $5/mo for one
            account it is worth checking at one or two accounts. For a single channel, Buffer Essentials at $5/mo is
            hard to beat.
          </p>
          <Callout kind="tip" title="Free plans can cover a lot">
            <p>
              Posting three times a week to two networks is about 26 posts a month. Buffer and Publer cap posts{" "}
              <em>queued at once</em>, not per month, so you can stay free if you top up the queue each week.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "who-should-pick-what",
      title: "Who should pick what",
      body: (
        <GuideTable
          caption="Quick picks"
          head={["If you", "Start with", "Why"]}
          rows={[
            ["Only post to Facebook and Instagram", "Meta Business Suite", "Free and made by Meta"],
            ["Have one or two channels", "Buffer or Publer", "Lowest per-channel prices and free plans"],
            ["Manage 3 to 5 accounts and want comment-to-DM", "Poskoo", "Flat price, scheduler and auto-DM in one"],
            ["Need client reports", "Metricool", "Analytics and competitor tracking built in"],
            ["Care most about your Instagram grid", "Planoly or Later", "Visual grid planning"],
            ["Reuse evergreen posts", "SocialBee", "Content categories and recycling"],
          ]}
        />
      ),
    },
    {
      id: "save-money",
      title: "5 ways to spend less on scheduling",
      body: (
        <>
          <ol>
            <li><strong>Pay yearly once you are sure.</strong> Most tools knock 15 to 30% off. Use a monthly plan for the first month, then switch.</li>
            <li><strong>Drop channels you never post to.</strong> On per-channel tools, every connected account costs money.</li>
            <li><strong>Batch your posts.</strong> One sitting a week keeps you inside free queue limits. The <Link href="/tools/instagram-scheduling-checklist">scheduling checklist</Link> helps.</li>
            <li><strong>Post when your audience is online.</strong> Fewer, better-timed posts beat a packed queue. Try the <Link href="/tools/best-time-to-post-on-instagram">best time to post tool</Link>.</li>
            <li><strong>Avoid paying for two tools.</strong> If you also want Instagram comment-to-DM, a scheduler that includes it can replace a separate subscription.</li>
          </ol>
          <p>
            For a side-by-side feature view, see our{" "}
            <Link href="/social-media-scheduler-comparison">social media scheduler comparison</Link> and the{" "}
            <Link href="/instagram-scheduler">Instagram scheduler</Link>.
          </p>
          <InlineCta
            title="Schedule your first week free"
            text="Poskoo's free plan covers 2 accounts and 10 scheduled posts a month, plus 500 auto-DMs. No credit card."
            tool={{ href: "/tools/instagram-posting-frequency-calculator", label: "Find your posting pace" }}
          />
        </>
      ),
    },
  ],
  sources: [
    { label: "Buffer: Pricing", href: SRC.buffer },
    { label: "Later: Pricing", href: SRC.later },
    { label: "Metricool: Pricing", href: SRC.metricool },
    { label: "Publer Help Center: Plans and pricing", href: SRC.publer },
    { label: "Planoly: Pricing", href: SRC.planoly },
    { label: "SocialBee: Pricing", href: SRC.socialbee },
    { label: "Meta: Meta Business Suite", href: SRC.metaSuite },
  ],
};
