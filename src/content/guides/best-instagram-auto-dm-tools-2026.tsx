import Link from "next/link";
import { Callout, Ext, GuideTable, InlineCta, type GuideBody } from "@/components/guides/GuideBlocks";
import { POSKOO } from "./poskooFacts";

// Competitor facts come from each vendor's own pricing page, opened November 12, 2026.
const SRC = {
  manychat: "https://manychat.com/pricing",
  creatorflow: "https://creatorflow.so/pricing",
  linkdm: "https://linkdm.com/pricing",
  inro: "https://inro.social/pricing",
  zorcha: "https://zorcha.com/pricing",
  replyrush: "https://www.replyrush.com/pricing",
};

/* ---------- Article ---------- */

export const body: GuideBody = {
  intro: (
    <>
      <p>
        &quot;Comment GUIDE and I&apos;ll send it to you&quot; is one of the most useful lines on Instagram. It turns a
        post into a conversation, and a conversation into a click, a sale or an email address. Doing it by hand stops
        working the day a post gets more than a few dozen comments. That is what auto-DM tools are for.
      </p>
      <p>
        We compared seven comment-to-DM tools on price, monthly limits, lead capture and how easy they are to set up.{" "}
        <strong>
          Short answer: pick a flat-priced tool with a free plan for simple keyword-to-link DMs, and pick ManyChat or
          Inrō when you need full chat flows, many channels or a team inbox.
        </strong>{" "}
        Prices were checked in November 2026 and may change.
      </p>
      <Callout kind="warning" title="Disclosure: we make Poskoo">
        <p>
          Poskoo makes this guide and we list ourselves first. Here&apos;s how we compared: every price and limit for
          other tools comes from that vendor&apos;s own pricing page, we left out anything we could not confirm, and
          we say where another tool beats us. Our criteria are in{" "}
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
          <p>
            Entry prices below are the lowest paid plan. Some vendors show the yearly-billed rate by default, so we
            note which one you are looking at. &quot;Per month&quot; limits reset monthly.
          </p>
          <GuideTable
            caption="Instagram auto-DM tools compared (prices checked November 2026)"
            head={["Tool", "Free plan", "Cheapest paid plan", "How usage is counted", "Best for"]}
            rows={[
              ["Poskoo", "500 auto-DMs/mo, 2 social accounts", `${POSKOO.proPrice}, 2,500 DMs${POSKOO.soon}`, "DMs sent", "Auto-DM plus a post scheduler in one"],
              ["ManyChat", "25 active contacts/mo, ManyChat branding", "Essential $14/mo billed yearly, 250 contacts", "Active contacts", "Multi-channel chat flows"],
              ["CreatorFlow", "500 DMs/mo, 1 account", "Pro $15/mo ($12/mo yearly), 5,000 DMs per account", "DMs sent", "Low-cost Instagram-only DMs"],
              ["LinkDM", "1,000 DMs/mo, 1 account", "Pro $19/mo ($182/yr), 25,000 DMs", "DMs sent", "High DM volume on a budget"],
              ["Inrō", "100 activated contacts/mo", "Pro from €12.99/mo, metered", "Activated contacts", "CRM, campaigns and integrations"],
              ["Zorcha", "Unlimited DMs, limited features", "Pro $14.99/mo ($9.99/mo yearly)", "Features by plan", "Free plan with no DM cap"],
              ["ReplyRush", "1,500 DMs/mo, 1 account", "Lite $10/mo, 7,500 DMs", "DMs sent", "Cheap monthly plan, iOS app"],
            ]}
          />
          <p>
            Every tool here connects through Meta&apos;s official API, so you need an Instagram Business or Creator
            account. None of them should ask for your Instagram password.
          </p>
        </>
      ),
    },
    {
      id: "how-we-picked",
      title: "How we picked",
      body: (
        <>
          <p>We looked for tools that do Instagram comment-to-DM today, not on a roadmap, and scored them on:</p>
          <ul>
            <li>
              <strong>Real monthly cost.</strong> Not just the headline price, but what you pay at 500, 2,500 and
              10,000 DMs a month, and whether monthly billing costs more than the price on the card.
            </li>
            <li>
              <strong>How usage is counted.</strong> Per DM, per &quot;active contact&quot; or per feature. This
              changes your bill more than the plan name does.
            </li>
            <li>
              <strong>Lead capture.</strong> Can it ask for an email before sending the link, or check that someone
              follows you first? Which plan unlocks it?
            </li>
            <li>
              <strong>Setup time.</strong> Can a solo creator go from sign-up to a working keyword rule in about ten
              minutes?
            </li>
            <li>
              <strong>Safety.</strong> Official Meta API login only. We skipped tools that ask for passwords or use
              browser bots.
            </li>
          </ul>
          <p>
            We did not score support quality or uptime, because we could not measure them fairly for every tool.
          </p>
        </>
      ),
    },
    {
      id: "the-tools",
      title: "The 7 best Instagram auto-DM tools",
      body: (
        <>
          <h3>1. Poskoo: auto-DM and scheduling in one place</h3>
          <p>
            Poskoo is a social media scheduler with{" "}
            <Link href="/instagram-auto-dm">Instagram comment-to-DM</Link> built in. You write a post, pick a time and
            attach a keyword rule in the same step, so the rule is live the moment the post publishes. Rules work on
            feed posts and Reels, and you can also auto-reply to Story replies and to DMs that contain a keyword.
          </p>
          <ul>
            <li><strong>Price:</strong> Free plan with 500 auto-DMs a month. {POSKOO.paidLead}{POSKOO.proPrice} with 2,500 DMs. {POSKOO.agencyPrice} with 10,000 DMs and 25 social accounts. See <Link href="/pricing">pricing</Link>.</li>
            <li><strong>Lead capture:</strong> email capture in the DM and click and lead analytics on Pro and Agency. You can also send the link only after someone follows you.</li>
            <li><strong>Also includes:</strong> a scheduler for {POSKOO.socialNetworks}, plus a link-in-bio page.</li>
            <li><strong>Cons:</strong> auto-DM is Instagram only. DM limits are lower than LinkDM or CreatorFlow at a similar price. No visual flow builder for long multi-step chats.</li>
          </ul>
          <p>
            <strong>Best for:</strong> <Link href="/social-media-scheduler-for-creators">creators</Link> and small businesses who want to plan posts and send keyword DMs
            without paying for two tools.
          </p>

          <h3>2. ManyChat: the most complete chat automation platform</h3>
          <p>
            <Ext href={SRC.manychat}>ManyChat</Ext> is the best-known name in this space. It goes far beyond
            comment-to-DM: visual flow builder, broadcasts, an AI layer and channels including Instagram, Facebook
            Messenger, TikTok, WhatsApp, Telegram, SMS and email.
          </p>
          <ul>
            <li><strong>Price:</strong> Free covers 25 active contacts a month on 2 channels with ManyChat branding and up to 4 live triggers. Essential is $14/mo billed yearly ($168/yr) for 250 active contacts. Pro is $29/mo billed yearly ($348/yr) for 2,500. Monthly billing costs more.</li>
            <li><strong>Pricing quirk:</strong> you pay per <em>active contact</em>, meaning each person you interact with in a month. Above your allowance, extra contacts cost $0.10 each on Essential and $0.05 on Pro (monthly billing). A viral Reel can raise your bill.</li>
            <li><strong>Cons:</strong> more to learn than a single-purpose tool, and costs climb with audience size. No post scheduler.</li>
          </ul>
          <p>
            <strong>Best for:</strong> brands and creators who need multi-step flows, several channels or a shared
            inbox. If you only need keyword-to-link, see our <Link href="/manychat-alternative">ManyChat
            alternative</Link> page.
          </p>

          <h3>3. CreatorFlow: low price, Instagram focus</h3>
          <p>
            <Ext href={SRC.creatorflow}>CreatorFlow</Ext> does comment-to-DM, Story replies and keyword DM replies,
            with ready-made templates. It is priced by DM volume, not contacts.
          </p>
          <ul>
            <li><strong>Price:</strong> Free has 1 Instagram account and 500 DMs a month. Pro is $15/mo ($12/mo yearly) for 2 accounts and 5,000 DMs per account. Growth is $30/mo ($24/mo yearly) for 5 accounts. Extra DM packs start at 1,000 for $5.</li>
            <li><strong>Cons:</strong> the free plan leaves out the follow gate, email gate and link tracking. Its pricing page only mentions Instagram.</li>
          </ul>
          <p><strong>Best for:</strong> Instagram creators who want lots of DMs for a low flat price.</p>

          <h3>4. LinkDM: generous DM limits</h3>
          <p>
            <Ext href={SRC.linkdm}>LinkDM</Ext> covers post, Story and DM automations for Instagram, plus Facebook DM
            automation, and its limits are among the highest we found.
          </p>
          <ul>
            <li><strong>Price:</strong> Free connects 1 Instagram account with up to 1,000 DMs a month. Pro is $19/mo or $182/yr for up to 3 accounts and 25,000 DMs a month. Platinum+ is $99/mo for 10 accounts.</li>
            <li><strong>Cons:</strong> no post scheduler, so you still need a second tool to plan content.</li>
          </ul>
          <p><strong>Best for:</strong> accounts that run frequent <Link href="/tools/instagram-comment-picker">giveaways</Link> or launches with thousands of comments.</p>

          <h3>5. Inrō: a CRM for Instagram DMs</h3>
          <p>
            <Ext href={SRC.inro}>Inrō</Ext> treats DMs as a sales pipeline: contacts, folders, campaigns, an AI agent,
            webhooks and integrations through Make and Zapier.
          </p>
          <ul>
            <li><strong>Price:</strong> Free has 100 activated contacts a month and 3 active automations. Pro starts at €12.99/mo with unlimited automations and up to 10 team members. Annual Pro is €1,249/yr. Managed accounts start at €249/mo.</li>
            <li><strong>Pricing quirk:</strong> monthly Pro is metered. A contact counts once any automation or campaign touches them that month, and your price follows that number. Budget for busy months.</li>
            <li><strong>Cons:</strong> prices are in euros, and the metered bill is harder to predict than a flat plan.</li>
          </ul>
          <p><strong>Best for:</strong> teams that sell in DMs and want CRM features and integrations.</p>

          <h3>6. Zorcha: a free plan with no DM cap</h3>
          <p>
            <Ext href={SRC.zorcha}>Zorcha</Ext> lists unlimited automations, DMs and contacts on every plan,
            including Free, and limits features instead.
          </p>
          <ul>
            <li><strong>Price:</strong> Pro is $14.99/mo, or $9.99/mo billed yearly. Ultimate is $39.99/mo ($24.99/mo yearly). Business is $109.99/mo ($79.99/mo yearly).</li>
            <li><strong>Cons:</strong> collecting emails or phone numbers, follow-ups and the flow builder are not on Free. Prices we saw may vary by region.</li>
          </ul>
          <p><strong>Best for:</strong> beginners who want to test comment-to-DM for free without watching a counter.</p>

          <h3>7. ReplyRush: cheapest monthly plan, with an iOS app</h3>
          <p>
            <Ext href={SRC.replyrush}>ReplyRush</Ext> automates DMs for posts, Reels and Stories on Instagram and
            Facebook, and has a web dashboard plus an iOS app.
          </p>
          <ul>
            <li><strong>Price:</strong> Free has 1,500 DMs a month on 1 account. Lite is $10/mo for 7,500 DMs. Boost is $25/mo for 40,000 DMs and 3 accounts. MAX is $100/mo.</li>
            <li><strong>Cons:</strong> on Free, comment auto-replies, follow-gated DMs and the email collector are not included, app branding stays on, and data is kept for 30 days.</li>
          </ul>
          <p><strong>Best for:</strong> creators who manage everything from their phone and want a cheap monthly plan.</p>

          <InlineCta
            title="Test your keyword before you go live"
            text="Paste real comments and see which ones your keyword rule would match. Free, no sign-up."
            tool={{ href: "/tools/instagram-comment-keyword-tester", label: "Try the keyword tester" }}
          />
        </>
      ),
    },
    {
      id: "what-it-really-costs",
      title: "What it really costs at your volume",
      body: (
        <>
          <p>
            The pricing model matters more than the sticker price. Per-DM tools charge for messages sent. Per-contact
            tools charge for people reached. A rough guide for one Instagram account:
          </p>
          <GuideTable
            caption="Cheapest plan that covers each monthly volume (monthly billing unless noted)"
            head={["Tool", "About 500 DMs", "About 2,500 DMs", "About 10,000 DMs"]}
            rows={[
              ["Poskoo", "Free", `${POSKOO.proShort}${POSKOO.soon}`, `${POSKOO.agencyShort}${POSKOO.soon}`],
              ["ManyChat", "Essential, plus extra contacts", "Pro $29 billed yearly", "Business or higher"],
              ["CreatorFlow", "Free", "Pro $15", "Growth $30"],
              ["LinkDM", "Free", "Free (1,000) or Pro $19", "Pro $19"],
              ["ReplyRush", "Free", "Free (1,500) or Lite $10", "Boost $25"],
            ]}
          />
          <p>
            ManyChat counts people, not messages, so 2,500 DMs to 2,500 different people uses 2,500 active contacts.
            Inrō&apos;s monthly Pro price follows activated contacts, and Zorcha does not cap DMs, so we left both out
            of the table. Use the <Link href="/tools/instagram-comment-to-dm-calculator">comment-to-DM
            calculator</Link> to estimate your own numbers from views and comment rates.
          </p>
          <Callout kind="tip" title="Count the second tool too">
            <p>
              Most auto-DM tools do not schedule posts. If you also pay for a scheduler, add that to the total. Our{" "}
              <Link href="/guides/cheapest-social-media-scheduling-tools-2026">cheapest scheduling tools guide</Link>{" "}
              lists the costs.
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
          head={["If you are", "Start with", "Why"]}
          rows={[
            ["A creator who also needs a scheduler", "Poskoo", "Posts and DM rules on one calendar, free plan to start"],
            ["Running a big giveaway or launch", "LinkDM or CreatorFlow", "High DM limits for a low flat price"],
            ["A brand on several chat channels", "ManyChat", "Instagram, Messenger, WhatsApp, TikTok and more"],
            ["Selling in DMs with a team", "Inrō", "CRM, campaigns, webhooks and team seats"],
            ["Testing comment-to-DM for free", "Zorcha or ReplyRush", "No DM cap on Zorcha Free, 1,500 DMs on ReplyRush Free"],
          ]}
        />
      ),
    },
    {
      id: "setup-tips",
      title: "How to set up your first comment-to-DM campaign",
      body: (
        <>
          <ol>
            <li>
              <strong>Pick one clear keyword.</strong> Short words like GUIDE, LINK or PRICE work best. Check that it
              does not also match normal comments with the{" "}
              <Link href="/tools/instagram-comment-keyword-tester">keyword tester</Link>.
            </li>
            <li>
              <strong>Write the DM like a person.</strong> Say thanks, deliver what you promised, and add one link.
              Preview it with the <Link href="/tools/instagram-comment-to-dm-preview">DM preview tool</Link>.
            </li>
            <li>
              <strong>Ask for the comment in the post.</strong> Put the keyword in the first line of the caption and
              say it out loud in the Reel.
            </li>
            <li>
              <strong>Decide on lead capture.</strong> An email gate gives you a list you own. A follow gate grows
              your audience. Both add a step, so expect a few fewer clicks.
            </li>
            <li>
              <strong>Check results after 48 hours.</strong> Compare DMs sent with link clicks. If clicks are low,
              rewrite the first line of the DM.
            </li>
          </ol>
          <p>
            If a DM does not arrive, our <Link href="/help/instagram-auto-dm-not-working">auto-DM troubleshooting
            checklist</Link> covers the usual causes, and{" "}
            <Link href="/instagram-dm-automation">Instagram DM automation explained</Link> covers what Meta allows.
          </p>
          <InlineCta
            title="Send your first auto-DM today"
            text="Poskoo's free plan includes 500 auto-DMs a month and a scheduler for your posts. No credit card."
            tool={{ href: "/instagram-auto-dm", label: "See how auto-DM works" }}
          />
        </>
      ),
    },
    {
      id: "rules-and-safety",
      title: "Instagram rules to know",
      body: (
        <>
          <ul>
            <li><strong>Business or Creator account only.</strong> Meta only allows automated DMs through its API on these account types. Switching is free.</li>
            <li><strong>Only reply to people who reached out.</strong> Comment-to-DM works because the person commented first. Cold DMs to strangers are not allowed through the API.</li>
            <li><strong>Never share your password.</strong> Official tools use Meta&apos;s login screen.</li>
            <li><strong>Disclose affiliate links.</strong> If the DM link earns you a commission, say so in the message.</li>
          </ul>
          <Callout kind="example" title="A DM that gets clicks">
            <p>
              &quot;Hey! Thanks for commenting. Here&apos;s the 7-day meal plan I promised: [link]. Reply here if you
              want the grocery list too.&quot;
            </p>
          </Callout>
        </>
      ),
    },
  ],
  sources: [
    { label: "ManyChat: Pricing", href: SRC.manychat },
    { label: "CreatorFlow: Pricing", href: SRC.creatorflow },
    { label: "LinkDM: Pricing", href: SRC.linkdm },
    { label: "Inrō: Pricing", href: SRC.inro },
    { label: "Zorcha: Pricing", href: SRC.zorcha },
    { label: "ReplyRush: Pricing", href: SRC.replyrush },
  ],
};
