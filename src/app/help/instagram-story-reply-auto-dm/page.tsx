import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { breadcrumbJsonLd, ldJson, publisherRef } from "@/lib/tool-schema";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

export const metadata: Metadata = withSocial({
  title: { absolute: "Auto-DM Instagram Story Replies: Step-by-Step Guide" },
  description:
    "Send an automatic DM with your link to everyone who replies FREE to your Instagram Story. Set up a story-reply rule step by step and turn it on.",
  alternates: { canonical: "/help/instagram-story-reply-auto-dm" },
});

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to auto-DM people who reply to your Instagram Story",
  description: metadata.description,
  dateModified: "2026-11-07",
  author: { "@type": "Organization", name: BRAND.company },
  publisher: publisherRef(),
  mainEntityOfPage: `${BRAND.url}/help/instagram-story-reply-auto-dm`,
};

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", url: `${BRAND.url}/` },
  { name: "Help", url: `${BRAND.url}/help` },
  { name: "Story reply auto-DM", url: `${BRAND.url}/help/instagram-story-reply-auto-dm` },
]);

const steps = [
  {
    name: "Open Auto-DM",
    body: (
      <>
        Log in and open{" "}
        <Link className={s.vlink} href="/app/auto-dm">
          Auto-DM
        </Link>
        . This is where all your comment and story-reply automations live.
      </>
    ),
  },
  {
    name: "Start a new automation",
    body: (
      <>
        Click <strong>New automation</strong>. The form opens with your connected Instagram account already selected; if
        you run more than one profile, pick the one that will answer the story replies.
      </>
    ),
  },
  {
    name: "Choose the Story-reply freebie template",
    body: (
      <>
        Open the{" "}
        <Link className={s.vlink} href="/instagram-auto-dm/templates">
          auto-DM templates
        </Link>{" "}
        and choose <strong>Story-reply freebie</strong> (keyword FREE, no gate, trigger &ldquo;Replies to my
        stories&rdquo;), then press <strong>Use this template</strong>. Or, in Auto-DM, click{" "}
        <strong>New automation</strong> and tick <strong>Replies to my stories</strong> under{" "}
        <strong>When to send</strong>.
      </>
    ),
  },
  {
    name: "Set your keyword",
    body: (
      <>
        In <strong>Keywords</strong>, type the word people should reply with, such as <code>FREE</code>. You can add up
        to 10 keywords, separated by commas, and choose whether the reply must contain the keyword or match it exactly.
      </>
    ),
  },
  {
    name: "Write the DM and add your link",
    body: (
      <>
        Write your <strong>DM message</strong> and paste your page in <strong>Link URL</strong>. Use{" "}
        <code>{"{{username}}"}</code> to greet the person by name and <code>{"{{link}}"}</code> where the link should
        appear.
      </>
    ),
  },
  {
    name: "Optional: ask for an email first",
    body: (
      <>
        Tick <strong>Ask for email first</strong> if you want to collect an email address before the link is sent. The
        link is delivered once the person has replied with their email. The{" "}
        <Link className={s.vlink} href="/help/auto-dm-instagram-comments">
          comment-to-DM setup guide
        </Link>{" "}
        explains how the gates work.
      </>
    ),
  },
  {
    name: "Save and turn it on",
    body: (
      <>
        Press <strong>Create automation</strong>. The new rule is saved as <strong>Active</strong>. To stop it later,
        press <strong>Pause</strong> in your automation list; press <strong>Activate</strong> to turn it back on.
      </>
    ),
  },
];

const faqs = [
  {
    q: "Does a story-reply auto-DM post a public reply?",
    a: "No. Replies to an Instagram Story arrive as private DMs, so there is no public comment to answer. The automation simply sends your DM back in the same conversation.",
  },
  {
    q: "Can one rule handle both post comments and story replies?",
    a: "Yes. Under “When to send”, tick both “Comments on my posts” and “Replies to my stories” and the same keywords and DM are used for both.",
  },
  {
    q: "Do I need an Instagram professional account?",
    a: "Yes. Auto-DMs use Meta's official Instagram API, which works with Business and Creator accounts connected through Meta's login.",
  },
  {
    q: "What if someone replies without the keyword?",
    a: "Nothing is sent. The rule only replies when the story reply contains your keyword (or matches it exactly, if you chose exact match).",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const related = [
  { href: "/help/auto-dm-instagram-comments", label: "Auto-DM everyone who comments" },
  { href: "/help/instagram-auto-dm-not-working", label: "Instagram auto DM not working" },
  { href: "/instagram-auto-dm/templates", label: "Instagram auto DM templates" },
  { href: "/help/schedule-instagram-stories", label: "Schedule Instagram Stories" },
  { href: "/help/getting-started", label: "Getting started" },
];

export default function InstagramStoryReplyAutoDmHelpPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Help center", path: "/help" },
        { name: "Story reply auto-DM", path: "/help/instagram-story-reply-auto-dm" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(crumbsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="hero">
        <div className={s.heroText}>
          <p className="eyebrow">Guide</p>
          <h1>
              Auto-DM people who reply to your Instagram <em className="s">Story</em>
            </h1>
          <p className="lede">
            Ask viewers to reply with a keyword like FREE, and {BRAND.name} sends each of them a DM with your link. Here is
            how to set it up, step by step.
          </p>
        </div>
        <HelpGuideIllustration variant="story" className="hero-art" />
      </header>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>What a <span className={s.nowrap}>story-reply</span> <span className={s.nowrap}>auto-DM</span> is</h2>
            <p>
              When someone replies to your Instagram Story, the reply lands in your DMs, not in a public comment thread.
              A story-reply auto-DM watches those replies for your keyword and answers in the same private
              conversation, so there is no public comment reply to write.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Before you start</h2>
            <ul>
              <li>
                An Instagram professional account (Business or Creator) connected in{" "}
                <Link className={s.vlink} href="/app/settings">
                  Settings
                </Link>{" "}
                through Meta&apos;s official login. The{" "}
                <Link className={s.vlink} href="/help/getting-started">
                  getting started guide
                </Link>{" "}
                walks you through it.
              </li>
              <li>The link you want to send, such as a checklist, a discount page or a sign-up form.</li>
            </ul>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2><span className={s.nowrap}>Step-by-step</span> setup</h2>
            {steps.map((st, i) => (
              <div key={st.name}>
                <h3>
                  Step {i + 1}: {st.name}
                </h3>
                <p>{st.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Story ideas that get replies</h2>
            <p>People only reply with your keyword if the story tells them to. Make the ask clear and visible:</p>
            <ul>
              <li>
                Add large text or a sticker that says &ldquo;Reply FREE&rdquo; and say what they get, for example
                &ldquo;Reply FREE for my checklist&rdquo;.
              </li>
              <li>
                Show a preview of the freebie on the story, then end with &ldquo;Reply GUIDE and I&apos;ll send it&rdquo;.
              </li>
              <li>
                Use the same keyword across a short series of stories so viewers who tap through still see the ask.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Troubleshooting</h2>
            <p>
              If replies are not getting a DM, check that the rule shows <strong>Active</strong>, that{" "}
              <strong>Replies to my stories</strong> is ticked, and that the reply contains your keyword. For the full
              checklist, read{" "}
              <Link className={s.vlink} href="/help/instagram-auto-dm-not-working">
                Instagram auto DM not working
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>FAQ</h2>
          </div>
          <div className="faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Related guides</h2>
            <ul>
              {related.map((r) => (
                <li key={r.href}>
                  <Link className={s.vlink} href={r.href}>
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <p className="small" style={{ textAlign: "center", marginTop: "20px" }}>
        New to {BRAND.name}?{" "}
        <Link className={s.vlink} href="/signup">
          Create a free account
        </Link>{" "}
        or email{" "}
        <a className={s.vlink} href={`mailto:${BRAND.supportEmail}`}>
          {BRAND.supportEmail}
        </a>
        .
      </p>
    </PublicShell>
  );
}
