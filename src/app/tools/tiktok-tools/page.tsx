import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import { AnimArt } from "@/components/AnimArt";
import { ToolCta, ToolFaqSection, toolMetadata } from "@/components/tools/ToolPageTemplate";
import { faqJsonLd, ldJson } from "@/components/tools/seo";
import { toolSoftwareJsonLd } from "@/lib/tool-schema";
import { networkAvailability, availabilityPhrase } from "@/components/ChannelStatusNote";
import t from "@/components/tools/tools.module.css";

const PATH = "/tools/tiktok-tools";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

export const metadata = toolMetadata({
  path: PATH,
  title: "Free TikTok Tools: Captions, Hashtags, Sizes & Ideas",
  description:
    "Free TikTok tools for captions, hooks, hashtags, video ideas, bios, usernames and video sizes. Use them in your browser, then schedule in Poskoo.",
});

type Tool = { href: string; name: string; text: string };

const groups: { id: string; title: string; intro: string; tools: Tool[] }[] = [
  {
    id: "text",
    title: "TikTok caption and text tools",
    intro: "Write a caption, hook and hashtag set that stops the scroll, then check it fits before you post.",
    tools: [
      { href: "/tools/tiktok-caption-generator", name: "TikTok caption generator", text: "Get caption ideas with hooks and a comment call to action for your next video." },
      { href: "/tools/tiktok-caption-counter", name: "TikTok caption counter", text: "Count caption characters and hashtags against TikTok's limit as you type." },
      { href: "/tools/tiktok-hook-generator", name: "TikTok hook generator", text: "Turn a topic into ready-to-say first lines in eight styles that stop the scroll." },
      { href: "/tools/tiktok-hashtag-generator", name: "TikTok hashtag generator", text: "Build a relevant hashtag set for your niche and copy it in one click." },
      { href: "/tools/tiktok-font-generator", name: "TikTok font generator", text: "Turn text into bold, italic and script styles for your bio and captions." },
      { href: "/tools/tiktok-video-ideas-generator", name: "TikTok video ideas generator", text: "Get six ready-to-use video ideas for your niche, each with a hook and caption starter." },
    ],
  },
  {
    id: "profile",
    title: "TikTok profile tools",
    intro: "Set up a profile that tells viewers what you do and looks sharp on every screen.",
    tools: [
      { href: "/tools/tiktok-bio-generator", name: "TikTok bio generator", text: "Draft a bio with emojis, line breaks and a call to action that fits the limit." },
      { href: "/tools/tiktok-username-generator", name: "TikTok username generator", text: "Find @username ideas from your name and niche that fit your brand." },
      { href: "/tools/tiktok-profile-picture-size-checker", name: "TikTok profile picture size checker", text: "Make sure your profile photo is square and sharp at every size." },
    ],
  },
  {
    id: "sizes",
    title: "TikTok video and photo size tools",
    intro: "Check the crop, ratio and safe zones before your video or photo goes live.",
    tools: [
      { href: "/tools/tiktok-video-size-checker", name: "TikTok video size checker", text: "Confirm your video is 1080×1920 and under the file size limit before you upload." },
      { href: "/tools/tiktok-photo-size-checker", name: "TikTok photo size checker", text: "Check photo dimensions and aspect ratio for photo carousels and posts." },
      { href: "/tools/tiktok-safe-zone-checker", name: "TikTok safe zone checker", text: "Keep text and buttons clear of the TikTok interface and captions." },
    ],
  },
  {
    id: "numbers",
    title: "TikTok stats and money tools",
    intro: "Measure what works and estimate what your account can earn.",
    tools: [
      { href: "/tools/tiktok-engagement-rate-calculator", name: "TikTok engagement rate calculator", text: "Compare videos by likes, comments and shares to see what works." },
      { href: "/tools/tiktok-money-calculator", name: "TikTok money calculator", text: "Estimate brand deal pay from followers and engagement, plus Creator Rewards." },
    ],
  },
];

const allTools = groups.flatMap((g) => g.tools);

function faqsFor(state: ReturnType<typeof networkAvailability>) {
  const notLive = state !== "live";
  const tiktokPhrase = availabilityPhrase(state, "TikTok");

  return [
    {
      q: "What are the best TikTok tools?",
      a: "The best TikTok tools are the ones that fix the job in front of you: a caption generator and counter for writing, a hook and hashtag generator for reach, size checkers for video and photos, a bio and username generator for your profile, and a scheduler for publishing. This hub groups all of them by task so you can start with the one you need.",
      aNode: (
        <>
          The best TikTok tools are the ones that fix the job in front of you: a caption generator and counter for
          writing, a hook and hashtag generator for reach, size checkers for video and photos, a bio and username
          generator for your profile, and a scheduler for publishing. This hub groups all of them by task so you can start
          with the one you need.
        </>
      ),
    },
    {
      q: "Are these TikTok tools free?",
      a: `Yes. Every tool on this page is free to use with no signup and no usage limit. They are made by ${BRAND.name}, a social media scheduler${notLive ? "" : " with TikTok scheduling"}, which has its own free plan if you want to schedule what you create.`,
      aNode: (
        <>
          Yes. Every tool on this page is free to use with no signup and no usage limit. They are made by {BRAND.name}, a
          social media scheduler{notLive ? "" : " with TikTok scheduling"}, which has its own free plan if you want to schedule what you
          create.
        </>
      ),
    },
    {
      q: "How do I schedule a TikTok video with Poskoo?",
      a: notLive
        ? `Not yet. TikTok publishing in Poskoo is ${tiktokPhrase}. Until then, draft your caption, hook and hashtags here and post from the TikTok app.`
        : `Draft your caption, hook and hashtags here, then open the TikTok scheduler to add the video to your calendar. Connect your TikTok account through the official login, pick a date and time, and ${BRAND.name} publishes it for you. You can create a free account to start.`,
      aNode: notLive ? (
        <>
          Not yet. TikTok publishing in Poskoo is {tiktokPhrase}. Until then, draft your caption, hook and hashtags here
          and post from the TikTok app. Follow the{" "}
          <Link href="/guides/how-to-schedule-tiktok-videos">step-by-step guide to scheduling TikTok videos</Link>.
        </>
      ) : (
        <>
          Draft your caption, hook and hashtags here, then open the{" "}
          <Link href="/tiktok-scheduler">TikTok scheduler</Link> to add the video to your calendar. Connect your TikTok
          account through the official login, pick a date and time, and {BRAND.name} publishes it for you. You can{" "}
          <Link href="/signup">create a free account</Link> to start, or follow the{" "}
          <Link href="/guides/how-to-schedule-tiktok-videos">step-by-step guide to scheduling TikTok videos</Link>.
        </>
      ),
    },
  ];
}

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Free TikTok tools",
  numberOfItems: allTools.length,
  itemListElement: allTools.map((tool, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: tool.name,
    url: `${BRAND.canonicalUrl}${tool.href}`,
  })),
};

const softwareJsonLd = toolSoftwareJsonLd({
  name: "TikTok tools",
  description:
    "A free collection of TikTok tools for captions, hooks, hashtags, video ideas, bios, usernames, video and photo sizes, engagement and earnings.",
  url: `${BRAND.canonicalUrl}${PATH}`,
});

export default function TikTokToolsPage() {
  const state = networkAvailability("tiktok");
  const faqs = faqsFor(state);
  return (
    <PublicShell breadcrumbs={[{ name: "TikTok tools", path: PATH }]}>
      {[itemListJsonLd, softwareJsonLd, faqJsonLd(faqs)].map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(data) }} />
      ))}
      <div className={`${t.page} ${t.hubPage}`}>
        <header className={`hero ${t.hero} ${t.hubHero}`}>
          <span className="pill">Free · no signup · runs in your browser</span>
          <h1>Free TikTok tools for every video</h1>
          <p className="lede">
            These free TikTok tools run in your browser to write captions, hooks and hashtags, size your video and
            photos, set up your profile and estimate your earnings, then schedule it all with {BRAND.name}.
          </p>
          <div className={t.heroCtas}>
            <Link className="btn btn-dark" href="/tiktok-scheduler">
              Schedule TikTok videos <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className={t.textLink} href="/signup">
              Create a free {BRAND.name} account <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="hero-art">
            <AnimArt
              name="features"
              label="A creator writes a TikTok caption next to a calendar, a vertical video and size guides"
            />
          </div>
        </header>

        <section className={t.section} aria-labelledby="tiktok-tools-list">
          <div className="head">
            <p className="eyebrow">All {allTools.length} tools</p>
            <h2 id="tiktok-tools-list">TikTok tools grouped by what you need to do</h2>
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

        <ToolFaqSection title="TikTok tools questions" faqs={faqs} />

        <section className={`${t.section} ${t.related}`}>
          <nav className="relChips" aria-label="Keep exploring">
            <span>Keep exploring</span>
            <Link href="/tiktok-scheduler">TikTok scheduler</Link>
            <Link href="/help/schedule-tiktok-posts">How to schedule TikTok videos</Link>
            <Link href="/guides/how-to-schedule-tiktok-videos">TikTok scheduling guide (2026)</Link>
            <Link href="/tools">All free tools</Link>
            <Link href="/signup">Free plan</Link>
            <Link href="/tools/best-time-to-post-on-tiktok">Best time to post on TikTok</Link>
            <Link href="/tools/instagram-tools">Instagram tools</Link>
          </nav>
        </section>

        <ToolCta
          cta={{
            title: "Draft it here,",
            mark: "schedule it on TikTok.",
            text:
              state === "live"
                ? `${BRAND.name} publishes your videos on time on the official TikTok API, so you can plan a week of posts in one sitting.`
                : `TikTok publishing in ${BRAND.name} is ${availabilityPhrase(state, "TikTok")}. Draft your caption, hook and hashtags here and post from the TikTok app for now.`,
          }}
        />
      </div>
    </PublicShell>
  );
}
