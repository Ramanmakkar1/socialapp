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

const PATH = "/tools/x-tools";

// Readiness / platform copy follows the RUNTIME env (the Docker build has no env): regenerate at most every 10 minutes.
export const revalidate = 600;

export function generateMetadata() {
  return toolMetadata({
    path: PATH,
    title: "Free X (Twitter) Tools: Threads, Bios, Counters & More",
    description:
      networkAvailability("x") === "live"
        ? "Free X (Twitter) tools for posts, threads, bios, fonts, hashtags, character counts, previews, header sizes and engagement stats. No signup, then schedule."
        : "Free X (Twitter) tools for posts, threads, bios, fonts, hashtags, character counts, previews, header sizes and engagement stats. No signup needed.",
  });
}

type Tool = { href: string; name: string; text: string };

const groups: { id: string; title: string; intro: string; tools: Tool[] }[] = [
  {
    id: "writing",
    title: "X post and thread writing tools",
    intro: "Draft a post or thread, check it fits and see exactly how it will look before you publish.",
    tools: [
      {
        href: "/tools/x-post-generator",
        name: "X post generator",
        text: "Turn a topic into ready-to-post X drafts with hooks and a clear call to action.",
      },
      {
        href: "/tools/x-thread-maker",
        name: "X thread maker",
        text: "Split a long idea into numbered posts that stay under the character limit.",
      },
      {
        href: "/tools/x-character-counter",
        name: "X character counter",
        text: "Count characters and see how much room you have left in a post or thread.",
      },
      {
        href: "/tools/x-post-preview",
        name: "X post preview",
        text: "Preview your post in the timeline layout, with links, hashtags and line breaks.",
      },
    ],
  },
  {
    id: "profile",
    title: "X profile and branding tools",
    intro: "Make your profile look sharp with a clear bio, styled text and a correctly sized header.",
    tools: [
      {
        href: "/tools/x-bio-generator",
        name: "X bio generator",
        text: "Write a profile bio with your name, what you do and a call to action in 160 characters.",
      },
      {
        href: "/tools/x-font-generator",
        name: "X font generator",
        text: "Create bold and stylish text for posts, bios and display names, then copy it.",
      },
      {
        href: "/tools/x-header-size-checker",
        name: "X header size checker",
        text: "Check your profile header image is the right size and safe on every screen.",
      },
    ],
  },
  {
    id: "growth",
    title: "X growth and planning tools",
    intro: "Find the right tags, measure what works and pick a time to publish.",
    tools: [
      {
        href: "/tools/x-hashtag-generator",
        name: "X hashtag generator",
        text: "Get relevant hashtags for your niche and keep your post easy to read.",
      },
      {
        href: "/tools/x-engagement-rate-calculator",
        name: "X engagement rate calculator",
        text: "Compare posts by likes, replies and reposts to see what your audience responds to.",
      },
      {
        href: "/tools/best-time-to-post-on-x",
        name: "Best time to post on X",
        text: "Pick your audience time zone and get starting slots to test for more reach.",
      },
    ],
  },
];

const allTools = groups.flatMap((g) => g.tools);

function faqsFor(state: ReturnType<typeof networkAvailability>) {
  const notLive = state !== "live";
  const xPhrase = availabilityPhrase(state, "X");

  return [
    {
      q: "What are the best free X tools?",
      a: "The best free X tools are the ones that fix the job in front of you: a post generator and thread maker for writing, a character counter and post preview for checking, a bio and font generator for your profile, a header size checker for images, a hashtag generator for reach, an engagement rate calculator for stats and a best-time guide for planning. This hub groups all of them by task so you can start with the one you need.",
      aNode: (
        <>
          The best free X tools are the ones that fix the job in front of you: a post generator and thread maker for
          writing, a character counter and post preview for checking, a bio and font generator for your profile, a header
          size checker for images, a hashtag generator for reach, an engagement rate calculator for stats and a best-time
          guide for planning. This hub groups all of them by task so you can start with the one you need.
        </>
      ),
    },
    {
      q: "Are these X (Twitter) tools free?",
      a: `Yes. Every tool on this page is free to use with no signup and no usage limit. They are made by ${BRAND.name}, a social media scheduler${notLive ? "" : " with X scheduling"}, which has its own free plan if you want to schedule what you create.`,
      aNode: (
        <>
          Yes. Every tool on this page is free to use with no signup and no usage limit. They are made by {BRAND.name}, a
          social media scheduler{notLive ? "" : " with X scheduling"}, which has its own free plan if you want to schedule what you create.
        </>
      ),
    },
    {
      q: "How do I schedule an X post with Poskoo?",
      a: notLive
        ? `Not yet. X publishing in Poskoo is ${xPhrase}. Until then, draft and check your post here and publish it from the X app.`
        : `Draft your post or thread here, then open the X scheduler to add it to your calendar. Connect your X account through the official login, pick a date and time, and ${BRAND.name} publishes it for you. You can create a free account to start.`,
      aNode: notLive ? (
        <>
          Not yet. X publishing in Poskoo is {xPhrase}. Until then, draft and check your post here and publish it from
          the X app.
        </>
      ) : (
        <>
          Draft your post or thread here, then open the <Link href="/x-scheduler">X scheduler</Link> to add it to your
          calendar. Connect your X account through the official login, pick a date and time, and {BRAND.name} publishes it
          for you. You can <Link href="/signup">create a free account</Link> to start.
        </>
      ),
    },
    {
      q: "Do these tools upload my text or images?",
      a: "No. Every tool runs in your browser and nothing is uploaded to a server. Size checkers read your image locally, and text tools only work on what you type. Your files stay on your device until you choose to upload them to X yourself or schedule them in Poskoo.",
      aNode: (
        <>
          No. Every tool runs in your browser and nothing is uploaded to a server. Size checkers read your image locally,
          and text tools only work on what you type. Your files stay on your device until you choose to upload them to X
          yourself or schedule them in Poskoo.
        </>
      ),
    },
  ];
}

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Free X (Twitter) tools",
  numberOfItems: allTools.length,
  itemListElement: allTools.map((tool, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: tool.name,
    url: `${BRAND.canonicalUrl}${tool.href}`,
  })),
};

const softwareJsonLd = toolSoftwareJsonLd({
  name: "X (Twitter) tools",
  description:
    "A free collection of X (Twitter) tools for posts, threads, bios, fonts, hashtags, character counts, previews, header sizes, engagement stats and posting times.",
  url: `${BRAND.canonicalUrl}${PATH}`,
});

export default function XToolsPage() {
  const state = networkAvailability("x");
  const faqs = faqsFor(state);
  return (
    <PublicShell breadcrumbs={[{ name: "X tools", path: PATH }]}>
      {[itemListJsonLd, softwareJsonLd, faqJsonLd(faqs)].map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(data) }} />
      ))}
      <div className={`${t.page} ${t.hubPage}`}>
        <header className={`hero ${t.hero} ${t.hubHero}`}>
          <span className="pill">Free · no signup · runs in your browser</span>
          <h1>Free X (Twitter) Tools</h1>
          <p className="lede">
            X, formerly Twitter, is the microblogging network where you post short updates and threads. These free X
            tools cover every step: write the post or thread, check the character count and preview, build your bio and
            profile, find hashtags, measure engagement and pick when to publish.{" "}
            {state === "live"
              ? `Draft and check everything here, then schedule it with ${BRAND.name}.`
              : `Draft and check everything here, then post from the X app. X publishing in ${BRAND.name} is ${availabilityPhrase(state, "X")}.`}
          </p>
          <div className={t.heroCtas}>
            <Link className="btn btn-dark" href="/x-scheduler">
              Schedule X posts <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className={t.textLink} href="/signup">
              Create a free {BRAND.name} account <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="hero-art">
            <AnimArt
              name="features"
              label="A creator writes an X post next to a calendar, a profile card and a thread preview"
            />
          </div>
        </header>

        <section className={t.section} aria-labelledby="x-tools-list">
          <div className="head">
            <p className="eyebrow">All {allTools.length} tools</p>
            <h2 id="x-tools-list">X tools grouped by what you need to do</h2>
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

        <ToolFaqSection title="X (Twitter) tools questions" faqs={faqs} />

        <section className={`${t.section} ${t.related}`}>
          <nav className="relChips" aria-label="Keep exploring">
            <span>Keep exploring</span>
            <Link href="/x-scheduler">X scheduler</Link>
            <Link href="/tools">All free tools</Link>
            <Link href="/signup">Free plan</Link>
            <Link href="/tools/instagram-tools">Instagram tools</Link>
            <Link href="/tools/youtube-tools">YouTube tools</Link>
            <Link href="/tools/threads-tools">Threads tools</Link>
          </nav>
        </section>

        <ToolCta
          cta={{
            title: "Draft it here,",
            mark: "schedule it on X.",
            text:
              state === "live"
                ? `${BRAND.name} publishes your posts and threads on time on the official X API, so you can plan a week of posts in one sitting.`
                : `X publishing in ${BRAND.name} is ${availabilityPhrase(state, "X")}. Draft and check your post here and publish it from the X app for now.`,
          }}
        />
      </div>
    </PublicShell>
  );
}
