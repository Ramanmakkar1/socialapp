import Link from "next/link";
import { Callout, DayList, Ext, GuideTable, InlineCta, type GuideBody } from "@/components/guides/GuideBlocks";

// Sources (all opened while writing, November 2026).
const SRC = {
  ypp: "https://support.google.com/youtube/answer/72851",
  imh: "https://influencermarketinghub.com/influencer-marketing-benchmark-report/",
  shopifyCollabs: "https://help.shopify.com/en/manual/promoting-marketing/collabs/creators/payments",
  original: "https://creators.instagram.com/blog/rewarding-original-creators-on-instagram",
  paidPartnership: "https://help.instagram.com/1109894795810258",
  ftc: "https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers",
  adStandards: "https://adstandards.ca/wp-content/uploads/Ad-Standards-Influencer-Marketing-Disclosure-Guidelines-2025-10-08.pdf",
};

export const body: GuideBody = {
  intro: (
    <>
      <p>
        Most advice about making money on social media starts with a screenshot of someone else&apos;s payout. This
        guide doesn&apos;t. There is no promised number here, because what you earn depends on your niche, your
        audience and what you sell, and anyone who tells you otherwise is guessing.
      </p>
      <p>
        What we can give you is the honest map: <strong>the eight ways people actually earn from social media, what
        each one needs before it pays, and a step-by-step plan to get your first income</strong> without waiting for
        a huge following.
      </p>
    </>
  ),
  sections: [
    {
      id: "honest-picture",
      title: "The honest picture before you start",
      body: (
        <>
          <p>
            Social media income rarely comes from one place. Creators who earn steadily usually stack two or three
            streams: an affiliate link here, a small product there, a service for people who want more help. Each
            one is small at first. Together they add up.
          </p>
          <p>Three things are true for almost everyone who gets there:</p>
          <ul>
            <li>
              <strong>Trust comes before money.</strong> People buy from accounts that have helped them for free,
              many times, in a specific area.
            </li>
            <li>
              <strong>Owned contacts beat followers.</strong> A follower can miss your post. An email address or a DM
              conversation is a direct line.
            </li>
            <li>
              <strong>Original work wins reach.</strong> Instagram says it now{" "}
              <Ext href={SRC.original}>limits recommendations for accounts that mostly repost</Ext> content they did
              not make, so the &quot;repost and monetize&quot; shortcut is closing.
            </li>
          </ul>
          <Callout kind="warning" title="Skip anything that promises fast money">
            <p>
              Courses that guarantee income, &quot;engagement pods&quot; and bought followers all waste time. Bought
              followers don&apos;t buy anything, and they make your real numbers look worse to brands.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "ways-to-earn",
      title: "8 realistic ways to make money on social media",
      body: (
        <>
          <p>Here is the short version. Details for each one follow.</p>
          <GuideTable
            caption="Ways to earn, compared"
            head={["Way to earn", "Who pays you", "Needs a big audience?"]}
            rows={[
              ["Brand deals", "Brands, for posts on your account", "No fixed minimum, but reach and fit matter"],
              ["Affiliate links", "Brands or networks, per sale", "No"],
              ["Digital products", "Your audience", "No"],
              ["Services and coaching", "Clients", "No"],
              ["UGC", "Brands, for videos they post", "No"],
              ["Creator programs and ad revenue", "The platform", "Yes, platform minimums apply"],
              ["Subscriptions and fan support", "Your most loyal followers", "Usually, plus eligibility rules"],
              ["Lead gen for local business", "Your own customers", "No"],
            ]}
          />

          <h3>1. Brand deals</h3>
          <p>
            A brand pays you to feature its product in a post, Reel or Story on your account. Fit matters more than
            size: a skincare brand would rather pay a small account full of skincare buyers than a big general one.
            Influencer Marketing Hub&apos;s <Ext href={SRC.imh}>2026 benchmark report</Ext> describes budgets
            continuing to move toward nano and micro creators. Start by pitching brands you already use, with a short
            note on who follows you and one idea for the post.
          </p>

          <h3>2. Affiliate links</h3>
          <p>
            You share a tracked link and earn a commission when someone buys. It works at any size because you are
            paid on results, not reach. Pick products you actually use, then explain how you use them. Store
            programs like <Ext href={SRC.shopifyCollabs}>Shopify Collabs</Ext> let you apply to individual brands.
          </p>

          <h3>3. Digital products</h3>
          <p>
            Templates, checklists, presets, meal plans, short guides, recorded workshops. You make it once and sell
            it many times. The best first product answers the question you get asked most in comments and DMs.
            Keep it small and cheap enough to be an easy yes.
          </p>

          <h3>4. Services and coaching</h3>
          <p>
            Often the fastest route to real income, because a handful of clients can matter more than thousands of
            followers. A photographer sells shoots, a fitness creator sells coaching, a career creator sells resume
            reviews. Your content is the proof that you know what you are doing.
          </p>

          <h3>5. UGC (user-generated content)</h3>
          <p>
            Brands pay you to make videos they run on their own accounts or in ads. Your follower count barely
            matters, since the video never goes on your profile. What matters is a clean, natural on-camera style and
            a small portfolio. Make three sample videos for products you own and put them on a simple page.
          </p>

          <h3>6. Creator programs and ad revenue</h3>
          <p>
            Some platforms share ad money or pay for views. These have the highest bar. YouTube, for example, opens
            its <Ext href={SRC.ypp}>Partner Program</Ext> at 1,000 subscribers plus either 4,000 public watch hours in
            the last 12 months or 10 million Shorts views in the last 90 days. TikTok&apos;s Creator Rewards Program
            also has follower and view minimums, listed in TikTok Studio. Treat these payouts as a bonus on top of
            other income, not the plan.
          </p>

          <h3>7. Subscriptions and fan support</h3>
          <p>
            Paid subscriptions, tips and gifts let your biggest fans pay for extra content. Each platform sets its own
            eligibility rules (age, country, followers), and they change, so check the monetization section of your
            professional dashboard. This works best once you already have people asking for more.
          </p>

          <h3>8. Lead generation for a local business</h3>
          <p>
            If you run a salon, clinic, trade, studio or shop, your account doesn&apos;t need to &quot;monetize&quot;
            at all. It needs to bring in bookings and quote requests. A local account with a few hundred followers
            in the right city can be worth more than a viral one. Every post should make it easy to ask a question
            or book.
          </p>
        </>
      ),
    },
    {
      id: "how-many-followers",
      title: "How many followers do you actually need?",
      body: (
        <>
          <p>
            Fewer than you think for most paths, and an exact number for a few. The table sticks to what platforms
            publish. Where there is no published rule, we say so.
          </p>
          <GuideTable
            caption="Follower requirements by path"
            head={["Path", "Published minimum", "What really decides it"]}
            rows={[
              ["Affiliate links", "None for most programs", "Trust and relevance to the product"],
              ["Digital products", "None", "Solving one clear problem"],
              ["Services and coaching", "None", "Proof you can do the work"],
              ["UGC", "None", "Video quality and a portfolio"],
              ["Brand deals", "None (varies by brand)", "Audience fit, engagement, past results"],
              [
                "YouTube Partner Program",
                <>1,000 subscribers plus watch hours or Shorts views (<Ext href={SRC.ypp}>YouTube Help</Ext>)</>,
                "Meeting the bar only lets you apply; YouTube reviews the channel",
              ],
              ["TikTok Creator Rewards", "Follower and view minimums set by TikTok", "Original videos that meet length rules"],
              ["Subscriptions and gifts", "Varies by platform and country", "A loyal core of fans"],
            ]}
          />
          <Callout kind="tip" title="Engagement says more than follower count">
            <p>
              Brands look at how many people react to your posts compared with how many follow you. Work out your own
              rate with the free <Link href="/tools/instagram-engagement-rate-calculator">engagement rate calculator</Link>{" "}
              before you pitch, so you can quote real numbers.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "step-by-step",
      title: "A step-by-step plan to your first income",
      body: (
        <>
          <p>
            This plan assumes you are starting small. It focuses on the paths that don&apos;t need permission from a
            platform: affiliate, services, a small product and leads.
          </p>
          <DayList
            days={[
              {
                title: "Step 1: Pick one audience and one problem.",
                body: (
                  <>
                    {" "}&quot;Meal prep for shift workers&quot; is easier to sell to than &quot;food&quot;. If you are
                    still choosing, start with our guide to the{" "}
                    <Link href="/guides/best-instagram-niches-2026">best Instagram niches for 2026</Link>.
                  </>
                ),
              },
              {
                title: "Step 2: Set up your profile to sell.",
                body: (
                  <>
                    {" "}Your bio should say who you help and how, and your link should go somewhere useful. Draft a bio
                    with the <Link href="/tools/instagram-bio-generator">bio generator</Link>, then build a{" "}
                    <Link href="/instagram-link-in-bio">link in bio page</Link> with your offer, your best free resource
                    and a way to contact you.
                  </>
                ),
              },
              {
                title: "Step 3: Post helpful content on a schedule you can keep.",
                body: (
                  <>
                    {" "}Three solid posts a week for three months beats a daily plan you drop in week two. Batch them
                    and queue them with a <Link href="/instagram-scheduler">scheduler</Link>.
                  </>
                ),
              },
              {
                title: "Step 4: Collect contacts, not just likes.",
                body: (
                  <>
                    {" "}Offer a free checklist or template in exchange for an email. This list is what you will sell to
                    later, and nobody can take it away with an algorithm change.
                  </>
                ),
              },
              {
                title: "Step 5: Make your first offer.",
                body: (
                  <>
                    {" "}Pick the easiest one for your niche: an affiliate link for a tool you use, a paid session, or a
                    small digital product. Tell people about it plainly, more than once.
                  </>
                ),
              },
              {
                title: "Step 6: Ask what people want next.",
                body: (
                  <>
                    {" "}Read every comment and DM. The questions people repeat are your next posts, your next product
                    and the proof you can show a brand.
                  </>
                ),
              },
              {
                title: "Step 7: Track what earns, then do more of it.",
                body: (
                  <>
                    {" "}Tag your links with the <Link href="/tools/instagram-utm-builder">UTM builder</Link> so you
                    know which posts send buyers, not just clicks.
                  </>
                ),
              },
            ]}
          />
        </>
      ),
    },
    {
      id: "comment-to-dm",
      title: "How comment-to-DM, link in bio and products fit together",
      body: (
        <>
          <p>
            The hardest moment in social selling is the jump from &quot;I like this post&quot; to &quot;I clicked
            the link&quot;. On Instagram, links in captions aren&apos;t clickable, so people have to visit your
            profile, find the link and tap it. Many don&apos;t.
          </p>
          <p>
            <strong>Comment-to-DM closes that gap.</strong> You end a post with &quot;Comment GUIDE and I&apos;ll
            send it to you&quot;, and everyone who comments that word gets the link in their DMs right away. The
            comments also tell Instagram people care about the post.
          </p>
          <h3>A simple funnel that works at any size</h3>
          <ol>
            <li>
              <strong>Post:</strong> a Reel or carousel that solves part of a problem.
            </li>
            <li>
              <strong>Comment keyword:</strong> people ask for the full checklist.
            </li>
            <li>
              <strong>DM:</strong> the link arrives, optionally after they share an email.
            </li>
            <li>
              <strong>Link in bio:</strong> the same freebie, your paid offer and your booking link live on one page
              for profile visitors.
            </li>
            <li>
              <strong>Product or service:</strong> people who liked the free thing are the most likely to buy.
            </li>
          </ol>
          <p>
            Poskoo is built around this flow. <Link href="/instagram-auto-dm">Instagram auto-DM</Link> sends your
            link to everyone who comments a keyword, and can collect an email first. The{" "}
            <Link href="/instagram-link-in-bio">link in bio page</Link> holds your offers, and lead magnets hand out a
            free file once someone shares their email. You can also create digital product pages paid through your
            own Stripe account (payments are switching on soon). Auto-DM works on Instagram; scheduling covers
            Instagram, Facebook Pages, Threads, YouTube, LinkedIn, Bluesky and Mastodon. The{" "}
            <Link href="/pricing">free plan</Link> includes auto-DMs and a link in bio page, so you can test the
            funnel before paying for anything.
          </p>
          <InlineCta
            title="Turn comments into contacts"
            text="Send your link to everyone who comments a keyword, capture emails in the DM and keep your offers on one link in bio page. Free plan, no credit card."
            tool={{ href: "/tools/instagram-comment-to-dm-calculator", label: "Estimate your comment-to-DM leads" }}
          />
        </>
      ),
    },
    {
      id: "pricing-and-pitching",
      title: "Pricing your work and pitching brands",
      body: (
        <>
          <p>
            There is no standard rate card, and published &quot;rates per follower&quot; vary so much they are not
            worth anchoring on. Price from your side instead:
          </p>
          <ul>
            <li>
              <strong>Time:</strong> how long does the post, video or session take, including edits and calls?
            </li>
            <li>
              <strong>Usage:</strong> if a brand wants to run your video as an ad, that is worth more than a post on
              your own account. Agree how long and where they can use it.
            </li>
            <li>
              <strong>Results:</strong> if you have past numbers (clicks, sales, sign-ups), share them. Results are
              the best argument for a higher price.
            </li>
          </ul>
          <Callout kind="example" title="A short pitch that gets replies">
            <p>
              &quot;Hi, I post meal-prep ideas for nurses and shift workers. I&apos;ve used your containers for a year
              and my followers ask about them often. Idea: a Reel prepping a week of night-shift lunches with them.
              Happy to send recent results. Would you be open to a paid post?&quot;
            </p>
          </Callout>
          <p>
            Keep each pitch personal, short and about the brand&apos;s customers. Write captions for paid posts with
            the <Link href="/tools/instagram-caption-generator">caption generator</Link>, then edit them into your own
            voice.
          </p>
        </>
      ),
    },
    {
      id: "mistakes",
      title: "Mistakes that slow down your first dollar",
      body: (
        <>
          <ul>
            <li>
              <strong>Waiting for a follower milestone.</strong> Most paths have no minimum. Start offering something
              small now.
            </li>
            <li>
              <strong>Selling in every post.</strong> If most posts are pitches, people tune out. Keep the bulk of your
              content useful on its own.
            </li>
            <li>
              <strong>Promoting products you haven&apos;t used.</strong> One bad recommendation can cost more trust
              than ten good ones earn.
            </li>
            <li>
              <strong>Relying on one platform.</strong> Reach changes overnight. An email list and a page you control
              protect you.
            </li>
            <li>
              <strong>Making a big product first.</strong> A 60-page course nobody asked for is a common trap. Sell
              something small, learn, then grow it.
            </li>
            <li>
              <strong>Ignoring DMs.</strong> Most sales happen in conversations. Fast, friendly replies matter more
              than polish.
            </li>
          </ul>
          <Callout kind="warning" title="Disclose paid posts and affiliate links">
            <p>
              Use Instagram&apos;s <Ext href={SRC.paidPartnership}>paid partnership label</Ext> for brand deals and
              say clearly when a link earns you money. See the FTC&apos;s{" "}
              <Ext href={SRC.ftc}>Disclosures 101 for Social Media Influencers</Ext> (US) and Ad Standards&apos;{" "}
              <Ext href={SRC.adStandards}>Influencer Marketing Disclosure Guidelines</Ext> (Canada). Rules apply even
              if the product was free.
            </p>
          </Callout>
        </>
      ),
    },
  ],
  sources: [
    { label: "YouTube Help: YouTube Partner Program overview and eligibility", href: SRC.ypp },
    { label: "Influencer Marketing Hub: Influencer Marketing Benchmark Report 2026", href: SRC.imh },
    { label: "Shopify Help Center: Getting paid on Shopify Collabs", href: SRC.shopifyCollabs },
    { label: "Instagram for Creators: Rewarding original creators on Instagram (April 2026)", href: SRC.original },
    { label: "Instagram Help Center: Paid partnership label", href: SRC.paidPartnership },
    { label: "FTC: Disclosures 101 for Social Media Influencers", href: SRC.ftc },
    { label: "Ad Standards: Influencer Marketing Disclosure Guidelines (2025)", href: SRC.adStandards },
  ],
};
