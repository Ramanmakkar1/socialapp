import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { breadcrumbJsonLd, ldJson } from "@/lib/tool-schema";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { AnimArt } from "@/components/AnimArt";

const description = `Step-by-step guides for ${BRAND.name}: connect Instagram, set up comment-to-DM rules, fix auto-DMs that are not sending, and use free templates.`;

export const metadata: Metadata = {
  title: { absolute: `Instagram Scheduling & Auto-DM Help Guides | ${BRAND.name}` },
  description,
  alternates: { canonical: "/help" },
};

const guides = [
  {
    href: "/help/getting-started",
    no: "01 / Start here",
    title: "Getting started in 3 minutes",
    text: "Connect Instagram, create your first auto-DM rule from a template, and schedule a post in the calendar.",
    go: "Read guide",
  },
  {
    href: "/help/instagram-auto-dm-not-working",
    no: "02 / Troubleshooting",
    title: "Instagram auto DM not working?",
    text: "A step-by-step checklist: connection, message access, active rules, keywords, gates, and the send queue.",
    go: "Read guide",
  },
  {
    href: "/help/auto-dm-instagram-comments",
    no: "03 / Auto-DM",
    title: "Auto-DM everyone who comments",
    text: "Set up a keyword comment-to-DM rule with a link, email capture or follow gate.",
    go: "Read guide",
  },
  {
    href: "/help/schedule-instagram-stories",
    no: "04 / Scheduling",
    title: "Schedule Instagram Stories",
    text: "Pick the Story format, paste one image or video link, choose a time and see what Stories can and cannot include.",
    go: "Read guide",
  },
  {
    href: "/help/schedule-instagram-reels",
    no: "05 / Scheduling",
    title: "Schedule Instagram Reels",
    text: "Paste one public .mp4 link, write a caption, pick a time and see what a scheduled Reel needs, step by step.",
    go: "Read guide",
  },
  {
    href: "/help/schedule-instagram-carousel",
    no: "06 / Scheduling",
    title: "Schedule Instagram carousels",
    text: "Paste 2 to 10 public image links in slide order, write one caption and schedule the carousel from the Calendar.",
    go: "Read guide",
  },
  {
    href: "/help/instagram-story-reply-auto-dm",
    no: "07 / Auto-DM",
    title: "Auto-DM Instagram Story replies",
    text: "Send a DM with your link to everyone who replies to your Story with a keyword like FREE.",
    go: "Read guide",
  },
  {
    href: "/help/schedule-threads-posts",
    no: "08 / Scheduling",
    title: "Schedule Threads posts",
    text: "Write up to 500 characters, add one image or video, pick a time and Poskoo publishes it to Threads.",
    go: "Read guide",
  },
  {
    href: "/help/schedule-linkedin-posts",
    no: "09 / Scheduling",
    title: "Schedule LinkedIn posts",
    text: "Connect your profile with LinkedIn's official sign-in, write the post, add images, pick a time and it publishes.",
    go: "Read guide",
  },
  {
    href: "/contact",
    no: "10 / Contact",
    title: "Contact support",
    text: "Email the team about scheduling, auto-DMs or your account — we reply within one business day.",
    go: "Contact us",
  },
];

const resources = [
  {
    href: "/instagram-auto-dm",
    title: "Instagram auto DM overview",
    text: "How comment-to-DM works and what you can automate.",
  },
  {
    href: "/instagram-auto-dm/templates",
    title: "DM message templates",
    text: "Copy-ready keywords and messages for guides, shops, webinars, and more.",
  },
  {
    href: "/tools",
    title: "Free Instagram tools",
    text: "Caption counter, image sizes, engagement rate, and other helpers.",
  },
];

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Help center",
  url: `${BRAND.url}/help`,
  description,
  mainEntity: {
    "@type": "ItemList",
    itemListElement: guides
      .filter((g) => g.href.startsWith("/help/"))
      .map((g, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: g.title,
        url: `${BRAND.url}${g.href}`,
      })),
  },
};

const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", url: BRAND.url },
  { name: "Help", url: `${BRAND.url}/help` },
]);

export default function HelpHubPage() {
  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(crumbsJsonLd) }}
      />
      <header className="hero">
        <span className="pill">Guides · troubleshooting · free tools</span>
        <h1>
          Help <em className="s">center</em>
        </h1>
        <p className="lede">
          Guides for scheduling posts and Instagram comment-to-DM automation in {BRAND.name}.
        </p>
        <div className="hero-art"><AnimArt name="help" label="A creator reads on a giant open book under a lightbulb and a signpost" /></div>
      </header>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Step by step</p>
            <h2>Guides</h2>
          </div>
          <div className="cards">
            {guides.map((g) => (
              <article key={g.href} className="pcard">
                <span className="no">{g.no}</span>
                <h3>{g.title}</h3>
                <p>{g.text}</p>
                <Link className="go" href={g.href}>
                  {g.go} <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Keep exploring</p>
              <h2>Product resources</h2>
              <div className="pains">
                {resources.map((r) => (
                  <Link key={r.href} className="pain" href={r.href}>
                    <b>{r.title}</b>
                    <span>{r.text}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="art">
              <Image
                sizes="(max-width: 960px) 100vw, 50vw"
                src="/landing/card-dm.webp"
                width={900}
                height={900}
                loading="lazy"
                alt="A relaxed creator on a beanbag while DMs fly out of his phone to followers"
              />
            </div>
          </div>
        </div>
      </section>

      <p className="small" style={{ textAlign: "center", marginTop: "20px" }}>
        Still stuck?{" "}
        <Link className={s.vlink} href="/app">
          Open your dashboard
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
