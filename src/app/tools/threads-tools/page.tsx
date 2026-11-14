import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import { AnimArt } from "@/components/AnimArt";
import { ToolCta, ToolFaqSection, toolMetadata } from "@/components/tools/ToolPageTemplate";
import { faqJsonLd, ldJson } from "@/components/tools/seo";
import t from "@/components/tools/tools.module.css";

const PATH = "/tools/threads-tools";

export const metadata = toolMetadata({
  path: PATH,
  title: "Free Threads Tools: Post Ideas, Bios, Fonts & Counters",
  description:
    "Seven free Threads tools from Poskoo: write posts and threads, build a bio, try bold fonts, count characters, preview posts and find the best time to post.",
});

const tools = [
  {
    href: "/tools/threads-post-generator",
    name: "Threads post generator",
    text: "Start with a topic and get ready-to-edit post ideas that fit the 500-character Threads limit.",
  },
  {
    href: "/tools/threads-thread-maker",
    name: "Threads thread maker",
    text: "Turn a long draft into a numbered thread with a clear hook, so every part fits and reads well.",
  },
  {
    href: "/tools/threads-bio-generator",
    name: "Threads bio generator",
    text: "Write a profile bio with emojis, line breaks and a call to action that fits your Threads profile.",
  },
  {
    href: "/tools/threads-font-generator",
    name: "Threads font generator",
    text: "Create bold, italic and script Unicode text for your Threads bio, posts and display name.",
  },
  {
    href: "/tools/threads-character-counter",
    name: "Threads character counter",
    text: "Count characters and links against the 500-character limit before you publish a Threads post.",
  },
  {
    href: "/tools/threads-post-preview",
    name: "Threads post preview",
    text: "See your Threads post in a mobile mockup, check where it cuts off, then copy it when it looks right.",
  },
  {
    href: "/tools/best-time-to-post-on-threads",
    name: "Best time to post on Threads",
    text: "Pick your audience time zone and get starting slots to test for morning, lunch and evening posts.",
  },
];

const faqs = [
  {
    q: "Are these Threads tools free?",
    a: `Yes. Every tool on this page is free to use with no signup and no usage limit. They are made by ${BRAND.name}, a social media scheduler with Instagram auto-DM, which has its own free plan if you want to schedule what you create.`,
  },
  {
    q: "Do I need a Threads account to use the tools?",
    a: "No. The tools run in your browser, so you can draft posts, check character counts, preview a post and find posting times without logging in. You only connect an account, through Meta's official login, if you sign up to schedule posts.",
  },
  {
    q: "What is the character limit for a Threads post?",
    a: "A Threads post allows up to 500 characters. The character counter counts text and links, and the preview shows how your post looks on a phone before you publish it.",
  },
  {
    q: "Which tool should I start with?",
    a: "Writing a new post? Start with the Threads post generator. Have a long draft? Split it with the thread maker. Preparing your profile? Use the bio generator and font generator. Before you publish, check the character counter and post preview.",
  },
];

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Free Threads tools",
  numberOfItems: tools.length,
  itemListElement: tools.map((tool, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: tool.name,
    url: `${BRAND.url}${tool.href}`,
  })),
};

export default function ThreadsToolsPage() {
  return (
    <PublicShell breadcrumbs={[{ name: "Threads tools", path: PATH }]}>
      {[itemListJsonLd, faqJsonLd(faqs)].map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(data) }} />
      ))}
      <div className={t.page}>
        <header className={`hero ${t.hero} ${t.hubHero}`}>
          <span className="pill">Free · no signup · runs in your browser</span>
          <h1>Free Threads Tools</h1>
          <p className="lede">
            These free Threads tools help you write posts, build a thread, craft your bio and time your posts for
            Threads, Meta&apos;s text-first social app. Draft and check everything here, then schedule it with{" "}
            {BRAND.name}.
          </p>
          <div className={t.heroCtas}>
            <Link className="btn btn-dark" href="/threads-scheduler">
              Schedule Threads posts <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className={t.textLink} href="/signup">
              Create a free {BRAND.name} account <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="hero-art">
            <AnimArt
              name="features"
              label="A creator writes a Threads post next to a calendar, chat bubbles and a character counter"
            />
          </div>
        </header>

        <section className={t.section} aria-labelledby="threads-tools-list">
          <div className="head">
            <p className="eyebrow">All seven tools</p>
            <h2 id="threads-tools-list">Threads tools for writing, checking and planning posts</h2>
          </div>
          <ul className={t.grid}>
            {tools.map((tool) => (
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
        </section>

        <ToolFaqSection title="Threads tools questions" faqs={faqs} />

        <section className={`${t.section} ${t.related}`}>
          <nav className="relChips" aria-label="Keep exploring">
            <span>Keep exploring</span>
            <Link href="/threads-scheduler">Threads scheduler</Link>
            <Link href="/tools/threads-caption-generator">Threads caption generator</Link>
            <Link href="/help/schedule-threads-posts">How to schedule Threads posts</Link>
            <Link href="/tools">All free social media tools</Link>
          </nav>
        </section>

        <ToolCta
          cta={{
            title: "Draft it here,",
            mark: "schedule it on Threads.",
            text: `${BRAND.name} publishes your Threads posts on time on the official Meta API, and can auto-DM everyone who comments a keyword on Instagram.`,
          }}
        />
      </div>
    </PublicShell>
  );
}
