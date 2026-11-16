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
      src: "/landing/card-dm.webp",
      width: 1024,
      height: 1024,
      alt: "A relaxed creator on a beanbag while DMs fly out of his phone to new followers",
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
        a: "Meta Business Suite is free for Facebook and Instagram. For other networks, Buffer and Publer have free plans for up to 3 channels, and their paid plans start around $5 a month for one channel. For five accounts, flat plans such as Metricool Starter or Poskoo Pro (priced at $14 a month billed yearly once it launches) cost less.",
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
      src: "/landing/card-schedule.webp",
      width: 1024,
      height: 1024,
      alt: "A creator pins post cards onto a weekly calendar next to a smiling alarm clock",
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
      src: "/landing/multichannel.webp",
      width: 1536,
      height: 1024,
      alt: "A creator at a laptop sends one post that splits to several phones and screens",
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
];

/** Minutes to read at ≈230 words per minute, at least 1. */
export const readingMinutes = (g: GuideEntry) => Math.max(1, Math.round(g.wordCount / 230));

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
export const guidePath = (slug: string) => `/guides/${slug}`;
export const categoryLabel = (c: GuideCategory) => GUIDE_CATEGORIES.find((x) => x.id === c)?.label ?? c;

/** Newest first by published date. */
export const GUIDES_BY_DATE = [...GUIDES].sort((a, b) => b.published.localeCompare(a.published));
