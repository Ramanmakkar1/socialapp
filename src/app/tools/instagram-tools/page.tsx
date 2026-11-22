import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import { AnimArt } from "@/components/AnimArt";
import { ToolCta, ToolFaqSection, toolMetadata } from "@/components/tools/ToolPageTemplate";
import { faqJsonLd, ldJson } from "@/components/tools/seo";
import { toolSoftwareJsonLd } from "@/lib/tool-schema";
import t from "@/components/tools/tools.module.css";

const PATH = "/tools/instagram-tools";

export const metadata = toolMetadata({
  path: PATH,
  title: "Free Instagram Tools: Captions, Bios, Sizes & Hashtags",
  description:
    "Free Instagram tools for captions, bios, image sizes, hashtags, planning and comment-to-DM. No signup, runs in your browser, then schedule with Poskoo.",
});

type Tool = { href: string; name: string; text: string };

const groups: { id: string; title: string; intro: string; tools: Tool[] }[] = [
  {
    id: "captions",
    title: "Instagram caption tools",
    intro: "Write a caption that stops the scroll, then check it fits before you post.",
    tools: [
      {
        href: "/tools/instagram-caption-generator",
        name: "Instagram caption generator",
        text: "Get caption drafts with hooks, line breaks and a comment call to action for your next post.",
      },
      {
        href: "/tools/instagram-caption-counter",
        name: "Instagram caption counter",
        text: "Count characters and hashtags against the 2,200-character limit as you type.",
      },
      {
        href: "/tools/instagram-caption-formatter",
        name: "Instagram caption formatter",
        text: "Keep blank lines and spacing, check counts, then copy clean caption text.",
      },
      {
        href: "/tools/instagram-hook-generator",
        name: "Instagram hook generator",
        text: "Get ready-to-copy Reel hooks in eight styles, from curiosity to result.",
      },
      {
        href: "/tools/instagram-post-ideas-generator",
        name: "Instagram post ideas generator",
        text: "Get six post ideas for your niche, with a hook and caption starter for each.",
      },
      {
        href: "/tools/instagram-line-break-generator",
        name: "Instagram line break generator",
        text: "Fix paragraph spacing so your caption reads the way you wrote it.",
      },
    ],
  },
  {
    id: "bios",
    title: "Instagram bio and profile tools",
    intro: "Build a profile that tells people what you do and what to tap next.",
    tools: [
      {
        href: "/tools/instagram-bio-generator",
        name: "Instagram bio generator",
        text: "Write bio ideas with emojis, line breaks and a clear call to action.",
      },
      {
        href: "/tools/instagram-username-generator",
        name: "Instagram username generator",
        text: "Find handle ideas from your name and niche that fit your brand.",
      },
      {
        href: "/tools/instagram-font-generator",
        name: "Instagram font generator",
        text: "Turn text into bold, italic, script and small-caps styles for your bio.",
      },
      {
        href: "/tools/instagram-highlight-cover-maker",
        name: "Instagram highlight cover maker",
        text: "Make matching highlight covers with icons and your brand colours.",
      },
      {
        href: "/tools/instagram-dm-link-generator",
        name: "Instagram DM link generator",
        text: "Create an ig.me link that opens a direct message with your account.",
      },
    ],
  },
  {
    id: "media-sizes",
    title: "Instagram image and video size tools",
    intro: "Check the crop, ratio and safe zones before your media goes live.",
    tools: [
      {
        href: "/tools/instagram-image-size",
        name: "Instagram image size guide",
        text: "Check the right sizes for feed posts, Reels and Stories before you upload.",
      },
      {
        href: "/tools/social-media-image-sizes",
        name: "Social media image sizes",
        text: "See 2026 sizes for nine platforms in one table, including Instagram.",
      },
      {
        href: "/tools/instagram-carousel-size-checker",
        name: "Instagram carousel size checker",
        text: "Check every slide's pixel size, ratio and file size, and whether they match.",
      },
      {
        href: "/tools/instagram-story-size-checker",
        name: "Instagram story size checker",
        text: "Confirm your Story is 1080×1920 and clear of the app interface.",
      },
      {
        href: "/tools/instagram-reels-size-checker",
        name: "Instagram Reel size checker",
        text: "Check Reel dimensions and file size before you schedule or upload.",
      },
      {
        href: "/tools/instagram-profile-picture-size-checker",
        name: "Instagram profile picture size checker",
        text: "Make sure your profile photo is square and sharp at every size.",
      },
      {
        href: "/tools/instagram-safe-zone-checker",
        name: "Instagram safe zone checker",
        text: "Keep text and buttons clear of the Reels and Stories interface.",
      },
      {
        href: "/tools/instagram-image-resizer",
        name: "Instagram image resizer",
        text: "Resize a photo to the right Instagram dimensions without uploading it.",
      },
      {
        href: "/tools/instagram-carousel-splitter",
        name: "Instagram carousel splitter",
        text: "Split one image into equal-width carousel slides and download them.",
      },
      {
        href: "/tools/instagram-grid-maker",
        name: "Instagram grid maker",
        text: "Plan a seamless grid by previewing how posts line up on your profile.",
      },
      {
        href: "/tools/instagram-carousel-maker",
        name: "Instagram carousel maker",
        text: "Build a multi-slide carousel with consistent layout and branding.",
      },
      {
        href: "/tools/instagram-story-maker",
        name: "Instagram story maker",
        text: "Make a 1080×1920 Story with a photo, text and gradient background.",
      },
      {
        href: "/tools/instagram-reel-cover-maker",
        name: "Instagram Reel cover maker",
        text: "Make a Reel cover whose title stays inside the profile-grid crop.",
      },
    ],
  },
  {
    id: "planning",
    title: "Instagram planning and scheduling tools",
    intro: "Decide what to post, when to post it and how to measure it.",
    tools: [
      {
        href: "/tools/instagram-scheduling-checklist",
        name: "Instagram scheduling checklist",
        text: "Check caption, media, channel, time zone and account before you schedule.",
      },
      {
        href: "/tools/instagram-posting-frequency-calculator",
        name: "Instagram posting frequency calculator",
        text: "Turn your weekly time budget into a realistic posting range and plan.",
      },
      {
        href: "/tools/social-media-content-calendar",
        name: "Social media content calendar",
        text: "Plan a week of posts across formats and keep every idea in one place.",
      },
      {
        href: "/tools/best-time-to-post-on-instagram",
        name: "Best time to post on Instagram",
        text: "Pick your audience time zone and get three starting slots to test.",
      },
      {
        href: "/tools/instagram-time-zone-converter",
        name: "Instagram time zone converter",
        text: "Convert a posting time between zones with daylight saving handled.",
      },
      {
        href: "/tools/social-media-scheduler-plan-calculator",
        name: "Scheduler plan calculator",
        text: "Find the smallest Poskoo plan that fits your accounts and posts.",
      },
      {
        href: "/tools/instagram-post-preview",
        name: "Instagram post preview",
        text: "See your photo and caption in a feed mockup before you publish.",
      },
      {
        href: "/tools/instagram-utm-builder",
        name: "Instagram UTM builder",
        text: "Tag links for your bio and auto-DMs so you can track what brings leads.",
      },
      {
        href: "/tools/instagram-comment-picker",
        name: "Instagram comment picker",
        text: "Pick giveaway winners at random, then follow up with an auto-DM.",
      },
      {
        href: "/tools/instagram-engagement-rate-calculator",
        name: "Instagram engagement rate calculator",
        text: "Compare posts by likes, comments, saves and shares to see what works.",
      },
      {
        href: "/tools/instagram-money-calculator",
        name: "Instagram money calculator",
        text: "Estimate sponsored-post pay from your followers and engagement rate.",
      },
    ],
  },
  {
    id: "hashtags",
    title: "Instagram hashtag tools",
    intro: "Build a hashtag set that fits your niche and the platform's limits.",
    tools: [
      {
        href: "/tools/instagram-hashtag-generator",
        name: "Instagram hashtag generator",
        text: "Build custom hashtag sets from hand-curated niches and copy them in one click.",
      },
      {
        href: "/tools/hashtag-generator",
        name: "Hashtag generator for every platform",
        text: "Generate hashtag sets for Instagram, TikTok, LinkedIn, YouTube, Facebook and X.",
      },
      {
        href: "/tools/instagram-hashtag-strategy",
        name: "Instagram hashtag strategy",
        text: "Plan a mix of broad, niche and branded tags instead of guessing.",
      },
    ],
  },
  {
    id: "comment-to-dm",
    title: "Instagram comment-to-DM tools",
    intro: "Test the keyword flow that turns comments into DMs and leads.",
    tools: [
      {
        href: "/tools/instagram-comment-keyword-tester",
        name: "Instagram comment keyword tester",
        text: "Test keywords and match types before you set up an auto-DM rule.",
      },
      {
        href: "/tools/instagram-comment-to-dm-calculator",
        name: "Instagram comment-to-DM calculator",
        text: "Estimate campaign results from views, comment rate, delivery and clicks.",
      },
      {
        href: "/tools/instagram-comment-to-dm-preview",
        name: "Instagram comment-to-DM preview",
        text: "Preview a keyword flow with your comments and DM text, all locally.",
      },
      {
        href: "/tools/instagram-dm-link-generator",
        name: "Instagram DM link generator",
        text: "Create an ig.me link that opens a direct message with your account.",
      },
    ],
  },
];

const allTools = groups.flatMap((g) => g.tools);

const faqs = [
  {
    q: "What are the best Instagram tools?",
    a: "The best Instagram tools are the ones that fix the job in front of you: a caption generator and counter for writing, a bio generator for your profile, size checkers for photos and Reels, a hashtag generator for reach, and a scheduler for publishing. This hub groups all of them by task so you can start with the one you need.",
    aNode: (
      <>
        The best Instagram tools are the ones that fix the job in front of you: a caption generator and counter for
        writing, a bio generator for your profile, size checkers for photos and Reels, a hashtag generator for reach,
        and a scheduler for publishing. This hub groups all of them by task so you can start with the one you need.
      </>
    ),
  },
  {
    q: "Are these Instagram tools free?",
    a: `Yes. Every tool on this page is free to use with no signup and no usage limit. They are made by ${BRAND.name}, a social media scheduler with Instagram auto-DM, which has its own free plan if you want to schedule what you create.`,
    aNode: (
      <>
        Yes. Every tool on this page is free to use with no signup and no usage limit. They are made by {BRAND.name}, a
        social media scheduler with Instagram auto-DM, which has its own free plan if you want to schedule what you
        create.
      </>
    ),
  },
  {
    q: "How do I schedule what I create with these tools?",
    a: `Draft your caption, bio or media here, then open the Instagram scheduler to add the post to your calendar. Connect your Instagram account through Meta's official login, pick a date and time, and ${BRAND.name} publishes it for you. You can create a free account to start.`,
    aNode: (
      <>
        Draft your caption, bio or media here, then open the{" "}
        <Link href="/instagram-scheduler">Instagram scheduler</Link> to add the post to your calendar. Connect your
        Instagram account through Meta&apos;s official login, pick a date and time, and {BRAND.name} publishes it for
        you. You can <Link href="/signup">create a free account</Link> to start.
      </>
    ),
  },
  {
    q: "Can I turn comments into DMs with these tools?",
    a: `Yes. Test your keyword with the comment keyword tester, then set up a rule in Instagram auto-DM. When someone comments your keyword, ${BRAND.name} sends them a private DM with your link and can capture their email. Start from a ready-made template if you want a head start.`,
    aNode: (
      <>
        Yes. Test your keyword with the comment keyword tester, then set up a rule in{" "}
        <Link href="/instagram-auto-dm">Instagram auto-DM</Link>. When someone comments your keyword, {BRAND.name}{" "}
        sends them a private DM with your link and can capture their email. Start from a{" "}
        <Link href="/instagram-auto-dm/templates">ready-made auto-DM template</Link> if you want a head start.
      </>
    ),
  },
];

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Free Instagram tools",
  numberOfItems: allTools.length,
  itemListElement: allTools.map((tool, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: tool.name,
    url: `${BRAND.url}${tool.href}`,
  })),
};

const softwareJsonLd = toolSoftwareJsonLd({
  name: "Instagram tools",
  description:
    "A free collection of Instagram tools for captions, bios, image sizes, hashtags, planning and comment-to-DM automation.",
  url: `${BRAND.url}${PATH}`,
});

export default function InstagramToolsPage() {
  return (
    <PublicShell breadcrumbs={[{ name: "Instagram tools", path: PATH }]}>
      {[itemListJsonLd, softwareJsonLd, faqJsonLd(faqs)].map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(data) }} />
      ))}
      <div className={`${t.page} ${t.hubPage}`}>
        <header className={`hero ${t.hero} ${t.hubHero}`}>
          <span className="pill">Free · no signup · runs in your browser</span>
          <h1>Free Instagram tools for captions, bios, sizes and DMs</h1>
          <p className="lede">
            These free Instagram tools cover every step of a post: write the caption, build your bio, size the media,
            plan the week, pick hashtags and test a comment-to-DM flow. Draft and check everything here, then schedule
            it with {BRAND.name}.
          </p>
          <div className={t.heroCtas}>
            <Link className="btn btn-dark" href="/instagram-scheduler">
              Schedule Instagram posts <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className={t.textLink} href="/signup">
              Create a free {BRAND.name} account <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="hero-art">
            <AnimArt
              name="features"
              label="A creator writes an Instagram caption next to a calendar, chat bubbles and image size guides"
            />
          </div>
        </header>

        <section className={t.section} aria-labelledby="instagram-tools-list">
          <div className="head">
            <p className="eyebrow">All {allTools.length} tools</p>
            <h2 id="instagram-tools-list">Instagram tools grouped by what you need to do</h2>
          </div>
          {groups.map((group) => (
            <div key={group.id} id={group.id} className={t.section}>
              <div className="head">
                <h3>{group.title}</h3>
                <p>{group.intro}</p>
              </div>
              <ul className={t.grid}>
                {group.tools.map((tool) => (
                  <li key={tool.href}>
                    <Link className={t.card} href={tool.href}>
                      <span className={t.cardTop}>
                        <b>{tool.name}</b>
                      </span>
                      <p>{tool.text}</p>
                      <span className={t.go}>
                        Open the free tool <span aria-hidden="true">→</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className={t.section} aria-labelledby="instagram-workflow">
          <div className="head">
            <p className="eyebrow">Your next step</p>
            <h2 id="instagram-workflow">Turn your Instagram workflow into growth</h2>
          </div>
          <ul className={t.grid}>
            <li>
              <Link className={t.card} href="/instagram-scheduler">
                <span className={t.cardTop}>
                  <b>Create content</b>
                </span>
                <p>Plan and schedule Instagram posts, Reels and Stories from one calendar.</p>
                <span className={t.go}>
                  Open the Instagram scheduler <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
            <li>
              <Link className={t.card} href="/features/instagram-comment-to-dm">
                <span className={t.cardTop}>
                  <b>Turn comments into leads</b>
                </span>
                <p>Send automatic DMs, share links and capture leads from comment keywords.</p>
                <span className={t.go}>
                  Set up Instagram comment-to-DM <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
            <li>
              <Link className={t.card} href="/social-media-analytics">
                <span className={t.cardTop}>
                  <b>Track results</b>
                </span>
                <p>Measure reach, engagement and audience growth across your social accounts.</p>
                <span className={t.go}>
                  Explore social media analytics <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          </ul>
        </section>

        <ToolFaqSection title="Instagram tools questions" faqs={faqs} />

        <section className={`${t.section} ${t.related}`}>
          <nav className="relChips" aria-label="Keep exploring">
            <span>Keep exploring</span>
            <Link href="/instagram-scheduler">Instagram scheduler</Link>
            <Link href="/instagram-auto-dm">Instagram auto DM</Link>
            <Link href="/instagram-auto-dm/templates">Auto-DM templates</Link>
            <Link href="/instagram-dm-automation">Instagram DM automation</Link>
            <Link href="/instagram-link-in-bio">Link in bio page</Link>
            <Link href="/tools/threads-tools">Threads tools</Link>
            <Link href="/tools/facebook-tools">Facebook tools</Link>
            <Link href="/tools/tiktok-tools">TikTok tools</Link>
            <Link href="/guides/best-instagram-niches-2026">Best Instagram niches for 2026</Link>
            <Link href="/tools">All free social media tools</Link>
          </nav>
        </section>

        <ToolCta
          cta={{
            title: "Draft it here,",
            mark: "schedule it on Instagram.",
            text: `${BRAND.name} publishes your posts on time on the official Meta API, and can auto-DM everyone who comments a keyword.`,
          }}
        />
      </div>
    </PublicShell>
  );
}
