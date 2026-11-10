import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { faqJsonLd, ldJson } from "@/lib/tool-schema";

const PATH = "/instagram-content-planner";

export const metadata: Metadata = {
  title: { absolute: "Instagram Content Planner: Hook to Scheduled Post" },
  description:
    "Plan one Instagram post in five steps: draft a hook, write the caption, check image dimensions, preview the post, then schedule it with Poskoo.",
  alternates: { canonical: PATH },
};

const steps = [
  {
    no: "01 / Hook",
    title: "Draft a hook",
    text: "Get ready-to-copy hooks for your topic across eight styles — curiosity, mistake, how-to, myth, story, list, contrarian and result.",
    href: "/tools/instagram-hook-generator",
    cta: "Open the hook generator",
  },
  {
    no: "02 / Caption",
    title: "Write a caption",
    text: "Generate a caption with a hook, clean line breaks and a comment CTA, then tweak it until it sounds like you.",
    href: "/tools/instagram-caption-generator",
    cta: "Open the caption generator",
  },
  {
    no: "03 / Image",
    title: "Check image dimensions",
    text: "Confirm the right sizes for feed posts, Reels and Stories so your media is never cropped or compressed on upload.",
    href: "/tools/instagram-image-size",
    cta: "Open the image size guide",
  },
  {
    no: "04 / Preview",
    title: "Preview the post",
    text: "Drop in your photo and caption to see the post in a feed mockup and compare the square and portrait crops.",
    href: "/tools/instagram-post-preview",
    cta: "Open the post preview",
  },
  {
    no: "05 / Schedule",
    title: "Schedule it",
    text: "Pick a time on the calendar and Poskoo publishes the post for you — and can auto-DM everyone who comments.",
    href: "/instagram-scheduler",
    cta: "Open the Instagram scheduler",
  },
];

const faqs = [
  {
    q: "What is the best order to plan an Instagram post?",
    a: "Start with the hook, write the caption around it, check the image dimensions for the format you picked, preview the finished post, and schedule it last so nothing changes after you have seen it.",
  },
  {
    q: "Are the planning tools free?",
    a: "Yes. The hook generator, caption generator, image size guide and post preview are free and run in your browser — no sign-up needed.",
  },
  {
    q: "Do I need an account to schedule the post?",
    a: `No account is needed for the free tools. To schedule, create a free ${BRAND.name} account, connect Instagram with Meta's official login, and pick a publish time.`,
  },
  {
    q: "Can scheduling also trigger auto-DMs?",
    a: `Yes. In ${BRAND.name} you can attach a comment-to-DM rule to a scheduled post, so everyone who comments a keyword gets your link in their DMs right after it goes live.`,
  },
];

// One .cards grid per 3 steps so the pcard tilt/colors (nth-child 1-3) work.
const groups: (typeof steps)[] = [];
for (let i = 0; i < steps.length; i += 3) groups.push(steps.slice(i, i + 3));

export default function InstagramContentPlannerPage() {
  return (
    <PublicShell
      breadcrumbs={[
        { name: "Tools", path: "/tools" },
        { name: "Instagram content planner", path: PATH },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }}
      />
      <header className="hero">
        <span className="pill">Free planning toolkit</span>
        <p className="eyebrow">Instagram content planner</p>
        <h1>
          From hook to scheduled post, <em className="s mark">in five steps.</em>
        </h1>
        <p className="lede">
          This free Instagram content planner walks you through one post in five steps — hook,
          caption, image size, preview, then schedule — with tools that run in your browser. When
          you are ready, a free {BRAND.name} account publishes the post at the time you pick.
        </p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/instagram-scheduler">
            Schedule a post <span aria-hidden="true">→</span>
          </Link>
          <Link className="btn btn-line" href="#workflow">
            See the workflow
          </Link>
        </div>
        <div className="hero-art" style={{ maxWidth: 820 }}>
          <Image
            sizes="(max-width: 860px) 100vw, 820px"
            src="/illustrations/free-tools.webp"
            width={1536}
            height={1024}
            priority
            alt="A creator lifts a paintbrush out of an open toolbox full of a ruler, scissors, a hashtag, a magnifying glass and photos, with a happy dog in the flowers."
          />
        </div>
      </header>

      <section id="workflow" style={{ paddingTop: 20, scrollMarginTop: 24 }}>
        <div className="head">
          <p className="eyebrow">The workflow</p>
          <h2>
            Five steps from <em className="s">idea to scheduled post.</em>
          </h2>
        </div>
        {groups.map((group, gi) => (
          <div key={group[0].no} className="cards" style={gi > 0 ? { marginTop: 26 } : undefined}>
            {group.map((st) => (
              <article key={st.href} className="pcard">
                <span className="no">{st.no}</span>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
                <Link className="go" href={st.href}>
                  {st.cta} <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        ))}
        <p className="small" style={{ textAlign: "center", marginTop: 26 }}>
          Planning a comment keyword?{" "}
          <Link className={s.vlink} href="/tools/instagram-comment-to-dm-calculator">
            Estimate comments, DMs and link clicks →
          </Link>
        </p>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>How do I plan an Instagram post?</h2>
          </div>
          <div className="faq">
            {faqs.map((f, index) => (
              <details key={f.q} open={index === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>
                Ready when the post is. <em className="s">Schedule it.</em>
              </h2>
              <p>Pick a time on the calendar and {BRAND.name} publishes it for you.</p>
              <Link className="btn" href="/instagram-scheduler">
                Open the Instagram scheduler <span aria-hidden="true">→</span>
              </Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-schedule.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="A creator pins post cards onto a weekly calendar next to a smiling alarm clock"
            />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
