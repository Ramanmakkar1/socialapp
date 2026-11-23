import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import { AnimArt } from "@/components/AnimArt";
import { TOOLS, TOOL_CATEGORIES } from "@/components/tools/registry";
import { ToolsDirectory } from "@/components/tools/ToolsDirectory";
import { CategoryIcon, ToolIcon } from "@/components/tools/ToolIcon";
import { ToolCta, ToolFaqSection, toolMetadata } from "@/components/tools/ToolPageTemplate";
import { faqJsonLd, ldJson } from "@/components/tools/seo";
import t from "@/components/tools/tools.module.css";

const PATH = "/tools";

export const metadata = toolMetadata({
  path: "/tools",
  title: "Free Social Media Tools: Captions, Hashtags & Sizes",
  description:
    `${TOOLS.length} free social media tools for Instagram, TikTok, X, YouTube, LinkedIn, Facebook, Threads and Pinterest: captions, hashtags, sizes. No signup.`,
});

const faqs = [
  {
    q: "Are these social media tools really free?",
    a: `Yes. Every tool on this page is free to use with no signup and no usage limit. They are made by ${BRAND.name}, a social media scheduler with Instagram auto-DM, which has its own free plan if you want to schedule what you create.`,
  },
  {
    q: "Do the tools upload my photos or text?",
    a: "No. The tools run in your browser. Images you load into the size checkers, carousel tools and cover makers are processed on your device and downloads are generated locally.",
  },
  {
    q: "Do I need to connect my social accounts?",
    a: "No. None of the free tools ask you to log in to Instagram, TikTok or any other network. You only connect an account, through that platform's official login, if you sign up to schedule posts or run auto-DMs.",
  },
  {
    q: "Which tool should I start with?",
    a: "Writing a post? Start with the caption generator and hashtag generator. Preparing media? Use the image size guide or carousel splitter. Running a comment campaign? Test your keyword with the comment keyword tester first.",
  },
];

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Free social media tools",
  numberOfItems: TOOLS.length,
  itemListElement: TOOLS.map((tool, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: tool.name,
    url: `${BRAND.canonicalUrl}${tool.href}`,
  })),
};

export default function ToolsPage() {
  return (
    <PublicShell breadcrumbs={[{ name: "Free social media tools", path: PATH }]}>
      {[itemListJsonLd, faqJsonLd(faqs)].map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(data) }} />
      ))}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <symbol id="tool-ok" viewBox="0 0 18 18">
            <circle cx="9" cy="9" r="9" fill="var(--green)" />
            <path d="M5 9.3l2.6 2.5L13 6.4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </symbol>
        </defs>
      </svg>
      <div className={`${t.page} ${t.hubPage}`}>
        <header className={`hero ${t.hero} ${t.hubHero}`}>
          <span className="pill">Free · no signup · runs in your browser</span>
          <h1>
            {TOOLS.length} free <em className="s mark">social media tools</em> for every post
          </h1>
          <p className="lede">
            Write captions, hashtags and hooks, size your images for every network, plan your week, test Instagram
            comment-to-DM keywords and check YouTube metadata with the{" "}
            <Link href="/tools/youtube-title-counter">YouTube title counter</Link>. Use them before you post, or
            schedule the result with {BRAND.name}.
          </p>
          <ul className={t.catTiles} aria-label="Tool categories">
            {TOOL_CATEGORIES.map((c) => (
              <li key={c.id}>
                <a className={t.catTile} href={`#${c.id}`}>
                  <span className={`${t.cardIcon} ${t[`cat_${c.id}`]}`}>
                    <CategoryIcon category={c.id} />
                  </span>
                  <span>
                    <b>{TOOLS.filter((tool) => tool.category === c.id).length}</b>
                    <small>{c.label}</small>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div className={t.heroCtas}>
            <a className="btn btn-dark" href="#all-tools">
              Browse the tools <ArrowDown size={17} aria-hidden="true" />
            </a>
            <Link className={t.textLink} href="/instagram-scheduler">
              Schedule posts with {BRAND.name} <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="hero-art">
            <AnimArt name="features" label="A creator points at an open toolbox of calendar, chat, mail, chart and link tools" />
          </div>
        </header>

        <section className={t.picks} aria-labelledby="most-used-tools">
          <div className={t.groupHead}>
            <h2 id="most-used-tools">Most-used free tools</h2>
            <p>The three tools people open most, one per job.</p>
          </div>
          <ul className={t.grid}>
            <li>
              <Link href="/tools/linkedin-text-formatter" className={t.card}>
                <span className={t.cardTop}>
                  <span className={`${t.cardIcon} ${t.cat_create}`}>
                    <ToolIcon name="type" />
                  </span>
                  <b>LinkedIn text formatter</b>
                </span>
                <p>Copy bold, italic and bulleted Unicode text for LinkedIn posts and profiles.</p>
                <span className={t.go}>
                  Open tool <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
            <li>
              <Link href="/tools/instagram-highlight-cover-maker" className={t.card}>
                <span className={t.cardTop}>
                  <span className={`${t.cardIcon} ${t.cat_media}`}>
                    <ToolIcon name="circle" />
                  </span>
                  <b>Instagram highlight cover maker</b>
                </span>
                <p>Matching highlight covers with icons and brand colours, downloaded as PNGs.</p>
                <span className={t.go}>
                  Open tool <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
            <li>
              <Link href="/tools/facebook-engagement-rate-calculator" className={t.card}>
                <span className={t.cardTop}>
                  <span className={`${t.cardIcon} ${t.cat_plan}`}>
                    <ToolIcon name="percent" />
                  </span>
                  <b>Facebook engagement rate calculator</b>
                </span>
                <p>Engagement rate by reach or followers from reactions, comments and shares.</p>
                <span className={t.go}>
                  Open tool <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          </ul>
        </section>

        <section className={t.picks} aria-labelledby="schedulers-by-network">
          <div className={t.groupHead}>
            <h2 id="schedulers-by-network">Schedulers by network</h2>
            <p>
              Schedule posts on Instagram, TikTok, LinkedIn, Threads, Bluesky, Pinterest, Facebook and Google Business Profile.
            </p>
          </div>
          <ul className={t.grid}>
            <li>
              <Link href="/instagram-scheduler" className={t.card}>
                <span className={t.cardTop}>
                  <span className={t.cardIcon}>
                    <ToolIcon name="calendar" />
                  </span>
                  <b>Instagram scheduler</b>
                </span>
                <p>Schedule posts on Instagram.</p>
                <span className={t.go}>
                  Open tool <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
            <li>
              <Link href="/tiktok-scheduler" className={t.card}>
                <span className={t.cardTop}>
                  <span className={t.cardIcon}>
                    <ToolIcon name="calendar" />
                  </span>
                  <b>TikTok scheduler</b>
                </span>
                <p>Schedule posts on TikTok.</p>
                <span className={t.go}>
                  Open tool <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
            <li>
              <Link href="/linkedin-scheduler" className={t.card}>
                <span className={t.cardTop}>
                  <span className={t.cardIcon}>
                    <ToolIcon name="calendar" />
                  </span>
                  <b>LinkedIn scheduler</b>
                </span>
                <p>Schedule posts on LinkedIn.</p>
                <span className={t.go}>
                  Open tool <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
            <li>
              <Link href="/threads-scheduler" className={t.card}>
                <span className={t.cardTop}>
                  <span className={t.cardIcon}>
                    <ToolIcon name="calendar" />
                  </span>
                  <b>Threads scheduler</b>
                </span>
                <p>Schedule posts on Threads.</p>
                <span className={t.go}>
                  Open tool <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
            <li>
              <Link href="/bluesky-scheduler" className={t.card}>
                <span className={t.cardTop}>
                  <span className={t.cardIcon}>
                    <ToolIcon name="calendar" />
                  </span>
                  <b>Bluesky scheduler</b>
                </span>
                <p>Schedule posts on Bluesky.</p>
                <span className={t.go}>
                  Open tool <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
            <li>
              <Link href="/pinterest-scheduler" className={t.card}>
                <span className={t.cardTop}>
                  <span className={t.cardIcon}>
                    <ToolIcon name="calendar" />
                  </span>
                  <b>Pinterest scheduler</b>
                </span>
                <p>Schedule posts on Pinterest.</p>
                <span className={t.go}>
                  Open tool <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
            <li>
              <Link href="/google-business-profile-scheduler" className={t.card}>
                <span className={t.cardTop}>
                  <span className={t.cardIcon}>
                    <ToolIcon name="calendar" />
                  </span>
                  <b>Google Business Profile scheduler</b>
                </span>
                <p>Schedule posts on Google Business Profile.</p>
                <span className={t.go}>
                  Open tool <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
            <li>
              <Link href="/facebook-scheduler" className={t.card}>
                <span className={t.cardTop}>
                  <span className={t.cardIcon}>
                    <ToolIcon name="calendar" />
                  </span>
                  <b>Facebook scheduler</b>
                </span>
                <p>Schedule posts on Facebook.</p>
                <span className={t.go}>
                  Open tool <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          </ul>
        </section>

        <section id="all-tools" className={t.toolSection} aria-label="All free tools">
          <ToolsDirectory />
        </section>

        <ToolFaqSection title="Free social media tools questions" faqs={faqs} />

        <section className={`${t.section} ${t.related}`}>
          <nav className="relChips" aria-label="Keep exploring">
            <span>Keep exploring</span>
            <Link href="/instagram-scheduler">Instagram scheduler</Link>
            <Link href="/instagram-auto-dm">Instagram auto DM</Link>
            <Link href="/instagram-dm-automation">Instagram DM automation</Link>
            <Link href="/instagram-link-in-bio">Link in bio page</Link>
            <Link href="/facebook-scheduler">Facebook scheduler</Link>
            <Link href="/threads-scheduler">Threads scheduler</Link>
            <Link href="/youtube-scheduler">YouTube scheduler</Link>
            <Link href="/linkedin-scheduler">LinkedIn scheduler</Link>
            <Link href="/tiktok-scheduler">TikTok scheduler</Link>
            <Link href="/tools/threads-tools">Threads tools</Link>
            <Link href="/tools/best-time-to-post-on-threads">Best time to post on Threads</Link>
            <Link href="/tools/instagram-tools">Instagram tool hub</Link>
            <Link href="/tools/youtube-tools">YouTube tools</Link>
            <Link href="/tools/youtube-video-ideas-generator">YouTube video ideas generator</Link>
            <Link href="/tools/x-tools">X (Twitter) tools</Link>
            <Link href="/tools/tiktok-tools">TikTok tools</Link>
            <Link href="/tools/tiktok-hook-generator">TikTok hook generator</Link>
            <Link href="/tools/tiktok-money-calculator">TikTok money calculator</Link>
            <Link href="/tools/facebook-tools">Facebook tools</Link>
            <Link href="/tools/instagram-bio-generator">Instagram bio generator</Link>
            <Link href="/tools/instagram-engagement-rate-calculator">Instagram engagement rate calculator</Link>
            <Link href="/tools/youtube-title-counter">YouTube title counter</Link>
            <Link href="/tools/linkedin-text-formatter">LinkedIn text formatter</Link>
            <Link href="/social-media-scheduler">Social media scheduler for small business</Link>
          </nav>
        </section>

        <ToolCta
          cta={{
            title: "Made something you like?",
            mark: "Schedule it and auto-DM commenters.",
            text: `${BRAND.name} publishes your posts on time and sends your link to everyone who comments a keyword, on the official Meta API.`,
          }}
        />
      </div>
    </PublicShell>
  );
}
