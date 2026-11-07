import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import UtmBuilder from "./UtmBuilder";
import { breadcrumbJsonLd, faqJsonLd, ldJson, toolSoftwareJsonLd } from "@/lib/tool-schema";

const PATH = "/tools/instagram-utm-builder";
const description =
  "Free Instagram UTM builder: tag links for your bio, Stories and auto-DMs with source, medium and campaign. Runs in your browser; nothing is saved.";

export const metadata: Metadata = {
  title: { absolute: "Instagram UTM Builder: Free Campaign URL Link Generator" },
  description,
  alternates: { canonical: PATH },
};

const faqs = [
  {
    q: "Do UTM tags track clicks by themselves?",
    a: "No. UTM parameters only label the visit. Your website needs an analytics tool (such as Google Analytics) to read the labels and report the traffic under your campaign.",
  },
  {
    q: "Which source and medium should I use for Instagram?",
    a: "Use instagram as the source and social as the medium, and keep the spelling identical every time. Use utm_content to tell the bio link, Story sticker and auto-DM apart.",
  },
  {
    q: "What happens if my link already has UTM tags or other parameters?",
    a: "The builder replaces utm_source, utm_medium, utm_campaign and utm_content with your new values, so you never get duplicates. Other parameters and #section anchors stay as they were.",
  },
];

const toolJsonLd = toolSoftwareJsonLd({ name: "Instagram UTM Builder", description, url: `${BRAND.url}${PATH}` });
const crumbsJsonLd = breadcrumbJsonLd([
  { name: "Home", url: BRAND.url },
  { name: "Free tools", url: `${BRAND.url}/tools` },
  { name: "Instagram UTM builder", url: `${BRAND.url}${PATH}` },
]);

const codeStyle = { background: "var(--poskoo-band)", borderRadius: 8, padding: "2px 6px", fontSize: ".92em" } as const;

export default function InstagramUtmBuilderPage() {
  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqJsonLd(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(crumbsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(toolJsonLd) }} />
      <header className="hero">
        <span className="pill">Free · runs in your browser · nothing is saved</span>
        <h1>
          Instagram <em className="s mark">UTM builder</em>
        </h1>
        <p className="lede">
          Add campaign tags to the links in your bio, Story stickers and auto-DMs so your website analytics can show
          which Instagram placement sent each visit.
        </p>
        <div className="hero-art" style={{ maxWidth: 520 }}>
          <Image
            sizes="(max-width: 520px) 100vw, 520px"
            src="/landing/card-dm.webp"
            width={900}
            height={900}
            loading="lazy"
            alt="A relaxed creator on a beanbag while DMs fly out of his phone to followers"
          />
        </div>
      </header>

      <div className={s.tile} style={{ padding: 24, marginTop: 28 }}>
        <UtmBuilder />
      </div>
      <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
        More free Instagram tools:{" "}
        <Link className={s.vlink} href="/tools/instagram-dm-link-generator">
          DM link generator
        </Link>
        {" · "}
        <Link className={s.vlink} href="/tools/instagram-comment-keyword-tester">
          Comment keyword tester
        </Link>
      </p>

      {/* Worked example + analytics notes */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Example: one campaign, tagged for the bio</h2>
            <p>
              Destination <code style={codeStyle}>https://example.com/spring-sale?ref=ig#offer</code>,
              campaign <code style={codeStyle}>spring_sale</code>, Bio preset:
            </p>
            <div
              className={s.tile}
              style={{ padding: "12px 16px", marginTop: 12, fontSize: ".92rem", wordBreak: "break-all" }}
            >
              https://example.com/spring-sale?ref=ig&amp;utm_source=instagram&amp;utm_medium=social&amp;utm_campaign=spring_sale&amp;utm_content=bio_link#offer
            </div>
            <p style={{ marginTop: 12 }}>
              The existing <code style={codeStyle}>ref</code> parameter and the <code style={codeStyle}>#offer</code> anchor are kept. Use the same campaign name
              for the Story and auto-DM versions and change only the content value.
            </p>
            <h2>Website analytics vs {BRAND.name} click counts</h2>
            <p>
              UTM tags label traffic; they don’t count anything on their own. Your destination site needs analytics installed
              (for example Google Analytics, following{" "}
              <a
                href="https://support.google.com/analytics/answer/10917952?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className={s.vlink}
              >
                Google’s campaign URL guidance
              </a>
              ) to report sessions, sign-ups and sales by source, medium and campaign.
            </p>
            <p>
              {BRAND.name} counts something different: how many people clicked the link inside an auto-DM it sent. Use both
              together—{BRAND.name} shows which comment rule drives clicks, and your analytics shows what those visitors did
              on your site.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Instagram UTM FAQ</h2>
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

      {/* CTA */}
      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <div>
              <h2>Send tagged links automatically in Instagram DMs</h2>
              <p>{BRAND.tagline}</p>
              <Link className="btn" href="/signup">
                Start free <span aria-hidden="true">→</span>
              </Link>
            </div>
            <Image
              sizes="(max-width: 960px) 100vw, 50vw"
              src="/landing/card-leads.webp"
              width={900}
              height={900}
              loading="lazy"
              alt="Two friends high-five next to a board of new leads"
            />
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 24 }}>
            <Link className={s.vlink} href="/instagram-auto-dm">
              How Instagram auto DM works
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
