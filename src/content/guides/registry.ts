// Single list of every guide article. The /guides hub, the /guides/[slug] template, the
// sitemap, public-pages and llms.txt all read from here, so a new article is added once:
// a registry entry below + a body module in ./bodies.ts.
// Pure data (no JSX) so node:test files can import it.

export type GuideCategory = "growth" | "scheduling" | "auto-dm" | "ideas" | "money" | "seo";

export const GUIDE_CATEGORIES: { id: GuideCategory; label: string }[] = [
  { id: "growth", label: "Instagram growth" },
  { id: "scheduling", label: "Scheduling" },
  { id: "auto-dm", label: "Auto-DM & leads" },
  { id: "ideas", label: "Content ideas" },
  { id: "money", label: "Make money" },
  { id: "seo", label: "Social SEO" },
];

export type GuideFaq = { q: string; a: string };

export type GuideEntry = {
  slug: string;
  /** <title>, max 60 characters, unique. */
  title: string;
  /** Meta description, 140–155 characters, unique. */
  description: string;
  /** H1 (may be longer than the <title>). */
  h1: string;
  subtitle: string;
  /** Short breadcrumb / card label. */
  crumb: string;
  /** One line for cards. */
  excerpt: string;
  category: GuideCategory;
  author: string;
  /** ISO dates (YYYY-MM-DD). */
  published: string;
  updated: string;
  /** Measured from the article body (≈230 words per minute). */
  wordCount: number;
  cover: { src: string; width: number; height: number; alt: string };
  takeaways: string[];
  faqs: GuideFaq[];
  /** Free tool hrefs for the related-tools carousel (first one is the "relevant tool" CTA). */
  tools: string[];
  /** Related guide slugs. */
  related?: string[];
};

export const GUIDES: GuideEntry[] = [
  {
    slug: "best-instagram-niches-2026",
    title: "Best Instagram Niches to Start in 2026 (and How to Pick)",
    description:
      "18 Instagram niches worth starting in 2026, with content ideas, ways to earn and difficulty for each, plus a simple scoring method and a 7-day niche test.",
    h1: "The best Instagram niches to start in 2026 (and how to pick yours)",
    subtitle:
      "18 niches with real content ideas, honest monetization paths and a simple way to test one in a week before you commit.",
    crumb: "Best Instagram niches 2026",
    excerpt: "18 niches with content ideas, ways to earn and a 7-day test to pick yours.",
    category: "growth",
    author: "Poskoo team",
    published: "2026-11-11",
    updated: "2026-11-11",
    wordCount: 3070,
    cover: {
      src: "/guides/best-instagram-niches-2026.webp",
      width: 1029,
      height: 698,
      alt: "A creator holding a phone picks a plant card from floating niche cards: dumbbell, recipe bowl, laptop, paint palette, coins and a travel pin",
    },
    takeaways: [
      "Pick a niche where you can make 50+ posts without running dry, not just the one that looks most profitable.",
      "Instagram now favours original content in recommendations, so niches you can film or photograph yourself have an edge.",
      "Score each idea on knowledge, demand, repeatability, ways to earn and your angle, then test the top two for 7 days.",
      "Most small accounts earn first from affiliate links, UGC, services or a small digital product, not from big brand deals.",
      "A narrow promise (\"plant care for dark apartments\") beats a broad topic (\"plants\") when you are starting from zero.",
    ],
    faqs: [
      {
        q: "What is the most profitable Instagram niche in 2026?",
        a: "There is no single answer. Finance, business, tech and fitness have many ways to earn but are crowded. The most profitable niche for you is one where you can help, post consistently and sell something real: an affiliate product you use, a service, UGC or a small digital product.",
      },
      {
        q: "Can I grow on Instagram without a niche?",
        a: "You can, but it is slower. A clear niche tells new viewers what they get if they follow, and makes ideas easier to find. A broad topic works if every post keeps the same promise.",
      },
      {
        q: "How many niches should I test before choosing one?",
        a: "Score five to ten ideas on paper, then test your top two in real posts for about a week. Testing more at once splits your effort.",
      },
      {
        q: "Do faceless Instagram accounts still work in 2026?",
        a: "Yes, if the content is original. Recipes, plant care, art process and tech walkthroughs work without showing your face. Reposting other people's clips does not: Instagram limits recommendations for accounts that mostly post unoriginal content.",
      },
      {
        q: "How long does it take to know if a niche is working?",
        a: "A 7-day test shows whether you can keep making the content and which posts get saves, shares and comments. Give the winner a few more weeks of steady posting before judging growth.",
      },
      {
        q: "Can I change my niche later?",
        a: "Yes. Many creators narrow or shift as they learn what their audience responds to. Post the new angle alongside your current content, then update your bio once it works.",
      },
    ],
    tools: [
      "/tools/instagram-post-ideas-generator",
      "/tools/instagram-hashtag-generator",
      "/tools/instagram-hook-generator",
      "/tools/instagram-bio-generator",
      "/tools/instagram-username-generator",
      "/tools/instagram-posting-frequency-calculator",
      "/tools/social-media-content-calendar",
      "/tools/instagram-engagement-rate-calculator",
    ],
  },
  {
    slug: "how-to-get-more-instagram-followers",
    title: "How to Get More Instagram Followers in 2026 (30-Day Plan)",
    description:
      "A practical 30-day plan to get more Instagram followers in 2026: what to post, how often, hooks, hashtags, profile tips and turning comments into leads.",
    h1: "How to get more Instagram followers in 2026",
    subtitle:
      "What actually grows an account, how often to post, hooks that stop the scroll, and a 30-day plan you can start this week.",
    crumb: "Get more Instagram followers",
    excerpt: "What grows an account, how often to post and a 30-day plan to start.",
    category: "growth",
    author: "Poskoo team",
    published: "2026-11-14",
    updated: "2026-11-14",
    wordCount: 2050,
    cover: {
      src: "/guides/best-instagram-niches-2026.webp",
      width: 1029,
      height: 698,
      alt: "A creator holding a phone watches a follower count rise beside floating Reels, carousel and comment cards",
    },
    takeaways: [
      "Post original Reels and carousels on one clear topic 3-5 times a week, and keep the schedule for months.",
      "Hook viewers in the first second by naming the problem and promising a specific fix.",
      "Reply to every comment and DM, and give people a reason to follow: a series, a freebie or a clear promise.",
      "Hashtags label a post; keywords in your caption and on-screen text do more of the work.",
      "Turn comments into leads with a keyword and comment-to-DM automation, then follow up in DMs.",
    ],
    faqs: [
      {
        q: "How many followers do you need to make money?",
        a: "For affiliate links, services, UGC and digital products there is no official minimum. You can earn with a small, engaged audience. Platform ad programs set their own thresholds, so treat those as a bonus rather than the plan.",
      },
      {
        q: "Is it better to post Reels or carousels for growth?",
        a: "Both can grow an account. As a general guide, Reels can reach people who don't follow you yet, while carousels are easy to save and share. Post both for a few weeks and check your Insights to see which format brings more new reach for your topic.",
      },
      {
        q: "Why am I losing followers?",
        a: "Small drops are normal and often just people tidying their feed. Bigger drops can follow a change in topic, a run of low-value posts or a long gap between posts. Check whether your recent posts still match the promise in your bio.",
      },
      {
        q: "How long does it take to grow on Instagram?",
        a: "It varies by topic, format and how consistently you post. Most accounts need weeks to months of steady posting and replying before growth compounds. Judge progress monthly, not daily.",
      },
      {
        q: "Do I need to post every day?",
        a: "No. Three to five good posts a week that you can keep up for months usually beat a daily plan you abandon. Consistency matters more than volume.",
      },
      {
        q: "Can I grow without showing my face?",
        a: "Yes, if the content is original. Recipes, plant care, art process, screen recordings and product demos can grow without a face. What matters is that you make the content and that it helps a specific audience.",
      },
    ],
    tools: [
      "/tools/instagram-posting-frequency-calculator",
      "/tools/instagram-hook-generator",
      "/tools/instagram-hashtag-generator",
      "/tools/instagram-bio-generator",
      "/tools/instagram-post-ideas-generator",
      "/tools/instagram-engagement-rate-calculator",
    ],
    related: ["best-instagram-niches-2026", "social-media-seo-2026"],
  },
  {
    slug: "how-to-make-money-on-social-media-2026",
    title: "How to Make Money on Social Media in 2026 (Real Plan)",
    description:
      "8 realistic ways to make money on social media in 2026, the follower counts each really needs, a step-by-step plan to first income and mistakes to avoid.",
    h1: "How to make money on social media in 2026",
    subtitle:
      "Eight realistic ways to earn, what each one needs before it pays, and a step-by-step plan to your first income without waiting for a huge following.",
    crumb: "Make money on social media",
    excerpt: "8 ways to earn, real follower requirements and a plan to your first income.",
    category: "money",
    author: "Poskoo team",
    published: "2026-11-12",
    updated: "2026-11-12",
    wordCount: 2320,
    cover: {
      src: "/guides/how-to-make-money-on-social-media-2026.webp",
      width: 1280,
      height: 720,
      alt: "A creator sitting with a phone sends dotted paths to cards for a gift box, a chain link, a download folder, a video camera and a shop, next to a piggy bank catching a coin",
    },
    takeaways: [
      "Most income streams (affiliate links, services, UGC, digital products) have no follower minimum, so you can start small.",
      "Platform payouts like YouTube's Partner Program have published thresholds; treat them as a bonus, not the plan.",
      "Stack two or three small streams instead of betting everything on one.",
      "Turn followers into contacts: comment-to-DM, an email freebie and a link in bio page move people from liking to buying.",
      "Disclose every paid post and affiliate link, even when the product was free.",
    ],
    faqs: [
      {
        q: "How many followers do you need to make money on social media?",
        a: "For affiliate links, services, UGC and digital products there is no official minimum. Platform programs differ: YouTube's Partner Program needs 1,000 subscribers plus watch hours or Shorts views, and TikTok's Creator Rewards Program has its own follower and view minimums.",
      },
      {
        q: "What is the fastest way to make money on social media as a beginner?",
        a: "Usually a service (coaching, reviews, shoots, local bookings) or an affiliate link for a product you already use. Both can pay with a small, engaged audience, while ad revenue programs need a large one.",
      },
      {
        q: "Can you make money on Instagram without being an influencer?",
        a: "Yes. UGC creators make videos brands post on their own accounts, and local businesses use Instagram to get bookings and quote requests. Neither needs a big following.",
      },
      {
        q: "How much do creators get paid for a sponsored post?",
        a: "There is no standard rate. Pay depends on your niche, audience fit, engagement, the work involved and whether the brand can reuse your content in ads. Price from your time, usage rights and past results.",
      },
      {
        q: "Do I have to disclose affiliate links and sponsored posts?",
        a: "Yes. Use Instagram's paid partnership label for brand deals and clearly say when a link earns you a commission. In the US the FTC sets the rules, and in Canada Ad Standards publishes influencer disclosure guidelines.",
      },
      {
        q: "Which platform is best for making money in 2026?",
        a: "The one where your buyers already spend time. Instagram and TikTok suit visual products and services, YouTube suits longer how-tos and ad revenue, LinkedIn suits B2B services, and Pinterest suits recipes, decor and products people plan to buy.",
      },
    ],
    tools: [
      "/tools/instagram-comment-to-dm-calculator",
      "/tools/instagram-bio-generator",
      "/tools/instagram-utm-builder",
      "/tools/instagram-engagement-rate-calculator",
    ],
    related: ["social-media-seo-2026", "best-instagram-niches-2026"],
  },
  {
    slug: "social-media-seo-2026",
    title: "Social Media SEO: How to Get Found in 2026",
    description:
      "How social media SEO works in 2026: keywords for Instagram, TikTok, YouTube, Pinterest and LinkedIn, hashtags, Google indexing and how to measure results.",
    h1: "Social media SEO: how to get found in 2026",
    subtitle:
      "Where each platform reads your keywords, what hashtags still do, how your posts reach Google, and how to tell if it's working.",
    crumb: "Social media SEO",
    excerpt: "Keywords, hashtags and Google indexing for Instagram, TikTok, YouTube and more.",
    category: "seo",
    author: "Poskoo team",
    published: "2026-11-12",
    updated: "2026-11-12",
    wordCount: 2250,
    cover: {
      src: "/guides/social-media-seo-2026.webp",
      width: 1280,
      height: 720,
      alt: "A big magnifying glass over a phone showing a profile and a colourful post grid, with search bars, a play button and map pins around it and a woman pointing at her phone",
    },
    takeaways: [
      "Platforms match searches to text, so put your main keyword in your name field, bio, first caption line and on-screen text.",
      "Hashtags are labels now, not a reach boost: Instagram caps captions at five, and YouTube ignores all tags past 60.",
      "Since July 2025, public posts from eligible Instagram professional accounts can appear in Google results.",
      "Clusters of posts on one topic teach apps and search engines what you are about faster than one-off posts.",
      "Measure non-follower reach, search traffic sources and link clicks over weeks, not days.",
    ],
    faqs: [
      {
        q: "What is social media SEO?",
        a: "It is the practice of using the words your audience searches for in your profile, captions, on-screen text and video so your posts show up in in-app search and in search engines like Google.",
      },
      {
        q: "Do hashtags still help on Instagram in 2026?",
        a: "They help label what a post is about, but Instagram has said they do not increase reach. Captions are now limited to five hashtags, so pick a few specific, relevant ones and put keywords in the caption itself.",
      },
      {
        q: "Can Instagram posts show up on Google?",
        a: "Yes. Since July 10, 2025, search engines can show public photos and videos from eligible accounts, which coverage describes as public professional accounts run by adults. You can opt out in your privacy settings.",
      },
      {
        q: "Where should I put keywords on my Instagram profile?",
        a: "In your name field (separate from your handle), your bio, the first line of your captions and in alt text where it describes the image naturally. Instagram also suggests a handle related to your content.",
      },
      {
        q: "How long does social media SEO take to work?",
        a: "Usually weeks to months. Search traffic builds as you post more on one topic and as people engage with those posts, so review results monthly rather than daily.",
      },
      {
        q: "Is TikTok SEO different from Instagram SEO?",
        a: "The basics are the same: clear keywords in captions and on-screen text. TikTok also leans on what you say in the video and on sounds, so say your topic out loud early and use captions.",
      },
    ],
    tools: [
      "/tools/instagram-bio-generator",
      "/tools/instagram-hashtag-generator",
      "/tools/instagram-caption-generator",
      "/tools/instagram-utm-builder",
    ],
    related: ["how-to-make-money-on-social-media-2026", "best-instagram-niches-2026"],
  },
  {
    slug: "best-instagram-auto-dm-tools-2026",
    title: "Best Instagram Auto-DM Tools in 2026 (Prices Compared)",
    description:
      "7 Instagram comment-to-DM tools compared on free plans, real monthly cost, DM and contact limits and lead capture, with who each tool suits best.",
    h1: "The best Instagram auto-DM tools in 2026, compared",
    subtitle:
      "Seven comment-to-DM tools side by side: what they cost at your volume, how they count usage and which one fits how you work.",
    crumb: "Best Instagram auto-DM tools 2026",
    excerpt: "7 comment-to-DM tools compared on price, limits and lead capture.",
    category: "auto-dm",
    author: "Poskoo team",
    published: "2026-11-12",
    updated: "2026-11-12",
    wordCount: 2306,
    cover: {
      src: "/guides/best-instagram-auto-dm-tools-2026.webp",
      width: 1280,
      height: 720,
      alt: "A creator with a magnifying glass studies a phone full of comments while three small robots on a winners' podium hold up a DM envelope with a link",
    },
    takeaways: [
      "Check how a tool counts usage: per DM sent, per active contact or per feature. It changes your bill more than the plan name.",
      "Per-contact pricing (ManyChat, Inrō) can jump after a viral post. Flat per-DM plans are easier to budget.",
      "For simple keyword-to-link DMs, a free plan from Poskoo, CreatorFlow, LinkDM, Zorcha or ReplyRush is enough to start.",
      "Pick ManyChat or Inrō when you need multi-step flows, several chat channels, a CRM or a team inbox.",
      "Only use tools that connect through Meta's official login. None should ever ask for your Instagram password.",
    ],
    faqs: [
      {
        q: "What is the best free Instagram auto-DM tool?",
        a: "It depends on what you need. Zorcha's free plan has no DM cap, ReplyRush Free allows 1,500 DMs a month, LinkDM Free 1,000 and Poskoo and CreatorFlow Free 500. Poskoo's free plan also includes a post scheduler. Check which features, such as email capture or follow gates, each free plan leaves out.",
      },
      {
        q: "Is ManyChat free for Instagram?",
        a: "ManyChat has a free plan, but in November 2026 it covered 25 active contacts a month with ManyChat branding and up to 4 live triggers. Paid plans start at $14 a month billed yearly for 250 active contacts.",
      },
      {
        q: "Can auto-DMs get my Instagram account banned?",
        a: "Tools that use Meta's official API and only message people who commented or messaged you first follow Instagram's rules. Avoid any tool that asks for your password or sends cold DMs to strangers.",
      },
      {
        q: "Do I need a business account for Instagram auto-DM?",
        a: "Yes. Meta only allows automated DMs through its API on Instagram Business or Creator accounts. Switching is free in the Instagram app settings.",
      },
      {
        q: "What is an active contact?",
        a: "Tools like ManyChat bill by active contacts: each person you interact with in a month counts once. A post that gets 3,000 commenters uses 3,000 contacts, even if each gets one DM.",
      },
      {
        q: "Can I schedule posts and auto-DM in the same tool?",
        a: "Most auto-DM tools do not schedule posts. Poskoo does both: you schedule the post and attach the keyword rule in one step, and the rule goes live when the post publishes.",
      },
    ],
    tools: [
      "/tools/instagram-comment-to-dm-calculator",
      "/tools/instagram-comment-keyword-tester",
      "/tools/instagram-comment-to-dm-preview",
      "/tools/instagram-dm-link-generator",
    ],
    related: ["cheapest-social-media-scheduling-tools-2026", "best-instagram-niches-2026"],
  },
  {
    slug: "cheapest-social-media-scheduling-tools-2026",
    title: "Cheapest Social Media Scheduling Tools in 2026",
    description:
      "8 cheap and free social media schedulers compared on real cost for 1 to 5 accounts, free plan limits and per-channel pricing quirks, plus who each suits.",
    h1: "The cheapest social media scheduling tools in 2026",
    subtitle:
      "Eight free and low-cost schedulers compared on what you actually pay, from one channel to five accounts.",
    crumb: "Cheapest scheduling tools 2026",
    excerpt: "8 free and cheap schedulers compared on real monthly cost.",
    category: "scheduling",
    author: "Poskoo team",
    published: "2026-11-12",
    updated: "2026-11-12",
    wordCount: 2081,
    cover: {
      src: "/guides/cheapest-social-media-scheduling-tools-2026.webp",
      width: 1280,
      height: 720,
      alt: "A creator holding a phone drops a gold coin into a pink piggy bank next to a spiral calendar filled with scheduled post cards",
    },
    takeaways: [
      "Meta Business Suite is free if you only post to Facebook and Instagram.",
      "Per-channel pricing (Buffer, Publer) is cheapest for one or two accounts but adds up as you connect more.",
      "Flat plans like Poskoo Pro or Metricool Starter usually win once you manage five or more accounts.",
      "Free plans differ: some cap posts per month, others cap posts queued at once, which you can top up each week.",
      "Count every subscription: a scheduler that also does Instagram comment-to-DM can replace a second tool.",
    ],
    faqs: [
      {
        q: "What is the cheapest social media scheduler?",
        a: "Meta Business Suite is free for Facebook and Instagram. For other networks, Buffer and Publer have free plans for up to 3 channels, and their paid plans start around $5 a month for one channel. For five accounts, flat plans such as Poskoo Pro ($14 a month billed yearly) cost less.",
      },
      {
        q: "Is there a completely free social media scheduler?",
        a: "Yes. Meta Business Suite is free for Facebook and Instagram, and Buffer, Publer, Metricool and Poskoo all have free plans with limits on accounts or posts. Later and SocialBee offer trials instead of free plans.",
      },
      {
        q: "Is Buffer still free in 2026?",
        a: "Yes. In November 2026 Buffer's free plan covered up to 3 channels with 10 scheduled posts per channel at a time. Paid Essentials costs $5 a month per channel, billed yearly.",
      },
      {
        q: "Which cheap scheduler supports Bluesky and Mastodon?",
        a: "Buffer and Poskoo both schedule to Bluesky and Mastodon. Publer supports both too. Metricool supports Bluesky.",
      },
      {
        q: "Should I pay monthly or yearly?",
        a: "Start monthly or on a free plan until you know you will stick with the tool, then switch to yearly. Most schedulers take 15 to 30% off for yearly billing.",
      },
      {
        q: "Can a cheap scheduler post Instagram Reels and Stories?",
        a: "Most can. Check the plan details, because some tools limit Stories or video posts. Poskoo schedules Instagram feed posts, Reels, carousels and Stories.",
      },
    ],
    tools: [
      "/tools/social-media-content-calendar",
      "/tools/instagram-scheduling-checklist",
      "/tools/best-time-to-post-on-instagram",
      "/tools/instagram-posting-frequency-calculator",
    ],
    related: ["best-instagram-auto-dm-tools-2026", "best-instagram-niches-2026"],
  },
  {
    slug: "how-to-schedule-instagram-posts",
    title: "How to Schedule Instagram Posts in 2026 (3 Free Ways)",
    description:
      "Learn how to schedule Instagram posts free in the app, Meta Business Suite or Poskoo, with steps, timing tips and mistakes to avoid in 2026.",
    h1: "How to schedule Instagram posts in 2026",
    subtitle:
      "Three free ways to schedule Instagram posts, the steps for each, and how to pick the one that fits how you post.",
    crumb: "Schedule Instagram posts",
    excerpt: "3 free ways to schedule Instagram posts, with steps and timing tips.",
    category: "scheduling",
    author: "Poskoo team",
    published: "2026-11-13",
    updated: "2026-11-13",
    wordCount: 1540,
    cover: {
      src: "/guides/cheapest-social-media-scheduling-tools-2026.webp",
      width: 1280,
      height: 720,
      alt: "A creator holding a phone drops a gold coin into a pink piggy bank next to a spiral calendar filled with scheduled post cards",
    },
    takeaways: [
      "You can schedule Instagram posts free in the Instagram app on a Professional account, in Meta Business Suite, or with a scheduler like Poskoo.",
      "The in-app option is quickest for one post on your phone; Meta Business Suite is better for planning on a desktop.",
      "A scheduler adds a queue, a calendar and comment-to-DM automation, which helps once you post several times a week.",
      "Check the time zone and aspect ratio before you save, or a post can publish at the wrong time or get cropped.",
      "Scheduling does not replace checking the queue: confirm every slot before a busy week or launch.",
    ],
    faqs: [
      {
        q: "Can you schedule Instagram Stories?",
        a: "Scheduling support for Stories varies by tool. The Instagram app is mainly built for scheduling feed posts, Reels and carousels, while some third-party schedulers, including Poskoo, can publish Stories. Check the current format list in the tool you use before you plan a Story-only campaign.",
      },
      {
        q: "Is scheduling Instagram posts free?",
        a: "Yes. Scheduling in the Instagram app is free on Business and Creator accounts, and Meta Business Suite is free for Facebook and Instagram. Third-party schedulers usually have a free plan with limits on accounts or posts, then a paid plan.",
      },
      {
        q: "Does scheduling a post affect its reach?",
        a: "There is no clear evidence that scheduling a post by itself lowers reach. What matters more is the content, how early people engage and whether the post suits the format. Publishing through an official API tool is different from using a bot that posts for you.",
      },
      {
        q: "Can you schedule Instagram posts from a computer?",
        a: "Yes, through Meta Business Suite or a third-party scheduler. The Instagram app itself is designed for posting from a phone, so a desktop tool is easier when your media and captions already live on your computer.",
      },
      {
        q: "Can you edit a scheduled Instagram post?",
        a: "Usually yes, as long as it has not published yet. You can open the scheduled post in the app, Business Suite or your scheduler and change the caption, media or time. Exact options depend on the tool and the post format.",
      },
      {
        q: "How far ahead can you schedule Instagram posts?",
        a: "Each tool sets its own limit, and the limit can change. Some planners allow weeks or months ahead, while others cap the queue. Check the current limit in your tool before you plan a long campaign.",
      },
    ],
    tools: [
      "/tools/instagram-scheduling-checklist",
      "/tools/best-time-to-post-on-instagram",
      "/tools/instagram-caption-generator",
      "/tools/instagram-image-size",
    ],
    related: ["cheapest-social-media-scheduling-tools-2026", "best-instagram-auto-dm-tools-2026"],
  },
  {
    slug: "how-to-schedule-tiktok-videos",
    title: "How to Schedule TikTok Videos in 2026 (Step by Step)",
    description:
      "Schedule TikTok videos free in TikTok Studio or Poskoo's official TikTok API scheduler, with steps, timing tips, size limits and fixes for failed posts.",
    h1: "How to schedule TikTok videos",
    subtitle:
      "The exact steps for TikTok Studio and Poskoo, the size and caption limits, and how to fix a video that failed.",
    crumb: "How to schedule TikTok videos",
    excerpt: "Schedule TikTok videos free in TikTok Studio or Poskoo, with steps and fixes.",
    category: "scheduling",
    author: "Poskoo team",
    published: "2026-11-14",
    updated: "2026-11-14",
    wordCount: 1387,
    cover: {
      src: "/guides/cheapest-social-media-scheduling-tools-2026.webp",
      width: 1280,
      height: 720,
      alt: "A creator holding a phone drops a coin into a piggy bank beside a spiral calendar filled with scheduled post cards for the week",
    },
    takeaways: [
      "You can schedule TikTok videos free in TikTok Studio on a desktop, or in Poskoo using TikTok's official Content Posting API.",
      "TikTok Studio accepts a schedule up to about 10 days ahead; Poskoo plans ahead on a week or month calendar across channels.",
      "Both routes are official, so neither asks for your TikTok password and you can revoke access at any time.",
      "Vertical 9:16 video fills the screen best, and a video must be at least 3 seconds and no longer than 10 minutes.",
      "Poskoo shows Published or Failed status in the queue, so you can fix the cause and retry a failed post.",
    ],
    faqs: [
      {
        q: "Can you schedule TikToks on the mobile app?",
        a: "TikTok Studio's scheduler is built for a desktop browser, so scheduling works best on a computer. On a phone you can still film, edit and post directly in the TikTok app. A scheduler such as Poskoo lets you pick the date and time from its browser interface.",
      },
      {
        q: "How far ahead can you schedule a TikTok?",
        a: "At the time of writing, TikTok Studio accepts a schedule up to about 10 days ahead. For a longer campaign, plan on the week or month calendar in a scheduler such as Poskoo, where you can edit, reschedule or delete a post before it is due.",
      },
      {
        q: "Does scheduling hurt TikTok reach?",
        a: "No. Scheduling does not change how the video is published: TikTok receives the same file and caption at the time you choose, exactly as if you had posted it from the app. Content and audience still matter most.",
      },
      {
        q: "Is scheduling TikTok videos free?",
        a: "Yes. TikTok Studio's scheduler is free to use once you sign in with your TikTok account. You do not need to pay to schedule a video there.",
      },
      {
        q: "What video length does TikTok accept?",
        a: "TikTok accepts MP4 and MOV video. In Poskoo a video must be at least 3 seconds and no longer than 10 minutes, with a 1 GB limit per file. Vertical 9:16 video, such as 1080 by 1920, fills the screen best.",
      },
      {
        q: "Why did my scheduled TikTok fail?",
        a: "The most common causes are an expired connection, missing posting permission, a video that is too long or too large, a visibility option that is no longer available, the daily posting limit, and photo posts linked from an unverified domain. Fix the cause, then retry the same post from the queue.",
      },
    ],
    tools: [
      "/tools/best-time-to-post-on-tiktok",
      "/tools/tiktok-video-size-checker",
      "/tools/tiktok-caption-counter",
      "/tools/tiktok-hashtag-generator",
    ],
    related: ["cheapest-social-media-scheduling-tools-2026", "social-media-seo-2026"],
  },
  {
    slug: "instagram-comment-to-dm-automation-guide",
    title: "Instagram Comment-to-DM Automation: The 2026 Playbook",
    description:
      "How Instagram comment-to-DM automation works under Meta's rules, with keyword lists, DM templates, follow and email gates, and a step-by-step setup.",
    h1: "Instagram comment-to-DM automation: the complete playbook",
    subtitle:
      "Meta's rules in plain English, keywords people actually type, DM templates to copy, and how to set it up and measure it.",
    crumb: "Comment-to-DM playbook",
    excerpt: "Meta's rules, keyword lists, DM templates and a step-by-step setup.",
    category: "auto-dm",
    author: "Poskoo team",
    published: "2026-11-15",
    updated: "2026-11-15",
    wordCount: 1790,
    cover: {
      src: "/landing/hero.webp",
      width: 1536,
      height: 1024,
      alt: "A woman sits on a giant phone showing a post with a GUIDE comment bubble, beside a calendar of scheduled posts, while an envelope with a link flies to a waving man holding a coffee and a dog looks on",
    },
    takeaways: [
      "Comment-to-DM automation sends a private message to anyone who comments your keyword, using Meta's official API.",
      "Meta allows one private reply per comment, sent within 7 days; follow-ups need the person to reply first.",
      "Pick one short keyword per offer, add variants like GUIDE and GUIDES, and use contains match by default.",
      "Deliver the promised link in the first two lines of the DM and end with a question to start a real conversation.",
      "Track keyword comments, DMs sent, link clicks and leads, and fix the weakest step first.",
    ],
    faqs: [
      {
        q: "Is Instagram comment-to-DM automation allowed?",
        a: "Yes, when it runs through Meta's official Instagram API. Private replies are a documented feature for Business and Creator accounts. Avoid tools that ask for your password or message people who never commented.",
      },
      {
        q: "How many DMs can I send per comment?",
        a: "Meta allows one private reply per comment, sent within 7 days of the comment. If the person replies, a standard messaging window opens and you can continue the conversation.",
      },
      {
        q: "Do I need a Business or Creator account?",
        a: "Yes. Automated DMs only work on Instagram professional accounts. Switching from a personal account is free and takes about a minute in the Instagram app.",
      },
      {
        q: "What makes a good comment keyword?",
        a: "A short, uncommon word that says what the person gets, such as GUIDE, PRICE or SHOP. Add common variants such as plurals, and show the keyword in the caption and on the post itself.",
      },
      {
        q: "Can I collect emails with comment-to-DM?",
        a: "Yes. In Poskoo, turn on Ask for email first and the DM asks for an address before sending the link. Captured emails are saved in Leads and can be exported as CSV. Check the pricing page for which plan includes email capture.",
      },
      {
        q: "Why didn't my auto-DM send?",
        a: "Common causes are a comment that doesn't match the keyword, an exact match rule when people wrote a sentence, a paused rule, or a disconnected account. Test your keywords first and check the rule's activity.",
      },
    ],
    tools: [
      "/tools/instagram-comment-keyword-tester",
      "/tools/instagram-comment-to-dm-preview",
      "/tools/instagram-comment-to-dm-calculator",
      "/tools/instagram-dm-link-generator",
      "/tools/instagram-utm-builder",
    ],
    related: ["best-instagram-auto-dm-tools-2026", "how-to-get-more-comments-on-instagram"],
  },
  {
    slug: "how-to-get-more-comments-on-instagram",
    title: "How to Get More Comments on Instagram: 12 Tactics",
    description:
      "12 ways to get more comments on Instagram, with sample captions, a reply routine, what to avoid and how to turn comments into DMs and leads.",
    h1: "How to get more comments on Instagram (and turn them into leads)",
    subtitle:
      "Twelve tactics with sample captions, a reply routine that keeps people talking, and a two-week plan to find what works for you.",
    crumb: "Get more Instagram comments",
    excerpt: "12 tactics, sample captions and a 2-week plan to get more comments.",
    category: "growth",
    author: "Poskoo team",
    published: "2026-11-15",
    updated: "2026-11-15",
    wordCount: 1670,
    cover: {
      src: "/illustrations/empty-inbox.webp",
      width: 1536,
      height: 1024,
      alt: "A woman on a purple beanbag holds a phone while colourful chat bubbles fly into a giant phone, with a dog asleep beside her",
    },
    takeaways: [
      "Ask one specific, easy question per post; \"A or B?\" gets more replies than \"Thoughts?\".",
      "Put the question on screen and say it out loud in Reels, not only in the caption.",
      "Reply to every comment early and ask something back to turn single comments into threads.",
      "Skip engagement bait, comment pods and bought comments: they add noise, not customers.",
      "Use a keyword call to action with comment-to-DM automation to turn comments into leads.",
    ],
    faqs: [
      {
        q: "Why am I getting views but no comments on Instagram?",
        a: "Usually because the post doesn't ask for a comment, or asks in a way that takes effort. End with one specific question or an A-or-B choice, put it on screen, and reply quickly to the first comments.",
      },
      {
        q: "Do comments help Instagram reach?",
        a: "Comments show that people found a post worth responding to, along with saves and shares. Treat them as one signal of interest rather than a guaranteed reach boost, and focus on content people want to talk about.",
      },
      {
        q: "Are comment pods allowed on Instagram?",
        a: "They are a poor idea. Pods bring comments from people who are not your audience, make your Insights harder to read and can look inauthentic. Real replies from your niche are worth more.",
      },
      {
        q: "How quickly should I reply to comments?",
        a: "As soon as you can, ideally in the first hour after posting. Early replies keep the conversation going while the post is being shown, and they encourage others to join in.",
      },
      {
        q: "What is a keyword comment call to action?",
        a: "A line such as \"Comment GUIDE and I'll send you the checklist\". When someone comments the keyword, comment-to-DM automation sends them the link in a private message.",
      },
    ],
    tools: [
      "/tools/instagram-engagement-rate-calculator",
      "/tools/instagram-hook-generator",
      "/tools/instagram-caption-generator",
      "/tools/instagram-comment-picker",
      "/tools/instagram-comment-keyword-tester",
    ],
    related: ["instagram-comment-to-dm-automation-guide", "how-to-get-more-instagram-followers"],
  },
  {
    slug: "how-to-find-your-best-time-to-post",
    title: "Best Time to Post on Social Media: Find Your Own in 2026",
    description:
      "There is no universal best time to post. Find yours: pick starting slots, read each platform's audience data, run a 2-3 week test and log results the right way.",
    h1: "How to find your best time to post on social media",
    subtitle:
      "A simple method instead of a generic chart: where to find your audience data on each platform, how to run a fair timing test and how to handle time zones.",
    crumb: "Find your best time to post",
    excerpt: "Skip the generic charts: test your own slots and keep the winners.",
    category: "scheduling",
    author: "Poskoo team",
    published: "2026-11-15",
    updated: "2026-11-15",
    wordCount: 1910,
    cover: {
      src: "/landing/multichannel.webp",
      width: 1536,
      height: 1024,
      alt: "A woman on a yellow beanbag with a laptop sends paper planes to phones, tablets and a desktop screen, each with a clock, while a dog sits beside her",
    },
    takeaways: [
      "There is no single best time for every account: the best time is when your own audience is online.",
      "Start with two or three slots (morning, lunch, evening) on your audience's clock, then check each platform's audience data.",
      "Test the slots for two to three weeks with the same format, scheduled to the exact minute, and log results at 48 hours.",
      "Compare like with like, use rates rather than totals, and look for a pattern instead of one viral post.",
      "Re-test every few months, because audiences, seasons and platforms change.",
    ],
    faqs: [
      {
        q: "What is the best time to post on social media?",
        a: "There is no single best time for every account. Good starting points are before work, lunchtime and the evening in your audience's time zone, but the real answer comes from your own analytics and a two to three week test of a few slots.",
      },
      {
        q: "Where can I see when my Instagram followers are online?",
        a: "With a professional account, open Insights from your professional dashboard and look at your followers. The Most active times chart shows the hours and days your followers use Instagram.",
      },
      {
        q: "Does posting time affect reach?",
        a: "It can help a little. Feeds are ranked rather than shown in time order, but a post that gets early views and replies has a better chance of being shown to more people. Content quality matters more than timing.",
      },
      {
        q: "Should I post at the same time on every platform?",
        a: "No. People use LinkedIn, Instagram, Threads and YouTube at different times and in different moods. Test each platform separately and keep the slots that win on each one.",
      },
      {
        q: "How long should a posting time test run?",
        a: "Two to three weeks is usually enough for a first answer, with at least three or four posts per slot. Rotate slots across days so no slot always gets the best day, then keep the winner and test a new slot next month.",
      },
      {
        q: "What if my followers are in different time zones?",
        a: "Post on the clock of your largest audience region. With two big regions, look for an overlapping hour or alternate slots on different days. If your audience is spread worldwide, timing matters less than a steady rhythm.",
      },
    ],
    tools: [
      "/tools/best-time-to-post-on-social-media",
      "/tools/best-time-to-post-on-instagram",
      "/tools/best-time-to-post-on-linkedin",
      "/tools/best-time-to-post-on-threads",
      "/tools/best-time-to-post-on-tiktok",
      "/tools/instagram-time-zone-converter",
      "/tools/instagram-engagement-rate-calculator",
    ],
    related: ["social-media-content-calendar-guide", "how-to-schedule-instagram-posts"],
  },
  {
    slug: "social-media-content-calendar-guide",
    title: "Social Media Content Calendar: Plan a Month in an Hour",
    description:
      "How to build a social media content calendar in one hour: goals, content pillars, a format mix, a sample 4-week plan you can copy and a weekly batching routine.",
    h1: "How to plan a social media content calendar (a month in one hour)",
    subtitle:
      "A timed, step-by-step method with content pillars, a full sample month for a small business, a weekly batching routine and a 15-minute monthly review.",
    crumb: "Social media content calendar",
    excerpt: "Plan a month of posts in an hour, with a sample calendar you can copy.",
    category: "scheduling",
    author: "Poskoo team",
    published: "2026-11-15",
    updated: "2026-11-15",
    wordCount: 1850,
    cover: {
      src: "/illustrations/empty-calendar.webp",
      width: 1536,
      height: 1024,
      alt: "A woman kneels beside a giant spiral wall calendar, pinning colourful photo cards into its squares, while a dog lies in the plants beside her",
    },
    takeaways: [
      "A content calendar only needs five columns: date, platform, format, content pillar and a one-line idea.",
      "Time-box the hour: 10 minutes on goal and pillars, 15 on ideas, 10 on a format mix, 15 filling the calendar and 10 scheduling week one.",
      "Three or four content pillars (teach, show, prove, sell) mean you never start from a blank page.",
      "Batch each week in one sitting and leave one open slot a week for reactive posts.",
      "Review the month in 15 minutes before planning the next: goal, top three posts, best pillar and what you skipped.",
    ],
    faqs: [
      {
        q: "What should a social media content calendar include?",
        a: "At minimum the date, the platform, the format (Reel, carousel, photo, text post), the content pillar it belongs to and a one-line idea specific enough to make. A status column and a link to the caption or media are useful extras.",
      },
      {
        q: "How far ahead should I plan social media content?",
        a: "A month is a practical horizon for most small businesses: far enough to plan launches and events, short enough to stay relevant. Batch and schedule one week at a time, and keep one open slot a week for timely posts.",
      },
      {
        q: "How many posts a week should be on my calendar?",
        a: "Plan the number you can keep for three months. For many small teams that is three to five feed posts a week plus Stories. If you planned five and made three last month, plan four this month.",
      },
      {
        q: "Is a spreadsheet good enough for a content calendar?",
        a: "Yes. A spreadsheet works well for planning. Poskoo's free content calendar template exports a CSV for Google Sheets or Excel. Once you post to several networks, a scheduler with a calendar view saves you copying posts into each app.",
      },
      {
        q: "Can AI plan my social media calendar?",
        a: "AI assistants such as ChatGPT or Claude are useful for brainstorming ideas from your goal and pillars. Edit what they suggest so it sounds like you and check any facts. Poskoo's MCP server can let an assistant create draft posts in your account for review.",
      },
      {
        q: "What are content pillars?",
        a: "Content pillars are the three or four recurring themes you post about, such as teaching, behind the scenes, customer proof and offers. They make planning faster and help new visitors understand what your account is about.",
      },
    ],
    tools: [
      "/tools/social-media-content-calendar",
      "/tools/instagram-post-ideas-generator",
      "/tools/social-media-post-generator",
      "/tools/best-time-to-post-on-social-media",
      "/tools/instagram-posting-frequency-calculator",
      "/tools/instagram-hook-generator",
    ],
    related: ["how-to-find-your-best-time-to-post", "how-to-cross-post-on-social-media"],
  },
  {
    slug: "instagram-reels-strategy-for-small-business",
    title: "Instagram Reels Strategy for Small Business (2026)",
    description:
      "An Instagram Reels strategy for small businesses: 8 formats with examples, hooks, length, safe zones, a weekly routine and how to turn views into DMs.",
    h1: "Instagram Reels strategy for small businesses",
    subtitle:
      "Eight Reel formats with real examples, hooks for the first two seconds, a weekly routine that fits around work, and a way to turn views into customers.",
    crumb: "Reels strategy for small business",
    excerpt: "8 Reel formats, hooks and a weekly routine that turns views into DMs.",
    category: "growth",
    author: "Poskoo team",
    published: "2026-11-15",
    updated: "2026-11-15",
    wordCount: 1720,
    cover: {
      src: "/illustrations/analytics.webp",
      width: 1536,
      height: 1024,
      alt: "A woman waters a row of rising green bar-chart plants with a watering can while hearts and an upward arrow float above, a dog beside her",
    },
    takeaways: [
      "Post two or three original Reels a week; Instagram recommends originals and drops aggregators from recommendations.",
      "Rotate three formats: one that shows skill, one that builds trust and one that helps the viewer.",
      "Say, show and write your hook in the first two seconds, with no greeting first.",
      "Film in one weekly batch on your phone, then schedule the Reels so posting never depends on a quiet moment.",
      "End each Reel with one comment keyword and judge it by non-follower reach, shares and saves, not likes.",
    ],
    faqs: [
      {
        q: "How many Reels should a small business post each week?",
        a: "Two or three a week is a realistic target for most small businesses. Pick a number you can keep for three months. A steady rhythm teaches you more than a burst of daily posting that stops after two weeks.",
      },
      {
        q: "How long should an Instagram Reel be?",
        a: "As long as the idea needs. Reels can be up to three minutes, but quick tips often work at 7 to 20 seconds and explainers at 30 to 60 seconds. Check where viewers drop off in Insights and tighten the next one.",
      },
      {
        q: "Do I need to show my face in Reels?",
        a: "No. Hands at work, a process, a before and after or a product demo all work without a face. Showing the team now and then does help people trust a small business, so try it once you are comfortable.",
      },
      {
        q: "Can I repost my TikTok videos as Reels?",
        a: "Yes, if they are your own videos. Download or export a clean file without another app's watermark first. Instagram does not treat watermarked content as eligible for recommendations.",
      },
      {
        q: "Should I use trending audio?",
        a: "Only when it fits the video. Clear speech or original sound that explains your work is usually more useful to a small business than a trending song with no connection to what you sell.",
      },
      {
        q: "Can I schedule Instagram Reels?",
        a: "Yes. Instagram lets professional accounts schedule in the app, and Poskoo schedules Reels from a browser alongside your other posts, then can auto-DM everyone who comments your keyword.",
      },
    ],
    tools: [
      "/tools/instagram-reels-size-checker",
      "/tools/instagram-safe-zone-checker",
      "/tools/instagram-reel-cover-maker",
      "/tools/instagram-hook-generator",
      "/tools/instagram-post-ideas-generator",
      "/tools/instagram-engagement-rate-calculator",
    ],
    related: ["how-to-get-more-instagram-followers", "instagram-comment-to-dm-automation-guide"],
  },
  {
    slug: "link-in-bio-best-practices",
    title: "Link in Bio Best Practices: What to Put on Yours",
    description:
      "Link in bio best practices: what to put on the page, in what order, how to word links, track clicks with UTMs and keep it in step with your latest posts.",
    h1: "Link in bio best practices: what to put on yours and how to get clicks",
    subtitle:
      "One main action, three to five links, labels that say what people get, and a page that changes when your posts do. With examples for creators, local businesses and coaches.",
    crumb: "Link in bio best practices",
    excerpt: "What to put on your link-in-bio page, in what order, and how to track clicks.",
    category: "auto-dm",
    author: "Poskoo team",
    published: "2026-11-15",
    updated: "2026-11-15",
    wordCount: 1790,
    cover: {
      src: "/guides/how-to-make-money-on-social-media-2026.webp",
      width: 1280,
      height: 720,
      alt: "A creator with a phone sends dotted paths out to a chain link, a gift box, a download folder, a video camera and a shop card, beside a piggy bank catching a coin",
    },
    takeaways: [
      "Put one main action at the top of your link-in-bio page and keep the whole list to three to five links.",
      "Instagram allows up to five bio links, but only the first shows in your bio; the rest sit behind a tap.",
      "Write labels that start with a verb and say what people get, such as \"Free 7-day meal plan (PDF)\".",
      "Track clicks per link and add UTM parameters so you can see what visitors do after the click.",
      "Update the top link whenever a post says \"link in bio\", and review the page once a month.",
    ],
    faqs: [
      {
        q: "How many links should a link-in-bio page have?",
        a: "Three to five is enough for most accounts. Put the one action you most want first, then the link from your latest post, a free resource, your main offer and one contact or trust link. More links usually means fewer clicks on the ones that matter.",
      },
      {
        q: "Can you add more than one link to an Instagram bio?",
        a: "Yes. Since April 2023 Instagram lets you add up to five links under Edit profile, then Links. Only the first link shows directly in your bio; the others appear in a pop-up when someone taps to see more.",
      },
      {
        q: "Do I still need a link-in-bio tool if Instagram allows five links?",
        a: "Not always. If you have one main destination, the native link is enough. A link-in-bio page helps when you promote different things from different posts, want click counts per link, or use the same link on several platforms.",
      },
      {
        q: "How do I track clicks on my link in bio?",
        a: "Use a link-in-bio tool that counts clicks per link, and add UTM parameters such as utm_source=instagram and utm_campaign=bio to each destination so your website analytics can show sign-ups and sales from those visits.",
      },
      {
        q: "What should my first link in bio be?",
        a: "The action that matches what you are posting about right now: the freebie from this week's Reel, a booking page or a product launch. Change it when your content moves on.",
      },
      {
        q: "Is Poskoo's link in bio free?",
        a: "Yes. The Free plan includes a link-in-bio page with up to 5 links, four colour themes and click counts per link. The Pro plan raises the limit to 20 links and is launching soon.",
      },
    ],
    tools: [
      "/tools/instagram-utm-builder",
      "/tools/instagram-bio-generator",
      "/tools/instagram-dm-link-generator",
      "/tools/instagram-comment-to-dm-preview",
      "/tools/instagram-profile-picture-size-checker",
    ],
    related: ["how-to-grow-email-list-from-instagram", "instagram-comment-to-dm-automation-guide"],
  },
  {
    slug: "how-to-grow-email-list-from-instagram",
    title: "How to Grow Your Email List From Instagram (2026)",
    description:
      "Grow your email list from Instagram: lead magnet ideas, where to promote them, comment-to-DM email capture, consent basics and a 3-email welcome sequence.",
    h1: "How to grow your email list from Instagram",
    subtitle:
      "Pick a freebie people want, promote it in every spot on your profile, collect emails in DMs with clear consent, and welcome new subscribers properly.",
    crumb: "Grow an email list from Instagram",
    excerpt: "Lead magnets, comment-to-DM email capture and a 3-email welcome sequence.",
    category: "auto-dm",
    author: "Poskoo team",
    published: "2026-11-15",
    updated: "2026-11-15",
    wordCount: 1680,
    cover: {
      src: "/illustrations/empty-leads.webp",
      width: 1536,
      height: 1024,
      alt: "A woman holding a big horseshoe magnet pulls in envelopes and round contact portraits that drop into a red box, a dog lying beside her",
    },
    takeaways: [
      "Followers are rented; an email list is the audience you own if reach drops or your account has trouble.",
      "Offer one small, specific freebie tied to what you sell, usable in under 15 minutes.",
      "Promote it in your bio link, Stories, Reels, carousel last slides, comment and DM keywords and a Highlight.",
      "Ask for the email in the DM with a plain consent line, then send the link straight away.",
      "Follow CAN-SPAM basics, check local rules such as GDPR or CASL, and send a short welcome sequence.",
    ],
    faqs: [
      {
        q: "What is the best lead magnet for Instagram?",
        a: "A small, specific resource connected to what you sell: a checklist, template, short plan, discount or early access. If people already ask you for it in DMs, it is a strong first choice.",
      },
      {
        q: "Can I collect emails directly in Instagram DMs?",
        a: "Yes. A comment-to-DM tool can ask for an email in the private reply and send the link once the person answers. Say clearly in the DM that they are joining your email list.",
      },
      {
        q: "Is it legal to email people who commented on my post?",
        a: "Only with permission to email them. A comment is a request for the freebie, not consent to marketing. Tell people they are joining your list, include an unsubscribe link and follow the rules where your subscribers live. This is not legal advice.",
      },
      {
        q: "Should I use a landing page or collect emails in DMs?",
        a: "Both work. DMs are easiest for comment keywords on Reels and carousels. A landing page suits your bio link, Story stickers and ads, where you have room to explain the offer.",
      },
      {
        q: "How do I get Instagram leads into my email tool?",
        a: "In Poskoo, captured contacts appear in your leads list and can be exported as a CSV, which most email tools can import. Use a separate tag or list so you know they came from Instagram.",
      },
      {
        q: "How often should I email my new subscribers?",
        a: "Send a short welcome sequence over the first week, then weekly or every two weeks. A steady rhythm matters more than a high frequency.",
      },
    ],
    tools: [
      "/tools/instagram-utm-builder",
      "/tools/instagram-dm-link-generator",
      "/tools/instagram-comment-keyword-tester",
      "/tools/instagram-comment-to-dm-preview",
      "/tools/instagram-comment-to-dm-calculator",
      "/tools/instagram-bio-generator",
    ],
    related: ["instagram-comment-to-dm-automation-guide", "link-in-bio-best-practices"],
  },
];

/** Minutes to read at ≈230 words per minute, at least 1. */
export const readingMinutes = (g: GuideEntry) => Math.max(1, Math.round(g.wordCount / 230));

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
export const guidePath = (slug: string) => `/guides/${slug}`;
export const categoryLabel = (c: GuideCategory) => GUIDE_CATEGORIES.find((x) => x.id === c)?.label ?? c;

/** Newest first by published date. */
export const GUIDES_BY_DATE = [...GUIDES].sort((a, b) => b.published.localeCompare(a.published));
