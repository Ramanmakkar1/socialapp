import Link from "next/link";
import { Callout, DayList, Ext, GuideTable, InlineCta, NicheList, type GuideBody, type Niche } from "@/components/guides/GuideBlocks";

// Sources (all opened while writing, November 2026).
const SRC = {
  original: "https://creators.instagram.com/blog/rewarding-original-creators-on-instagram",
  originalGuidelines: "https://creators.instagram.com/original-content-guidelines/",
  recTips: "https://creators.instagram.com/blog/instagram-recommendations-eligibility-tips-creators",
  accountStatus: "https://help.instagram.com/539126347315373",
  signals: "https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/",
  trialReels: "https://www.engadget.com/social-media/instagram-will-let-video-creators-make-trial-reels-for-non-followers-160016725.html",
  hootsuite: "https://www.hootsuite.com/research/social-trends",
  imh: "https://influencermarketinghub.com/influencer-marketing-benchmark-report/",
  shopifyCollabs: "https://help.shopify.com/en/manual/promoting-marketing/collabs/creators/payments",
  paidPartnership: "https://help.instagram.com/1109894795810258",
  ftc: "https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers",
  adStandards: "https://adstandards.ca/wp-content/uploads/Ad-Standards-Influencer-Marketing-Disclosure-Guidelines-2025-10-08.pdf",
  trends: "https://trends.google.com/trends/",
};

/* ---------- The 18 niches ---------- */

const MONEY: Niche[] = [
  {
    name: "Personal finance basics",
    level: "Hard",
    why: "Budgeting and saving questions never go out of season, and plain-language explainers get saved and sent. Crowded, so trust and a clear audience matter.",
    reel: "One money habit in 30 seconds, your budgeting app on screen.",
    carousel: "\"What I wish I knew before my first paycheque.\"",
    story: "Poll: \"Do you track your spending?\"",
    money: "Affiliate links for apps and books you use, budget templates, workshops.",
    angle: "Pick a life stage: newcomers to Canada, first jobs, freelancers. Educate, don't give personal investment advice.",
  },
  {
    name: "Side hustles and small business",
    level: "Medium",
    why: "Beginners want honest, practical steps. If you run a small business, every problem you solve is a post.",
    reel: "Packing today's orders, plus one lesson from this week.",
    carousel: "\"5 free tools I use to run my shop.\"",
    story: "Question box: \"Ask me anything about starting.\"",
    money: "Affiliate links for tools, templates, coaching, your own product.",
    angle: "Build in public: real wins and mistakes from one business, not generic lists.",
  },
  {
    name: "Career and job search",
    level: "Medium",
    why: "Resumes, interviews and using AI in a job hunt are constant questions, and interest spikes with hiring seasons and layoff news.",
    reel: "One interview question answered in three sentences.",
    carousel: "Weak vs strong resume bullets, side by side.",
    story: "\"Rate my headline\" with followers' permission.",
    money: "Resume reviews, mock interviews, templates, workshops.",
    angle: "Own one transition: nurses into tech, grads into the trades, teachers changing careers.",
  },
];

const HEALTH: Niche[] = [
  {
    name: "Fitness for busy people",
    level: "Hard",
    why: "Huge and crowded, but most of it assumes time and a gym. Filming your own workouts is original by default.",
    reel: "A 10-minute living-room workout.",
    carousel: "A four-week beginner plan, one week per slide.",
    story: "Daily poll: \"Did you move today?\"",
    money: "Coaching, paid programs, equipment affiliates, UGC for fitness brands.",
    angle: "Shift workers, new parents or over-40 beginners. Avoid medical claims.",
  },
  {
    name: "Easy recipes and meal prep",
    level: "Medium",
    why: "Recipes are made to be saved and sent, the signals Instagram says it weighs most (see above).",
    reel: "One-pan dinner, start to finish.",
    carousel: "One grocery list, three weeknight meals.",
    story: "Poll: \"Pick tomorrow's dinner.\"",
    money: "Kitchen affiliates, a meal-plan PDF, food brand deals, UGC.",
    angle: "Add a constraint: budget, one pot, the food you grew up with, high-protein vegetarian.",
  },
  {
    name: "Parenting and family life",
    level: "Medium",
    why: "Parents trust other parents' tested ideas, and comments turn into real conversations.",
    reel: "Three car-ride games that actually worked.",
    carousel: "A week of toddler lunchbox ideas.",
    story: "Question box: \"What's working at bedtime?\"",
    money: "Product affiliates, UGC for family brands, printables.",
    angle: "One stage (twins, back to work) and protect your kids' privacy: hands, no faces or school names.",
  },
  {
    name: "Pets and training",
    level: "Easy",
    why: "Easy to film daily, shared constantly, and training progress makes a natural series.",
    reel: "Teaching one cue in seven days.",
    carousel: "New-puppy proofing checklist, room by room.",
    story: "Poll: \"Guess what she's barking at.\"",
    money: "Pet product affiliates, UGC, local training or walking services.",
    angle: "One breed, rescue dogs, apartment cats or dog-friendly spots in your city.",
  },
];

const CREATIVE: Niche[] = [
  {
    name: "Plant care and small-space gardening",
    level: "Easy",
    why: "Visual, practical and seasonal, so the calendar writes itself.",
    reel: "Repotting a root-bound plant.",
    carousel: "Low-light plants that survived my dark apartment.",
    story: "\"Plant doctor\": followers send a sad plant photo.",
    money: "Affiliates for pots and grow lights, care guides, local workshops, UGC.",
    angle: "Tie it to a climate or space: Canadian winters, balconies, office desks.",
  },
  {
    name: "Budget home decor and DIY",
    level: "Medium",
    why: "Before-and-afters hold attention to the end, and renters want changes they can undo.",
    reel: "Renter-friendly kitchen refresh, before and after.",
    carousel: "Where every item in the room came from.",
    story: "Poll: \"Which paint colour?\"",
    money: "Shoppable affiliate links, UGC for home brands, design consults.",
    angle: "Renters only, tiny spaces, or thrifted-only rooms.",
  },
  {
    name: "Art and illustration process",
    level: "Medium",
    why: "Process videos are original, satisfying and show buyers exactly what they get.",
    reel: "Sketch to finished piece as a timelapse.",
    carousel: "How I pick a colour palette in four steps.",
    story: "Followers vote on the next piece's colours.",
    money: "Commissions, prints, brushes or templates, workshops.",
    angle: "One subject or style: pet portraits, architecture, botanical watercolour.",
  },
  {
    name: "Phone photography and editing",
    level: "Medium",
    why: "Almost everyone shoots on a phone and wants better photos. Tips are short and very saveable.",
    reel: "One setting that fixes dark photos.",
    carousel: "Unedited vs edited, with the three edits.",
    story: "\"Send me a photo to edit.\"",
    money: "Presets, mini-courses, gear affiliates, shoots for local businesses.",
    angle: "One subject: food for restaurants, products for small shops, real-estate photos.",
  },
  {
    name: "Thrift and sustainable fashion",
    level: "Medium",
    why: "Thrift finds are one of a kind, so your posts can't be copied.",
    reel: "One thrifted blazer styled three ways.",
    carousel: "How to check fabric quality in ten seconds.",
    story: "Outfit polls before you head out.",
    money: "Affiliates, UGC for fashion brands, reselling your finds, styling sessions.",
    angle: "Body type, real-winter layering, or workwear on a budget.",
  },
];

const TECH: Niche[] = [
  {
    name: "AI tools for everyday work",
    level: "Medium",
    why: "Curiosity is high and people want real workflows, not hype. Tools change fast, so posts age quickly.",
    reel: "Screen recording: meeting notes to a to-do list.",
    carousel: "Prompts I use every week for my job.",
    story: "Poll: \"Which tool should I test next?\"",
    money: "Software affiliate programs, prompt packs, workshops, small-business consulting.",
    angle: "One profession: AI for realtors, teachers, bookkeepers or salon owners.",
  },
  {
    name: "Tech and gadgets explained simply",
    level: "Hard",
    why: "People research before they buy, so simple explainers drive affiliate sales. Crowded, and you need products.",
    reel: "New phone? Change these five settings first.",
    carousel: "Two budget options compared for one use.",
    story: "\"Ask me before you buy\" question box.",
    money: "Affiliate links, UGC demos, brand partnerships.",
    angle: "Tech for grandparents, students or small business owners.",
  },
];

const LOCAL: Niche[] = [
  {
    name: "Local food and things to do",
    level: "Easy",
    why: "People search for what's near them and local businesses want locals. Just go places and film.",
    reel: "Three patios to try this weekend in your city.",
    carousel: "Cheap eats, one neighbourhood per slide.",
    story: "Poll: \"Where should I eat Friday?\"",
    money: "Paid features for local businesses, events, a local newsletter.",
    angle: "One neighbourhood, one cuisine, or a strict budget.",
  },
  {
    name: "Weekend and budget travel",
    level: "Medium",
    why: "Travel posts get saved for \"one day\", and weekend trips from your city are repeatable.",
    reel: "48 hours in a nearby town without a car.",
    carousel: "A carry-on-only packing list.",
    story: "A live trip diary with location stickers.",
    money: "Booking and gear affiliates, UGC for hotels, paid itineraries.",
    angle: "Trips within three hours of home, accessible travel, travelling with a dog.",
  },
  {
    name: "Neighbourhood and real estate guides",
    level: "Medium",
    why: "Buyers, renters and newcomers research areas long before they move.",
    reel: "A 60-second neighbourhood tour.",
    carousel: "Costs first-time buyers forget about.",
    story: "Open-house reminder plus a question box.",
    money: "Client leads, referral partners, local sponsors.",
    angle: "Newcomers, renters or downsizers. Check your licensing body's advertising rules.",
  },
  {
    name: "Behind the scenes of a service business",
    level: "Easy",
    why: "Salons, clinics, trades, cleaners: locals want to see the work and process before they book, and nobody else can film your jobs.",
    reel: "Before and after of today's job.",
    carousel: "Five questions to ask before hiring a pro like you.",
    story: "A day on the job, ending with how to book.",
    money: "Bookings, quote requests, repeat customers.",
    angle: "Answer the questions customers ask on the phone, including rough costs and timelines.",
  },
];

/* ---------- Article ---------- */

export const body: GuideBody = {
  intro: (
    <>
      <p>
        <strong>The best Instagram niche in 2026 is easy recipes and meal prep: you can film a new dish every week,
        the format is made to be saved and shared, and Instagram&apos;s own signals rank that engagement highest.</strong>
      </p>
      <p>
        That works because the best niche is not the biggest one, it is the one you can make original posts about every
        week for a year. Below are 18 niches that work right now, a simple way to score them, and a 7-day test so you
        can pick with evidence instead of guessing.
      </p>
    </>
  ),
  sections: [
    {
      id: "what-instagram-rewards",
      title: "What Instagram rewards in 2026",
      body: (
        <>
          <h3>Original content gets the recommendations</h3>
          <p>
            In April 2026 Instagram extended its originality rules from Reels to photos and carousels. Accounts that
            mostly post content they did not create are{" "}
            <Ext href={SRC.original}>no longer shown where Instagram recommends content</Ext> until a significant
            share of their recent posts are original again. Instagram says{" "}
            <strong>75% of recommendations in the US now come from original posts</strong>, and that adding a border,
            watermark, subtitles or a caption credit does not make someone else&apos;s post yours (see the{" "}
            <Ext href={SRC.originalGuidelines}>original content guidelines</Ext>).
          </p>
          <h3>Watch time, likes and sends</h3>
          <p>
            Instagram head Adam Mosseri said the{" "}
            <Ext href={SRC.signals}>top three ranking signals are watch time, likes and sends</Ext>. Niches full of
            &quot;I have to show someone this&quot; moments (recipes, tips, before-and-afters) have an edge.
          </p>
          <h3>You can test with strangers first</h3>
          <p>
            <Ext href={SRC.trialReels}>Trial Reels</Ext> show a Reel to non-followers first, so you can try a new
            topic without your followers seeing every experiment.
          </p>
          <h3>Search and eligibility basics</h3>
          <p>
            Instagram only recommends content from public accounts, and its{" "}
            <Ext href={SRC.recTips}>tips for creators</Ext> suggest keywords in your name, handle, bio and captions.
            Professional accounts can check <Ext href={SRC.accountStatus}>Account Status</Ext> for anything limiting
            recommendations.
          </p>
          <Callout kind="tip" title="What this means for your niche">
            <p>
              Favour niches where <strong>you</strong> make the thing: you cook it, film it, fix it, draw it or explain
              it. Repost and meme pages are exactly what Instagram now filters out of recommendations.
            </p>
          </Callout>
          <p>
            Audiences are splitting into smaller interest groups too. Hootsuite&apos;s{" "}
            <Ext href={SRC.hootsuite}>2026 social trends research</Ext> says &quot;Generic content strategies just
            won&apos;t cut it in 2026.&quot; Good news for beginners: a specific niche is easier to win.
          </p>
        </>
      ),
    },
    {
      id: "how-to-choose",
      title: "How to choose a niche: the 5-point score",
      body: (
        <>
          <p>
            Write down five to ten ideas and score each from 1 (weak) to 5 (strong) on these questions. Anything
            scoring <strong>18 or more out of 25</strong> is worth testing.
          </p>
          <GuideTable
            caption="Score each niche idea from 1 to 5"
            head={["Criterion", "Ask yourself", "A 5 looks like"]}
            rows={[
              ["Knowledge or passion", "Could I talk about this for an hour?", "You do it, study it or work in it."],
              ["Audience demand", "Are people asking questions about it?", "Real questions in comments, Google and Instagram search."],
              ["Repeatability", "Can I list 50 post ideas right now?", "Ideas come from your work, seasons or audience."],
              ["Ways to earn", "What could I sell or recommend in six months?", "Two or more of: affiliate, UGC, service, digital product, local customers."],
              ["Your angle", "Why follow me, not the top 10 accounts?", "A specific audience, place, constraint or personality."],
            ]}
          />
          <Callout kind="example" title="Example: two ideas scored">
            <p>
              <strong>&quot;Travel&quot;</strong>: knowledge 3, demand 5, repeatability 2, ways to earn 3, angle 1.
              Total <strong>14</strong>. Too broad.
            </p>
            <p>
              <strong>&quot;Weekend trips from Calgary without a car&quot;</strong>: 4, 4, 4, 3, 5. Total{" "}
              <strong>20</strong>. Worth a 7-day test.
            </p>
          </Callout>
          <h3>How small accounts actually earn</h3>
          <p>
            You do not need a huge following. Influencer Marketing Hub&apos;s{" "}
            <Ext href={SRC.imh}>2026 benchmark report</Ext> describes brand budgets continuing to shift toward nano and
            micro creators and UGC (videos made for brands to run as their own ads). First income usually comes from:
          </p>
          <ul>
            <li><strong>Affiliate links</strong> for products you use, through programs like <Ext href={SRC.shopifyCollabs}>Shopify Collabs</Ext>.</li>
            <li><strong>UGC</strong>: brands pay for the video, not your follower count.</li>
            <li><strong>Services</strong>: coaching, reviews, commissions, bookings.</li>
            <li><strong>A small digital product</strong>: templates, guides, presets, meal plans.</li>
          </ul>
        </>
      ),
    },
    {
      id: "best-niches",
      title: "18 Instagram niches worth starting in 2026",
      body: (
        <>
          <p>
            Each niche has why it works now, a Reel, carousel and Story idea, ways to earn, a difficulty level and a
            tip for standing out. <strong>Easy</strong> means less crowded or easy to film; <strong>Hard</strong> means
            crowded or trust-heavy.
          </p>
          <h3>Money and business</h3>
          <NicheList niches={MONEY} start={1} />
          <h3>Health and lifestyle</h3>
          <NicheList niches={HEALTH} start={4} />
          <InlineCta
            title="Got a niche in mind? Get six post ideas for it."
            text="The free post ideas generator gives you Reels, carousels and Stories with a hook and caption starter for each."
            tool={{ href: "/tools/instagram-post-ideas-generator", label: "Try the post ideas generator" }}
          />
          <h3>Creative and hobbies</h3>
          <NicheList niches={CREATIVE} start={8} />
          <h3>Tech and AI</h3>
          <NicheList niches={TECH} start={13} />
          <h3>Local and service businesses</h3>
          <NicheList niches={LOCAL} start={15} />
          <Callout kind="tip" title="Running a local business? Your niche is already picked">
            <p>Your trade is the niche. Use the work, the process, the people and customers&apos; questions as your content pillars.</p>
          </Callout>
        </>
      ),
    },
    {
      id: "niches-by-goal",
      title: "Niche ideas by goal",
      body: (
        <GuideTable
          caption="Quick picks by goal"
          head={["Your goal", "Niches that fit", "What you'd offer first"]}
          rows={[
            ["Earn from affiliate links", "Tech explained, home decor, recipes, plant care", "Products you already use"],
            ["Get paid for UGC", "Recipes, pets, home decor, thrift fashion, parenting", "Short product videos for brand ads"],
            ["Sell a service", "Career, phone photography, art, fitness coaching", "Reviews, sessions, commissions"],
            ["Sell a digital product", "Finance basics, recipes, AI tools, photography", "Templates, guides, presets"],
            ["Win local customers", "Service businesses, local food, neighbourhood guides", "Bookings, quotes, visits"],
            ["Build a personal brand", "Side hustles, AI tools, career", "Consulting, workshops, a newsletter"],
          ]}
        />
      ),
    },
    {
      id: "validate-in-7-days",
      title: "How to validate a niche in 7 days",
      body: (
        <>
          <p>This one-week test shows whether you can keep making the content and whether anyone cares. Run it on your top one or two ideas.</p>
          <DayList
            days={[
              {
                title: "Write your one-line promise.",
                body: (
                  <>
                    {" "}&quot;I help [who] [do what] without [pain].&quot; Turn it into a bio with the{" "}
                    <Link href="/tools/instagram-bio-generator">bio generator</Link> and find a handle with the{" "}
                    <Link href="/tools/instagram-username-generator">username generator</Link>.
                  </>
                ),
              },
              {
                title: "Check demand.",
                body: (
                  <>
                    {" "}Search the topic on Instagram and read comments on top posts: are people asking questions?
                    Compare a few phrasings in <Ext href={SRC.trends}>Google Trends</Ext> to spot seasons.
                  </>
                ),
              },
              {
                title: "List 20 post ideas.",
                body: (
                  <>
                    {" "}Start with the <Link href="/tools/instagram-post-ideas-generator">post ideas generator</Link>. If
                    you cannot reach 20, repeatability is a red flag.
                  </>
                ),
              },
              {
                title: "Make three posts.",
                body: (
                  <>
                    {" "}A Reel, a carousel and a set of Stories. Write openers with the{" "}
                    <Link href="/tools/instagram-hook-generator">hook generator</Link> and pick a few specific tags with
                    the <Link href="/tools/instagram-hashtag-generator">hashtag generator</Link>.
                  </>
                ),
              },
              {
                title: "Post the Reel as a Trial Reel.",
                body: <> If your account has it, non-followers see the new topic first.</>,
              },
              {
                title: "Talk to everyone who responds.",
                body: <> Reply to every comment and DM and note the questions. They are your next posts and product ideas.</>,
              },
              {
                title: "Review and decide.",
                body: (
                  <>
                    {" "}Check watch time, shares, saves and non-follower reach in Insights, compare posts with the{" "}
                    <Link href="/tools/instagram-engagement-rate-calculator">engagement rate calculator</Link>, then
                    commit, narrow or test idea two.
                  </>
                ),
              },
            ]}
          />
          <Callout kind="tip" title="Judge the effort, not just the numbers">
            <p>
              A week is too short to judge growth, but long enough to learn whether you enjoyed it and ideas kept
              coming. If it felt like a chore in week one, it will feel worse in month six.
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: "posting-cadence",
      title: "How often to post (and how to stay consistent)",
      body: (
        <>
          <p>
            There is no magic number. <strong>The right cadence is the one you can keep for three months.</strong>{" "}
            Three good posts a week you never miss beat a daily plan that dies in week two. The{" "}
            <Link href="/tools/instagram-posting-frequency-calculator">posting frequency calculator</Link> turns your
            weekly time budget into a realistic plan.
          </p>
          <ul>
            <li>
              <strong>Batch, then schedule.</strong> Make a week of posts in one sitting, map them in a{" "}
              <Link href="/tools/social-media-content-calendar">content calendar</Link>, then queue them. With{" "}
              <Link href="/instagram-scheduler">Poskoo&apos;s Instagram scheduler</Link>, feed posts, Reels, carousels
              and Stories sit on one calendar and publish at the time you pick.
            </li>
            <li>
              <strong>Turn comments into conversations.</strong> End posts with &quot;Comment PLAN and I&apos;ll send
              you the checklist.&quot; <Link href="/instagram-auto-dm">Poskoo auto-DM</Link> sends your link to everyone
              who comments the keyword, and can ask for an email first, so a busy post becomes a list of leads.
            </li>
          </ul>
          <InlineCta
            title="Plan your first week of niche posts"
            text="Schedule posts, Reels, carousels and Stories, and auto-DM everyone who comments a keyword. Free plan, no credit card."
            tool={{ href: "/tools/social-media-content-calendar", label: "Free content calendar" }}
          />
        </>
      ),
    },
    {
      id: "mistakes-to-avoid",
      title: "Mistakes to avoid",
      body: (
        <>
          <ul>
            <li><strong>Choosing on money alone.</strong> If you don&apos;t care about the topic, you won&apos;t last long enough to earn.</li>
            <li><strong>Going too broad.</strong> &quot;Lifestyle&quot; is not a niche. &quot;Slow mornings for night-shift nurses&quot; is.</li>
            <li><strong>Reposting other people&apos;s content.</strong> It now costs you recommendations. Use Story shares or collabs instead.</li>
            <li><strong>Copying a big creator exactly.</strong> Borrow the structure, change the subject and voice.</li>
            <li><strong>Switching niches every week.</strong> Give a niche that passed the test a few weeks of steady posting.</li>
            <li><strong>Advice beyond your training.</strong> In health, money and legal topics, share experience and point to professionals.</li>
          </ul>
          <Callout kind="warning" title="Always disclose paid posts and affiliate links">
            <p>
              Use Instagram&apos;s <Ext href={SRC.paidPartnership}>paid partnership label</Ext> for brand deals and say
              when a link earns you a commission. See the FTC&apos;s{" "}
              <Ext href={SRC.ftc}>Disclosures 101 for Social Media Influencers</Ext> (US) and Ad Standards&apos;{" "}
              <Ext href={SRC.adStandards}>Influencer Marketing Disclosure Guidelines</Ext> (Canada).
            </p>
          </Callout>
        </>
      ),
    },
  ],
  sources: [
    { label: "Instagram for Creators: Rewarding original creators on Instagram (April 2026)", href: SRC.original },
    { label: "Instagram for Creators: Original content guidelines", href: SRC.originalGuidelines },
    { label: "Instagram for Creators: What creators need to know about recommendations", href: SRC.recTips },
    { label: "Instagram Help Center: Account Status", href: SRC.accountStatus },
    { label: "Social Media Today: Instagram shares algorithm insights (January 2025)", href: SRC.signals },
    { label: "Engadget: Instagram trial Reels for non-followers (December 2024)", href: SRC.trialReels },
    { label: "Hootsuite: Social Media Trends 2026", href: SRC.hootsuite },
    { label: "Influencer Marketing Hub: Influencer Marketing Benchmark Report 2026", href: SRC.imh },
    { label: "Shopify Help Center: Getting paid on Shopify Collabs", href: SRC.shopifyCollabs },
    { label: "Instagram Help Center: Paid partnership label", href: SRC.paidPartnership },
    { label: "FTC: Disclosures 101 for Social Media Influencers", href: SRC.ftc },
    { label: "Ad Standards: Influencer Marketing Disclosure Guidelines (2025)", href: SRC.adStandards },
  ],
};
