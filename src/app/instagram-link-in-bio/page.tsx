import type { Metadata } from "next";
import Link from "next/link";
import PublicShell from "@/components/PublicShell";
import s from "@/components/site.module.css";
import { BRAND } from "@/lib/brand";
import { PLAN_LIMITS } from "@/lib/planLimits";
import { SOFTWARE_APPLICATION_OFFERS } from "@/lib/plans";

const PATH = "/instagram-link-in-bio";
const title = "Instagram Link in Bio Page: Add Links & Track Clicks";
const description =
  "Create a free Instagram link-in-bio page at poskoo.com/@yourname. Add up to 5 links on Free or 20 on paid plans, pick a theme and track every click.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
};

const freeLinks = PLAN_LIMITS.Free.bioLinks;
const paidLinks = PLAN_LIMITS.Pro.bioLinks;

const steps = [
  {
    n: "1",
    title: "Open Link in bio",
    text: "Sign in to Poskoo and open Link in bio in the app. Your page lives at poskoo.com/@yourname, so pick a handle that matches your Instagram name.",
  },
  {
    n: "2",
    title: "Add a label and a link",
    text: "Give each link a short label such as Shop the collection or Book a call, then paste the full address starting with https://. Add, reorder or remove links any time.",
  },
  {
    n: "3",
    title: "Pick a theme and publish",
    text: "Choose Sunrise, Mint, Lilac or Ink, add an optional avatar and bio, then tick Publish my page. Save and your page is live for anyone with the link.",
  },
];

const faqs = [
  {
    q: "What is an Instagram link-in-bio page?",
    a: "It is one public page that holds all the links you want to share from your Instagram bio. Instead of one link, your bio points to a page with your shop, latest post, offer and contact links.",
  },
  {
    q: "How do I add links to my Poskoo bio page?",
    a: "Open Link in bio in the Poskoo app, add a label and the full https:// address for each link, then save the page. You can add, reorder or remove links whenever you need to.",
  },
  {
    q: "Who can see my link-in-bio page?",
    a: "Anyone with the link can see it while the page is published. If you untick Publish my page and save, the page is hidden and visitors get a not-found page instead.",
  },
  {
    q: "How many links can I add?",
    a: `The Free plan includes ${freeLinks} links on your bio page. Pro and Agency include ${paidLinks} links, so you can share more destinations from one page.`,
  },
  {
    q: "Can I see which links people click?",
    a: "Yes. Every link on your page gets a tracked short link, and the Link in bio screen shows the click count for each link plus the total tracked clicks for the page.",
  },
  {
    q: "Can I change the look of my page?",
    a: "Yes. Pick one of four colour themes, Sunrise, Mint, Lilac or Ink, and add an optional avatar image and a short bio. The page is built to read well on a phone.",
  },
  {
    q: "Does my page show my latest Instagram posts?",
    a: "Yes. When you have published posts in Poskoo, the page shows your latest published posts under your links, so visitors can see recent work without leaving the page.",
  },
];

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: BRAND.name,
  url: `${BRAND.url}${PATH}`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description,
  featureList: [
    "Instagram link-in-bio page",
    "Custom handle at poskoo.com/@yourname",
    "Up to 5 links on Free and 20 on paid plans",
    "Four colour themes",
    "Click tracking for every link",
    "Latest published posts on the page",
  ],
  offers: SOFTWARE_APPLICATION_OFFERS,
  publisher: { "@type": "Organization", name: BRAND.company },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

const ld = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

function BioPreview() {
  return (
    <svg
      viewBox="0 0 320 420"
      width="320"
      height="420"
      role="img"
      aria-label="Preview of a Poskoo link-in-bio page on a phone, with a profile, a short bio and four link buttons."
    >
      <rect x="4" y="4" width="312" height="412" rx="34" fill="var(--ink)" />
      <rect x="14" y="14" width="292" height="392" rx="26" fill="var(--lilac)" />
      <circle cx="270" cy="60" r="70" fill="var(--peach)" opacity="0.55" />
      <rect x="132" y="24" width="56" height="7" rx="3.5" fill="var(--ink)" opacity="0.25" />
      <circle cx="160" cy="86" r="34" fill="var(--card)" stroke="var(--ink)" strokeWidth="3" />
      <circle cx="160" cy="78" r="12" fill="var(--violet)" />
      <path d="M140 104c3-13 37-13 40 0" fill="var(--violet)" />
      <text x="160" y="142" textAnchor="middle" fontFamily="var(--sans)" fontSize="17" fontWeight="700" fill="var(--ink)">
        Your Name
      </text>
      <text x="160" y="162" textAnchor="middle" fontFamily="var(--sans)" fontSize="12" fill="var(--ink)" opacity="0.7">
        @yourname
      </text>
      <rect x="70" y="178" width="180" height="8" rx="4" fill="var(--ink)" opacity="0.18" />
      <rect x="96" y="194" width="128" height="8" rx="4" fill="var(--ink)" opacity="0.12" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x="40"
            y={222 + i * 44}
            width="240"
            height="34"
            rx="17"
            fill="var(--card)"
            stroke="var(--violet)"
            strokeWidth="2"
          />
          <rect x="58" y={234 + i * 44} width={[96, 74, 110, 84][i]} height="9" rx="4.5" fill="var(--ink)" opacity="0.55" />
          <path
            d={`M258 ${239 + i * 44}l6 6-6 6`}
            fill="none"
            stroke="var(--violet)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}
      <text x="160" y="398" textAnchor="middle" fontFamily="var(--sans)" fontSize="11" fontWeight="700" fill="var(--ink)" opacity="0.55">
        Made with Poskoo
      </text>
    </svg>
  );
}

export default function InstagramLinkInBioPage() {
  return (
    <PublicShell breadcrumbs={[{ name: "Instagram link in bio", path: PATH }]}>
      {[appJsonLd, faqJsonLd].map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: ld(data) }}
        />
      ))}

      <header className="hero">
        <span className="pill">Free plan · {freeLinks} links</span>
        <p className="eyebrow">Instagram link in bio</p>
        <h1>
          One link in your bio. <em className="s mark">Every link you share</em>
        </h1>
        <p className="lede">
          A link-in-bio page is one public page that holds all the links you want to share from your Instagram bio.
          {" "}{BRAND.name} builds it for you at poskoo.com/@yourname, so your bio can point to your shop, latest post,
          offer and contact links at once.
        </p>
        <div className="ctas">
          <Link className="btn btn-dark" href="/signup">
            Create your free page <span aria-hidden="true">→</span>
          </Link>
          <Link className="btn btn-line" href="#how">
            How it works
          </Link>
        </div>
        <p className="small">Free plan. No credit card.</p>
        <div className="hero-art" style={{ maxWidth: 360 }}>
          <BioPreview />
        </div>
      </header>

      <section id="how" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">How to add links</p>
            <h2>
              Build your page in <em className="s">three steps</em>
            </h2>
          </div>
          <div className="cards">
            {steps.map((step) => (
              <article key={step.n} className="pcard">
                <span className="no">Step {step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
            Need more detail? Follow the{" "}
            <Link className={s.vlink} href="/help/instagram-link-in-bio-setup">
              step-by-step link-in-bio setup guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="split">
            <div className="copy">
              <p className="eyebrow">Who can view it</p>
              <h2>
                Public when you publish. <em className="s">Hidden when you don&apos;t</em>
              </h2>
              <p>
                Your page is public at poskoo.com/@yourname while Publish my page is ticked. Anyone with the link can
                open it, including people who tap the link in your Instagram bio. Untick the box and save, and the page
                is hidden from visitors until you publish it again.
              </p>
              <p>
                You control the handle, display name, bio, avatar and theme. Each link gets a tracked short link, so the
                Link in bio screen shows clicks per link and the total for the page.
              </p>
            </div>
            <div className="art">
              <BioPreview />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div className="head">
            <p className="eyebrow">Plan limits</p>
            <h2>
              How many links <em className="s">you can add</em>
            </h2>
            <p>
              The Free plan includes {freeLinks} links on your bio page. Pro and Agency include{" "}
              {paidLinks} links, so you can share more destinations from one page.
            </p>
          </div>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.th}>Plan</th>
                  <th className={s.th}>Links on your bio page</th>
                </tr>
              </thead>
              <tbody>
                <tr className={s.tr}>
                  <td className={s.td}>Free</td>
                  <td className={s.td} style={{ fontWeight: 700 }}>{freeLinks} links</td>
                </tr>
                <tr className={s.tr}>
                  <td className={s.td}>Pro</td>
                  <td className={s.td} style={{ fontWeight: 700 }}>{paidLinks} links</td>
                </tr>
                <tr className={s.tr}>
                  <td className={s.td}>Agency</td>
                  <td className={s.td} style={{ fontWeight: 700 }}>{PLAN_LIMITS.Agency.bioLinks} links</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="small" style={{ textAlign: "center", marginTop: 20 }}>
            <Link href="/pricing" className={s.vlink}>
              Compare every plan and limit
            </Link>
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Questions</p>
            <h2>Link-in-bio questions</h2>
          </div>
          <div className="faq">
            {faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
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
                Put every link <em className="s">in one place</em>
              </h2>
              <p>Start free, claim your handle and publish your page in a few minutes.</p>
              <Link className="btn" href="/signup">
                Create your free page <span aria-hidden="true">→</span>
              </Link>
            </div>
            <BioPreview />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
