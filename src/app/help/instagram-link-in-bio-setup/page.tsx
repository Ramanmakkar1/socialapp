import type { Metadata } from "next";
import { withSocial } from "@/lib/page-metadata";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { PLAN_LIMITS } from "@/lib/planLimits";
import { publisherRef } from "@/lib/tool-schema";
import HelpGuideIllustration from "@/components/HelpGuideIllustration";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";

export const metadata: Metadata = withSocial({
  title: { absolute: "How to Set Up an Instagram Link-in-Bio Page: Easy Guide" },
  description:
    `Set up your Instagram link-in-bio page in ${BRAND.name}: claim your page, add your links, pick a theme, paste the URL in your Instagram bio and track clicks.`,
  alternates: { canonical: "/help/instagram-link-in-bio-setup" },
});

const freeLinks = PLAN_LIMITS.Free.bioLinks;
const paidLinks = PLAN_LIMITS.Pro.bioLinks;

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to set up an Instagram link-in-bio page",
  description: metadata.description,
  image: `${BRAND.canonicalUrl}/landing/hero.webp`,
  dateModified: "2026-11-18",
  author: { "@type": "Organization", name: BRAND.company },
  publisher: publisherRef(),
  mainEntityOfPage: `${BRAND.canonicalUrl}/help/instagram-link-in-bio-setup`,
};

const steps = [
  {
    name: "Sign up or log in",
    text: "Create a free account or log in to Poskoo. No credit card is needed to start.",
    body: (
      <>
        <Link className={s.vlink} href="/signup">
          Create a free account
        </Link>{" "}
        or log in to {BRAND.name}. No credit card is needed to start.
      </>
    ),
  },
  {
    name: "Open the bio page editor in the app",
    text: "Sign in to Poskoo and open Link in bio in the app.",
    body: (
      <>
        Sign in to {BRAND.name} and open{" "}
        <Link className={s.vlink} href="/app">
          Link in bio
        </Link>{" "}
        in the app.
      </>
    ),
  },
  {
    name: "Choose your page name",
    text: "Pick a handle that matches your Instagram name, because your page lives at poskoo.com/@yourname.",
    body: (
      <>
        Pick a handle that matches your Instagram name, because your page lives at{" "}
        <strong>poskoo.com/@yourname</strong>.
      </>
    ),
  },
  {
    name: "Add your links",
    text: "Give each link a short label such as Shop the collection or Book a call, then paste the full address starting with https://. Add, reorder or remove links any time.",
    body: (
      <>
        Give each link a short label such as <em>Shop the collection</em> or <em>Book a call</em>, then paste the full
        address starting with <code>https://</code>. Add, reorder or remove links any time.
      </>
    ),
  },
  {
    name: "Pick a theme",
    text: "Choose Sunrise, Mint, Lilac or Ink, add an optional avatar and bio, then tick Publish my page and save.",
    body: (
      <>
        Choose <strong>Sunrise</strong>, <strong>Mint</strong>, <strong>Lilac</strong> or <strong>Ink</strong>, add an
        optional avatar and bio, then tick <strong>Publish my page</strong> and save.
      </>
    ),
  },
  {
    name: "Copy the page URL into your Instagram bio",
    text: "Copy your page URL and paste it into the Website field of your Instagram profile (Edit profile > Links in the Instagram app).",
    body: (
      <>
        Copy your page URL and paste it into the <strong>Website</strong> field of your Instagram profile (Edit profile
        &gt; Links in the Instagram app).
      </>
    ),
  },
  {
    name: "Check clicks for each link",
    text: "Every link on your page gets a tracked short link, and the Link in bio screen shows the click count for each link plus the total tracked clicks for the page.",
    body: (
      <>
        Every link on your page gets a tracked short link, and the Link in bio screen shows the click count for each
        link plus the total tracked clicks for the page.
      </>
    ),
  },
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to set up an Instagram link-in-bio page",
  description: metadata.description,
  image: `${BRAND.canonicalUrl}/landing/hero.webp`,
  step: steps.map((st, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: st.name,
    text: st.text,
  })),
};

const faqs = [
  {
    q: "What is an Instagram link-in-bio page?",
    a: "It is one public page that holds all the links you want to share from your Instagram bio. Instead of one link, your bio points to a page with your shop, latest post, offer and contact links.",
  },
  {
    q: "Who can see my link-in-bio page?",
    a: "Anyone with the link can see it while the page is published. If you untick Publish my page and save, the page is hidden and visitors get a not-found page instead.",
  },
  {
    q: "How many links can I add?",
    a: `The Free plan includes ${freeLinks} links on your bio page. The Pro and Agency plans include ${paidLinks} links, so you can share more destinations from one page.`,
  },
  {
    q: "Does my page show my latest Instagram posts?",
    a: "Yes. When you have published posts in Poskoo, the page shows your latest published posts under your links, so visitors can see recent work without leaving the page.",
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

export default function InstagramLinkInBioSetupHelpPage() {
  return (
    <PublicShell className={`${s.sched} ${s.pub}`}
      breadcrumbs={[
        { name: "Help center", path: "/help" },
        { name: "Link-in-Bio Setup", path: "/help/instagram-link-in-bio-setup" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="hero">
        <div className={s.heroText}>
          <p className="eyebrow">Guide</p>
            <h1>
              How to set up your Instagram <em className="s">link-in-bio page</em>
            </h1>
          <p className="lede">
            A link-in-bio page is one page at poskoo.com/@yourname that holds all your links. You create it in{" "}
            {BRAND.name}, add your links, pick a theme and paste its URL into your Instagram bio.
          </p>
        </div>
        <HelpGuideIllustration variant="start" className="hero-art" />
      </header>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>What you need</h2>
            <ul>
              <li>A free {BRAND.name} account — no credit card needed.</li>
              <li>Your Instagram profile open in the app so you can paste the page URL into your bio.</li>
              <li>The links you want to share, each with a short label and a full <code>https://</code> address.</li>
            </ul>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className={s.prose}>
            <h2>Step by step</h2>
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
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div className={s.prose}>
            <h2>How many links can I add?</h2>
            <p>
              The Free plan includes {freeLinks} links on your bio page. The Pro and Agency plans include {paidLinks}{" "}
              links, so you can share more destinations from one page.
            </p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.th}>Plan</th>
                  <th className={s.th}>Links</th>
                </tr>
              </thead>
              <tbody>
                <tr className={s.tr}>
                  <td className={s.td}>Free</td>
                  <td className={s.td} style={{ fontWeight: 700 }}>{freeLinks}</td>
                </tr>
                <tr className={s.tr}>
                  <td className={s.td}>Pro and Agency</td>
                  <td className={s.td} style={{ fontWeight: 700 }}>{paidLinks}</td>
                </tr>
              </tbody>
            </table>
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
              <li>
                <Link className={s.vlink} href="/instagram-link-in-bio">
                  Instagram link-in-bio page
                </Link>
              </li>
              <li>
                <Link className={s.vlink} href="/tools/instagram-utm-builder">
                  UTM builder for bio links
                </Link>
              </li>
              <li>
                <Link className={s.vlink} href="/help">
                  All help guides
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <p className="small" style={{ textAlign: "center", marginTop: "20px" }}>
        New to {BRAND.name}?{" "}
        <Link className={s.vlink} href="/signup">Create a free account</Link>{" "}
        or email{" "}
        <a className={s.vlink} href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>.
      </p>
    </PublicShell>
  );
}
