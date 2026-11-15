import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import { AnimArt } from "@/components/AnimArt";
import { ToolCta, ToolFaqSection, toolMetadata } from "@/components/tools/ToolPageTemplate";
import { faqJsonLd, ldJson } from "@/components/tools/seo";
import { toolSoftwareJsonLd } from "@/lib/tool-schema";
import t from "@/components/tools/tools.module.css";

const PATH = "/tools/youtube-tools";

export const metadata = toolMetadata({
  path: PATH,
  title: "Free YouTube Tools: Titles, Tags, Sizes & Hashtags",
  description:
    "Free YouTube tools for titles, tags, descriptions, thumbnail and Shorts sizes, handles and hashtags. Use them in your browser, then schedule in Poskoo.",
});

type Tool = { href: string; name: string; text: string };

const groups: { id: string; title: string; intro: string; tools: Tool[] }[] = [
  {
    id: "titles",
    title: "YouTube title and text tools",
    intro: "Write a title, description and tags that get found, then check they fit before you upload.",
    tools: [
      {
        href: "/tools/youtube-title-generator",
        name: "YouTube title generator",
        text: "Get title ideas with hooks and keywords for your next video or Short.",
      },
      {
        href: "/tools/youtube-title-counter",
        name: "YouTube title counter",
        text: "Count title, description and tag characters against YouTube's limits as you type.",
      },
      {
        href: "/tools/youtube-description-generator",
        name: "YouTube description generator",
        text: "Draft a description with a hook, summary, links and timestamps in one pass.",
      },
      {
        href: "/tools/youtube-tag-generator",
        name: "YouTube tag generator",
        text: "Build a tag set from your topic and copy it straight into YouTube Studio.",
      },
      {
        href: "/tools/youtube-hashtag-generator",
        name: "YouTube hashtag generator",
        text: "Pick relevant hashtags for your niche and keep within YouTube's limit.",
      },
    ],
  },
  {
    id: "channel",
    title: "YouTube channel tools",
    intro: "Set up a channel that looks sharp and tells viewers what you do.",
    tools: [
      {
        href: "/tools/youtube-handle-generator",
        name: "YouTube handle generator",
        text: "Find @handle ideas from your name and niche that fit your brand.",
      },
      {
        href: "/tools/youtube-banner-size-checker",
        name: "YouTube banner size checker",
        text: "Check your channel banner is 2048×1152 and safe on every screen size.",
      },
      {
        href: "/tools/youtube-profile-picture-size-checker",
        name: "YouTube profile picture size checker",
        text: "Make sure your channel photo is square and sharp at every size.",
      },
    ],
  },
  {
    id: "media-sizes",
    title: "YouTube video and Shorts size tools",
    intro: "Check the crop, ratio and safe zones before your video or Short goes live.",
    tools: [
      {
        href: "/tools/youtube-thumbnail-size-checker",
        name: "YouTube thumbnail size checker",
        text: "Confirm your thumbnail is 1280×720 and under the file size limit.",
      },
      {
        href: "/tools/youtube-shorts-size-checker",
        name: "YouTube Shorts size checker",
        text: "Check vertical video dimensions and file size before you schedule a Short.",
      },
      {
        href: "/tools/youtube-shorts-safe-zone-checker",
        name: "YouTube Shorts safe zone checker",
        text: "Keep text and buttons clear of the Shorts interface and captions.",
      },
    ],
  },
  {
    id: "planning",
    title: "YouTube planning and stats tools",
    intro: "Decide when to publish and how to measure what works.",
    tools: [
      {
        href: "/tools/best-time-to-post-on-youtube",
        name: "Best time to post on YouTube",
        text: "Pick your audience time zone and get three starting slots to test.",
      },
      {
        href: "/tools/youtube-engagement-rate-calculator",
        name: "YouTube engagement rate calculator",
        text: "Compare videos by likes, comments and shares to see what works.",
      },
    ],
  },
];

const allTools = groups.flatMap((g) => g.tools);

const faqs = [
  {
    q: "What are the best YouTube tools?",
    a: "The best YouTube tools are the ones that fix the job in front of you: a title generator and counter for writing, a description and tag generator for search, size checkers for thumbnails and Shorts, a handle generator for your channel, and a scheduler for publishing. This hub groups all of them by task so you can start with the one you need.",
    aNode: (
      <>
        The best YouTube tools are the ones that fix the job in front of you: a title generator and counter for
        writing, a description and tag generator for search, size checkers for thumbnails and Shorts, a handle
        generator for your channel, and a scheduler for publishing. This hub groups all of them by task so you can
        start with the one you need.
      </>
    ),
  },
  {
    q: "Are these YouTube tools free?",
    a: `Yes. Every tool on this page is free to use with no signup and no usage limit. They are made by ${BRAND.name}, a social media scheduler with YouTube scheduling, which has its own free plan if you want to schedule what you create.`,
    aNode: (
      <>
        Yes. Every tool on this page is free to use with no signup and no usage limit. They are made by {BRAND.name}, a
        social media scheduler with YouTube scheduling, which has its own free plan if you want to schedule what you
        create.
      </>
    ),
  },
  {
    q: "How do I schedule a YouTube video or Short with Poskoo?",
    a: `Draft your title, description and tags here, then open the YouTube scheduler to add the video or Short to your calendar. Connect your YouTube channel through Google's official login, pick a date and time, and ${BRAND.name} publishes it for you. You can create a free account to start.`,
    aNode: (
      <>
        Draft your title, description and tags here, then open the{" "}
        <Link href="/youtube-scheduler">YouTube scheduler</Link> to add the video or Short to your calendar. Connect
        your YouTube channel through Google&apos;s official login, pick a date and time, and {BRAND.name} publishes it
        for you. You can <Link href="/signup">create a free account</Link> to start, or follow the{" "}
        <Link href="/help/schedule-youtube-videos">step-by-step guide to scheduling YouTube videos</Link>.
      </>
    ),
  },
  {
    q: "Do these tools upload my files?",
    a: "No. Every tool runs in your browser and nothing is uploaded to a server. Size checkers read your image or video locally, and text tools only work on what you type. Your files stay on your device until you choose to upload them to YouTube yourself or schedule them in Poskoo.",
    aNode: (
      <>
        No. Every tool runs in your browser and nothing is uploaded to a server. Size checkers read your image or video
        locally, and text tools only work on what you type. Your files stay on your device until you choose to upload
        them to YouTube yourself or schedule them in Poskoo.
      </>
    ),
  },
];

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Free YouTube tools",
  numberOfItems: allTools.length,
  itemListElement: allTools.map((tool, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: tool.name,
    url: `${BRAND.url}${tool.href}`,
  })),
};

const softwareJsonLd = toolSoftwareJsonLd({
  name: "YouTube tools",
  description:
    "A free collection of YouTube tools for titles, descriptions, tags, hashtags, channel art, thumbnail and Shorts sizes, planning and engagement stats.",
  url: `${BRAND.url}${PATH}`,
});

export default function YouTubeToolsPage() {
  return (
    <PublicShell breadcrumbs={[{ name: "YouTube tools", path: PATH }]}>
      {[itemListJsonLd, softwareJsonLd, faqJsonLd(faqs)].map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(data) }} />
      ))}
      <div className={`${t.page} ${t.hubPage}`}>
        <header className={`hero ${t.hero} ${t.hubHero}`}>
          <span className="pill">Free · no signup · runs in your browser</span>
          <h1>Free YouTube tools for every upload</h1>
          <p className="lede">
            These free YouTube tools cover every step of a video: write the title, description and tags, size the
            thumbnail and Shorts, set up your channel and plan when to publish. Draft and check everything here, then
            schedule it with {BRAND.name}.
          </p>
          <div className={t.heroCtas}>
            <Link className="btn btn-dark" href="/youtube-scheduler">
              Schedule YouTube videos <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className={t.textLink} href="/signup">
              Create a free {BRAND.name} account <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="hero-art">
            <AnimArt
              name="features"
              label="A creator writes a YouTube title next to a calendar, a video thumbnail and Shorts size guides"
            />
          </div>
        </header>

        <section className={t.section} aria-labelledby="youtube-tools-list">
          <div className="head">
            <p className="eyebrow">All {allTools.length} tools</p>
            <h2 id="youtube-tools-list">YouTube tools grouped by what you need to do</h2>
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

        <ToolFaqSection title="YouTube tools questions" faqs={faqs} />

        <section className={`${t.section} ${t.related}`}>
          <nav className="relChips" aria-label="Keep exploring">
            <span>Keep exploring</span>
            <Link href="/youtube-scheduler">YouTube scheduler</Link>
            <Link href="/help/schedule-youtube-videos">How to schedule YouTube videos</Link>
            <Link href="/tools">All free tools</Link>
            <Link href="/signup">Free plan</Link>
            <Link href="/help/schedule-youtube-videos">How to schedule YouTube Shorts</Link>
            <Link href="/tools/instagram-tools">Instagram tools</Link>
            <Link href="/tools/threads-tools">Threads tools</Link>
            <Link href="/tools/tiktok-tools">TikTok tools</Link>
          </nav>
        </section>

        <ToolCta
          cta={{
            title: "Draft it here,",
            mark: "schedule it on YouTube.",
            text: `${BRAND.name} publishes your videos and Shorts on time on the official YouTube API, so you can plan a week of uploads in one sitting.`,
          }}
        />
      </div>
    </PublicShell>
  );
}
