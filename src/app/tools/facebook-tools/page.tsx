import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import { AnimArt } from "@/components/AnimArt";
import { ToolCta, ToolFaqSection, toolMetadata } from "@/components/tools/ToolPageTemplate";
import { faqJsonLd, ldJson } from "@/components/tools/seo";
import { toolSoftwareJsonLd } from "@/lib/tool-schema";
import t from "@/components/tools/tools.module.css";

const PATH = "/tools/facebook-tools";

export const metadata = toolMetadata({
  path: PATH,
  title: "Free Facebook Tools: Captions, Sizes, Bios & Hashtags",
  description:
    "Free Facebook tools for captions, hashtags, bios, fonts, post previews, cover and post sizes. Use them in your browser, then schedule in Poskoo.",
});

type Tool = { href: string; name: string; text: string };

const groups: { id: string; title: string; intro: string; tools: Tool[] }[] = [
  {
    id: "text",
    title: "Facebook text and caption tools",
    intro: "Write a caption, bio and hashtag set that fits Facebook's limits before you post.",
    tools: [
      {
        href: "/tools/facebook-caption-generator",
        name: "Facebook caption generator",
        text: "Get six post captions with a hook and call to action from your topic and goal.",
      },
      {
        href: "/tools/facebook-character-counter",
        name: "Facebook character counter",
        text: "Count posts, comments, ads and Page bios against Facebook's real limits as you type.",
      },
      {
        href: "/tools/facebook-hashtag-generator",
        name: "Facebook hashtag generator",
        text: "Pick a niche and copy 1 to 5 broad and specific hashtags for your Page posts.",
      },
      {
        href: "/tools/facebook-font-generator",
        name: "Facebook font generator",
        text: "Turn text into bold, italic and script styles for posts, comments and your intro.",
      },
      {
        href: "/tools/facebook-bio-generator",
        name: "Facebook bio generator",
        text: "Draft a short Page or profile bio with a call to action and a live character count.",
      },
      {
        href: "/tools/facebook-post-preview",
        name: "Facebook post preview",
        text: "See where your post cuts off before See more on desktop and mobile.",
      },
    ],
  },
  {
    id: "sizes",
    title: "Facebook image size tools",
    intro: "Check the crop and dimensions before your cover photo or feed image goes live.",
    tools: [
      {
        href: "/tools/facebook-cover-photo-size-checker",
        name: "Facebook cover photo size checker",
        text: "Test your image in the 820×312 desktop and 640×360 mobile frames.",
      },
      {
        href: "/tools/facebook-post-size-checker",
        name: "Facebook post size checker",
        text: "See exact pixels and ratio, then preview your image in a 4:5 feed frame.",
      },
    ],
  },
  {
    id: "timing",
    title: "Facebook timing and numbers tools",
    intro: "Decide when to publish and measure how well each post performs.",
    tools: [
      {
        href: "/tools/best-time-to-post-on-facebook",
        name: "Best time to post on Facebook",
        text: "Pick your audience time zone and get three starting slots to test.",
      },
      {
        href: "/tools/facebook-engagement-rate-calculator",
        name: "Facebook engagement rate calculator",
        text: "Add reactions, comments and shares to get one post's engagement rate.",
      },
    ],
  },
];

const allTools = groups.flatMap((g) => g.tools);

const faqs = [
  {
    q: "What are the best free Facebook tools?",
    a: "The best free Facebook tools are the ones that fix the job in front of you: a caption generator and character counter for writing, a hashtag and font generator for reach, a bio generator and post preview for your Page, size checkers for cover and feed images, and a best-time finder with an engagement calculator for planning. This hub groups all ten by task so you can start with the one you need.",
    aNode: (
      <>
        The best free Facebook tools are the ones that fix the job in front of you: a caption generator and character
        counter for writing, a hashtag and font generator for reach, a bio generator and post preview for your Page,
        size checkers for cover and feed images, and a best-time finder with an engagement calculator for planning.
        This hub groups all ten by task so you can start with the one you need.
      </>
    ),
  },
  {
    q: "Are these Facebook tools free?",
    a: `Yes. Every tool on this page is free to use with no signup and no usage limit. They are made by ${BRAND.name}, a social media scheduler with Facebook Page scheduling, which has its own free plan if you want to schedule what you create.`,
    aNode: (
      <>
        Yes. Every tool on this page is free to use with no signup and no usage limit. They are made by {BRAND.name}, a
        social media scheduler with Facebook Page scheduling, which has its own free plan if you want to schedule what
        you create.
      </>
    ),
  },
  {
    q: "How do I schedule a Facebook post with Poskoo?",
    a: `Draft your caption, hashtags and image here, then open the Facebook scheduler to add the post to your calendar. Connect your Facebook Page through Meta's official login, pick a date and time, and ${BRAND.name} publishes it for you. You can create a free account to start.`,
    aNode: (
      <>
        Draft your caption, hashtags and image here, then open the{" "}
        <Link href="/facebook-scheduler">Facebook scheduler</Link> to add the post to your calendar. Connect your
        Facebook Page through Meta&apos;s official login, pick a date and time, and {BRAND.name} publishes it for you.
        You can <Link href="/signup">create a free account</Link> to start, or follow the{" "}
        <Link href="/help/schedule-facebook-posts">step-by-step guide to scheduling Facebook posts</Link>.
      </>
    ),
  },
];

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Free Facebook tools",
  numberOfItems: allTools.length,
  itemListElement: allTools.map((tool, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: tool.name,
    url: `${BRAND.url}${tool.href}`,
  })),
};

const softwareJsonLd = toolSoftwareJsonLd({
  name: "Facebook tools",
  description:
    "A free collection of Facebook tools for captions, hashtags, bios, fonts, post previews, cover and post sizes, best posting times and engagement stats.",
  url: `${BRAND.url}${PATH}`,
});

export default function FacebookToolsPage() {
  return (
    <PublicShell breadcrumbs={[{ name: "Facebook tools", path: PATH }]}>
      {[itemListJsonLd, softwareJsonLd, faqJsonLd(faqs)].map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(data) }} />
      ))}
      <div className={`${t.page} ${t.hubPage}`}>
        <header className={`hero ${t.hero} ${t.hubHero}`}>
          <span className="pill">Free · no signup · runs in your browser</span>
          <h1>Free Facebook tools for every post</h1>
          <p className="lede">
            These free Facebook tools cover every step of a post: write the caption, hashtags and bio, check the
            character count, size the cover and feed image, preview the post and plan when to publish, all in your
            browser before you schedule it with {BRAND.name}.
          </p>
          <div className={t.heroCtas}>
            <Link className="btn btn-dark" href="/facebook-scheduler">
              Schedule Facebook posts <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className={t.textLink} href="/signup">
              Create a free {BRAND.name} account <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="hero-art">
            <AnimArt
              name="features"
              label="A creator writes a Facebook caption next to a calendar, a Page cover and a post size guide"
            />
          </div>
        </header>

        <section className={t.section} aria-labelledby="facebook-tools-list">
          <div className="head">
            <p className="eyebrow">All {allTools.length} tools</p>
            <h2 id="facebook-tools-list">Facebook tools grouped by what you need to do</h2>
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

        <ToolFaqSection title="Facebook tools questions" faqs={faqs} />

        <section className={`${t.section} ${t.related}`}>
          <nav className="relChips" aria-label="Keep exploring">
            <span>Keep exploring</span>
            <Link href="/facebook-scheduler">Facebook scheduler</Link>
            <Link href="/help/schedule-facebook-posts">How to schedule Facebook posts</Link>
            <Link href="/tools">All free tools</Link>
            <Link href="/signup">Free plan</Link>
            <Link href="/tools/instagram-tools">Instagram tools</Link>
            <Link href="/tools/youtube-tools">YouTube tools</Link>
            <Link href="/tools/threads-tools">Threads tools</Link>
            <Link href="/tools/tiktok-tools">TikTok tools</Link>
          </nav>
        </section>

        <ToolCta
          cta={{
            title: "Draft it here,",
            mark: "schedule it on Facebook.",
            text: `${BRAND.name} publishes your Facebook Page posts on time on the official Meta API, so you can plan a week of posts in one sitting.`,
          }}
        />
      </div>
    </PublicShell>
  );
}
